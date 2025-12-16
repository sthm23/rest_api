

export interface AuthTokenType {
  accessToken: string;
  refreshToken: string;
}

export interface JWTPayload {
  userId: number;
}