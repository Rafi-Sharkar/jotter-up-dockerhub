#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Docker Hub Build & Push Script${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Load environment variables from .env file
if [ -f .env ]; then
    echo -e "${GREEN}✓${NC} Loading environment variables from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${RED}✗${NC} .env file not found!"
    echo -e "${YELLOW}Please create a .env file based on .env.example${NC}"
    exit 1
fi

# Check required variables
if [ -z "$DOCKER_USERNAME" ] || [ -z "$PACKAGE_NAME" ] || [ -z "$PACKAGE_VERSION" ]; then
    echo -e "${RED}✗${NC} Missing required environment variables!"
    echo -e "${YELLOW}Please set DOCKER_USERNAME, PACKAGE_NAME, and PACKAGE_VERSION in .env${NC}"
    exit 1
fi

IMAGE_NAME="$DOCKER_USERNAME/$PACKAGE_NAME"
VERSION_TAG="$PACKAGE_VERSION"
LATEST_TAG="latest"

echo -e "${BLUE}Configuration:${NC}"
echo -e "  Docker Username: ${GREEN}$DOCKER_USERNAME${NC}"
echo -e "  Package Name: ${GREEN}$PACKAGE_NAME${NC}"
echo -e "  Version: ${GREEN}$VERSION_TAG${NC}"
echo -e "  Image: ${GREEN}$IMAGE_NAME${NC}\n"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗${NC} Docker is not running!"
    echo -e "${YELLOW}Please start Docker and try again${NC}"
    exit 1
fi

# Check if logged in to Docker Hub
if ! docker info 2>/dev/null | grep -q "Username"; then
    echo -e "${YELLOW}⚠${NC} Not logged in to Docker Hub"
    echo -e "${BLUE}Attempting to login...${NC}\n"
    docker login
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗${NC} Docker login failed!"
        exit 1
    fi
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Step 1: Building Docker Image${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Build the Docker image
echo -e "${YELLOW}Building image: $IMAGE_NAME:$VERSION_TAG${NC}"
docker build -t "$IMAGE_NAME:$VERSION_TAG" -t "$IMAGE_NAME:$LATEST_TAG" .

if [ $? -ne 0 ]; then
    echo -e "\n${RED}✗${NC} Docker build failed!"
    exit 1
fi

echo -e "\n${GREEN}✓${NC} Docker image built successfully!\n"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Step 2: Pushing to Docker Hub${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Push version tag
echo -e "${YELLOW}Pushing $IMAGE_NAME:$VERSION_TAG${NC}"
docker push "$IMAGE_NAME:$VERSION_TAG"

if [ $? -ne 0 ]; then
    echo -e "\n${RED}✗${NC} Failed to push version tag!"
    exit 1
fi

echo -e "${GREEN}✓${NC} Version tag pushed successfully!\n"

# Push latest tag
echo -e "${YELLOW}Pushing $IMAGE_NAME:$LATEST_TAG${NC}"
docker push "$IMAGE_NAME:$LATEST_TAG"

if [ $? -ne 0 ]; then
    echo -e "\n${RED}✗${NC} Failed to push latest tag!"
    exit 1
fi

echo -e "${GREEN}✓${NC} Latest tag pushed successfully!\n"

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Build and Push Completed!${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "Your image is now available at:"
echo -e "${GREEN}docker pull $IMAGE_NAME:$VERSION_TAG${NC}"
echo -e "${GREEN}docker pull $IMAGE_NAME:$LATEST_TAG${NC}\n"

echo -e "View on Docker Hub:"
echo -e "${BLUE}https://hub.docker.com/r/$IMAGE_NAME${NC}\n"
