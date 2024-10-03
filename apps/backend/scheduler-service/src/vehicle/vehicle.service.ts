import { v4 as uuid } from 'uuid';
import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Vehicle } from './entities/vehicle.entity';

@Injectable()
export class VehicleService {
  private readonly logger = new Logger(VehicleService.name);
  private rateLimiter: RateLimiterMemory;

  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    private entityManager: EntityManager,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {
    this.rateLimiter = new RateLimiterMemory({
      points: 100,
      duration: 1,
    });
  }

  async create(createVehicleDto: CreateVehicleDto) {
    await this.rateLimiter.consume('vehicle:create', 1);

    const vehicle = this.vehicleRepository.create(createVehicleDto);
    vehicle.id = vehicle.id || uuid();
    await this.vehicleRepository.save(vehicle);

    await this.cacheManager.del(`vehicle:findAll`);

    return vehicle;
  }

  async findAll() {
    await this.rateLimiter.consume('vehicle:findAll', 1);
    const cacheKey = `vehicle:findAll`;
    const cachedResult = await this.cacheManager.get<Vehicle[]>(cacheKey);
    if (cachedResult) {
      this.logger.log(`Returning cached availability result for ${cacheKey}`);
      return cachedResult;
    }

    const result = await this.vehicleRepository.find();

    await this.cacheManager.set(cacheKey, result, 300000); // Cache for 5 minutes
    return result;
  }

  async findOne(id: string) {
    await this.rateLimiter.consume('vehicle:findOne', 1);
    const cacheKey = `vehicle:findOne:${id}`;
    const cachedResult = await this.cacheManager.get<Vehicle[]>(cacheKey);
    if (cachedResult) {
      this.logger.log(`Returning cached availability result for ${cacheKey}`);
      return cachedResult;
    }

    const result = await this.vehicleRepository.findOneBy({ id });

    if (!result) {
      throw new NotFoundException(`Vehicle with id ${id} not found`);
    }

    await this.cacheManager.set(cacheKey, result, 300000); // Cache for 5 minutes
    return result;
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto) {
    await this.rateLimiter.consume('vehicle:update', 1);

    return this.entityManager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        const vehicle = await transactionalEntityManager.findOne(Vehicle, {
          where: { id },
          lock: { mode: 'pessimistic_write' },
        });

        if (!vehicle) {
          this.logger.warn(`Vehicle not found: ${id}`);
          throw new NotFoundException('Vehicle not found');
        }

        await transactionalEntityManager.update(
          Vehicle,
          { id },
          updateVehicleDto
        );

        // purging the cache for the updated vehicle keeping the findAll cache
        await this.cacheManager.del(`vehicle:findOne:${id}`);
        await this.cacheManager.del(`vehicle:findAll`);

        return await transactionalEntityManager.findOne(Vehicle, {
          where: { id },
          lock: { mode: 'pessimistic_write' },
        });
      }
    );
  }

  async remove(id: string) {
    await this.rateLimiter.consume('vehicle:remove', 1);

    // Use a transaction to ensure data consistency
    return this.entityManager.transaction(
      async (entityManager: EntityManager) => {
        const vehicle = await entityManager.findOne(Vehicle, { where: { id } });
        if (!vehicle) {
          throw new NotFoundException(`Vehicle with id ${id} not found`);
        }

        await entityManager.remove(vehicle);
        await this.cacheManager.del(`vehicle:findAll`);
      }
    );
  }
}
