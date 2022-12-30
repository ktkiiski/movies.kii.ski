import Drawer, { DrawerProps } from '@mui/material/Drawer';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles({
  drawerContents: {
    width: 250,
  },
});

export default function AppDrawer({ children, ...props }: DrawerProps) {
  const classes = useStyles();
  return (
    <Drawer {...props}>
      <div className={classes.drawerContents}>{children}</div>
    </Drawer>
  );
}
