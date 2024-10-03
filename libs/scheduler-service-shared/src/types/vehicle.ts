export interface Vehicle {
  id: string;
  type: string;
  location: string;
}

export interface TestDrive {
  id: string;
  startDateTime: Date;
  durationMins: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
}
