FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache sqlite-libs

COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY . .

RUN mkdir -p uploads

EXPOSE 6053

CMD ["npm", "start"]
