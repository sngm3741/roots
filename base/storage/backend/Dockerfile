# syntax=docker/dockerfile:1.7

FROM golang:1.25 AS builder
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /out/storage ./cmd/api

FROM gcr.io/distroless/base-debian12:nonroot
WORKDIR /app
COPY --from=builder /out/storage /app/storage
USER nonroot:nonroot
ENV STORAGE_HTTP_ADDR=:8080
ENTRYPOINT ["/app/storage"]
