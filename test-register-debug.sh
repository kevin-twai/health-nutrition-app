#!/bin/bash

echo "Testing registration with debug..."

# 使用不同的 email 避免重複
TIMESTAMP=$(date +%s)
EMAIL="test${TIMESTAMP}@example.com"

curl -X POST https://health-nutrition-api.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${EMAIL}\",
    \"password\": \"P@55w0rd\",
    \"confirmPassword\": \"P@55w0rd\",
    \"profile\": {
      \"name\": \"測試用戶\",
      \"age\": 30,
      \"gender\": \"male\",
      \"height\": 170,
      \"weight\": 70,
      \"activityLevel\": \"moderately_active\"
    }
  }" | jq .

echo ""
echo "Used email: ${EMAIL}"
