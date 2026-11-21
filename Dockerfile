FROM node:22-alpine
WORKDIR /app

RUN npm install -g pnpm@11.27.1

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

COPY . .

EXPOSE 8000
CMD ["node_modules/.bin/tsx", "src/server.ts"]