import { Module } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { VehicleController } from './vehicle.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { Vehicle } from '../vehicle/entities/vehicle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle]), CacheModule.register()],
  controllers: [VehicleController],
  providers: [VehicleService],
})
export class VehicleModule {}
