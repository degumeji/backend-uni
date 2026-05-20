export interface TokenPayload {
  sub: string;       // user id
  email: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export abstract class TokenServicePort {
  abstract generateTokenPair(payload: TokenPayload): Promise<TokenPair>;
  abstract verifyAccessToken(token: string): Promise<TokenPayload>;
  abstract verifyRefreshToken(token: string): Promise<TokenPayload>;
  abstract blacklistToken(token: string, ttlSeconds: number): Promise<void>;
  abstract isTokenBlacklisted(token: string): Promise<boolean>;
}
