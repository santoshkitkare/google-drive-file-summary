data "aws_acm_certificate" "app_cert" {
  provider = aws.use1
  domain   = "santoshkitkare.com"
  statuses = ["ISSUED"]
  most_recent = true
}
