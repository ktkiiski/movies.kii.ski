import Paper from '@material-ui/core/Paper';
import * as React from 'react';
import Spacer from './layout/Spacer';

interface PanelProps {
  children?: React.ReactNode;
  elevation?: number;
}

const Panel = ({ children, elevation = 1 }: PanelProps) => (
  <Paper elevation={elevation}>
    <Spacer>{children}</Spacer>
  </Paper>
);

export default Panel;
