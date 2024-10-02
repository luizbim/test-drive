import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { SchedulerController } from './scheduler.controller';
import { SchedulerService } from './scheduler.service';
import { Vehicle } from './entities/vehicle.entity';
import { TestDrive } from './entities/test-drive.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicle, TestDrive]),
    CacheModule.register(),
  ],
  controllers: [SchedulerController],
  providers: [SchedulerService],
})
export class SchedulerModule {}
