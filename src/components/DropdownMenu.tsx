import Menu, { MenuProps } from '@mui/material/Menu';

export interface DropdownMenuProps extends MenuProps {
  align?: 'left' | 'right';
}

export default function DropdownMenu({ align, children, ...props }: DropdownMenuProps) {
  return (
    <Menu
      anchorOrigin={{ vertical: 'bottom', horizontal: align || 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: align || 'left' }}
      disableRestoreFocus
      {...props}
    >
      {children}
    </Menu>
  );
}
