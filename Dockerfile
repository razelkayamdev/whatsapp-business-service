FROM node:24.3.0-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# ---------------- Runtime image ----------------
FROM node:24.3.0-alpine

RUN apk add --no-cache curl
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

ARG COMMIT_HASH
ENV COMMIT_HASH=${COMMIT_HASH}

CMD ["node", "dist/src/index.js"]
