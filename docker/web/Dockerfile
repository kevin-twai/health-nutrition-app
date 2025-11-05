FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY turbo.json ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY apps/web/package.json ./apps/web/

RUN npm install

# Copy source code
COPY packages/shared-types ./packages/shared-types
COPY apps/web ./apps/web

# Build shared types
RUN npm run build --workspace=@health-tracker/shared-types

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["npm", "run", "dev"]