############################
# API CERT (ap-south-1)
############################
resource "aws_acm_certificate" "api_cert" {
  domain_name       = "api.santoshkitkare.com"
  validation_method = "DNS"
}

resource "aws_acm_certificate_validation" "api_cert" {
  certificate_arn = aws_acm_certificate.api_cert.arn
}

############################
# APP CERT (us-east-1)
############################
resource "aws_acm_certificate" "app_cert" {
  provider          = aws.use1
  domain_name       = "app.santoshkitkare.com"
  validation_method = "DNS"
}


resource "aws_acm_certificate_validation" "app_cert" {
  provider        = aws.use1
  certificate_arn = aws_acm_certificate.app_cert.arn
}
