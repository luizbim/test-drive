import { styled } from '@mui/material/styles';
import { Card } from '@mui/material';
export const StyledCard = styled(Card)({
  position: 'relative',
  '&:hover': {
    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
  },
});

export const ActionButtons = styled('div')({
  position: 'absolute',
  top: '10px',
  right: '10px',
});
