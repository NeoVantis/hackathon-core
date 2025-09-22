export interface AuthUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  college?: string;
  address?: string;
  stepOneComplete: boolean;
  stepTwoComplete: boolean;
  isVerified: boolean;
  isActive: boolean;
  passwordResetCount: number;
  lastPasswordReset?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthAdmin {
  id: string;
  name: string;
  username: string;
  role: number; // 0 = Super Admin, 1 = Admin
  createdAt: Date;
  updatedAt: Date;
}

export interface SignInResponse {
  access_token: string;
  user: AuthUser;
}

export interface AdminSignInResponse {
  access_token: string;
  userRole: number;
}

export interface AdminMeResponse {
  admin: AuthAdmin;
}

export interface UserFindResponse {
  user: AuthUser;
}

export interface TokenVerificationResponse {
  valid: boolean;
  user?: {
    id: string;
    username: string;
    email: string;
  };
  message?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
}

export interface CompleteRegistrationRequest {
  fullName: string;
  phoneNumber?: string;
  college?: string;
  address?: string;
}

export interface UpdateUserRequest {
  fullName?: string;
  phoneNumber?: string;
  college?: string;
  address?: string;
}