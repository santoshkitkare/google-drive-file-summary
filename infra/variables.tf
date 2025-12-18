variable "aws_region" {
  default = "ap-south-1"
}

variable "project_name" {
  default = "google-drive-file-summarizer"
}

variable "frontend_bucket_name" {
  description = "Globally unique S3 bucket name"
  default = "google-drive-file-summarizer"
}
