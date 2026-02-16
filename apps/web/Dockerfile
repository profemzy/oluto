FROM node:24-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_API_URL=/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy root configuration
COPY package.json package-lock.json ./

# Copy web app definition
COPY apps/web/package.json ./apps/web/package.json
# If there are other packages, we might need them, but assuming simple structure for now.

# Install dependencies
RUN npm ci

# Copy the source code
COPY . .

# Build the web app
RUN npm run build -w apps/web

# Production image, copy all the files and run next
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
CMD ["node", "apps/web/server.js"]
