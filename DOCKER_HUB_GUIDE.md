# Docker Hub Deployment Guide

## Prerequisites

1. **Docker Hub Account**: Create an account at [hub.docker.com](https://hub.docker.com)
2. **Docker Installed**: Install Docker Desktop on your machine
3. **Environment Variables**: Configure your `.env` file

## Step 1: Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

**Important Variables:**
- `DOCKER_USERNAME`: Your Docker Hub username
- `PACKAGE_NAME`: Your application name (will be the repository name on Docker Hub)
- `PACKAGE_VERSION`: Image version tag (e.g., `latest`, `1.0.0`, `v1.0.2`)

Example:
```env
DOCKER_USERNAME=yourusername
PACKAGE_NAME=jotter-app
PACKAGE_VERSION=1.0.2
```

## Step 2: Login to Docker Hub

```bash
docker login
```

Enter your Docker Hub username and password when prompted.

## Step 3: Build the Docker Image

Build your Docker image with the proper tag:

```bash
docker build -t yourusername/jotter-app:1.0.2 .
```

Or use the version from your package.json:

```bash
docker build -t yourusername/jotter-app:latest .
```

## Step 4: Tag the Image (Optional)

If you want multiple tags (e.g., `latest` and version number):

```bash
# Tag as latest
docker tag yourusername/jotter-app:1.0.2 yourusername/jotter-app:latest

# Tag with specific version
docker tag yourusername/jotter-app:1.0.2 yourusername/jotter-app:v1.0.2
```

## Step 5: Push to Docker Hub

Push your image to Docker Hub:

```bash
# Push specific version
docker push yourusername/jotter-app:1.0.2

# Push latest tag
docker push yourusername/jotter-app:latest
```

To push all tags:

```bash
docker push yourusername/jotter-app --all-tags
```

## Step 6: Verify Upload

1. Go to [hub.docker.com](https://hub.docker.com)
2. Navigate to your repositories
3. Verify your image is listed with the correct tags

## Quick Build & Push Script

Use the provided script for easier deployment:

**Windows (PowerShell):**
```powershell
.\docker-build-push.ps1
```

**Linux/Mac:**
```bash
chmod +x docker-build-push.sh
./docker-build-push.sh
```

## Automated Build & Push

For a fully automated build and push:

```bash
# Set your environment variables
export DOCKER_USERNAME=yourusername
export PACKAGE_NAME=jotter-app
export PACKAGE_VERSION=1.0.2

# Build and push in one command
docker build -t $DOCKER_USERNAME/$PACKAGE_NAME:$PACKAGE_VERSION -t $DOCKER_USERNAME/$PACKAGE_NAME:latest . && \
docker push $DOCKER_USERNAME/$PACKAGE_NAME:$PACKAGE_VERSION && \
docker push $DOCKER_USERNAME/$PACKAGE_NAME:latest
```

## Using the Image in Production

### Pull and Run the Image

```bash
# Pull the image
docker pull yourusername/jotter-app:latest

# Run with docker run
docker run -d \
  --name jotter-app \
  -p 5000:5000 \
  --env-file .env \
  yourusername/jotter-app:latest
```

### Using Docker Compose

Update your `docker-compose.prod.yaml` with your image details and run:

```bash
docker-compose -f docker-compose.prod.yaml up -d
```

## Best Practices

1. **Version Tagging**: Use semantic versioning (e.g., `1.0.0`, `1.0.1`)
2. **Latest Tag**: Always maintain a `latest` tag for the most recent stable version
3. **Multi-stage Builds**: The Dockerfile uses multi-stage builds to optimize image size
4. **Security**: Never commit `.env` files or credentials to version control
5. **Health Checks**: The image includes health checks for container orchestration
6. **Build Arguments**: Consider using build arguments for sensitive data

## Troubleshooting

### Authentication Failed
```bash
docker logout
docker login
```

### Image Too Large
- The current Dockerfile uses multi-stage builds
- The production image only includes necessary dependencies
- Consider using `.dockerignore` to exclude unnecessary files

### Build Fails
```bash
# Clean build with no cache
docker build --no-cache -t yourusername/jotter-app:latest .
```

### Push Failed
```bash
# Check you're logged in
docker info | grep Username

# Ensure tag matches your username
docker tag local-image yourusername/jotter-app:latest
docker push yourusername/jotter-app:latest
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Build and Push to Docker Hub

on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/jotter-app:latest
            ${{ secrets.DOCKER_USERNAME }}/jotter-app:${{ github.ref_name }}
```

## Additional Resources

- [Docker Hub Documentation](https://docs.docker.com/docker-hub/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
