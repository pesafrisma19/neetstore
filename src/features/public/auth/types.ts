export interface LoginDto {
  username?: string;
  password?: string;
}

export interface RegisterDto {
  username?: string;
  password?: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    role: string;
    level: string;
    balance: number;
    phone?: string;
  };
}
