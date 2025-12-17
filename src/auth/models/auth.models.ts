

export interface AuthTokenType {
  accessToken: string;
  refreshToken: string;
}

export interface JWTPayload {
  sub: number;
  sessionId?: string;
}