# Stage 1: Build mã nguồn TypeScript và Prisma
FROM node:20-slim AS builder
WORKDIR /app

# Cài OpenSSL cho Prisma Client
RUN apt-get update -y && apt-get install -y openssl

# Copy package files và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy toàn bộ mã nguồn và biên dịch
COPY . .
RUN npm run build

# Stage 2: Runtime Production tối ưu dung lượng nhẹ
FROM node:20-slim AS runner
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --omit=dev

# Copy thư mục dist và prisma đã build từ Stage 1
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/databases/prisma/schema ./src/databases/prisma/schema
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Khởi tạo thư mục sessions cho Zalo Bot
RUN mkdir -p .sessions

EXPOSE 8000
ENV PORT=8000
ENV NODE_ENV=production

CMD ["node", "dist/server.js"]

