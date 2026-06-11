output "frontend_service_name" {
  description = "Name of the frontend Kubernetes service."
  value       = kubernetes_service.frontend_service.metadata[0].name
}

output "frontend_node_port" {
  description = "The NodePort assigned to the frontend service."
  value       = kubernetes_service.frontend_service.spec[0].port[0].node_port
}

output "backend_service_name" {
  description = "Name of the backend Kubernetes service."
  value       = kubernetes_service.backend_service.metadata[0].name
}

output "mongo_service_name" {
  description = "Name of the MongoDB Kubernetes service."
  value       = kubernetes_service.mongo_service.metadata[0].name
}
