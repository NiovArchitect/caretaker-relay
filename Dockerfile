# Caretaker Relay static caregiver UI (Vite build) served by nginx.
# DEPLOYMENT REQUIREMENT — online judges/caregivers hit HTTPS, not localhost.
#
# Build from monorepo parent context OR from caretaker-relay with sibling foundation:
#   docker build -f caretaker-relay/Dockerfile \
#     --build-arg VITE_CARE_API_URL=https://caretaker-relay-care-api.onrender.com \
#     -t caretaker-relay-web .

FROM node:22.11-bookworm-slim AS build
WORKDIR /src

ARG VITE_CARE_API_URL=http://127.0.0.1:3100
ARG VITE_CARE_TRANSPORT=http
ARG VITE_CARE_MODE=fixture
ENV VITE_CARE_API_URL=$VITE_CARE_API_URL \
    VITE_CARE_TRANSPORT=$VITE_CARE_TRANSPORT \
    VITE_CARE_MODE=$VITE_CARE_MODE

# Copy app + foundation packages needed for Vite aliases / file: deps
COPY caretaker-relay/package.json caretaker-relay/package-lock.json* ./app/
COPY caretaker-relay-foundation/packages/care-domain ./foundation/packages/care-domain
COPY caretaker-relay-foundation/packages/product-identity ./foundation/packages/product-identity

WORKDIR /src/app
# Rewrite file: deps to relative foundation path inside image
RUN node -e "const p=require('./package.json'); p.dependencies['@caretaker-relay/care-domain']='file:../foundation/packages/care-domain'; p.dependencies['@caretaker-relay/product-identity']='file:../foundation/packages/product-identity'; require('fs').writeFileSync('package.json', JSON.stringify(p,null,2));"
COPY caretaker-relay/ ./
RUN npm ci --no-audit --no-fund && npm run build

FROM nginx:1.27-alpine
COPY --from=build /src/app/dist /usr/share/nginx/html
# SPA fallback
RUN printf 'server {\n  listen 80;\n  root /usr/share/nginx/html;\n  index index.html;\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK CMD wget -qO- http://127.0.0.1/ || exit 1
