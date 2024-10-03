// src/scheduler/vehicle.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { VehicleService } from './vehicle.service';
import { Vehicle } from './entities/vehicle.entity';
import { Repository, EntityManager } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

describe('VehicleService', () => {
  let service: VehicleService;
  let vehicleRepository: jest.Mocked<Repository<Vehicle>>;
  let entityManager: jest.Mocked<EntityManager>;
  let cacheManager: jest.Mocked<any>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleService,
        {
          provide: getRepositoryToken(Vehicle),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: EntityManager,
          useValue: {
            transaction: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<VehicleService>(VehicleService);
    vehicleRepository = module.get(getRepositoryToken(Vehicle)) as jest.Mocked<
      Repository<Vehicle>
    >;
    entityManager = module.get(EntityManager) as jest.Mocked<EntityManager>;
    cacheManager = module.get(CACHE_MANAGER);

    const transactionMock = jest.fn(
      (cb: (entityManager: EntityManager) => Promise<any>) => cb(entityManager)
    );

    entityManager.transaction = transactionMock as any;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a vehicle', async () => {
      const createVehicleDto: CreateVehicleDto = {
        type: 'Tesla_Model_3',
        location: 'New York',
      };
      const createdVehicle = { id: '1', ...createVehicleDto, testDrives: [] };

      vehicleRepository.create.mockReturnValue(createdVehicle);
      vehicleRepository.save.mockResolvedValue(createdVehicle);

      const result = await service.create(createVehicleDto);

      expect(result).toEqual(createdVehicle);
      expect(vehicleRepository.create).toHaveBeenCalledWith(createVehicleDto);
      expect(vehicleRepository.save).toHaveBeenCalledWith(createdVehicle);
    });
  });

  describe('findAll', () => {
    it('should return an array of vehicles', async () => {
      const vehicles: Vehicle[] = [
        {
          id: '1',
          type: 'Tesla_Model_3',
          location: 'New York',
          testDrives: [],
        },
        { id: '2', type: 'BMW_i3', location: 'Los Angeles', testDrives: [] },
      ];

      cacheManager.get.mockResolvedValue(null);
      vehicleRepository.find.mockResolvedValue(vehicles);

      const result = await service.findAll();

      expect(result).toEqual(vehicles);
      expect(cacheManager.get).toHaveBeenCalledWith('vehicle:findAll');
      expect(vehicleRepository.find).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith(
        'vehicle:findAll',
        vehicles,
        300000
      );
    });

    it('should return cached vehicles if available', async () => {
      const cachedVehicles = [
        { id: '1', type: 'Tesla_Model_3', location: 'New York' },
      ];

      cacheManager.get.mockResolvedValue(cachedVehicles);

      const result = await service.findAll();

      expect(result).toEqual(cachedVehicles);
      expect(cacheManager.get).toHaveBeenCalledWith('vehicle:findAll');
      expect(vehicleRepository.find).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a vehicle if found', async () => {
      const vehicle = {
        id: '1',
        type: 'Tesla_Model_3',
        location: 'New York',
        testDrives: [],
      };

      cacheManager.get.mockResolvedValue(null);
      vehicleRepository.findOneBy.mockResolvedValue(vehicle);

      const result = await service.findOne('1');

      expect(result).toEqual(vehicle);
      expect(cacheManager.get).toHaveBeenCalledWith('vehicle:findOne:1');
      expect(vehicleRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
      expect(cacheManager.set).toHaveBeenCalledWith(
        'vehicle:findOne:1',
        vehicle,
        300000
      );
    });

    it('should throw NotFoundException if vehicle not found', async () => {
      cacheManager.get.mockResolvedValue(null);
      vehicleRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a vehicle', async () => {
      const updateVehicleDto: UpdateVehicleDto = { type: 'Tesla_Model_S' };
      const updatedVehicle = {
        id: '1',
        type: 'Tesla_Model_S',
        location: 'New York',
      };

      entityManager.findOne.mockResolvedValueOnce(updatedVehicle);
      entityManager.update.mockResolvedValueOnce(undefined);
      entityManager.findOne.mockResolvedValueOnce(updatedVehicle);

      const result = await service.update('1', updateVehicleDto);

      expect(result).toEqual(updatedVehicle);
      expect(entityManager.update).toHaveBeenCalledWith(
        Vehicle,
        { id: '1' },
        updateVehicleDto
      );
      expect(cacheManager.del).toHaveBeenCalledWith('vehicle:findOne:1');
    });

    it('should throw NotFoundException if vehicle not found during update', async () => {
      entityManager.findOne.mockResolvedValueOnce(null);

      await expect(service.update('1', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a vehicle', async () => {
      const vehicle = { id: '1', type: 'Tesla_Model_3', location: 'New York' };

      const removeMock = jest.fn((targetOrEntity) => {
        return targetOrEntity;
      });

      entityManager.findOne.mockResolvedValueOnce(vehicle);
      entityManager.remove = removeMock as any;

      await service.remove('1');

      expect(entityManager.remove).toHaveBeenCalledWith(vehicle);
    });

    it('should throw NotFoundException if vehicle not found during remove', async () => {
      entityManager.findOne.mockResolvedValueOnce(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
