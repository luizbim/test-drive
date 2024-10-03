import React from 'react';
import { CircularProgress, Box } from '@mui/material';

const PageLoader: React.FC = () => {
  return (
    <Box>
      <CircularProgress />
    </Box>
  );
};

export default PageLoader;
