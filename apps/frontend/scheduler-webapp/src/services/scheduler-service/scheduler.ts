import axios from 'axios';
import {
  CheckAvailabilityDtoConnector,
  ScheduleTestDriveDtoConnector,
  TestDrive,
  Vehicle,
} from '@libs/scheduler-service-shared';
import { BASE_API_URL } from './constants';
import {
  handleApiRequest,
  ApiResponseData,
} from '../../utils/api-request-handler';

/**
 * Makes a check availability request to the scheduler backend service
 * @param data The data to send
 * @returns
 */
export const checkAvailability = async (
  data: CheckAvailabilityDtoConnector
): Promise<ApiResponseData<Vehicle[]>> => {
  return handleApiRequest<Vehicle[]>(
    axios.post<Vehicle[]>(`${BASE_API_URL}/scheduler/check-availability`, data)
  );
};

/**
 * Schedules a test drive
 * @param data The schedule test drive data
 * @returns The created test drive
 */
export const scheduleTestDrive = async (
  data: ScheduleTestDriveDtoConnector
): Promise<ApiResponseData<TestDrive>> => {
  return handleApiRequest<TestDrive>(
    axios.post(`${BASE_API_URL}/scheduler/schedule-test-drive`, data)
  );
};
