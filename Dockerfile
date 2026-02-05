# Multi-stage build for TaskMe
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY pnpm*.yaml ./
RUN npm install -g pnpm
RUN pnpm install
COPY . .
RUN pnpm build || true

# API stage
FROM node:20-alpine AS api
WORKDIR /app
COPY --from=builder /app/apps/api ./
RUN npm install
EXPOSE 3000
CMD ["npx", "tsx", "src/index.ts"]

# Frontend stage  
FROM node:20-alpine AS web
WORKDIR /app
COPY --from=builder /app/apps/nextjs ./
RUN npm install
EXPOSE 3002
CMD ["npm", "start"]
