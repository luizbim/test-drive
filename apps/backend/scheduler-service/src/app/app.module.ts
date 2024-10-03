import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SchedulerModule } from '../scheduler/scheduler.module';
import { VehicleModule } from '../vehicle/vehicle.module';
import { TestDrive } from '../scheduler/entities/test-drive.entity';
import { Vehicle } from '../vehicle/entities/vehicle.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'bananas',
      password: 'strawberries',
      database: 'test-drive-scheduler',
      entities: [Vehicle, TestDrive],
      synchronize: true,
    }),
    SchedulerModule,
    VehicleModule,
  ],
})
export class AppModule {}
