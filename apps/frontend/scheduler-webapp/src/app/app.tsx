import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material/styles';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import BaseLayout from '../layouts/base-layout';
import TestDriveBooking from '../pages/test-drive-booking/test-drive-booking';
import VehicleManagement from '../pages/admin-area/vehicle-management';
import AuthGuard from '../components/auth-guard';

function App() {
  return (
    <ThemeProvider theme={createTheme()}>
      <CssBaseline />
      <Router>
        <BaseLayout>
          <Routes>
            <Route path="/" element={<TestDriveBooking />} />
            <Route
              path="/vehicle-management"
              element={<AuthGuard component={VehicleManagement} />}
            />
          </Routes>
        </BaseLayout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
