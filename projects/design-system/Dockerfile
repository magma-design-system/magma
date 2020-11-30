# Stage 0, based on Node.js, to build and compile the website
FROM node:15 as node
LABEL step=build
WORKDIR /app
COPY package.json package-lock.json /app/
RUN [ "npm", "install" ]
COPY ./ /app/

# TODO Copiare solo i sorgenti invece di fare clean:gatsby
RUN [ "npm", "run", "clean:gatsby" ]
RUN [ "npm", "run", "build:gatsby" ]
RUN [ "npm", "run", "build:storybook" ]

# Stage 1, based on Nginx, to have only the compiled website, ready for production with Nginx
FROM nginx:alpine
LABEL step=runtime

COPY --from=node /app/public/ /var/www/html/gatsby
COPY --from=node /app/storybook-static /var/www/html/storybook

COPY ./docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./docker/nginx/sites/ /etc/nginx/sites-available
