FROM node:20-alpine AS base
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 5001
ENV PORT=5001
CMD ["node", "--import", "tsx", "server.ts"]
