data "aws_ssm_parameter" "amzn2" {
  name = "/aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-gp2"
}

data "aws_subnet" "this" {
  id = var.subnet_id
}

resource "aws_security_group" "db" {
  name        = "${var.project_name}-db-redis-sg"
  description = "Allow Postgres (5432) and Redis (6379) from ECS instances, SSH for debugging"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Postgres from ECS"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.ecs_sg_id]
  }

  ingress {
    description     = "Redis from ECS"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [var.ecs_sg_id]
  }

  # Allow SSH for debugging (Dev only - restrict in prod)
  #ingress {
  #  description = "SSH from anywhere (Dev only)"
  #  from_port   = 22
  #  to_port     = 22
  #  protocol    = "tcp"
  #  cidr_blocks = ["186.55.30.175"]
  #}
#
  #egress {
  #  from_port   = 0
  #  to_port     = 0
  #  protocol    = "-1"
  #  cidr_blocks = ["186.55.30.175"]
  #}
}

resource "aws_ebs_volume" "data" {
  availability_zone = data.aws_subnet.this.availability_zone
  size              = var.volume_size
  type              = "gp3"

  tags = {
    Name = "${var.project_name}-db-redis-data"
  }
}

resource "aws_instance" "db_redis" {
  ami                         = data.aws_ssm_parameter.amzn2.value
  instance_type               = var.instance_type
  subnet_id                   = var.subnet_id
  associate_public_ip_address = true
  vpc_security_group_ids      = [aws_security_group.db.id]
  # key_name is optional - if not provided, use EC2 Instance Connect
  key_name                    = var.key_name != null ? var.key_name : null

  user_data = <<-EOF
              #!/bin/bash
              set -e
              yum update -y
              amazon-linux-extras install docker -y || yum install -y docker
              systemctl enable docker
              systemctl start docker
              usermod -aG docker ec2-user

              DEVICE=/dev/xvdh
              if [ ! -e "$DEVICE" ]; then
                DEVICE=/dev/nvme1n1
              fi

              if ! file -s $DEVICE | grep -qi 'filesystem'; then
                mkfs -t xfs $DEVICE
              fi

              mkdir -p /data
              grep -q "$DEVICE /data xfs" /etc/fstab || echo "$DEVICE /data xfs defaults,nofail 0 2" >> /etc/fstab
              mount -a
              mkdir -p /data/postgres /data/redis

              cat > /data/init.sql <<'SQL'
              -- Conectar a la base de datos correcta
              \c microservices_db;

              -- Tabla de productos
              CREATE TABLE IF NOT EXISTS products (
                  id SERIAL PRIMARY KEY,
                  name VARCHAR(255) NOT NULL,
                  description TEXT,
                  price DECIMAL(10, 2) NOT NULL,
                  category VARCHAR(100),
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              );

              -- Tabla de inventario
              CREATE TABLE IF NOT EXISTS inventory (
                  id SERIAL PRIMARY KEY,
                  product_id INTEGER NOT NULL UNIQUE,
                  quantity INTEGER NOT NULL DEFAULT 0,
                  warehouse VARCHAR(100),
                  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
              );

              -- Índices para optimizar consultas
              CREATE INDEX idx_products_category ON products(category);
              CREATE INDEX idx_inventory_product_id ON inventory(product_id);

              -- Datos de ejemplo
              INSERT INTO products (name, description, price, category) VALUES
                  ('Laptop Dell XPS 13', 'Ultrabook potente y ligera', 1299.99, 'Electronics'),
                  ('Mouse Logitech MX Master', 'Mouse ergonómico inalámbrico', 99.99, 'Electronics'),
                  ('Teclado Mecánico', 'Teclado mecánico RGB', 149.99, 'Electronics'),
                  ('Monitor 4K', 'Monitor 27 pulgadas 4K', 499.99, 'Electronics'),
                  ('Webcam HD', 'Cámara web Full HD', 79.99, 'Electronics');

              INSERT INTO inventory (product_id, quantity, warehouse) VALUES
                  (1, 50, 'Warehouse A'),
                  (2, 150, 'Warehouse A'),
                  (3, 75, 'Warehouse B'),
                  (4, 30, 'Warehouse A'),
                  (5, 100, 'Warehouse B');
              SQL

              # Descargar imágenes
              docker pull postgres:15-alpine
              docker pull redis:7-alpine

              # Ejecutar Postgres
              docker rm -f postgres || true
              docker run -d --name postgres --restart unless-stopped \
                -p 5432:5432 \
                -e POSTGRES_USER=${var.postgres_user} \
                -e POSTGRES_PASSWORD=${var.postgres_password} \
                -e POSTGRES_DB=${var.postgres_db} \
                -v /data/postgres:/var/lib/postgresql/data \
                -v /data/init.sql:/docker-entrypoint-initdb.d/init.sql:ro \
                postgres:15-alpine

              # Ejecutar Redis
              docker rm -f redis || true
              docker run -d --name redis --restart unless-stopped \
                -p 6379:6379 \
                -v /data/redis:/data \
                redis:7-alpine --appendonly yes
              EOF

  tags = {
    Name = "${var.project_name}-db-redis"
  }
}

resource "aws_volume_attachment" "data" {
  device_name = "/dev/xvdh"
  volume_id   = aws_ebs_volume.data.id
  instance_id = aws_instance.db_redis.id
}


