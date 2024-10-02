import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { SchedulerService } from './scheduler.service';
import { Vehicle } from './entities/vehicle.entity';
import { TestDrive } from './entities/test-drive.entity';
import { Repository, EntityManager, EntityTarget, DeepPartial } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('SchedulerService', () => {
  let service: SchedulerService;
  let vehicleRepository: jest.Mocked<Repository<Vehicle>>;
  let testDriveRepository: jest.Mocked<Repository<TestDrive>>;
  let cacheManager: any;
  let entityManager: jest.Mocked<EntityManager>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulerService,
        {
          provide: getRepositoryToken(Vehicle),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(TestDrive),
          useValue: {
            count: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
        {
          provide: EntityManager,
          useValue: {
            transaction: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SchedulerService>(SchedulerService);
    vehicleRepository = module.get(getRepositoryToken(Vehicle)) as jest.Mocked<
      Repository<Vehicle>
    >;
    testDriveRepository = module.get(
      getRepositoryToken(TestDrive)
    ) as jest.Mocked<Repository<TestDrive>>;
    cacheManager = module.get(CACHE_MANAGER);
    entityManager = module.get(EntityManager) as jest.Mocked<EntityManager>;
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('checkAvailability', () => {
    it('should return available vehicles', async () => {
      const mockVehicles = [
        { id: '1', type: 'Volkswagen_ID4', location: 'Dublin', testDrives: [] },
        { id: '2', type: 'Volkswagen_ID4', location: 'Dublin', testDrives: [] },
      ];

      vehicleRepository.find.mockResolvedValue(mockVehicles);

      const fiveMinInFuture = new Date();
      fiveMinInFuture.setMinutes(fiveMinInFuture.getMinutes() + 5);

      const result = await service.checkAvailability({
        location: 'Dublin',
        vehicleType: 'Volkswagen_ID4',
        startDateTime: fiveMinInFuture.toISOString(),
        durationMins: 45,
      });

      expect(result).toEqual(mockVehicles);
    });

    it('should throw NotFoundException when no vehicles are found', async () => {
      vehicleRepository.find.mockResolvedValue([]);

      const fiveMinInFuture = new Date();
      fiveMinInFuture.setMinutes(fiveMinInFuture.getMinutes() + 5);

      await expect(
        service.checkAvailability({
          location: 'Dublin',
          vehicleType: 'Volkswagen_ID4',
          startDateTime: fiveMinInFuture.toISOString(),
          durationMins: 45,
        })
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when duration is invalid', async () => {
      await expect(
        service.checkAvailability({
          location: 'Dublin',
          vehicleType: 'Volkswagen_ID4',
          startDateTime: new Date().toISOString(),
          durationMins: 0,
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('scheduleTestDrive', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      const transactionMock = jest.fn(
        (cb: (entityManager: EntityManager) => Promise<any>) =>
          cb(entityManager)
      );

      entityManager.transaction = transactionMock as any;
    });
    it('should schedule a test drive successfully', async () => {
      const fiveMinInFuture = new Date();
      fiveMinInFuture.setMinutes(fiveMinInFuture.getMinutes() + 5);

      const mockVehicle = {
        id: '1',
        type: 'Volkswagen_ID4',
        location: 'Dublin',
        testDrives: [],
      };
      const mockTestDrive = {
        id: '1',
        startDateTime: fiveMinInFuture,
        durationMins: 45,
        customerName: 'John Doe',
        customerPhone: '1234567890',
        customerEmail: 'john@example.com',
        vehicle: mockVehicle,
      };

      testDriveRepository.count.mockResolvedValue(0);

      entityManager.save.mockResolvedValue(mockTestDrive);
      entityManager.findOne.mockResolvedValue(mockVehicle);
      const createMock = jest.fn(
        (entityClass: EntityTarget<any>, plainObject?: DeepPartial<any>) => {
          if (Array.isArray(plainObject)) {
            return plainObject.map((obj) => ({ ...obj }));
          }
          return mockTestDrive;
        }
      );

      entityManager.create = createMock as any;
      const result = await service.scheduleTestDrive({
        vehicleId: '1',
        startDateTime: new Date().toISOString(),
        durationMins: 45,
        customerName: 'John Doe',
        customerPhone: '1234567890',
        customerEmail: 'john@example.com',
      });

      expect(result).toEqual(mockTestDrive);
    });

    it('should throw BadRequestException when customer has reached maximum test drives', async () => {
      testDriveRepository.count.mockResolvedValue(3);

      await expect(
        service.scheduleTestDrive({
          vehicleId: '1',
          startDateTime: new Date().toISOString(),
          durationMins: 45,
          customerName: 'John Doe',
          customerPhone: '1234567890',
          customerEmail: 'john@example.com',
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when vehicle is not found', async () => {
      const fiveMinInFuture = new Date();
      fiveMinInFuture.setMinutes(fiveMinInFuture.getMinutes() + 5);

      testDriveRepository.count.mockResolvedValue(0);
      entityManager.findOne.mockResolvedValue(null);

      await expect(
        service.scheduleTestDrive({
          vehicleId: '1',
          startDateTime: fiveMinInFuture.toISOString(),
          durationMins: 45,
          customerName: 'John Doe',
          customerPhone: '1234567890',
          customerEmail: 'john@example.com',
        })
      ).rejects.toThrow(NotFoundException);
    });
  });
});
