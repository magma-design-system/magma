# Stage 0, based on Node.js, to build and compile the website
FROM node:15 as node
LABEL step=build
WORKDIR /app/design-system

# TODO font-icons-cli e mgg-icons dovrebbero essere delle dipendenze, non dovrebbero essere usati direttamente
COPY ./font-icons-cli/package.json /app/font-icons-cli/
COPY ./font-icons-cli/package-lock.json /app/font-icons-cli/
RUN cd ./app/font-icons-cli/ && npm install
COPY ./mgg-icons/package.json /app/mgg-icons/
COPY ./mgg-icons/package-lock.json /app/mgg-icons/
RUN cd /app/mgg-icons/ && npm install
COPY ./font-icons-cli /app/font-icons-cli
COPY ./mgg-icons /app/mgg-icons

COPY ./design-system/package.json /app/design-system/
COPY ./design-system/package-lock.json /app/design-system/
RUN [ "npm", "install" ]
COPY ./design-system /app/design-system


# TODO Copiare solo i sorgenti invece di fare clean:gatsby
RUN [ "npm", "run", "clean:gatsby" ]
RUN [ "npm", "run", "build:gatsby" ]
RUN [ "npm", "run", "build:storybook" ]

# Stage 1, based on Nginx, to have only the compiled website, ready for production with Nginx
FROM nginx:alpine
LABEL step=runtime

COPY --from=node /app/design-system/public/ /var/www/html/gatsby
COPY --from=node /app/design-system/storybook-static /var/www/html/storybook

COPY ./design-system/docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./design-system/docker/nginx/sites/ /etc/nginx/sites-available
