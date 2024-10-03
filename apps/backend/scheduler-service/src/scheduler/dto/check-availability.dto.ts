import { IsString, IsDateString, IsNumber } from 'class-validator';

export class CheckAvailabilityDto {
  @IsString()
  location: string;

  @IsString()
  vehicleType: string;

  @IsDateString()
  startDateTime: string;

  @IsNumber()
  durationMins: number;
}
