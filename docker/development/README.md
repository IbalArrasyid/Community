# Hi.Events local development with Docker

This guide walks you through setting up Hi.Events using Docker, including requirements, setup steps, configuration,
and environment variables.

## Requirements

1. **Docker** – Required for containerized development. [Install Docker](https://docs.docker.com/get-docker/)
2. **Git** – Needed to clone the repository. [Install Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

> **Note:** This guide assumes a macOS or Linux environment by default. See the **Windows setup instructions** below if you're on Windows.

---

## Setup instructions (macOS / Linux)

### 1. Clone the repository

```bash
git clone git@github.com:HiEventsDev/Hi.Events.git
```

### 2. Start the development environment

Navigate to the Docker development directory and run the startup script:

```bash
cd Hi.Events/docker/development
./start-dev.sh
```

Once running, access the app at:

- **Frontend**: [https://localhost:8443](https://localhost:8443)

---

## Setup instructions (Windows)

From PowerShell, change to docker/development and invoke Git Bash explicitly:

~~~powershell
& "C:\Program Files\Git\bin\bash.exe" -c 'MSYS_NO_PATHCONV=1 bash ./start-dev.sh'
~~~

Choose N for "Wipe the database and start fresh?" to preserve data. Choose N for reinstalling frontend dependencies if the image has already built successfully. The launcher creates missing environment files, installs dependencies, waits for a live PostgreSQL connection, prepares missing development secrets and applies migrations. It stops if a setup command fails.

Existing application keys are preserved. backend/.env is the source of APP_KEY; Docker Compose no longer overrides it with a separate key. Never regenerate an existing application key to fix registration.

After setup, register your own account at [https://localhost:8443/auth/register](https://localhost:8443/auth/register). There is no seeded default website account. Development emails are available in [Mailpit](http://localhost:8025).

## PowerShell and MinIO image availability

PowerShell may open a .sh file in its associated editor instead of running Bash. To run the launcher from docker/development, invoke Git Bash explicitly:

~~~powershell
& "C:\Program Files\Git\bin\bash.exe" -c 'MSYS_NO_PATHCONV=1 bash ./start-dev.sh'
~~~

Choose N for "Wipe the database?" to keep existing data. For subsequent starts after setup, use docker compose directly:

~~~powershell
docker compose -f docker-compose.dev.yml up -d --build
~~~

The development minio and createbuckets services now build locally from minio/Dockerfile. They do not pull minio/minio or minio/mc images. Both Docker Hub and Quay image pulls failed during verification on 13 November 2026.

The source versions are pinned to:
- Server: RELEASE.2025-10-15T17-29-55Z.
- Client: RELEASE.2025-08-13T08-35-41Z.

The first build downloads Go module dependencies and compiles both binaries. Subsequent builds reuse the build cache. The MinIO volume, endpoints, bucket names and existing storage settings are preserved. License files are included in both images; upstream source is not modified.

[MinIO's official release instructions](https://github.com/minio/minio/releases/tag/RELEASE.2025-10-15T17-29-55Z) recommend building container deployments from source. This Dockerfile is for local development. The upstream repositories are archived; reassess the object-storage dependency before production deployment.

To verify just the object-storage build:

~~~powershell
docker compose -f docker-compose.dev.yml config --quiet
docker compose -f docker-compose.dev.yml build minio createbuckets
~~~

Verification completed on 13 November 2026:
- Bash syntax check of start-dev.sh passed through Git Bash.
- docker compose config --quiet passed.
- docker compose build minio createbuckets passed for both targets.
- An isolated temporary MinIO server passed its readiness check.
- The locally built mc created buckets, uploaded and downloaded objects, and applied the public bucket policy.
- Anonymous access to the public test object succeeded; the private test object returned HTTP 403.
- License files were present in both runtime images.
- Temporary test objects, buckets, container and network were removed. No application database or storage volume was mounted by the smoke test.

## Frontend dependency network timeouts

If yarn install fails with ESOCKETTIMEDOUT for a package tarball, the dependency download failed before the frontend application could start. Other concurrent image builds may be canceled as a consequence.

Both development frontend Dockerfiles use a persistent BuildKit Yarn cache, a 300000 ms network timeout and network concurrency of 2. The build switches registry.yarnpkg.com tarball URLs to registry.npmjs.org in the image's temporary copy of yarn.lock. The repository's lockfile, package versions and integrity hashes are preserved; frozen-lockfile and TLS verification remain enabled. The normal COPY of application source restores the original lockfile in the completed image.

Retry only the frontend build first so its error is visible separately:

~~~powershell
docker compose --progress plain -f docker-compose.dev.yml build frontend
docker compose -f docker-compose.dev.yml up -d
~~~

Do not use docker system prune or remove data volumes to resolve an npm registry timeout. The download cache is retained across failed builds, so a retry can reuse completed package downloads. This follows Docker's [cache mount guidance](https://docs.docker.com/build/cache/optimize/#use-cache-mounts).

Files changed for the frontend fix:
- frontend/Dockerfile.ssr.dev
- frontend/Dockerfile.csr.dev
- frontend/src/components/routes/organizer/CommunityContent/index.tsx
- docker/development/README.md

Verification of the frontend network fix on 13 November 2026:

| Check | Result |
| --- | --- |
| Full SSR development image build | Passed, including frozen dependency install and patch-package. |
| Rebuild after the CMS editor binding fix | Passed; the dependency installation layer was CACHED. |
| Backend image build run separately | Passed. |
| CSR Dockerfile BuildKit checks | Passed with no warnings; this is a Dockerfile check, not a full CSR image build. |
| Repository package.json and yarn.lock diff | Unchanged. |
| SHA-256 of yarn.lock in the frontend image versus repository | Matched. |
| Imports of React, Mantine, React Router, React Query, Sentry and Vite | Passed. |
| tsc --noEmit in the updated frontend image | Passed after making the CMS Editor value/onChange binding explicit. |
| build:ssr:client | Passed, with existing dependency/bundler warnings. |
| build:ssr:server | Passed in the updated image. |
| Temporary frontend development server | Started successfully; /@vite/client returned HTTP 200. |
| Default ESLint check of the edited CMS component | Blocked by the existing lingui/no-unlocalized-strings rule crash with TypeScript. |
| Same component ESLint check with only that rule disabled through CLI | Passed with zero warnings. Repository ESLint configuration is unchanged. |
| git diff --check for the changed files | Passed. |

The startup smoke test used synthetic API URLs and no application data volumes or host ports. Its temporary container was removed. It verifies frontend startup, not authenticated API flows, migrations, checkout or backend regression tests. Rerun the setup launcher to complete Composer/database setup; choose N when asked to wipe the database.

## Additional configuration

Hi.Events uses environment variables for configuration. You’ll find `.env` files in:

- `frontend/.env`
- `backend/.env`

You can modify these to customize your setup.

For a full list of environment variables, see the [Environment Variables Documentation](https://hi.events/docs/getting-started/deploying#environment-variables).

### Reserved seating and the box office

These are Hi.Events Enterprise features and stay off by default, even in development. To work on them, add `APP_LICENCE_KEY=development` to `backend/.env`. That unlocks them for development and testing, and shows a "Development licence" notice once they're in use. Remove the line to switch them off again.

## Registration fails after containers start

PostgreSQL can exit during first initialization if a shell script has Windows CRLF line endings (env: bash\r: No such file or directory). The initialization scripts are stored with LF and .gitattributes enforces LF for development shell scripts. The launcher probes pg_isready against the running server instead of reading historical startup logs.

If initialization already created the PostgreSQL volume, keep it and start the services again. The main database remains available; run the idempotent script explicitly to create the test database if the interrupted first initialization missed it:

~~~powershell
docker compose -f docker-compose.dev.yml up -d pgsql minio createbuckets
docker compose -f docker-compose.dev.yml exec -T pgsql bash /docker-entrypoint-initdb.d/01-create-test-db.sh
~~~

The MinIO service passes server directly to its binary entrypoint. createbuckets exits with status 0 once its one-time setup finishes; it does not need to stay running.

No new migration is introduced by these startup fixes. Service recreation preserves named volumes. Do not use down -v, migrate:fresh or migrate:refresh to repair registration.

## Windows backend filesystem performance

The backend Composer vendor directory uses the app-backend-vendor Docker volume. PHP dependencies are read from the Linux filesystem rather than the Windows bind mount. Application source remains bind-mounted for live editing. The launcher sets ownership and runs Composer inside the backend container to populate or update this volume. Host backend/vendor is no longer used by the running container.

On an existing checkout with dependencies installed, they can be copied into this volume without downloads before recreating the backend. The application key and PostgreSQL/MinIO volumes remain unchanged. After recreating the backend, restart nginx so it resolves the current backend address.

Do not regenerate keys or remove database volumes when the gateway returns 504. An account may already have been created before the gateway timed out; try signing in with the same email after setup is healthy.
