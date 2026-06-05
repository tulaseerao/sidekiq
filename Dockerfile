FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

FROM base AS builder
COPY package*.json prisma ./
RUN npm install --ignore-scripts && npx prisma generate

COPY . .
RUN npm run build

FROM base AS runner
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY package*.json next.config.js ./

ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

USER nextjs
CMD ["sh", "-c", "npx prisma migrate deploy --skip-generate 2>/dev/null; npm start"]
