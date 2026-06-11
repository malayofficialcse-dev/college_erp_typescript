locals {
  backend_image  = "${var.registry_namespace}/college-erp-backend:${var.backend_image_tag}"
  frontend_image = "${var.registry_namespace}/college-erp-frontend:${var.frontend_image_tag}"
}

resource "kubernetes_config_map" "frontend_nginx_config" {
  metadata {
    name      = "frontend-nginx-config"
    namespace = var.namespace
  }

  data = {
    "default.conf" = <<-EOF
      server {
        listen 80;
        server_name localhost;

        root /usr/share/nginx/html;
        index index.html;

        location / {
          try_files $uri $uri/ /index.html;
        }

        location /api/ {
          proxy_pass http://backend-service:5001;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
        }
      }
    EOF
  }
}

resource "kubernetes_persistent_volume_claim" "mongo_pvc" {
  metadata {
    name      = "mongo-pvc"
    namespace = var.namespace
  }

  spec {
    access_modes = ["ReadWriteOnce"]

    resources {
      requests = {
        storage = var.mongo_storage_size
      }
    }

    storage_class_name = var.mongo_storage_class_name != "" ? var.mongo_storage_class_name : null
  }
}

resource "kubernetes_deployment" "mongo" {
  metadata {
    name      = "mongo"
    namespace = var.namespace
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "mongo"
      }
    }

    template {
      metadata {
        labels = {
          app = "mongo"
        }
      }

      spec {
        container {
          name  = "mongo"
          image = var.mongo_image

          port {
            container_port = 27017
          }

          volume_mount {
            name       = "mongo-storage"
            mount_path = "/data/db"
          }
        }

        volume {
          name = "mongo-storage"

          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.mongo_pvc.metadata[0].name
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "mongo_service" {
  metadata {
    name      = "mongo-service"
    namespace = var.namespace
  }

  spec {
    selector = {
      app = kubernetes_deployment.mongo.spec[0].template[0].metadata[0].labels[0].app
    }

    port {
      port        = 27017
      target_port = 27017
      protocol    = "TCP"
    }
  }
}

resource "kubernetes_deployment" "backend" {
  metadata {
    name      = "backend"
    namespace = var.namespace
  }

  spec {
    replicas = var.backend_replicas

    selector {
      match_labels = {
        app = "backend"
      }
    }

    template {
      metadata {
        labels = {
          app = "backend"
        }
      }

      spec {
        container {
          name  = "backend"
          image = local.backend_image

          port {
            container_port = 5001
          }

          env {
            name  = "PORT"
            value = "5001"
          }

          env {
            name  = "MONGODB_URI"
            value = "mongodb://mongo-service:27017/erp"
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "backend_service" {
  metadata {
    name      = "backend-service"
    namespace = var.namespace
  }

  spec {
    selector = {
      app = "backend"
    }

    port {
      port        = 5001
      target_port = 5001
      protocol    = "TCP"
    }
  }
}

resource "kubernetes_deployment" "frontend" {
  metadata {
    name      = "frontend"
    namespace = var.namespace
  }

  spec {
    replicas = var.frontend_replicas

    selector {
      match_labels = {
        app = "frontend"
      }
    }

    template {
      metadata {
        labels = {
          app = "frontend"
        }
      }

      spec {
        container {
          name  = "frontend"
          image = local.frontend_image

          port {
            container_port = 80
          }

          volume_mount {
            name       = "nginx-config"
            mount_path = "/etc/nginx/conf.d/default.conf"
            sub_path   = "default.conf"
          }
        }

        volume {
          name = "nginx-config"

          config_map {
            name = kubernetes_config_map.frontend_nginx_config.metadata[0].name
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "frontend_service" {
  metadata {
    name      = "frontend-service"
    namespace = var.namespace
  }

  spec {
    type = "NodePort"

    selector = {
      app = "frontend"
    }

    port {
      port        = 80
      target_port = 80
      node_port   = var.frontend_node_port
      protocol    = "TCP"
    }
  }
}
