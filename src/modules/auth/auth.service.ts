import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  AuthUser,
  AuthAdmin,
  SignInResponse,
  AdminSignInResponse,
  AdminMeResponse,
  UserFindResponse,
  TokenVerificationResponse,
  CreateUserRequest,
  CompleteRegistrationRequest,
  UpdateUserRequest,
} from '../../interfaces/auth.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly httpClient: AxiosInstance;
  private readonly authServiceUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL') || 'http://localhost:3000/api/v1';
    this.httpClient = axios.create({
      baseURL: this.authServiceUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => response,
      (error) => {
        this.logger.error(
          `Auth service error: ${error.response?.status} - ${error.response?.data?.message || error.message}`,
        );
        return Promise.reject(error);
      },
    );
  }

  // Admin Authentication Methods
  async adminSignIn(username: string, password: string): Promise<AdminSignInResponse> {
    try {
      const response = await this.httpClient.post('/admin/login', {
        username,
        password,
      });
      return response.data;
    } catch (error) {
      throw new UnauthorizedException('Invalid admin credentials');
    }
  }

  async getAdminProfile(token: string): Promise<AuthAdmin> {
    try {
      const response = await this.httpClient.get('/admin/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.admin;
    } catch (error) {
      throw new UnauthorizedException('Invalid admin token');
    }
  }

  async createAdmin(
    token: string,
    adminData: {
      name: string;
      username: string;
      password: string;
      role: number;
    },
  ): Promise<AuthAdmin> {
    try {
      const response = await this.httpClient.post('/admin/create', adminData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to create admin: ${error.message}`);
      throw error;
    }
  }

  async listAllAdmins(token: string): Promise<AuthAdmin[]> {
    try {
      const response = await this.httpClient.get('/admin/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to list admins: ${error.message}`);
      throw error;
    }
  }

  // User Authentication Methods
  async userSignIn(identifier: string, password: string): Promise<SignInResponse> {
    try {
      const response = await this.httpClient.post('/auth/signin', {
        identifier,
        password,
      });
      return response.data;
    } catch (error) {
      throw new UnauthorizedException('Invalid user credentials');
    }
  }

  async createUser(userData: CreateUserRequest): Promise<{ userId: string; message: string }> {
    try {
      const response = await this.httpClient.post('/auth/signup/step1', userData);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`);
      throw error;
    }
  }

  async completeUserRegistration(
    userId: string,
    userData: CompleteRegistrationRequest,
  ): Promise<SignInResponse> {
    try {
      const response = await this.httpClient.post(`/auth/signup/step2/${userId}`, userData);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to complete user registration: ${error.message}`);
      throw error;
    }
  }

  async verifyToken(token: string): Promise<TokenVerificationResponse> {
    try {
      const response = await this.httpClient.post('/auth/verify-token', { token });
      return response.data;
    } catch (error) {
      return { valid: false, message: 'Invalid token' };
    }
  }

  async getUserProfile(token: string): Promise<AuthUser> {
    try {
      const response = await this.httpClient.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.user;
    } catch (error) {
      throw new UnauthorizedException('Invalid user token');
    }
  }

  async findUser(params: { username?: string; email?: string }): Promise<AuthUser> {
    try {
      const queryParams = new URLSearchParams();
      if (params.username) queryParams.append('username', params.username);
      if (params.email) queryParams.append('email', params.email);

      const response = await this.httpClient.get(`/users/find?${queryParams.toString()}`);
      return response.data.user;
    } catch (error) {
      this.logger.error(`Failed to find user: ${error.message}`);
      throw error;
    }
  }

  async getUserById(id: string): Promise<AuthUser> {
    try {
      const response = await this.httpClient.get(`/users/${id}`);
      return response.data.user;
    } catch (error) {
      this.logger.error(`Failed to get user by ID: ${error.message}`);
      throw error;
    }
  }

  async updateUser(id: string, token: string, userData: UpdateUserRequest): Promise<AuthUser> {
    try {
      const response = await this.httpClient.put(`/users/${id}`, userData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.user;
    } catch (error) {
      this.logger.error(`Failed to update user: ${error.message}`);
      throw error;
    }
  }

  async deactivateUser(id: string, token: string): Promise<{ message: string }> {
    try {
      const response = await this.httpClient.delete(`/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to deactivate user: ${error.message}`);
      throw error;
    }
  }

  // Admin User Management Methods
  async getUsers(
    token: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      searchField?: string;
      verified?: boolean;
      active?: boolean;
      sortBy?: string;
      sortOrder?: string;
    } = {},
  ): Promise<{
    users: AuthUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await this.httpClient.get(`/admin/users?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get users: ${error.message}`);
      throw error;
    }
  }

  async adminDeactivateUser(userId: string, token: string): Promise<{ message: string }> {
    try {
      const response = await this.httpClient.post(
        `/admin/users/${userId}/deactivate`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to deactivate user: ${error.message}`);
      throw error;
    }
  }

  // Email Verification Methods
  async requestEmailVerification(email: string): Promise<{ otpId: string; message: string }> {
    try {
      const response = await this.httpClient.post('/auth/request-email-verification', { email });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to request email verification: ${error.message}`);
      throw error;
    }
  }

  async verifyEmail(otpId: string, code: string): Promise<{ message: string }> {
    try {
      const response = await this.httpClient.post('/auth/verify-email', { otpId, code });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to verify email: ${error.message}`);
      throw error;
    }
  }

  async resendEmailVerification(otpId: string): Promise<{ message: string }> {
    try {
      const response = await this.httpClient.post('/auth/resend-email-verification', { otpId });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to resend email verification: ${error.message}`);
      throw error;
    }
  }

  // Password Reset Methods
  async requestPasswordReset(email: string): Promise<{ otpId: string; message: string }> {
    try {
      const response = await this.httpClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to request password reset: ${error.message}`);
      throw error;
    }
  }

  async resetPassword(
    otpId: string,
    code: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    try {
      const response = await this.httpClient.post('/auth/reset-password', {
        otpId,
        code,
        newPassword,
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to reset password: ${error.message}`);
      throw error;
    }
  }
}