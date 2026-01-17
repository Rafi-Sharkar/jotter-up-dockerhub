# Jotter Server - NestJS + Prisma + PostgreSQL

A production-ready NestJS application with Prisma ORM, PostgreSQL database, authentication, file management, and Docker support.

## 🚀 Features

- **NestJS Framework**: Modern, scalable Node.js framework
- **Prisma ORM**: Type-safe database access
- **PostgreSQL**: Reliable database with Docker support
- **Authentication**: JWT-based auth with refresh tokens
- **File Management**: Cloudinary & AWS S3 integration
- **Email Service**: SMTP email support with templates
- **API Documentation**: Swagger/OpenAPI documentation
- **Docker Ready**: Multi-stage builds optimized for production
- **Docker Hub**: Ready to deploy to Docker Hub

## 📋 Prerequisites

- Node.js 24+ (or use Docker)
- pnpm (or npm/yarn)
- Docker & Docker Compose (for containerized setup)
- Docker Hub account (for deployment)

## 🛠️ Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Rafi-Sharkar/jotter-server.git
cd jotter-server
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and update with your values:
- Database credentials
- JWT secret
- SMTP settings (optional)
- Cloudinary/AWS credentials (optional)

### 4. Start Database with Docker

```bash
docker compose --profile dev up -d
```

### 5. Run Database Migrations

```bash
pnpm db:migrate
```

### 6. Start Development Server

```bash
pnpm dev
```

### 7. Access API Documentation

Open your browser and navigate to:
```
http://localhost:5000/docs
```

## 🐳 Docker Hub Deployment

This project is ready to be deployed to Docker Hub. Follow these steps:

### Quick Deploy

**Windows (PowerShell):**
```powershell
.\docker-build-push.ps1
```

**Linux/Mac:**
```bash
chmod +x docker-build-push.sh
./docker-build-push.sh
```

### Manual Deploy

1. **Configure `.env` file**:
```env
DOCKER_USERNAME=your-dockerhub-username
PACKAGE_NAME=jotter-app
PACKAGE_VERSION=1.0.2
```

2. **Login to Docker Hub**:
```bash
docker login
```

3. **Build the image**:
```bash
docker build -t your-username/jotter-app:1.0.2 .
docker build -t your-username/jotter-app:latest .
```

4. **Push to Docker Hub**:
```bash
docker push your-username/jotter-app:1.0.2
docker push your-username/jotter-app:latest
```

For detailed instructions, see [DOCKER_HUB_GUIDE.md](DOCKER_HUB_GUIDE.md)

## 🚢 Production Deployment

### Using Docker Compose

```bash
docker-compose -f docker-compose.prod.yaml up -d
```

This will start:
- **API Server** (Port 5000)
- **PostgreSQL Database** (Port 5443 → 5432)
- **Caddy Reverse Proxy** (Ports 80, 443)

### Pull from Docker Hub

```bash
docker pull your-username/jotter-app:latest
docker run -d -p 5000:5000 --env-file .env your-username/jotter-app:latest
```

## 📜 Available Scripts

```bash
# Development
pnpm dev              # Start dev server with watch mode
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm db:migrate       # Run migrations
pnpm db:generate      # Generate Prisma client
pnpm db:studio        # Open Prisma Studio
pnpm db:push          # Push schema changes
pnpm db:reset         # Reset database

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm format           # Check code formatting
pnpm format:fix       # Fix code formatting

# CI/CD
pnpm ci:check         # Run all checks
pnpm ci:fix           # Fix all issues
```

## 🏗️ Project Structure

```
.
├── src/
│   ├── main/              # Main application modules
│   │   ├── auth/          # Authentication
│   │   └── file-system/   # File management
│   ├── lib/               # Shared libraries
│   │   ├── prisma/        # Database service
│   │   ├── mail/          # Email service
│   │   └── file/          # File service
│   ├── core/              # Core utilities
│   │   ├── jwt/           # JWT guards & strategies
│   │   ├── filter/        # Exception filters
│   │   └── pipe/          # Custom pipes
│   └── common/            # Common DTOs & utils
├── prisma/
│   ├── schema/            # Prisma schema files
│   └── migrations/        # Database migrations
├── Dockerfile             # Production-ready Dockerfile
├── docker-compose.prod.yaml  # Production compose file
└── compose.yaml           # Development compose file
```

## 🔑 Environment Variables

Key variables in `.env`:

```env
# App
NODE_ENV=production
BASE_URL=http://localhost:5000
PORT=5000

# Docker Hub
DOCKER_USERNAME=your-username
PACKAGE_NAME=jotter-app
PACKAGE_VERSION=1.0.2

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5443/jotter_db

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=90d

# SMTP (Optional)
MAIL_USER=your-email@example.com
MAIL_PASS=your-app-password

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 🔧 Configuration

### Database

The project uses PostgreSQL with Prisma ORM. Schema files are located in `prisma/schema/`.

### Authentication

JWT-based authentication with refresh tokens. Configure `JWT_SECRET` and `JWT_EXPIRES_IN` in `.env`.

### File Storage

Supports both Cloudinary and AWS S3. Configure credentials in `.env`.

## 📚 API Documentation

Once the server is running, access:
- **Swagger UI**: http://localhost:5000/docs
- **OpenAPI JSON**: http://localhost:5000/docs-json

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

UNLICENSED - Private use only

## 👤 Author

[Rafi Sharkar](https://github.com/Rafi-Sharkar)

## ⚠️ Notes

- SMTP and Cloudinary credentials in `.env.example` are limited/demo accounts
- Update all credentials before deploying to production
- Never commit `.env` files to version control
- Review and update security settings before production deployment

## 📞 Support

For issues and questions, please open an issue on GitHub.
