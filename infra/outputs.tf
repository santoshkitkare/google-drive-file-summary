output "alb_dns" {
  description = "Public DNS name of the Application Load Balancer"
  value       = aws_lb.alb.dns_name
}

output "cloudfront_url" {
  description = "CloudFront URL for frontend"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "s3_bucket_name" {
  value = aws_s3_bucket.frontend.bucket
}
