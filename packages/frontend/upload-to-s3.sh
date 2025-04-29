#!/bin/bash
set -e

# Build the frontend
pnpm build

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
  echo "AWS CLI not found. Please install and configure it first."
  exit 1
fi

# Set your S3 bucket name here
S3_BUCKET=${S3_BUCKET:-"sample-react-fe"}

# Upload the build output to S3 (sync for efficiency)
aws s3 sync ./dist "s3://$S3_BUCKET/" --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id E1T1MHZ13LE77Q --paths "/*"

echo "Build and upload to S3 complete!"