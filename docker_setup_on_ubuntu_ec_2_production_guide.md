# Docker Setup on Ubuntu EC2 (Production-Ready Guide)

This document explains **how to properly install and configure Docker on an Ubuntu EC2 instance** for production use.

---

## Prerequisites

- AWS EC2 instance running **Ubuntu 22.04 LTS**
- SSH access using a `.pem` key
- Local machine: **Windows 11**

---

## 1. Connect to EC2 Instance

```bash
ssh -i ubuntu-key.pem ubuntu@<PUBLIC_IP>
```

---

## 2. Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
sudo reboot
```

Reconnect after reboot.

---

## 3. Install Required Dependencies

```bash
sudo apt install -y \
  ca-certificates \
  curl \
  gnupg \
  lsb-release \
  apt-transport-https
```

---

## 4. Add Docker Official GPG Key

```bash
sudo install -m 0755 -d /etc/apt/keyrings

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

sudo chmod a+r /etc/apt/keyrings/docker.gpg
```

---

## 5. Add Docker Repository

```bash
echo \
"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu \
$(lsb_release -cs) stable" | \
sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

---

## 6. Install Docker Engine and Docker Compose

```bash
sudo apt update

sudo apt install -y \
  docker-ce \
  docker-ce-cli \
  containerd.io \
  docker-buildx-plugin \
  docker-compose-plugin
```

---

## 7. Verify Docker Installation

```bash
docker --version
docker compose version
```

---

## 8. Run Docker Without sudo (Recommended)

```bash
sudo usermod -aG docker ubuntu
newgrp docker
```

Test:

```bash
docker run hello-world
```

---

## 9. Enable Docker on System Boot

```bash
sudo systemctl enable docker
sudo systemctl start docker
sudo systemctl status docker
```

---

## 10. Security Hardening

### 10.1 Disable Root Login

```bash
sudo nano /etc/ssh/sshd_config
```

Set:

```ini
PermitRootLogin no
```

Restart SSH:

```bash
sudo systemctl restart ssh
```

---

### 10.2 Enable UFW Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw enable
sudo ufw status
```

Allow application port (example: 3000):

```bash
sudo ufw allow 3000
```

---

## 11. Docker Best Practices

### 11.1 Create a Dedicated Docker Network

```bash
docker network create app-network
```

---

### 11.2 Docker Compose Example

```yaml
version: '3.9'

services:
  app:
    image: node:20-alpine
    container_name: app
    working_dir: /app
    volumes:
      - .:/app
    command: npm run start
    ports:
      - '3000:3000'
    networks:
      - app-network

networks:
  app-network:
    external: true
```

Run:

```bash
docker compose up -d
```

---

## 12. AWS EC2 Security Group Configuration

Ensure the following inbound rules are set:

| Type       | Port | Source                       |
| ---------- | ---- | ---------------------------- |
| SSH        | 22   | My IP                        |
| Custom TCP | 3000 | 0.0.0.0/0 (or restricted IP) |

---

## 13. Docker Log Management

Edit Docker daemon configuration:

```bash
sudo nano /etc/docker/daemon.json
```

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Restart Docker:

```bash
sudo systemctl restart docker
```

---

## 14. Maintenance Commands

```bash
docker system df
docker system prune -a
```

---

## 15. Common Issues

### Permission Denied

```bash
logout
ssh -i ubuntu-key.pem ubuntu@<PUBLIC_IP>
```

---

### Port Not Accessible

- Check EC2 Security Group
- Verify UFW rules
- Confirm container port mapping

---

## Final Checklist

- Docker installed from official repository
- Docker runs without sudo
- Docker enabled on boot
- Firewall configured
- Docker Compose ready

---

## Recommended Next Steps

- Dockerize NestJS + Prisma
- Docker Compose with PostgreSQL
- Nginx reverse proxy + SSL
- CI/CD deployment pipeline

---

**Author:** Rafi Sharkar
