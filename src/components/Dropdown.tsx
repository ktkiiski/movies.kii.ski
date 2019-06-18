import * as React from 'react';
import DropdownMenu, { DropdownMenuProps } from './DropdownMenu';

interface DropdownProps extends Omit<DropdownMenuProps, 'open'> {
  button: JSX.Element;
}

interface DropdownState {
  anchorEl?: HTMLElement;
}

class Dropdown extends React.Component<DropdownProps, DropdownState> {

  public state = { anchorEl: undefined };

  public handleOpen: React.MouseEventHandler<HTMLElement> = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  }

  public handleClose: React.MouseEventHandler<HTMLElement> = () => {
    this.setState({ anchorEl: undefined });
  }

  public renderChildren() {
    return React.Children.map(this.props.children, (child) => {
      if (typeof child === 'object' && child && 'props' in child) {
        const { props } = child;
        const onClick = 'onClick' in props && typeof props.onClick === 'function' && props.onClick;
        return React.cloneElement(child, {
          onClick: (event: React.MouseEvent<HTMLElement>) => {
            if (onClick) {
              onClick(event);
            }
            this.handleClose(event);
          },
        });
      }
      return child;
    });
  }

  public render() {
    const { anchorEl } = this.state;
    const { children, button, ...dropdownProps } = this.props;
    const isOpen = Boolean(anchorEl);
    return <>
      {React.cloneElement(button, { onClick: this.handleOpen })}
      <DropdownMenu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={this.handleClose}
        {...dropdownProps}>
        {this.renderChildren()}
      </DropdownMenu>
    </>;
  }
}

export default Dropdown;
