import { IsString, IsDateString, IsNumber } from 'class-validator';
import { CheckAvailabilityDtoConnector } from '@libs/scheduler-service-shared';
export class CheckAvailabilityDto implements CheckAvailabilityDtoConnector {
  @IsString()
  location: string;

  @IsString()
  vehicleType: string;

  @IsDateString()
  startDateTime: string;

  @IsNumber()
  durationMins: number;
}
