# Requires `output: "standalone"` in next.config.ts
FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH NEXT_TELEMETRY_DISABLED=1
RUN npm install -g pnpm@12.5.1

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Landing (Astro, carpeta landing/): HTML estático que la app sirve en "/".
FROM base AS landing
WORKDIR /landing
COPY landing/package.json landing/pnpm-lock.yaml landing/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY landing/ .
ARG LANDING_APP_URL=https://app.criba.isroot.in
ENV PUBLIC_APP_URL=$LANDING_APP_URL SITE_URL=$LANDING_APP_URL
RUN pnpm build

FROM base AS build
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
# Mientras la API no exponga los endpoints del front, la app corre con datos simulados.
ARG NEXT_PUBLIC_USE_MOCKS=true
COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY --from=landing /landing/dist ./public/landing
RUN pnpm build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
# OWASP A02: never run as root
USER node
EXPOSE 3000
CMD ["node", "server.js"]
