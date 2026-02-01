export type User = {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
};

export type MeResponse = {
  user: User;
};
