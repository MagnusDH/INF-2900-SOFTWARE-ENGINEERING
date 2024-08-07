FROM node:14-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json .
COPY pnpm-lock.yaml .

RUN pnpm install

COPY . .

EXPOSE 5173

CMD ["pnpm", "run", "dev"]