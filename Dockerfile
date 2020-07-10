# BUILD IMAGE
FROM node:10 as build

WORKDIR /app

# Invalidate cache
ADD "http://worldtimeapi.org/api/timezone/Europe/Amsterdam.txt" skipcache

# Add app
COPY website /app
RUN yarn

# Remove potentially cached Docusaurus files
RUN rm -rf /app/.docusaurus
RUN rm -rf /app/build

# Generate build
RUN yarn build

# ###############################################################################

# PROD IMAGE
FROM nginx:1.17.0-alpine

# Invalidate cache
ADD "http://worldtimeapi.org/api/timezone/Europe/Amsterdam.txt" skipcache

# Copy build artifacts from the 'build environment'
RUN rm -rf /usr/share/nginx/html/**
COPY --from=build /app/build /usr/share/nginx/html
