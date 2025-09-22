# Hackathon Core API

A comprehensive hackathon management system built with NestJS, TypeORM, and PostgreSQL. This system integrates with NeoVantis Auth Service and Notification Service to provide complete hackathon management capabilities.

## Features

### Core Functionality
- **Hackathon Management**: Create, update, publish, and manage hackathons
- **Team Management**: Team registration, member management, and team analytics
- **Submission Management**: Handle project submissions with file uploads and AI scoring
- **User Authentication**: Integration with NeoVantis Auth Service for admin and user management
- **Notifications**: Email notifications and bulk messaging via NeoVantis Notification Service

### Analytics & Reporting
- **Real-time Analytics**: Track registrations, submissions, and participation rates
- **Data Export**: Export hackathon data in JSON/CSV formats
- **Activity Logging**: Comprehensive audit trail of all user and admin actions
- **Performance Metrics**: AI scoring integration and team performance tracking

### API Features
- **RESTful APIs**: Complete CRUD operations for all entities
- **Authentication**: JWT-based authentication with role-based access control
- **File Upload**: Support for project files, presentations, and media
- **Rate Limiting**: Built-in protection against API abuse
- **Health Checks**: Application monitoring and status endpoints

## Technology Stack

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT tokens
- **File Storage**: Local filesystem (configurable)
- **External Services**: NeoVantis Auth & Notification Services
- **Deployment**: Docker & Docker Compose
- **Load Balancer**: Nginx (optional)

## Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose (for containerized deployment)

## Installation

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hackathon-core
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start PostgreSQL database**
   ```bash
   npm run docker:dev
   ```

5. **Run the application**
   ```bash
   npm run start:dev
   ```

The application will be available at `http://localhost:3002`

### Docker Deployment

1. **Production deployment**
   ```bash
   npm run docker:up
   ```

2. **Development with external database**
   ```bash
   npm run docker:dev
   npm run start:dev
   ```

## Configuration

### Environment Variables

See `.env.example` for all available configuration options:

#### Required Variables
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`: Database connection
- `JWT_SECRET`: JWT token signing secret
- `AUTH_SERVICE_URL`: NeoVantis Auth Service endpoint
- `NOTIFICATION_SERVICE_URL`: NeoVantis Notification Service endpoint

#### Optional Variables
- `PORT`: Application port (default: 3002)
- `NODE_ENV`: Environment (development/production)
- `CORS_ORIGIN`: Allowed CORS origins
- `UPLOAD_PATH`: File upload directory
- `MAX_FILE_SIZE`: Maximum file upload size

## API Documentation

### Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

### Main Endpoints

#### Hackathons
- `GET /hackathons` - List hackathons
- `POST /hackathons` - Create hackathon (Admin)
- `GET /hackathons/:id` - Get hackathon details
- `PATCH /hackathons/:id` - Update hackathon (Admin)
- `DELETE /hackathons/:id` - Delete hackathon (Admin)
- `POST /hackathons/:id/publish` - Publish hackathon (Admin)

#### Teams
- `GET /teams` - List teams
- `POST /teams` - Create team
- `GET /teams/:id` - Get team details
- `PATCH /teams/:id` - Update team
- `DELETE /teams/:id` - Delete team

#### Submissions
- `GET /submissions` - List submissions
- `POST /submissions` - Create submission
- `GET /submissions/:id` - Get submission details
- `PATCH /submissions/:id` - Update submission
- `DELETE /submissions/:id` - Delete submission

#### Analytics (Admin only)
- `GET /analytics/overall` - Overall platform analytics
- `GET /analytics/hackathon/:id` - Hackathon-specific analytics
- `GET /analytics/export/hackathon/:id` - Export hackathon data

#### Activity Logs (Admin only)
- `GET /activity-logs` - View activity logs
- `GET /activity-logs/summary` - Activity summary

### Query Parameters

Most list endpoints support:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status
- Various entity-specific filters

## Database Schema

The application uses PostgreSQL with the following main entities:

### Core Entities
- **Hackathons**: Event details, timeline, rules
- **Teams**: Team information and member management
- **Submissions**: Project submissions with files and scoring
- **Users**: Participant information (via Auth Service)
- **Admins**: Administrative users (via Auth Service)

### Supporting Entities
- **Activity Logs**: Audit trail of all actions
- **Team Members**: Team membership relationships
- **Submission Criteria**: Scoring criteria and results
- **Announcements**: Event announcements
- **Analytics Data**: Cached analytics information

## External Service Integration

### NeoVantis Auth Service
- User authentication and management
- Admin role verification
- JWT token validation
- User profile information

### NeoVantis Notification Service
- Email notifications
- Bulk messaging campaigns
- Template-based communications
- Delivery tracking

## Development

### Available Scripts

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debugging
npm run build              # Build for production
npm run start:prod         # Start production build

# Database
npm run db:migrate         # Run database migrations
npm run db:rollback        # Rollback last migration
npm run db:seed            # Seed database with test data

# Testing
npm run test               # Run unit tests
npm run test:e2e           # Run end-to-end tests
npm run test:cov           # Run tests with coverage

# Docker
npm run docker:build       # Build Docker image
npm run docker:up          # Start production containers
npm run docker:dev         # Start development database
npm run docker:logs        # View application logs

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format code with Prettier
```

### Project Structure

```
src/
├── common/              # Shared utilities, guards, decorators
├── entities/           # TypeORM entities
├── modules/            # Feature modules
│   ├── auth/           # Authentication integration
│   ├── hackathon/      # Hackathon management
│   ├── team/           # Team management
│   ├── submission/     # Submission handling
│   ├── analytics/      # Analytics and reporting
│   ├── activity-log/   # Activity logging
│   └── notification/   # Notification integration
├── app.module.ts       # Main application module
└── main.ts            # Application entry point
```

## Deployment

### Docker Production Deployment

1. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

2. **Deploy with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Set up Nginx (optional)**
   - Configure SSL certificates
   - Update nginx.conf with your domain
   - Enable HTTPS configuration

### Database Migrations

The application automatically runs migrations on startup. For manual migration management:

```bash
# Generate new migration
npm run db:generate -- --name MigrationName

# Run migrations
npm run db:migrate

# Rollback migration
npm run db:rollback
```

## Monitoring and Health Checks

### Health Endpoint
- `GET /health` - Application health status

### Docker Health Checks
The Docker container includes built-in health checks that monitor:
- Application responsiveness
- Database connectivity
- External service availability

### Logging
- Application logs to console and files
- Activity logs stored in database
- Request/response logging in development

## Security

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin/User)
- Token expiration and refresh

### API Security
- Rate limiting on all endpoints
- Input validation and sanitization
- CORS configuration
- Security headers via Nginx

### Data Protection
- Database connection encryption
- Secure file upload handling
- Audit trail for all actions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in `/docs`

## License

This project is proprietary software developed for NeoVantis.

---

**Note**: This application is designed to work with the NeoVantis ecosystem. Ensure proper configuration of external services for full functionality.
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
