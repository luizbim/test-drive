import { PartialType } from '@nestjs/mapped-types';
import { UpdateVehicleDtoConnector } from '@libs/scheduler-service-shared';
import { CreateVehicleDto } from './create-vehicle.dto';

export class UpdateVehicleDto
  extends PartialType(CreateVehicleDto)
  implements UpdateVehicleDtoConnector {}
