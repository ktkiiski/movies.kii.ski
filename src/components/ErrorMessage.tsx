import Typography from '@material-ui/core/Typography';
import * as React from 'react';

const ErrorMessage = ({message}: {message: string}) => (
    <Typography>{message}</Typography>
);

export default ErrorMessage;
