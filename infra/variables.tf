variable "aws_region" {
  default = "ap-south-1"
}

variable "project_name" {
  default = "drive-file-summary"
}

variable "domain_name" {
  description = "Root domain in Route53"
  default = "yourdomain.com"
}

variable "api_subdomain" {
  default = "api"
}

variable "ecr_image" {
  description = "Full ECR image URI"
  default = "385046010545.dkr.ecr.ap-south-1.amazonaws.com/drive-file-summary-backend:latest"
}

variable "container_port" {
  default = 8000
}
variable "frontend_bucket_name" {
  description = "S3 bucket name for frontend"
  default = "google-drive-file-summary"
}

variable "index_document" {
  default = "index.html"
}

variable "google_client_id" {
  type      = string
  sensitive = true
}

variable "google_client_secret" {
  type      = string
  sensitive = true
}

variable "google_redirect_uri" {
  type = string
}

variable "openai_api_key" {
  type      = string
  sensitive = true
}

variable "openai_model" {
  type = string
  default = "gpt-4o-mini"
}