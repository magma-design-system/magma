#FROM nginx:alpine
#
#WORKDIR /var/www/html
#
#COPY ./storybook-static /var/www/html
#
#COPY ./docker/nginx/nginx.conf /etc/nginx/nginx.conf
#COPY ./docker/nginx/sites/ /etc/nginx/sites-available

# Stage 0, based on Node.js, to build and compile Angular
FROM node:15 as node
WORKDIR /app
COPY package.json package-lock.json /app/
RUN [ "npm", "install" ]
COPY ./ /app/

# TODO Copiare solo i sorgenti invece di fare clean:gatsby
RUN [ "npm", "run", "clean:gatsby" ]
RUN [ "npm", "run", "build:gatsby" ]

# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:1.19
COPY --from=node /app/dist/backoffice/ /usr/share/nginx/html
COPY ./nginx-custom.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
