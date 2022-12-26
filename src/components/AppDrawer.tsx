import { makeStyles } from '@material-ui/core';
import Drawer, { DrawerProps } from '@material-ui/core/Drawer';

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
