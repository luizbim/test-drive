import React from 'react';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PageLoader from '../components/page-loader';

const GradientAppBar = styled(AppBar)(() => ({
  background: 'linear-gradient(45deg, #F05A7E 30%, #FFBE98 90%)',
  boxShadow: '0 3px 5px 2px rgba(240, 90, 126, .3)',
  backgroundColor: 'white',
}));

const ContentArea = styled(Container)(() => ({
  paddingTop: '80px',
  paddingBottom: '20px',
}));

const BaseButton = styled(Button)(() => ({
  backgroundColor: '#125B9A',
}));

interface DefaultLayoutProps {
  children: React.ReactNode;
}

const BaseLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { loginWithRedirect, isLoading, isAuthenticated, logout } = useAuth0();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <GradientAppBar position="static">
        <Toolbar>
          {!isLoading && isAuthenticated && (
            <div>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-controls={open ? 'basic-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-haspopup="true"
                aria-label="menu"
                sx={{ mr: 2 }}
                onClick={handleClick}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                  'aria-labelledby': 'basic-button',
                }}
              >
                <MenuItem
                  onClick={() => {
                    navigate('vehicle-management');
                    handleClose();
                  }}
                >
                  <ListItemIcon>
                    <ElectricCarIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Vehicle Management</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    navigate('/');
                    handleClose();
                  }}
                >
                  <ListItemIcon>
                    <MenuBookIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Test Drive Booking</ListItemText>
                </MenuItem>
              </Menu>
            </div>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Test Drive Booking
          </Typography>
          {!isLoading && !isAuthenticated && (
            <BaseButton
              onClick={() =>
                loginWithRedirect({
                  appState: {
                    returnTo: window.location.origin,
                  },
                })
              }
              color="warning"
              variant="contained"
            >
              ADMIN AREA
            </BaseButton>
          )}
          {!isLoading && isAuthenticated && (
            <BaseButton
              onClick={() =>
                logout({
                  logoutParams: {
                    returnTo: window.location.origin,
                  },
                })
              }
              color="warning"
              variant="contained"
            >
              LOGOUT
            </BaseButton>
          )}
        </Toolbar>
      </GradientAppBar>

      <ContentArea maxWidth="lg">
        {isLoading ? <PageLoader /> : children}
      </ContentArea>
    </Box>
  );
};

export default BaseLayout;
