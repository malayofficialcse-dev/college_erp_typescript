variable "kubeconfig_path" {
  description = "Path to the kubeconfig file. Leave blank to use the default provider behavior."
  type        = string
  default     = ""
}

variable "kubeconfig_context" {
  description = "Optional kubeconfig context to use. Leave blank to use the default context."
  type        = string
  default     = ""
}

variable "namespace" {
  description = "Kubernetes namespace to deploy into."
  type        = string
  default     = "default"
}

variable "registry_namespace" {
  description = "Container registry namespace or repository prefix for frontend/backend images."
  type        = string
  default     = "malaymaity"
}

variable "backend_image_tag" {
  description = "Tag for the backend container image."
  type        = string
  default     = "latest"
}

variable "frontend_image_tag" {
  description = "Tag for the frontend container image."
  type        = string
  default     = "latest"
}

variable "mongo_image" {
  description = "MongoDB image to deploy."
  type        = string
  default     = "mongo:7.0"
}

variable "mongo_storage_size" {
  description = "Persistent storage size for MongoDB."
  type        = string
  default     = "1Gi"
}

variable "mongo_storage_class_name" {
  description = "Optional storage class name for the MongoDB PVC. Leave blank to use the cluster default."
  type        = string
  default     = ""
}

variable "backend_replicas" {
  description = "Number of backend replicas."
  type        = number
  default     = 2
}

variable "frontend_replicas" {
  description = "Number of frontend replicas."
  type        = number
  default     = 1
}

variable "frontend_node_port" {
  description = "NodePort to expose the frontend service."
  type        = number
  default     = 30080
}
