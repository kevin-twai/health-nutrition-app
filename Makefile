.PHONY: help install dev build test lint clean docker-up docker-down docker-build deploy-prod deploy-k8s backup restore health-check

# Default target
help:
	@echo "健康營養追蹤系統 - 開發與部署指令"
	@echo ""
	@echo "開發指令:"
	@echo "  install         安裝所有相依性"
	@echo "  dev             啟動開發模式"
	@echo "  build           建置所有應用"
	@echo "  test            執行所有測試"
	@echo "  lint            執行程式碼檢查"
	@echo "  clean           清理建置檔案"
	@echo ""
	@echo "Docker 指令:"
	@echo "  docker-up       啟動 Docker 容器"
	@echo "  docker-down     停止 Docker 容器"
	@echo "  docker-build    建置 Docker 映像"
	@echo ""
	@echo "生產環境部署:"
	@echo "  deploy-prod     部署到生產環境 (Docker Compose)"
	@echo "  deploy-k8s      部署到 Kubernetes"
	@echo "  secrets-create  建立 Kubernetes 秘密"
	@echo "  health-check    執行健康檢查"
	@echo ""
	@echo "備份與恢復:"
	@echo "  backup          執行手動備份"
	@echo "  restore-pg      恢復 PostgreSQL (需指定 BACKUP=檔名)"
	@echo "  restore-mongo   恢復 MongoDB (需指定 BACKUP=檔名)"

# Install dependencies
install:
	npm install

# Start development mode
dev:
	npm run dev

# Build all applications
build:
	npm run build

# Run all tests
test:
	npm run test

# Run linting
lint:
	npm run lint

# Clean build files
clean:
	npm run clean

# Docker commands
docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-build:
	docker-compose build

# Database commands
db-migrate:
	@echo "執行資料庫遷移..."
	docker-compose exec postgres psql -U postgres -d health_tracker -f /docker-entrypoint-initdb.d/init.sql

db-seed:
	@echo "填充測試資料..."
	docker-compose exec mongodb mongo health_tracker_nutrition /docker-entrypoint-initdb.d/init.js

# Development helpers
logs:
	docker-compose logs -f

status:
	docker-compose ps

restart:
	docker-compose restart

# 生產環境部署
deploy-prod:
	@echo "部署到生產環境..."
	@if [ ! -f .env.production ]; then \
		echo "錯誤: .env.production 檔案不存在，請先建立環境變數檔案"; \
		exit 1; \
	fi
	docker-compose -f docker-compose.prod.yml up -d
	@echo "生產環境部署完成"

deploy-prod-monitoring:
	@echo "部署到生產環境 (包含監控)..."
	docker-compose -f docker-compose.prod.yml --profile monitoring up -d
	@echo "生產環境部署完成 (包含監控)"

# Kubernetes 部署
deploy-k8s:
	@echo "部署到 Kubernetes..."
	./scripts/deploy.sh deploy
	@echo "Kubernetes 部署完成"

deploy-k8s-dev:
	@echo "部署到 Kubernetes 開發環境..."
	kubectl apply -k k8s/
	@echo "Kubernetes 開發環境部署完成"

# 秘密管理
secrets-create:
	./scripts/manage-secrets.sh create

secrets-validate:
	./scripts/manage-secrets.sh validate

secrets-export:
	./scripts/manage-secrets.sh export secrets-backup.yaml

# 備份和恢復
backup:
	@echo "執行手動備份..."
	./scripts/backup.sh
	@echo "備份完成"

backup-list-pg:
	./scripts/disaster-recovery.sh list-postgres

backup-list-mongo:
	./scripts/disaster-recovery.sh list-mongodb

restore-pg:
	@if [ -z "$(BACKUP)" ]; then \
		echo "請指定備份檔案: make restore-pg BACKUP=檔名"; \
		exit 1; \
	fi
	./scripts/disaster-recovery.sh restore-postgres $(BACKUP)

restore-mongo:
	@if [ -z "$(BACKUP)" ]; then \
		echo "請指定備份檔案: make restore-mongo BACKUP=檔名"; \
		exit 1; \
	fi
	./scripts/disaster-recovery.sh restore-mongodb $(BACKUP)

# 健康檢查和監控
health-check:
	@echo "執行健康檢查..."
	@if command -v kubectl >/dev/null 2>&1; then \
		./scripts/deploy.sh health-check; \
	else \
		curl -f http://localhost/health || echo "健康檢查失敗"; \
	fi

logs-api:
	@if command -v kubectl >/dev/null 2>&1; then \
		kubectl logs -f deployment/api -n health-nutrition-tracker; \
	else \
		docker-compose -f docker-compose.prod.yml logs -f api-1; \
	fi

logs-web:
	@if command -v kubectl >/dev/null 2>&1; then \
		kubectl logs -f deployment/web -n health-nutrition-tracker; \
	else \
		docker-compose -f docker-compose.prod.yml logs -f web; \
	fi

# 清理
clean-docker:
	docker-compose -f docker-compose.prod.yml down -v
	docker system prune -f

clean-k8s:
	kubectl delete namespace health-nutrition-tracker --ignore-not-found=true

# 環境設定
setup-dev:
	@echo "設定開發環境..."
	make install
	@if [ ! -f .env ]; then cp .env.example .env; fi
	make docker-up
	@echo "開發環境設定完成"

setup-prod:
	@echo "設定生產環境..."
	@if [ ! -f .env.production ]; then \
		cp .env.production.example .env.production; \
		echo "請編輯 .env.production 檔案並填入實際值"; \
	fi
	@echo "生產環境設定完成"