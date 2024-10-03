import { IsString, IsDateString, IsNumber } from 'class-validator';
import { ScheduleTestDriveDtoConnector } from '@libs/scheduler-service-shared';

export class ScheduleTestDriveDto implements ScheduleTestDriveDtoConnector {
  @IsString()
  vehicleId: string;

  @IsDateString()
  startDateTime: string;

  @IsNumber()
  durationMins: number;

  @IsString()
  customerName: string;

  @IsString()
  customerPhone: string;

  @IsString()
  customerEmail: string;
}
