export interface UserProfile {
  first_name?: string | null;
  last_name?: string | null;
  username: string;
}

export const getDisplayName = (user: UserProfile | null | undefined): string => {
  if (!user) return 'Unknown User';
  
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  
  if (user.first_name) {
    return user.first_name;
  }
  
  if (user.last_name) {
    return user.last_name;
  }
  
  return user.username || 'Unknown User';
};
