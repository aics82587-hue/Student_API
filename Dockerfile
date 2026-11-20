FROM node:22-alpine
WORKDIR /app

RUN npm install -g pnpm@11.27.1

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

ENV NODE_ENV=production
EXPOSE 3000
CMD ["pnpm", "start"]