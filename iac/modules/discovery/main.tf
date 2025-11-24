resource "aws_service_discovery_private_dns_namespace" "main" {
  name        = var.namespace_name
  description = "Service discovery namespace for ${var.project_name}"
  vpc         = var.vpc_id
}
