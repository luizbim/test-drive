import { IsString, IsDateString, IsNumber } from 'class-validator';

export class ScheduleTestDriveDto {
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
