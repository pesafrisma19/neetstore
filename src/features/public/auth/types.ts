export interface LoginDto {
  countryCode?: string;
  phone: string;
  password?: string;
  turnstileToken?: string | null;
}

export interface RegisterDto {
  countryCode?: string;
  phone: string;
  password?: string;
  confirmPassword?: string;
  turnstileToken?: string | null;
}

export interface ForgotPasswordDto {
  phone: string;
  turnstileToken?: string | null;
}

export interface AuthResponse {
  token?: string;
  message?: string;
  requiresVerification?: boolean;
  requiresLinking?: boolean;
  linkToken?: string;
  email?: string;
  methods?: {
    password: boolean;
    whatsappOtp: boolean;
  };
  maskedPhone?: string | null;
  phone?: string;
  role?: string;
  level?: string;
  user?: {
    id: number | string;
    username: string;
    role: string;
    level: string;
    balance: number;
    phone?: string | null;
    email?: string | null;
  };
}

export interface LinkOtpResponse {
  success: boolean;
  message: string;
  cooldownSeconds?: number;
  maskedPhone?: string | null;
}
