import { styled } from '@mui/system';
import { Paper } from '@mui/material';
export const StyledPaper = styled(Paper)(() => ({
  padding: '20px',
  margin: '20px auto',
}));

export const FormContainer = styled('form')(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
}));
