import { makeStyles } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';
import { recomposeColor } from '@material-ui/core/styles/colorManipulator';
import PersonIcon from '@material-ui/icons/Person';

const useStyles = makeStyles({
  fadedImg: {
    opacity: 0.7,
  },
});

interface ProfileAvatarProps {
  size?: number;
  fade?: string | null;
  className?: string;
  user: {
    id: string;
    name?: string | null;
    picture?: string | null;
  };
}

function PersonAvatar(props: ProfileAvatarProps) {
  const classes = useStyles();
  const { user, size, fade, ...avatarProps } = props;
  const { name, picture, id } = user;
  const hueHex = id.slice(-2);
  const hue = parseInt(hueHex, 16);
  const fontSize = size && Math.floor(size * 0.5);
  const backgroundColor =
    fade ||
    recomposeColor({
      type: 'hsl',
      values: [hue, 65, 50],
    });
  const style = {
    width: size,
    height: size,
    backgroundColor,
    fontSize,
  };
  if (picture) {
    return (
      <Tooltip title={name || ''}>
        <Avatar style={style} src={picture} classes={fade ? { img: classes.fadedImg } : undefined} {...avatarProps} />
      </Tooltip>
    );
  }
  const initialsRegexp = /(^|\b)\w/g;
  let initials = '';
  if (name) {
    let match = initialsRegexp.exec(name);
    if (match) {
      initials += match[0].toLocaleUpperCase();
      match = initialsRegexp.exec(name);
      if (match) {
        initials += match[0].toLocaleUpperCase();
      }
    }
  }
  return (
    <Tooltip title={name || ''}>
      <Avatar style={style} {...props}>
        {initials || <PersonIcon />}
      </Avatar>
    </Tooltip>
  );
}

export default PersonAvatar;
