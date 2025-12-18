resource "aws_secretsmanager_secret" "app_secrets" {
  name = "${var.project_name}-secrets"
}

resource "aws_secretsmanager_secret_version" "app_secrets" {
  secret_id = aws_secretsmanager_secret.app_secrets.id
  secret_string = jsonencode({
    GOOGLE_CLIENT_ID     = "replace-me"
    GOOGLE_CLIENT_SECRET = "replace-me"
    OPENAI_API_KEY       = "replace-me"
    SESSION_SECRET       = "replace-me"
  })
}
