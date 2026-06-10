# Kubernetes Deployment for College ERP

## Overview
This manifest deploys the project as a multi-tier Kubernetes application:

- `mongo` as a MongoDB deployment + service
- `backend` as a deployment + ClusterIP service
- `frontend` as a static site deployment + NodePort service
- `ConfigMap` for frontend nginx to proxy `/api` to backend

## Steps to deploy

1. Build and publish Docker images:

```bash
docker build -t <your-dockerhub-username>/college-erp-backend:latest ./backend
docker build -t <your-dockerhub-username>/college-erp-frontend:latest ./frontend

docker push <your-dockerhub-username>/college-erp-backend:latest
docker push <your-dockerhub-username>/college-erp-frontend:latest
```

2. Replace `<your-dockerhub-username>` in `k8s/k8s-deploy.yaml`.

3. Apply Kubernetes resources:

```bash
kubectl apply -f k8s/k8s-deploy.yaml
```

4. Check pod status:

```bash
kubectl get pods
kubectl get svc
```

5. Open frontend:

- Local access: `http://localhost:30080`

## Scaling backend

```bash
kubectl scale deployment backend --replicas=3
```

## Resume bullet examples

- "Containerized a React/Vite frontend and Node.js/Express backend with Docker, then deployed the multi-tier ERP application to Kubernetes using Deployments, Services, ConfigMaps, and persistent storage."
- "Implemented Kubernetes deployment manifests for frontend, backend, and MongoDB, and scaled backend replicas with `kubectl scale` for availability and load distribution."
- "Configured Kubernetes networking so frontend static assets proxy `/api` requests to backend services in the cluster."
