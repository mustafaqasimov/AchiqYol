# AçıqYol

Java 21 / Spring Boot 3 / PostgreSQL / Redis / Next.js / Tailwind / Leaflet.

## Run

```sh
cp .env.example .env
# Edit .env: choose strong DB_PASSWORD and ADMIN_PASSWORD.
docker compose up --build -d
docker compose logs -f backend frontend
curl -f http://localhost:3000/api/locations
```

Open port 3000. Production requires HTTPS at a reverse proxy for installation and secure HTTP Basic credentials. PostgreSQL, Redis and backend are internal services. Configure CORS_ORIGINS to the actual frontend origin. Compose preserves PostgreSQL data in a named volume. Do not delete that volume unless intentionally resetting data.

Public reads; POST, PUT and DELETE require the administrator credentials from .env. No default production password. For example (curl prompts for the password):

```sh
curl -u admin -H 'Content-Type: application/json' -d '{"name":"Bakı Kitab Mərkəzi","description":"Girişin əlçatanlığını yerində yoxlayın","latitude":40.372,"longitude":49.843}' http://localhost:3000/api/locations
curl http://localhost:3000/api/locations/1
curl -u admin -X PUT -H 'Content-Type: application/json' -d '{"name":"Updated location","description":"Updated description","latitude":40.372,"longitude":49.843}' http://localhost:3000/api/locations/1
curl -u admin -X DELETE http://localhost:3000/api/locations/1
```

## Development and checks

```sh
cd backend
./mvnw test
# Provide DB_URL, DB_USER, DB_PASSWORD, REDIS_HOST, ADMIN_PASSWORD first:
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
# In a separate terminal:
cd frontend
npm ci
npm run dev
npm run typecheck
npm run build
```

For host development, provide reachable PostgreSQL and Redis ports; Compose deliberately does not expose them. The frontend proxies /api/locations to BACKEND_URL (defaults to http://localhost:8080). The API exposes Swagger at backend /swagger-ui/index.html and health at /actuator/health.

## Scope and design

The WatchList repository was inspected: service/interfaces, service/impl, dto/request, dto/response and entity/entities are mirrored. The singular repository directory follows the explicit AchiqYol requirement (WatchList uses repositories).

The frontend now adapts the supplied Stitch HTML: lavender surfaces, green actions, status chips, map pins, cards, and bottom navigation. The supplied SVG is used for the explicitly labelled design demo. External photos and Material font icons are replaced with local SVG illustrations/icons. It uses text rating labels, a map-equivalent list, labelled controls, visible focus and 48px controls. Full WCAG conformance has not been audited.

Ratings are calculated from reviews: green >=4, yellow >=2.5, red below 2.5, grey without reviews. Users and reviews have entities, repositories and database tables; registration and review submission endpoints are not implemented. Initial data is empty. The UI displays the first 100 locations; API pagination supports page and size. Redis list caches expire after two minutes and CRUD invalidates them.

The install button triggers beforeinstallprompt where supported and gives manual instructions otherwise. Real PNG icons are included. The service worker caches static assets and serves an offline page; live API responses and external map tiles are not cached. The map requires OpenStreetMap tile access. Use a suitable tile provider for production traffic and follow its usage policy.

## Push to GitHub

This checkout already has origin configured. Run:

```sh
cd /workspace/AchiqYol
git init
git remote get-url origin || git remote add origin https://github.com/mustafaqasimov/AchiqYol.git
git add .
git commit -m "Initialize AchiqYol full-stack application"
git branch -M main
git push -u origin main
```

Keep .env out of Git.

## Generated file tree

```text
.env.example
.gitignore
README.md
backend/.dockerignore
backend/.mvn/wrapper/maven-wrapper.properties
backend/Dockerfile
backend/mvnw
backend/pom.xml
backend/src/main/java/az/achiqyol/AchiqYolApplication.java
backend/src/main/java/az/achiqyol/config/OpenApiConfig.java
backend/src/main/java/az/achiqyol/config/RedisConfig.java
backend/src/main/java/az/achiqyol/config/SecurityConfig.java
backend/src/main/java/az/achiqyol/controller/LocationController.java
backend/src/main/java/az/achiqyol/dto/request/LocationRequest.java
backend/src/main/java/az/achiqyol/dto/response/LocationResponse.java
backend/src/main/java/az/achiqyol/entity/entities/Location.java
backend/src/main/java/az/achiqyol/entity/entities/Review.java
backend/src/main/java/az/achiqyol/entity/entities/User.java
backend/src/main/java/az/achiqyol/exception/GlobalExceptionHandler.java
backend/src/main/java/az/achiqyol/exception/NotFoundException.java
backend/src/main/java/az/achiqyol/mapper/LocationMapper.java
backend/src/main/java/az/achiqyol/repository/LocationRepository.java
backend/src/main/java/az/achiqyol/repository/ReviewRepository.java
backend/src/main/java/az/achiqyol/repository/UserRepository.java
backend/src/main/java/az/achiqyol/service/impl/LocationServiceImpl.java
backend/src/main/java/az/achiqyol/service/impl/RatingPolicy.java
backend/src/main/java/az/achiqyol/service/interfaces/LocationService.java
backend/src/main/resources/application-dev.yml
backend/src/main/resources/application.yml
backend/src/main/resources/db/changelog/changelog-master.xml
backend/src/main/resources/db/changelog/changes/001-initial.sql
backend/src/test/java/az/achiqyol/service/impl/RatingPolicyTest.java
docker-compose.yml
frontend/.dockerignore
frontend/Dockerfile
frontend/app/api/[...path]/route.ts
frontend/app/globals.css
frontend/app/layout.tsx
frontend/app/page.tsx
frontend/components/InstallApp.tsx
frontend/components/Map.tsx
frontend/next-env.d.ts
frontend/next.config.mjs
frontend/package-lock.json
frontend/package.json
frontend/postcss.config.mjs
frontend/public/icons/icon-192.png
frontend/public/icons/icon-512.png
frontend/public/manifest.json
frontend/public/offline.html
frontend/public/service-worker.js
frontend/tailwind.config.ts
frontend/tsconfig.json
```

## Validation in this workspace

- `docker compose --env-file .env.example config -q`: passed.
- `npm run build`: passed (Next.js 15.5.29, TypeScript checked).
- Production frontend HTTP request: 200.
- Backend tests: subsequently compiled and passed using the Maven / Temurin 21 Docker image (2 tests, 0 failures).
- Full Compose startup, database migration execution, browser accessibility audit and native PWA install have not been verified.

## Mock data / Demo məlumatlar

`.env` faylına əlavə edin:

```env
SPRING_PROFILES_ACTIVE=demo
```

Sonra:

```sh
git pull origin main
docker compose up --build -d
```

Demo profilində Liquibase 4 uydurma Bakı məkanı, 2 istifadəçi və 6 rəy əlavə edir.
Sahil kafesi 4.5 (yaşıl), Şəhər kitabxanası 3 (sarı), Köhnə pilləkənli mağaza
1.5 (qırmızı), Yeni park isə rəysiz (boz) göstərilir. Bütün nümunələr DEMO kimi
işarələnib; bunlar real əlçatanlıq iddiaları deyil.

Liquibase dəyişiklik tarixçəsi sayəsində restart zamanı məlumatlar təkrarlanmır.
Mövcud məkanlar dəyişdirilmir. Redis-də əvvəlki siyahı varsa, ən çox 2 dəqiqə
sonra yenilə. Demo profilini söndürmək üçün dəyəri boşalt və backend-i yenidən
başlat; artıq bazaya yazılmış demo məlumatlar avtomatik silinmir. Demo profilini
production bazasında aktivləşdirmə.

## Stitch design preview (no backend required)

```sh
cd frontend
npm ci
npm run dev
```

Open `http://localhost:3000/?demo=1`, or click **Dizayn demosu**. This browser demo
is separate from the backend Liquibase demo profile. It uses fictional sample
places and the supplied schematic SVG; live mode still uses the API and Leaflet.
Search, status filters, map selection, list/detail navigation and local bookmarks
work. Experience/report forms save and restore browser-local drafts only. Route
and account dialogs explicitly identify services that are not implemented.

Validation: production build passed; Chromium desktop (1440px) and mobile (390px)
checks passed for filters, search, details, bookmarks, dialogs, draft submission,
and horizontal overflow. Full accessibility certification is not claimed.

## Photo → AI assessment → map

Use **Məkan əlavə et** to choose a JPEG/PNG/WebP or take a camera photo. The browser
resizes it to at most 1280px and re-encodes JPEG, dropping EXIF metadata. After
explicit consent, the server sends the image to OpenAI; it never exposes the API
key to the browser. Photos are not retained in PostgreSQL. The confirmed place,
coordinates, preliminary color and AI notes are persisted through the existing
admin-protected Location API. The map focuses on the new marker. Community
reviews take precedence over the preliminary AI color when reviews exist.

For Docker, fill these server variables in the root `.env` and recreate services:

```env
OPENAI_API_KEY=your-key-entered-locally
OPENAI_VISION_MODEL=gpt-4.1-mini
ADMIN_USER=admin
ADMIN_PASSWORD=your-strong-password
```

```sh
docker compose up --build -d
```

For frontend development, copy `frontend/.env.example` to `frontend/.env.local`,
set the same admin credentials as the backend and your own OpenAI key, then
restart `npm run dev`. Never put credentials in `NEXT_PUBLIC_*`, screenshots or
Git. Add-place uses admin credentials entered in the form; they are not stored
in localStorage. Public user accounts are not implemented. Deploy with HTTPS.

`POST /api/accessibility` verifies admin authentication, limits the body size,
checks image signatures, calls structured vision output, validates its response,
and forces uncertain/low-confidence findings to GREY. Text found in images is
untrusted. The AI describes visible features and unknowns; it cannot certify a
whole building, measure an unseen slope or guarantee a safe route. New columns
are added through Liquibase changeSet `002-ai-assessment`.

The downloadable HTML is a visual/offline preview only: photo selection works,
but it cannot call AI or publish to the shared map. AI API credentials were not
available during implementation. Provider behavior was tested with controlled
fixtures; real image interpretation still requires a configured key and live test.

Checks: `node --experimental-strip-types --test tests/accessibility.test.mjs`
(from frontend, Node 22.18+), `npm run build`, backend Maven tests, and browser
photo-upload → mocked AI → saved marker checks. No fabricated AI results are used
in the shipped app when the provider is unavailable.
