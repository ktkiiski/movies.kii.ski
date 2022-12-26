import { createTheme } from '@material-ui/core';
import { pink } from '@material-ui/core/colors';

export const mainTheme = createTheme({
  palette: {
    primary: {
      main: '#1e88e5',
    },
    secondary: pink,
    background: {
      default: '#f5f5f5',
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    type: 'dark',
  },
});
