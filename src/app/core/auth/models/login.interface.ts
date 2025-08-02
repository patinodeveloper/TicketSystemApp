export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number; // segundos
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface JwtPayload {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  roles: string[];
  tokenType: string;
  sub: string;
  iat: number;
  exp: number;
}
