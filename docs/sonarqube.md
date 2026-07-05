# SonarQube (local + server)

`docker-compose.sonar.yml` runs SonarQube Community Edition + Postgres. It's
the same file whether you're running it on your own machine or on a VPS -
nothing in it is machine-specific.

## Local

```bash
# Linux only, once per host reboot - SonarQube's Elasticsearch needs this:
sudo sysctl -w vm.max_map_count=262144

npm run sonar:up
```

Wait ~1-2 minutes for first boot, then open http://localhost:9000
(default login `admin` / `admin`, it'll force a password change).

1. Create a project manually (key `vz-book-2026`, matching
   `sonar-project.properties`).
2. Generate a token for it (My Account → Security) and export it:
   ```bash
   export SONAR_TOKEN=<token>
   ```
3. Generate coverage, then scan:
   ```bash
   npm run test:coverage
   npm run sonar:scan
   ```
4. Results show up on the project dashboard at http://localhost:9000.

Shut it down with `npm run sonar:down` (data persists in the named Docker
volumes between runs; add `-v` to `docker compose -f docker-compose.sonar.yml
down -v` to wipe it).

## Server

Copy `docker-compose.sonar.yml` to any VPS and run the same `sonar:up`
command there. Two things a real deployment needs that local doesn't:

- **Reverse proxy + TLS** (Caddy or Nginx) in front of port 9000 - don't
  expose SonarQube directly to the internet over plain HTTP.
- **Backups** of the `postgresql_data` volume (that's where all analysis
  history and settings live; `sonarqube_data`/`sonarqube_extensions` are
  regenerable).

Once a server exists, point CI at it instead of running the scan locally -
see the `sonar` job note below.

## CI

Not wired into `.github/workflows/quality.yml` yet - that lands as a small
follow-up once the CI PR (`feat/quality-ci`) is merged, to avoid two PRs
touching the same workflow file at once. The job will look roughly like:

```yaml
sonar:
  runs-on: ubuntu-latest
  if: ${{ secrets.SONAR_HOST_URL != '' }}
  steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0
    - uses: actions/setup-node@v4
      with:
        node-version: 20
        cache: 'npm'
    - run: npm ci
    - run: npm run test:coverage
    - uses: SonarSource/sonarqube-scan-action@v4
      env:
        SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
        SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
    - uses: SonarSource/sonarqube-quality-gate-action@v1
      env:
        SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

Guarded by `if: secrets.SONAR_HOST_URL != ''` so the workflow doesn't break
for anyone who hasn't deployed a server yet.
