/* eslint-disable @typescript-eslint/no-empty-interface */
export interface CreateVehicleDtoConnector {
  type: string;
  location: string;
}

export interface UpdateVehicleDtoConnector
  extends Partial<CreateVehicleDtoConnector> {}
