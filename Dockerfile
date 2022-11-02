
# Install the base requirements for the app.
# This stage is to support development.
# FROM python:alpine AS base
# WORKDIR /
# COPY requirements.txt .
# RUN pip install -r requirements.txt


FROM node:18-alpine
# Adding build tools to make yarn install work on Apple silicon / arm64 machines
RUN apk add --no-cache --virtual .gyp python3 make g++
WORKDIR /
COPY . .
RUN yarn install --production
CMD ["node", "index.js"]