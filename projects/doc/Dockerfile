# Stage 0, based on Node.js, to build and compile the website
FROM node:15 as node
LABEL step=build
WORKDIR /app

RUN npm install -g npm-install-peers

# Storybook of react project, dependency install
COPY ./react/package.json /app/react/package.json
RUN cd react && npm install
RUN cd react && npm-install-peers

# Website of doc project, dependency install
COPY ./doc/package.json /app/doc/package.json
RUN cd doc && npm install
RUN cd doc && npm-install-peers

# Copy of all sources
COPY ./react /app/react
COPY ./doc /app/doc


# TODO Copiare solo i sorgenti invece di fare gatsby:clean
RUN cd react && npm run build:storybook
RUN cd doc && npm run clean
RUN cd doc && npm run build

# Stage 1, based on Nginx, to have only the compiled website, ready for production with Nginx
FROM nginx:alpine
LABEL step=runtime

COPY --from=node /app/doc/public/ /var/www/html/gatsby
COPY --from=node /app/react/storybook-static /var/www/html/storybook

COPY ./doc/docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./doc/docker/nginx/sites/ /etc/nginx/sites-available
