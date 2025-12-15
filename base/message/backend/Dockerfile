# syntax=docker/dockerfile:1.7

ARG BIN=ingress
FROM golang:1.25 AS builder
ARG BIN
WORKDIR /src
COPY . .
ENV BIN=${BIN}
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /out/app ./cmd/$BIN

FROM gcr.io/distroless/base-debian12:nonroot
WORKDIR /app
COPY --from=builder /out/app /app/app
USER nonroot:nonroot
ENTRYPOINT ["/app/app"]
