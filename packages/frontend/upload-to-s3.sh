#!/bin/bash
set -e

# Build the frontend
pnpm build

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
  echo "AWS CLI not found. Please install and configure it first."
  exit 1
fi

S3_BUCKET=${S3_BUCKET:-"sample-react-fe"}

check_aws_credentials() {
  echo "Checking AWS credentials..."
  
  # Try a simple AWS command to check credentials
  if ! aws sts get-caller-identity &>/dev/null; then
    echo "AWS credentials are invalid or expired. Attempting AWS SSO login..."
    aws sso login
    
    # Check if login was successful
    if ! aws sts get-caller-identity &>/dev/null; then
      echo "AWS SSO login failed. Please run 'aws sso login' manually and try again."
      exit 1
    fi
    
    echo "AWS SSO login successful."
  else
    echo "AWS credentials are valid."
  fi
}

# username cli-user
check_aws_credentials

# Upload the build output to S3 
echo "Uploading to S3 bucket: $S3_BUCKET"
if aws s3 sync ./dist "s3://$S3_BUCKET/" --delete; then
  echo "S3 upload completed successfully!"
else
  echo "Error: Failed to upload to S3 bucket."
  exit 1
fi

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id E1T1MHZ13LE77Q --paths "/*"

echo "Build and upload to S3 complete!"