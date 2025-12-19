locals {
  app_name = "${var.project_name}-backend"
  fqdn     = "${var.api_subdomain}.${var.domain_name}"
}
