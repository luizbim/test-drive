import { Controller, Post, Body } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { ScheduleTestDriveDto } from './dto/schedule-test-drive.dto';

@Controller('scheduler')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Post('check-availability')
  async checkAvailability(@Body() checkAvailabilityDto: CheckAvailabilityDto) {
    return this.schedulerService.checkAvailability(checkAvailabilityDto);
  }

  @Post('schedule-test-drive')
  async scheduleTestDrive(@Body() scheduleTestDriveDto: ScheduleTestDriveDto) {
    return this.schedulerService.scheduleTestDrive(scheduleTestDriveDto);
  }
}
