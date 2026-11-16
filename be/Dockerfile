# Stage 1: Build mã nguồn TypeScript và Prisma
FROM node:20-slim AS builder
WORKDIR /app

# Cài OpenSSL cho Prisma Client
RUN apt-get update -y && apt-get install -y openssl

# Copy package files và cài đặt dependencies
COPY package*.json ./
RUN npm install --ignore-scripts

# Copy schema và generate Prisma Client bằng binary cục bộ (tránh npx check update/hang)
COPY src/databases/prisma/schema ./src/databases/prisma/schema
RUN ./node_modules/.bin/prisma generate --schema=src/databases/prisma/schema

# Copy toàn bộ mã nguồn và biên dịch TypeScript bằng local binary với cấp phát bộ nhớ tối ưu
COPY . .
RUN node --max-old-space-size=2048 ./node_modules/typescript/bin/tsc

# Tinh gọn dependencies chỉ giữ lại production packages (không phải cài lại từ đầu ở Stage 2)
RUN npm prune --omit=dev

# Stage 2: Runtime Production tối ưu dung lượng nhẹ
FROM node:20-slim AS runner
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/databases/prisma/schema ./src/databases/prisma/schema

# Khởi tạo thư mục sessions cho Zalo Bot
RUN mkdir -p .sessions

EXPOSE 8000
ENV PORT=8000
ENV NODE_ENV=production

CMD ["node", "dist/server.js"]
