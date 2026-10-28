# Stage 1: install production dependencies only
FROM node:20-alpine AS deps
WORKDIR /app
# package-lock.json is picked up automatically once you create it (see README)
COPY package*.json ./
RUN npm install --omit=dev

# Stage 2: small runtime image
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src

# Run as the unprivileged "node" user that ships with the base image
USER node
EXPOSE 3000

# Used by "docker run" locally. ECS uses the health check in the task definition.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "src/index.js"]
