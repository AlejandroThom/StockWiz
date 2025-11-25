output "namespace_id" {
  value = data.aws_service_discovery_dns_namespace.main.id
}

output "namespace_name" {
  value = data.aws_service_discovery_dns_namespace.main.name
}
