FROM nginx:alpine

COPY ./projects/stencil/dist-storybook /usr/share/nginx/html/storybook

COPY ./docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./docker/nginx/sites/ /etc/nginx/sites-available
