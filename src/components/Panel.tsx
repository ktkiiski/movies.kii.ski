import Paper from '@mui/material/Paper';
import * as React from 'react';
import Spacer from './layout/Spacer';

interface PanelProps {
  children?: React.ReactNode;
  elevation?: number;
}

export default function Panel({ children, elevation = 1 }: PanelProps) {
  return (
    <Paper elevation={elevation}>
      <Spacer>{children}</Spacer>
    </Paper>
  );
}
