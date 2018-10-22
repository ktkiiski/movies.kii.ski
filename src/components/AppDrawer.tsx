import Drawer, {DrawerProps} from '@material-ui/core/Drawer';
import { createStyles, withStyles, WithStyles } from '@material-ui/core/styles';
import { Omit } from 'broilerkit/utils/objects';
import * as React from 'react';

const styles = createStyles({
    drawerContents: {
        width: 250,
    },
});

type AppDrawerProps = Omit<DrawerProps, 'classes'> & WithStyles<typeof styles>;

const AppDrawer = ({classes, children, ...props}: AppDrawerProps) => (
    <Drawer {...props}>
        <div className={classes.drawerContents}>{children}</div>
    </Drawer>
);

export default withStyles(styles)(AppDrawer);
