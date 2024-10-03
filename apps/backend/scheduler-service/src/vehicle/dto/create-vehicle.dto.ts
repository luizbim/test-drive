import { IsString, IsNotEmpty } from 'class-validator';
export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  location: string;
}
