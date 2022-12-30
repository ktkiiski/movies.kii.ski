import { createTheme, adaptV4Theme } from '@mui/material';
import { pink } from '@mui/material/colors';

export const mainTheme = createTheme(adaptV4Theme({
  palette: {
    primary: {
      main: '#1e88e5',
    },
    secondary: pink,
    background: {
      default: '#f5f5f5',
    },
  },
}));

export const darkTheme = createTheme(adaptV4Theme({
  palette: {
    mode: 'dark',
  },
}));
