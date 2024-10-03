import axios from 'axios';
import {
  Vehicle,
  CreateVehicleDtoConnector,
  UpdateVehicleDtoConnector,
} from '@libs/scheduler-service-shared';
import { BASE_API_URL } from './constants';
import {
  handleApiRequest,
  ApiResponseData,
} from '../../utils/api-request-handler';

/**
 * Fetches all vehicles from the scheduler backend service
 * @returns List of all vehicles
 */
export const getAllVehicles = async (): Promise<ApiResponseData<Vehicle[]>> => {
  return handleApiRequest<Vehicle[]>(
    axios.get<Vehicle[]>(`${BASE_API_URL}/vehicle`)
  );
};

/**
 * Fetches a single vehicle from the scheduler backend service
 * @param id The id of the vehicle
 * @returns The vehicle with the given id
 */
export const getVehicle = async (
  id: string
): Promise<ApiResponseData<Vehicle>> => {
  return handleApiRequest<Vehicle>(
    axios.get<Vehicle>(`${BASE_API_URL}/vehicle/${id}`)
  );
};

/**
 * Deletes a vehicle from the scheduler backend service
 * @param id The id of the vehicle
 */
export const deleteVehicle = async (
  id: string
): Promise<ApiResponseData<void>> => {
  return handleApiRequest<void>(
    axios.delete<void>(`${BASE_API_URL}/vehicle/${id}`)
  );
};

/**
 * Creates a new vehicle in the scheduler backend service
 * @param vehicle The vehicle object to add
 * @returns The added vehicle
 */
export const addVehicle = async (
  vehicle: CreateVehicleDtoConnector
): Promise<ApiResponseData<Vehicle>> => {
  return handleApiRequest<Vehicle>(
    axios.post<Vehicle>(`${BASE_API_URL}/vehicle`, vehicle)
  );
};

/**
 * Updates a vehicle in the scheduler backend service
 * @param vehicle The vehicle object to update
 * @returns The updated vehicle
 */
export const updateVehicle = async (
  id: Vehicle['id'],
  vehicle: UpdateVehicleDtoConnector
): Promise<ApiResponseData<Vehicle>> => {
  return handleApiRequest<Vehicle>(
    axios.patch(`${BASE_API_URL}/vehicle/${id}`, vehicle)
  );
};
