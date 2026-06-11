# Terraform Kubernetes Deployment

This Terraform config deploys the College ERP application to an existing Kubernetes cluster using the `kubernetes` provider.

## What it creates

- `ConfigMap` for frontend Nginx configuration
- `PersistentVolumeClaim` for MongoDB data
- `Deployment` for MongoDB, backend, and frontend
- `Service` for MongoDB, backend, and frontend

## Prerequisites

- Terraform 1.5+ installed
- Access to a Kubernetes cluster
- `kubectl` configured locally or a kubeconfig file path

## Usage

1. Initialize Terraform:

```bash
cd terraform
terraform init
```

2. Apply with image variables:

```bash
terraform apply \
  -var "registry_namespace=<your-registry-namespace>" \
  -var "backend_image_tag=<tag>" \
  -var "frontend_image_tag=<tag>"
```

If you need to use a custom kubeconfig path or context:

```bash
terraform apply \
  -var "kubeconfig_path=/path/to/kubeconfig" \
  -var "kubeconfig_context=<context>" \
  -var "registry_namespace=<your-registry-namespace>" \
  -var "backend_image_tag=<tag>" \
  -var "frontend_image_tag=<tag>"
```

## Example

```bash
terraform apply \
  -var "registry_namespace=malaymaity" \
  -var "backend_image_tag=latest" \
  -var "frontend_image_tag=latest"
```

## Notes

- The frontend service is exposed as `NodePort` on port `30080` by default.
- The MongoDB PVC uses the cluster default storage class unless `mongo_storage_class_name` is provided.
