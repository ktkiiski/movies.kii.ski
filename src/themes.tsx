import { createMuiTheme } from '@material-ui/core';
import { pink } from '@material-ui/core/colors';

export const mainTheme = createMuiTheme({
    palette: {
        primary: {
            main: '#1e88e5',
        },
        secondary: pink,
        background: {
            default: '#f5f5f5',
        },
    },
    typography: {
        useNextVariants: true,
    },
});

export const darkTheme = createMuiTheme({
    palette: {
        type: 'dark',
    },
    typography: {
        useNextVariants: true,
    },
});
