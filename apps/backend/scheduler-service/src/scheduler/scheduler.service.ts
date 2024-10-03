import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Vehicle } from '../vehicle/entities/vehicle.entity';
import { TestDrive } from './entities/test-drive.entity';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { ScheduleTestDriveDto } from './dto/schedule-test-drive.dto';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private rateLimiter: RateLimiterMemory;

  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(TestDrive)
    private testDriveRepository: Repository<TestDrive>,
    private entityManager: EntityManager,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {
    this.rateLimiter = new RateLimiterMemory({
      points: 10,
      duration: 60,
    });
  }

  async checkAvailability(
    checkAvailabilityDto: CheckAvailabilityDto
  ): Promise<Vehicle[]> {
    await this.rateLimiter.consume('checkAvailability', 1);

    const cacheKey = `availability:${JSON.stringify(checkAvailabilityDto)}`;
    const cachedResult = await this.cacheManager.get<Vehicle[]>(cacheKey);
    if (cachedResult) {
      this.logger.log(`Returning cached availability result for ${cacheKey}`);
      return cachedResult;
    }
    const { location, vehicleType, startDateTime, durationMins } =
      checkAvailabilityDto;
    const startDate = new Date(startDateTime);
    const endDate = new Date(startDate.getTime() + durationMins * 60000);

    this.logger.log(
      `Checking availability for ${vehicleType} in ${location} from ${startDate} for ${durationMins} minutes`
    );

    // Validate input
    if (durationMins <= 0 || durationMins > 120) {
      throw new BadRequestException(
        'Duration must be between 1 and 120 minutes'
      );
    }

    if (startDate < new Date()) {
      throw new BadRequestException('Start date must be in the future');
    }

    // Find all vehicles of the given type at the specified location
    const vehicles = await this.vehicleRepository.find({
      where: {
        type: vehicleType,
        location: location,
      },
      relations: ['testDrives'],
    });

    if (vehicles.length === 0) {
      this.logger.warn(
        `No vehicles found matching the criteria: ${vehicleType} in ${location}`
      );
      throw new NotFoundException('No vehicles found matching the criteria');
    }

    // Filter out vehicles that are already scheduled for a test drive at the requested time
    const availableVehicles = vehicles.filter((vehicle) => {
      return !vehicle.testDrives.some((testDrive) => {
        const testDriveStart = new Date(testDrive.startDateTime);
        const testDriveEnd = new Date(
          testDriveStart.getTime() + testDrive.durationMins * 60000
        );
        return (
          (startDate >= testDriveStart && startDate < testDriveEnd) ||
          (endDate > testDriveStart && endDate <= testDriveEnd) ||
          (startDate <= testDriveStart && endDate >= testDriveEnd)
        );
      });
    });

    if (availableVehicles.length === 0) {
      this.logger.warn(
        `No available vehicles for the requested time slot: ${startDate} to ${endDate}`
      );
      throw new NotFoundException(
        'No available vehicles for the requested time slot'
      );
    }

    const result = this.distributeVehicles(availableVehicles);
    await this.cacheManager.set(cacheKey, result, 300000); // Cache for 5 minutes
    return result;
  }

  async scheduleTestDrive(
    scheduleTestDriveDto: ScheduleTestDriveDto
  ): Promise<TestDrive> {
    await this.rateLimiter.consume('scheduleTestDrive', 2);

    const {
      vehicleId,
      startDateTime,
      durationMins,
      customerName,
      customerPhone,
      customerEmail,
    } = scheduleTestDriveDto;

    const startDate = new Date(startDateTime);
    const endDate = new Date(startDate.getTime() + durationMins * 60000);

    this.logger.log(
      `Scheduling test drive for vehicle ${vehicleId} at ${startDate} for ${durationMins} minutes`
    );

    // Validate input
    if (durationMins <= 0 || durationMins > 120) {
      throw new BadRequestException(
        'Duration must be between 1 and 120 minutes'
      );
    }

    if (startDate < new Date()) {
      throw new BadRequestException('Start date must be in the future');
    }

    // Check if the customer has exceeded the maximum number of test drives
    const customerTestDriveCount = await this.testDriveRepository.count({
      where: { customerEmail },
    });

    if (customerTestDriveCount >= 3) {
      throw new BadRequestException(
        'Maximum number of test drives reached for this customer'
      );
    }

    // Use a transaction to ensure data consistency
    return this.entityManager.transaction(
      async (transactionalEntityManager) => {
        // Check if the vehicle exists
        const vehicle = await transactionalEntityManager.findOne(Vehicle, {
          where: { id: vehicleId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!vehicle) {
          this.logger.warn(`Vehicle not found: ${vehicleId}`);
          throw new NotFoundException('Vehicle not found');
        }
        Logger.log(`Vehicle found: ${vehicleId}`);
        const existingTestDrives = await transactionalEntityManager.find(
          TestDrive,
          {
            where: { vehicle: { id: vehicleId } },
          }
        );
        Logger.log(`ExistingTestDrives total: ${existingTestDrives.length}`);

        // Check if the vehicle is available for the requested time slot
        const isVehicleAvailable = !existingTestDrives.some((testDrive) => {
          const testDriveStart = new Date(testDrive.startDateTime);
          const testDriveEnd = new Date(
            testDriveStart.getTime() + testDrive.durationMins * 60000
          );
          return (
            (startDate >= testDriveStart && startDate < testDriveEnd) ||
            (endDate > testDriveStart && endDate <= testDriveEnd) ||
            (startDate <= testDriveStart && endDate >= testDriveEnd)
          );
        });
        Logger.log(
          `Vehicle is ${isVehicleAvailable ? 'available' : 'not available'}`
        );
        if (!isVehicleAvailable) {
          this.logger.warn(
            `Vehicle ${vehicleId} is not available for the requested time slot: ${startDate} to ${endDate}`
          );
          throw new BadRequestException(
            'Vehicle is not available for the requested time slot'
          );
        }

        // Create and save the new test drive
        const newTestDrive = transactionalEntityManager.create(TestDrive, {
          startDateTime: startDate,
          durationMins,
          customerName,
          customerPhone,
          customerEmail,
          vehicle,
        });

        const savedTestDrive = await transactionalEntityManager.save(
          newTestDrive
        );
        this.logger.log(
          `Test drive scheduled successfully: ${savedTestDrive.id}`
        );

        return savedTestDrive;
      }
    );
  }

  private distributeVehicles(availableVehicles: Vehicle[]): Vehicle[] {
    return availableVehicles.sort(
      (a, b) => a.testDrives.length - b.testDrives.length
    );
  }
}
