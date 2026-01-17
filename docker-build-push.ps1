# Docker Hub Build & Push Script for Windows PowerShell

Write-Host "========================================" -ForegroundColor Blue
Write-Host "  Docker Hub Build & Push Script" -ForegroundColor Blue
Write-Host "========================================`n" -ForegroundColor Blue

# Load environment variables from .env file
if (Test-Path .env) {
    Write-Host "✓ Loading environment variables from .env file..." -ForegroundColor Green
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            if ($name -and $name -notmatch '^#') {
                [Environment]::SetEnvironmentVariable($name, $value, "Process")
            }
        }
    }
} else {
    Write-Host "✗ .env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file based on .env.example" -ForegroundColor Yellow
    exit 1
}

# Get environment variables
$DOCKER_USERNAME = $env:DOCKER_USERNAME
$PACKAGE_NAME = $env:PACKAGE_NAME
$PACKAGE_VERSION = $env:PACKAGE_VERSION

# Check required variables
if (-not $DOCKER_USERNAME -or -not $PACKAGE_NAME -or -not $PACKAGE_VERSION) {
    Write-Host "✗ Missing required environment variables!" -ForegroundColor Red
    Write-Host "Please set DOCKER_USERNAME, PACKAGE_NAME, and PACKAGE_VERSION in .env" -ForegroundColor Yellow
    exit 1
}

$IMAGE_NAME = "$DOCKER_USERNAME/$PACKAGE_NAME"
$VERSION_TAG = $PACKAGE_VERSION
$LATEST_TAG = "latest"

Write-Host "Configuration:" -ForegroundColor Blue
Write-Host "  Docker Username: $DOCKER_USERNAME" -ForegroundColor Green
Write-Host "  Package Name: $PACKAGE_NAME" -ForegroundColor Green
Write-Host "  Version: $VERSION_TAG" -ForegroundColor Green
Write-Host "  Image: $IMAGE_NAME`n" -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "✗ Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again" -ForegroundColor Yellow
    exit 1
}

# Check if logged in to Docker Hub
$dockerInfo = docker info 2>&1
if ($dockerInfo -notmatch "Username") {
    Write-Host "⚠ Not logged in to Docker Hub" -ForegroundColor Yellow
    Write-Host "Attempting to login...`n" -ForegroundColor Blue
    docker login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Docker login failed!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "========================================" -ForegroundColor Blue
Write-Host "  Step 1: Building Docker Image" -ForegroundColor Blue
Write-Host "========================================`n" -ForegroundColor Blue

# Build the Docker image
Write-Host "Building image: ${IMAGE_NAME}:${VERSION_TAG}" -ForegroundColor Yellow
docker build -t "${IMAGE_NAME}:${VERSION_TAG}" -t "${IMAGE_NAME}:${LATEST_TAG}" .

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n✗ Docker build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✓ Docker image built successfully!`n" -ForegroundColor Green

Write-Host "========================================" -ForegroundColor Blue
Write-Host "  Step 2: Pushing to Docker Hub" -ForegroundColor Blue
Write-Host "========================================`n" -ForegroundColor Blue

# Push version tag
Write-Host "Pushing ${IMAGE_NAME}:${VERSION_TAG}" -ForegroundColor Yellow
docker push "${IMAGE_NAME}:${VERSION_TAG}"

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n✗ Failed to push version tag!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Version tag pushed successfully!`n" -ForegroundColor Green

# Push latest tag
Write-Host "Pushing ${IMAGE_NAME}:${LATEST_TAG}" -ForegroundColor Yellow
docker push "${IMAGE_NAME}:${LATEST_TAG}"

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n✗ Failed to push latest tag!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Latest tag pushed successfully!`n" -ForegroundColor Green

Write-Host "========================================" -ForegroundColor Blue
Write-Host "✓ Build and Push Completed!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Blue

Write-Host "Your image is now available at:"
Write-Host "docker pull ${IMAGE_NAME}:${VERSION_TAG}" -ForegroundColor Green
Write-Host "docker pull ${IMAGE_NAME}:${LATEST_TAG}`n" -ForegroundColor Green

Write-Host "View on Docker Hub:"
Write-Host "https://hub.docker.com/r/${IMAGE_NAME}`n" -ForegroundColor Blue
