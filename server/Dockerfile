# ------------------------- Start of building phase -------------------------
# Builds an evironment to compile this app.

# Initializes node v16.15.1 as a base image, named `builder`.
FROM node:16.15.1-alpine AS builder

# Create the `/app` directory in the image for the build stage.
WORKDIR /app

# Install typescript with --quite and -g modes.
RUN npm install --quite typescript -g

# Copy the package.json to `app` directory in the image's filesystem.
COPY ./package.json ./
# COPY ./package-lock.json ./
COPY ./yarn.lock ./

# Install all dependencies.
# RUN npm install
RUN yarn --frozen-lockfile

# Copy all directories/files (except those declared at the .dockerignore file)
# from directory where the Dockerfile is stored to the image's filesystem.
COPY . .

# RUN npm run build
RUN yarn clean && yarn build

# Remove all development dependencies.
RUN npm prune --production
#RUN yarn install --production

# ------------------------- End of building phase -------------------------


# -------------------------------------------------------------------------
FROM node:16.15.1-alpine

# Create the `/app` directory in the image's filesystem.
WORKDIR /app

# Author information.
LABEL author.name="Le Hoang Anh"
LABEL author.email="lehoanganh.le2001@gmail.com"

# Copy necessary directories/files from builder stage
# to current working directory in the image's filesystem.
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/data ./data

EXPOSE 3000
CMD ["node", "dist/index.js"]
# -------------------------------------------------------------------------
