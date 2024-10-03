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
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [Vehicle, TestDrive],
      synchronize: true,
    }),
    SchedulerModule,
    VehicleModule,
  ],
})
export class AppModule {}
