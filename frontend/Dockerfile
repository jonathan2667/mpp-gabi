FROM nginx:alpine

# Copy static files
COPY . /usr/share/nginx/html

# Create nginx config that uses PORT env variable
RUN echo 'server { \
    listen $PORT; \
    server_name _; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf.template

# Use envsubst to replace $PORT with actual port value
CMD envsubst '$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'

EXPOSE $PORT 