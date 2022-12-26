import usePublicProfile from '../hooks/usePublicProfile';
import PersonAvatar from './PersonAvatar';

interface ProfileAvatarProps {
  size?: number;
  fade?: string | null;
  className?: string;
  profileId: string;
}

const profilePlaceholder = {
  id: '00000000-0000-0000-0000-000000000000',
  name: '',
  picture: null,
};

export default function ProfileAvatar({ size, profileId, fade, className }: ProfileAvatarProps) {
  const [profile] = usePublicProfile(profileId);
  return <PersonAvatar user={profile ?? profilePlaceholder} size={size} fade={fade} className={className} />;
}
