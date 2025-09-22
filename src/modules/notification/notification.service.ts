import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  NotificationResponse,
  SendEmailRequest,
  SendBulkEmailRequest,
  SendTemplateEmailRequest,
  SendBulkTemplateEmailRequest,
  CreateEmailTemplateRequest,
  EmailTemplate,
} from '../../interfaces/notification.interface';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly httpClient: AxiosInstance;
  private readonly notificationServiceUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.notificationServiceUrl =
      this.configService.get<string>('NOTIFICATION_SERVICE_URL') ||
      'http://localhost:4321/api/v1';
    this.httpClient = axios.create({
      baseURL: this.notificationServiceUrl,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => response,
      (error) => {
        this.logger.error(
          `Notification service error: ${error.response?.status} - ${error.response?.data?.message || error.message}`,
        );
        return Promise.reject(error);
      },
    );
  }

  // Email Sending Methods
  async sendEmail(emailData: SendEmailRequest): Promise<NotificationResponse> {
    try {
      const response = await this.httpClient.post('/notifications/send-email', emailData);
      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to send email: ${error.message}`);
      throw error;
    }
  }

  async sendBulkEmail(emailData: SendBulkEmailRequest): Promise<NotificationResponse> {
    try {
      const response = await this.httpClient.post('/notifications/send-bulk-email', emailData);
      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to send bulk email: ${error.message}`);
      throw error;
    }
  }

  async sendTemplateEmail(emailData: SendTemplateEmailRequest): Promise<NotificationResponse> {
    try {
      const response = await this.httpClient.post('/notifications/send-template-email', emailData);
      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to send template email: ${error.message}`);
      throw error;
    }
  }

  async sendBulkTemplateEmail(
    emailData: SendBulkTemplateEmailRequest,
  ): Promise<NotificationResponse> {
    try {
      const response = await this.httpClient.post(
        '/notifications/send-bulk-template-email',
        emailData,
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to send bulk template email: ${error.message}`);
      throw error;
    }
  }

  // Template Management Methods
  async createEmailTemplate(templateData: CreateEmailTemplateRequest): Promise<EmailTemplate> {
    try {
      const response = await this.httpClient.post('/notifications/templates', templateData);
      return response.data.data.template;
    } catch (error: any) {
      this.logger.error(`Failed to create email template: ${error.message}`);
      throw error;
    }
  }

  async getEmailTemplates(): Promise<EmailTemplate[]> {
    try {
      const response = await this.httpClient.get('/notifications/templates');
      return response.data.data.templates;
    } catch (error: any) {
      this.logger.error(`Failed to get email templates: ${error.message}`);
      throw error;
    }
  }

  async getEmailTemplateByName(name: string): Promise<EmailTemplate> {
    try {
      const response = await this.httpClient.get(`/notifications/templates/${name}`);
      return response.data.data.template;
    } catch (error: any) {
      this.logger.error(`Failed to get email template: ${error.message}`);
      throw error;
    }
  }

  async updateEmailTemplate(
    id: string,
    templateData: Partial<CreateEmailTemplateRequest>,
  ): Promise<EmailTemplate> {
    try {
      const response = await this.httpClient.put(`/notifications/templates/${id}`, templateData);
      return response.data.data.template;
    } catch (error: any) {
      this.logger.error(`Failed to update email template: ${error.message}`);
      throw error;
    }
  }

  async deleteEmailTemplate(id: string): Promise<{ message: string }> {
    try {
      const response = await this.httpClient.delete(`/notifications/templates/${id}`);
      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to delete email template: ${error.message}`);
      throw error;
    }
  }

  // Notification Management Methods
  async getNotifications(params: {
    status?: string;
    recipientEmail?: string;
    campaignId?: string;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<NotificationResponse> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await this.httpClient.get(`/notifications?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to get notifications: ${error.message}`);
      throw error;
    }
  }

  async getNotificationById(id: string): Promise<NotificationResponse> {
    try {
      const response = await this.httpClient.get(`/notifications/${id}`);
      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to get notification: ${error.message}`);
      throw error;
    }
  }

  async retryNotification(id: string): Promise<NotificationResponse> {
    try {
      const response = await this.httpClient.post(`/notifications/${id}/retry`);
      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to retry notification: ${error.message}`);
      throw error;
    }
  }

  async getNotificationStats(): Promise<NotificationResponse> {
    try {
      const response = await this.httpClient.get('/notifications/stats');
      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to get notification stats: ${error.message}`);
      throw error;
    }
  }

  // Health and Status Methods
  async getHealthStatus(): Promise<any> {
    try {
      const response = await this.httpClient.get('/health');
      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to get notification service health: ${error.message}`);
      throw error;
    }
  }

  async getSimpleHealthStatus(): Promise<{ status: string }> {
    try {
      const response = await this.httpClient.get('/health/simple');
      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to get simple health status: ${error.message}`);
      throw error;
    }
  }

  async getHealthStats(): Promise<NotificationResponse> {
    try {
      const response = await this.httpClient.get('/health/stats');
      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to get health stats: ${error.message}`);
      throw error;
    }
  }

  // Convenience Methods for Common Use Cases
  async sendWelcomeEmail(
    recipientEmail: string,
    recipientName: string,
    templateData: object,
  ): Promise<NotificationResponse> {
    return this.sendTemplateEmail({
      recipientEmail,
      recipientName,
      templateName: 'welcome',
      templateData,
      priority: 'normal',
      metadata: { source: 'user_registration' },
    });
  }

  async sendHackathonNotification(
    recipientEmail: string,
    recipientName: string,
    subject: string,
    content: string,
    htmlContent?: string,
    hackathonId?: string,
  ): Promise<NotificationResponse> {
    return this.sendEmail({
      recipientEmail,
      recipientName,
      subject,
      content,
      htmlContent,
      priority: 'normal',
      metadata: {
        source: 'hackathon_notification',
        hackathon_id: hackathonId,
      },
    });
  }

  async sendTeamInvitationEmail(
    recipientEmail: string,
    recipientName: string,
    teamName: string,
    inviterName: string,
    hackathonTitle: string,
    invitationLink: string,
  ): Promise<NotificationResponse> {
    return this.sendTemplateEmail({
      recipientEmail,
      recipientName,
      templateName: 'team_invitation',
      templateData: {
        teamName,
        inviterName,
        hackathonTitle,
        invitationLink,
      },
      priority: 'high',
      metadata: { source: 'team_invitation' },
    });
  }

  async sendSubmissionDeadlineReminder(
    recipientEmails: string[],
    hackathonTitle: string,
    deadlineDate: string,
    submissionUrl: string,
  ): Promise<NotificationResponse> {
    return this.sendBulkTemplateEmail({
      recipients: recipientEmails.map((email) => ({
        email,
        templateData: {
          hackathonTitle,
          deadlineDate,
          submissionUrl,
        },
      })),
      templateName: 'submission_deadline_reminder',
      priority: 'high',
      metadata: { source: 'deadline_reminder' },
    });
  }

  async sendResultsAnnouncement(
    recipientEmail: string,
    recipientName: string,
    hackathonTitle: string,
    rank?: number,
    awardTitle?: string,
    resultsUrl?: string,
  ): Promise<NotificationResponse> {
    return this.sendTemplateEmail({
      recipientEmail,
      recipientName,
      templateName: 'results_announcement',
      templateData: {
        hackathonTitle,
        rank,
        awardTitle,
        resultsUrl,
        isWinner: rank !== undefined && rank <= 3,
      },
      priority: 'high',
      metadata: { source: 'results_announcement' },
    });
  }
}