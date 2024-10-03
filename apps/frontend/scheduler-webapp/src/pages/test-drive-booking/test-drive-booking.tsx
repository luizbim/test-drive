import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  MenuItem,
  Typography,
  Grid2,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import {
  Vehicle,
  CheckAvailabilityDtoConnector,
  ScheduleTestDriveDtoConnector,
} from '@libs/scheduler-service-shared';
import * as vehiclesService from '../../services/scheduler-service/vehicles';
import * as schedulerService from '../../services/scheduler-service/scheduler';
import { StyledPaper, FormContainer } from './test-drive-booking.style';

dayjs.extend(utc);

type SnackbarContent = {
  type: 'error' | 'success' | 'info' | 'warning';
  message: string;
};

const TestDriveBooking: React.FC = () => {
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarContent, setSnackbarContent] =
    useState<SnackbarContent | null>(null);
  const [dateFilter, setDateFilter] = useState<Dayjs | null>(null);
  const [timeFilter, setTimeFilter] = useState<Dayjs | null>(null);
  const [durationFilter, setDurationFilter] = useState<number>(45);
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [allVehicleTypes, setAllVehicleTypes] = useState<string[]>([]);
  const [allLocations, setAllLocations] = useState<string[]>([]);

  const maxDate: Dayjs = dayjs().add(14, 'day');

  useEffect(() => {
    setAvailableVehicles([]);
  }, [
    dateFilter,
    timeFilter,
    locationFilter,
    durationFilter,
    vehicleTypeFilter,
  ]);

  useEffect(() => {
    fetchAllVehicles();
  }, []);

  const fetchAllVehicles = async (): Promise<void> => {
    const { data: vehicles } = await vehiclesService.getAllVehicles();
    setAllVehicleTypes([
      ...new Set(vehicles?.map((vehicle) => vehicle.type.trim())),
    ]);
    setAllLocations([
      ...new Set(vehicles?.map((vehicle) => vehicle.location.trim())),
    ]);
  };

  const checkAvailability = async (): Promise<void> => {
    try {
      if (
        !dateFilter ||
        !timeFilter ||
        !locationFilter ||
        !durationFilter ||
        !vehicleTypeFilter
      )
        return;

      const startDateTime = dayjs(dateFilter)
        .hour(timeFilter.hour())
        .minute(timeFilter.minute())
        .utc()
        .format();

      const params: CheckAvailabilityDtoConnector = {
        location: locationFilter,
        startDateTime,
        durationMins: durationFilter,
        vehicleType: vehicleTypeFilter,
      };
      const checkResult = await schedulerService.checkAvailability(params);
      console.log('checkResult', checkResult);
      if (!checkResult.success) {
        return handleSnackbarOpen({
          type: 'warning',
          message: checkResult.message || 'Error checking availability',
        });
      }
      if (checkResult.data) {
        setAvailableVehicles(checkResult.data);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      handleSnackbarOpen({
        type: 'error',
        message: `Error checking availability: ${error}`,
      });
    }
  };

  const scheduleTestDrive = async (): Promise<void> => {
    if (!selectedVehicle) {
      alert('Please select an available vehicle');
      return;
    }
    if (!dateFilter || !timeFilter) {
      alert('Please select a date and time');
      return;
    }
    try {
      const startDateTime = dayjs(dateFilter)
        .hour(timeFilter.hour())
        .minute(timeFilter.minute())
        .utc()
        .format();

      const params: ScheduleTestDriveDtoConnector = {
        vehicleId: selectedVehicle,
        startDateTime,
        durationMins: durationFilter,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
      };

      const scheduleResult = await schedulerService.scheduleTestDrive(params);
      if (!scheduleResult.success) {
        handleSnackbarOpen({
          type: 'error',
          message: scheduleResult.message || 'Error scheduling test drive',
        });
      } else {
        handleSnackbarOpen({
          type: 'success',
          message: 'Test drive scheduled successfully',
        });
      }
      clearForm();
    } catch (error) {
      console.error('Error booking test drive:', error);
      handleSnackbarOpen({
        type: 'error',
        message: 'Failed to book test drive. Please try again.',
      });
    }
  };

  const clearForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setSelectedVehicle('');
    setAvailableVehicles([]);
    setDateFilter(null);
    setTimeFilter(null);
    setDurationFilter(45);
    setVehicleTypeFilter('');
    setLocationFilter('');
  };

  const handleSnackbarOpen = (params: SnackbarContent) => {
    setSnackbarContent(params);
    setSnackbarOpen(true);
  };
  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
    setSnackbarContent(null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <StyledPaper elevation={3}>
        <Typography variant="h5" gutterBottom>
          Book a Test Drive
        </Typography>
        <FormContainer>
          <DesktopDatePicker
            label="Select Date"
            value={dateFilter}
            onChange={(newDate: Dayjs | null) => setDateFilter(newDate)}
            minDate={dayjs()}
            maxDate={maxDate}
          />
          <TimePicker
            label="Select Time"
            value={timeFilter}
            onChange={(newTime) => setTimeFilter(newTime)}
            // renderInput={(params: any) => <TextField {...params} />}
          />
          <TextField
            select
            label="Duration (minutes)"
            value={durationFilter}
            onChange={(e) => setDurationFilter(Number(e.target.value))}
          >
            <MenuItem value={30}>30</MenuItem>
            <MenuItem value={45}>45</MenuItem>
            <MenuItem value={60}>60</MenuItem>
            <MenuItem value={120}>120</MenuItem>
          </TextField>
          <TextField
            select
            label="Vehicle Type"
            value={vehicleTypeFilter}
            onChange={(e) => setVehicleTypeFilter(e.target.value)}
          >
            {allVehicleTypes.length === 0 && (
              <MenuItem value="">No Vehicles Registered</MenuItem>
            )}
            {allVehicleTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Location"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            {allLocations.length === 0 && (
              <MenuItem value="">No Vehicles Registered</MenuItem>
            )}
            {allLocations.map((location) => (
              <MenuItem key={location} value={location}>
                {location}
              </MenuItem>
            ))}
          </TextField>
          <Button type="button" variant="contained" onClick={checkAvailability}>
            Find Vehicles
          </Button>
        </FormContainer>

        <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>
          {availableVehicles.length
            ? 'Available Vehicles'
            : 'No Vehicles Available'}
        </Typography>
        <Grid2 container spacing={2}>
          {availableVehicles.map((vehicle) => (
            <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={vehicle.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{vehicle.type}</Typography>
                  <Typography color="textSecondary">
                    {vehicle.location}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => setSelectedVehicle(vehicle.id)}
                  >
                    Select
                  </Button>
                </CardActions>
              </Card>
            </Grid2>
          ))}
        </Grid2>

        <Dialog
          open={selectedVehicle !== ''}
          onClose={() => {
            setSelectedVehicle('');
            setName('');
            setEmail('');
            setPhone('');
          }}
        >
          <DialogTitle>Add your details to book your test drive</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Email"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              margin="dense"
              label="Phone"
              fullWidth
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setSelectedVehicle('');
                setName('');
                setEmail('');
                setPhone('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={scheduleTestDrive}>Book Test Drive</Button>
          </DialogActions>
        </Dialog>
      </StyledPaper>
      {snackbarOpen && (
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={5000}
          onClose={handleSnackbarClose}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbarContent?.type}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbarContent?.message}
          </Alert>
        </Snackbar>
      )}
    </LocalizationProvider>
  );
};

export default TestDriveBooking;
