import React, { useState, useEffect } from 'react';
import {
  CardContent,
  Typography,
  Button,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Delete, Edit, Add } from '@mui/icons-material';
import { StyledCard, ActionButtons } from './vehicle-management.style';
import { Vehicle } from '@libs/scheduler-service-shared';
import {
  addVehicle,
  updateVehicle,
  deleteVehicle,
  getAllVehicles,
} from '../../services/scheduler-service/vehicles';

const VehicleManagement: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleType, setVehicleType] = useState<string>('');
  const [vehicleLocation, setVehicleLocation] = useState<string>('');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async (): Promise<void> => {
    try {
      const { data } = await getAllVehicles();
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const handleAddVehicle = async (): Promise<void> => {
    try {
      await addVehicle({ type: vehicleType, location: vehicleLocation });
      setOpenDialog(false);
      setVehicleType('');
      setVehicleLocation('');
      fetchVehicles();
    } catch (error) {
      console.error('Error adding vehicle:', error);
    }
  };

  const handleEditVehicle = async (): Promise<void> => {
    if (!editingVehicle) return;
    try {
      await updateVehicle(editingVehicle.id, {
        type: vehicleType,
        location: vehicleLocation,
      });
      setOpenDialog(false);
      setEditingVehicle(null);
      setVehicleType('');
      setVehicleLocation('');
      fetchVehicles();
    } catch (error) {
      console.error('Error editing vehicle:', error);
    }
  };

  const handleDeleteVehicle = async (id: string): Promise<void> => {
    try {
      await deleteVehicle(id);
      fetchVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    }
  };

  return (
    <div>
      <Button
        startIcon={<Add />}
        variant="contained"
        color="primary"
        onClick={() => setOpenDialog(true)}
        sx={{ mb: 2 }}
      >
        Add New Vehicle
      </Button>
      <Grid container spacing={2}>
        {vehicles.map((vehicle) => (
          <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6">{vehicle.type}</Typography>
                <Typography color="textSecondary">
                  {vehicle.location}
                </Typography>
              </CardContent>
              <ActionButtons>
                <IconButton
                  onClick={() => {
                    setEditingVehicle(vehicle);
                    setVehicleType(vehicle.type);
                    setVehicleLocation(vehicle.location);
                    setOpenDialog(true);
                  }}
                >
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDeleteVehicle(vehicle.id)}>
                  <Delete />
                </IconButton>
              </ActionButtons>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setEditingVehicle(null);
          setVehicleType('');
          setVehicleLocation('');
        }}
      >
        <DialogTitle>
          {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Vehicle Type"
            fullWidth
            value={vehicleType}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setVehicleType(e.target.value)
            }
          />
          <TextField
            margin="dense"
            label="Location"
            fullWidth
            value={vehicleLocation}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setVehicleLocation(e.target.value)
            }
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenDialog(false);
              setEditingVehicle(null);
              setVehicleType('');
              setVehicleLocation('');
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={editingVehicle ? handleEditVehicle : handleAddVehicle}
            color="primary"
          >
            {editingVehicle ? 'Save Changes' : 'Add Vehicle'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default VehicleManagement;
