# BUILD IMAGE
FROM node:10 as build

WORKDIR /app

# Install and cache app dependencies
COPY website/package.json /app/package.json
COPY website/yarn.lock /app/yarn.lock
RUN yarn

# Add app
COPY website /app

# Generate build
RUN yarn build

# ###############################################################################

# # PROD IMAGE
FROM nginx:1.17.0-alpine

# # Copy build artifacts from the 'build environment'
COPY --from=build /app/build /usr/share/nginx/html
