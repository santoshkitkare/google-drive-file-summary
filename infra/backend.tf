terraform {
  backend "s3" {
    bucket         = "santosh-s3-bucket-demo"
    key            = "terraform_states/google-drive-file-summarizer/terraform.tfstate"
    region         = "ap-south-1"
    encrypt        = true
  }
}