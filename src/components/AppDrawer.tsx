import Drawer, {DrawerProps} from '@material-ui/core/Drawer';
import { withStyles } from '@material-ui/core/styles';
import { Omit } from 'broilerkit/utils/objects';
import * as React from 'react';

const stylize = withStyles(() => ({
    drawerContents: {
        width: 250,
    },
}));

const AppDrawer = stylize<Omit<DrawerProps, 'classes'>>(({classes, children, ...props}) => (
    <Drawer {...props}>
        <div className={classes.drawerContents}>{children}</div>
    </Drawer>
));

export default AppDrawer;
