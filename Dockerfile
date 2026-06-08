FROM nginx:1.27-alpine

# Static site
COPY public/ /usr/share/nginx/html/

# Server config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Runtime env -> config.js (nginx runs scripts in /docker-entrypoint.d/ on boot).
# envsubst ships with the official nginx image, so no extra packages are needed.
COPY docker-entrypoint.sh /docker-entrypoint.d/40-card2pay-config.sh
RUN chmod +x /docker-entrypoint.d/40-card2pay-config.sh

EXPOSE 80
