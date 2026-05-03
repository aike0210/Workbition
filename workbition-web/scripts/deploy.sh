#!/bin/bash

# Exit on error
set -e

echo "Starting deployment..."

# Build the application
echo "Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "Build successful!"
else
    echo "Build failed!"
    exit 1
fi

# Deploy to server (example using rsync)
# echo "Deploying to server..."
# rsync -avz --delete dist/ user@server:/path/to/deployment/

# Or deploy using Docker
# echo "Building Docker image..."
# docker build -t workbition-web .
# docker push workbition-web:latest

echo "Deployment completed successfully!"