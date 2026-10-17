# NEXT_PUBLIC_* são embutidas no bundle em BUILD: cada uma entra como ARG + ENV aqui e em build.args no compose.
FROM node:20-alpine AS build
WORKDIR /app
ARG API_ORIGEM
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_KEY
ARG NEXT_PUBLIC_SUPABASE_BUCKET
ENV API_ORIGEM=$API_ORIGEM \
    NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_KEY=$NEXT_PUBLIC_SUPABASE_KEY \
    NEXT_PUBLIC_SUPABASE_BUCKET=$NEXT_PUBLIC_SUPABASE_BUCKET
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
