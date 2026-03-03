# 职业K线 Docker 镜像
FROM node:20-alpine

# 安装 better-sqlite3 依赖
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN npm prune --omit=dev

ENV NODE_ENV=production
ENV PORT=4173
EXPOSE 4173

CMD ["node", "server/server.js"]
