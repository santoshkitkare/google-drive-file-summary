terraform {
  required_version = ">= 1.5.0"

  backend "s3" {
    bucket         = "santosh-s3-bucket-demo"
    key            = "terraform_states/google-drive-file-summary/terraform.tfstate"
    region         = "ap-south-1"
    encrypt        = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Default provider → ap-south-1 (backend, ECS, ALB, S3)
provider "aws" {
  region = "ap-south-1"
}

# Alias provider → us-east-1 (CloudFront + ACM for frontend)
provider "aws" {
  alias  = "use1"
  region = "us-east-1"
}