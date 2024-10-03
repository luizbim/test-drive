export interface CheckAvailabilityDtoConnector {
  location: string;
  vehicleType: string;
  startDateTime: string;
  durationMins: number;
}

export interface ScheduleTestDriveDtoConnector {
  vehicleId: string;
  startDateTime: string;
  durationMins: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
}

export interface TestDriveConnector {
  id: string;
  startDateTime: string;
  durationMins: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
}
