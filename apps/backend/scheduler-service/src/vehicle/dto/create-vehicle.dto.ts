import { IsString, IsNotEmpty } from 'class-validator';
import { CreateVehicleDtoConnector } from '@libs/scheduler-service-shared';
export class CreateVehicleDto implements CreateVehicleDtoConnector {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  location: string;
}
