#!/bin/bash
set -e

echo "⚠️ Destroying infrastructure"
terraform destroy -auto-approve

echo "🧹 Cleanup complete. Billing stopped."
echo "🗑️ Infrastructure destroyed"