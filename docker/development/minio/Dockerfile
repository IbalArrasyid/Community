FROM golang:1.26-alpine AS minio-build

ARG MINIO_VERSION=RELEASE.2025-10-15T17-29-55Z
ENV CGO_ENABLED=0 GOTOOLCHAIN=local GOMAXPROCS=2
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go install -trimpath -ldflags="-s -w" github.com/minio/minio@${MINIO_VERSION} \
    && mkdir -p /out \
    && cp "$(go list -m -f '{{.Dir}}' github.com/minio/minio@${MINIO_VERSION})/LICENSE" /out/LICENSE

FROM golang:1.26-alpine AS mc-build

ARG MC_VERSION=RELEASE.2025-08-13T08-35-41Z
ENV CGO_ENABLED=0 GOTOOLCHAIN=local GOMAXPROCS=2
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go install -trimpath -ldflags="-s -w" github.com/minio/mc@${MC_VERSION} \
    && mkdir -p /out \
    && cp "$(go list -m -f '{{.Dir}}' github.com/minio/mc@${MC_VERSION})/LICENSE" /out/LICENSE

FROM alpine:3.23 AS server

RUN apk add --no-cache ca-certificates curl
COPY --from=minio-build /go/bin/minio /usr/bin/minio
COPY --from=minio-build /out/LICENSE /usr/share/licenses/minio/LICENSE
LABEL org.opencontainers.image.source="https://github.com/minio/minio" \
    org.opencontainers.image.version="RELEASE.2025-10-15T17-29-55Z" \
    org.opencontainers.image.licenses="AGPL-3.0-only"
EXPOSE 9000 8900
ENTRYPOINT ["/usr/bin/minio"]
CMD ["server", "/data", "--console-address", ":8900"]

FROM alpine:3.23 AS client

RUN apk add --no-cache ca-certificates
COPY --from=mc-build /go/bin/mc /usr/bin/mc
COPY --from=mc-build /out/LICENSE /usr/share/licenses/mc/LICENSE
LABEL org.opencontainers.image.source="https://github.com/minio/mc" \
    org.opencontainers.image.version="RELEASE.2025-08-13T08-35-41Z" \
    org.opencontainers.image.licenses="AGPL-3.0-only"
ENTRYPOINT ["/usr/bin/mc"]
