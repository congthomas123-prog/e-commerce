export type AuthenticatedUser = {
  id: string;
  email: string;
  fullName: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResponseData = AuthTokens & {
  user: AuthenticatedUser;
};

export type RefreshTokenPayload = {
  sub: string;
  email: string;
};
