#!/bin/bash
set -e

echo "🚀 Initializing Terraform"
terraform init

echo "📐 Planning"
terraform plan

echo "✅ Applying infrastructure"
terraform apply -auto-approve

echo "🎉 Deployment complete"
