# BUILD IMAGE
FROM node:10 as build

WORKDIR /app

# Install and cache app dependencies
COPY website/package.json /app/package.json
COPY website/yarn.lock /app/yarn.lock
RUN yarn

# Invalidate cache from here on
ADD "http://worldtimeapi.org/" skipcache

# Remove potentially cached Docusaurus files
RUN rm -rf /app/.docusaurus
RUN rm -rf /app/build

# Add app
COPY website /app

# Generate build
RUN yarn build

# ###############################################################################

# PROD IMAGE
FROM nginx:1.17.0-alpine

# Copy build artifacts from the 'build environment'
RUN rm -rf /usr/share/nginx/html/**
COPY --from=build /app/build /usr/share/nginx/html
