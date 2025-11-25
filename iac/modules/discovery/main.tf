data "aws_service_discovery_dns_namespace" "main" {
  name = var.namespace_name
  type = "DNS_PRIVATE"
}

