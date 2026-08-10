export interface LoginDto {
  countryCode?: string;
  phone: string;
  password?: string;
}

export interface RegisterDto {
  countryCode?: string;
  phone: string;
  password?: string;
  confirmPassword?: string;
}

export interface AuthResponse {
  token?: string;
  message?: string;
  requiresVerification?: boolean;
  phone?: string;
  role?: string;
  level?: string;
  user?: {
    id: string;
    username: string;
    role: string;
    level: string;
    balance: number;
    phone?: string;
  };
}
