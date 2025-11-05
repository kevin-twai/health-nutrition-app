FROM alpine:3.18

# 安裝必要工具
RUN apk add --no-cache \
    postgresql-client \
    mongodb-tools \
    aws-cli \
    curl \
    bash \
    dcron \
    tzdata

# 設定時區
ENV TZ=Asia/Taipei
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# 建立備份目錄
RUN mkdir -p /backups/postgres /backups/mongodb

# 複製備份腳本
COPY scripts/backup.sh /usr/local/bin/backup.sh
RUN chmod +x /usr/local/bin/backup.sh

# 建立 cron 任務
RUN echo "0 2 * * * /usr/local/bin/backup.sh" > /etc/crontabs/root

# 啟動 cron 服務
CMD ["crond", "-f", "-d", "8"]