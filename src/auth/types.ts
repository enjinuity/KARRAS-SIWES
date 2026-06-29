export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

export type AuthPayload = {
  token: string;
  user: AuthUser;
};
