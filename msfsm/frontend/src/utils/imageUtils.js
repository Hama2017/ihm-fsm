import { PROFILE_PICTURE_PATH } from '@/config/api.config';

export function getProfilePictureUrl(filename) {
  if (!filename) return 'https://i.pravatar.cc/150?img=1';
  return `${PROFILE_PICTURE_PATH}/${filename}`;
}