import Menu, { MenuProps } from '@material-ui/core/Menu';
import * as React from 'react';

export interface DropdownMenuProps extends MenuProps {
  align?: 'left' | 'right';
}

const DropdownMenu = ({ align, ...props }: DropdownMenuProps) => (
  <Menu
    anchorOrigin={{ vertical: 'bottom', horizontal: align || 'left' }}
    transformOrigin={{ vertical: 'top', horizontal: align || 'left' }}
    getContentAnchorEl={undefined}
    disableRestoreFocus
    {...props}>{props.children}</Menu>
);

export default DropdownMenu;
