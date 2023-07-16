FROM postgres:15.1-alpine AS db
ENV POSTGRES_USER docker
ENV POSTGRES_PASSWORD docker
ENV POSTGRES_DB docker

FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat
RUN apk update

RUN yarn set version 3.3.1

FROM base AS installer
WORKDIR /app

COPY . .
RUN yarn install --frozen-lockfile


FROM base AS builder
WORKDIR /app
COPY --from=installer /app .

ENV NODE_ENV production
RUN yarn build


FROM base AS runner
WORKDIR /app
# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 apprunner
USER apprunner

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

CMD ["node", "dist/main"]