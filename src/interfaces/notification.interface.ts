export interface NotificationResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface SendEmailRequest {
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  content: string;
  htmlContent?: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  scheduledAt?: string;
  metadata?: object;
  campaignId?: string;
}

export interface SendBulkEmailRequest {
  recipientEmails: string[];
  subject: string;
  content: string;
  htmlContent?: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  scheduledAt?: string;
  metadata?: object;
  campaignId?: string;
}

export interface SendTemplateEmailRequest {
  recipientEmail: string;
  recipientName?: string;
  templateName: string;
  templateData: object;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  scheduledAt?: string;
  metadata?: object;
  campaignId?: string;
}

export interface SendBulkTemplateEmailRequest {
  recipients: Array<{
    email: string;
    name?: string;
    templateData: object;
  }>;
  templateName: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  scheduledAt?: string;
  metadata?: object;
  campaignId?: string;
}

export interface CreateEmailTemplateRequest {
  name: string;
  subject: string;
  textContent: string;
  htmlContent: string;
  description?: string;
  defaultData?: object;
  requiredVariables?: string[];
  category?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  textContent?: string;
  htmlContent?: string;
  isActive: boolean;
  description?: string;
  defaultData?: object;
  requiredVariables?: string[];
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}