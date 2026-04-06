# ---------- BUILD ----------
FROM node:20-alpine AS builder

WORKDIR /app

# enable pnpm
RUN corepack enable

# 1) copy only manifests for cache
COPY package.json pnpm-lock.yaml ./

# 2) install deps (cached layer)
RUN pnpm install

# 3) now copy source
COPY . .

RUN pnpm svelte-kit sync

# 4) build static site (SvelteKit + adapter-static)
RUN pnpm run build


# ---------- RUNTIME ----------
FROM nginx:stable-alpine

WORKDIR /usr/share/nginx/html

# nginx config
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# copy static build output
COPY --from=builder /app/build .

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]