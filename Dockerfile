FROM nginx:alpine

WORKDIR /var/www/html

COPY ./storybook-static /var/www/html

COPY ./docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./docker/nginx/sites/ /etc/nginx/sites-available