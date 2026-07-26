FROM golang:1.26-alpine

WORKDIR /app

# Install git and air for hot-reloading
RUN apk add --no-cache git && \
    go install github.com/air-verse/air@latest

# Copy dependency files first to leverage Docker's cache layers
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source code
COPY . .

# Air will run our server and watch for changes
CMD ["air", "-c", ".air.toml"]