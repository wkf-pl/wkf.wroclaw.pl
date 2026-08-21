# WKF Online

Jedna aplikacja Node.js łącząca publiczny frontend Next.js, panel i API Payload oraz kod domenowy Wrocławskiego Klubu Fantastyki.

## Stack

- Next.js 16 i React 19,
- Payload 3,
- PostgreSQL,
- Azure Blob Storage (Azurite lokalnie),
- SMTP przez oficjalny adapter Nodemailer,
- Docker Compose z PostgreSQL, Azurite i Mailpit.

## Runtime lokalny

Projekt przypina Node.js 22.17.0 przez sekcję `volta` w `package.json`. Po zainstalowaniu Volty wejście do katalogu projektu automatycznie przełącza aktywny runtime na właściwą wersję. pnpm 11.16.0 jest przypięty przez pole `packageManager`.

## Uruchomienie w Dockerze

1. Skopiuj `.env.example` do `.env`.
2. Ustaw `PAYLOAD_SECRET`, na przykład wynikiem `openssl rand -base64 32`.
3. Uruchom `docker compose up --build`.
4. W osobnym terminalu uruchom `docker compose exec -T app pnpm verify:compose`, aby sprawdzić HTTP, bootstrap pierwszego administratora, upload do Azurite i wysyłkę do Mailpit. Test wymaga pustej kolekcji użytkowników i usuwa utworzone przez siebie rekordy oraz wiadomość.

Aplikacja będzie dostępna pod `http://127.0.0.1:3000` (również `http://localhost:3000`), panel Payload pod `http://127.0.0.1:3000/admin`, a Mailpit pod `http://127.0.0.1:8025`.

Uploady przechodzą przez ten sam oficjalny adapter Azure na każdym środowisku. Lokalnie trafiają do Azurite, a na stagingu i produkcji do osobnych kontenerów Azure Blob Storage.

## Uruchomienie aplikacji poza Dockerem

Można uruchamiać proces Next.js lokalnie, pozostawiając usługi pomocnicze w kontenerach:

```bash
docker compose up -d postgres azurite mailpit
pnpm install
pnpm dev
```

Domyślne `.env.example` używa adresów usług dostępnych z hosta, w tym lokalnego endpointu Azurite.

## Najważniejsze polecenia

```bash
pnpm check
pnpm build
pnpm generate:types
pnpm migrate:create
pnpm migrate
pnpm seed
pnpm verify:compose
```

## Struktura

```text
src/
├── app/          frontend, panel Payload, API i health check
├── collections/  cienkie konfiguracje kolekcji Payload
├── globals/      globalne ustawienia strony
├── modules/      logika domenowa według funkcji biznesowych
├── access/       współdzielone reguły dostępu Payload
├── jobs/         zadania domenowe Payload Jobs
├── email/        konfiguracja SMTP i szablony
├── storage/      konfiguracja Azure Blob Storage i Azurite
└── lib/          małe narzędzia infrastrukturalne
```

`collections/` nie powinno przejmować logiki biznesowej. Operacje takie jak zapis na sesję, rezygnacja czy awans z listy rezerwowej będą implementowane w `modules/sessions/` i wywoływane z cienkich hooków, endpointów lub zadań.

## Infrastruktura

Projekt ma trzy środowiska:

- `local` działa w Docker Compose z PostgreSQL, Azurite i Mailpit,
- `staging` działa w osobnej grupie zasobów i osobnym Azure Container Apps Environment,
- `prod` działa w osobnej grupie zasobów pod docelowym adresem `https://wkf.wroclaw.pl`.

Definicje Bicep znajdują się w `infra/azure/`. Staging i produkcja mają osobne bazy PostgreSQL, konta Storage, środowiska Container Apps oraz Log Analytics. Współdzielą jedynie Azure Container Registry.

Workflow stagingu buduje obraz tylko raz i publikuje jego digest. Produkcja wymaga ręcznego podania digestu sprawdzonego na stagingu. Na obu środowiskach migracje wykonuje osobny Azure Container Apps Job przed przełączeniem obrazu aplikacji.

Szczegółowa konfiguracja Azure i wymagane ustawienia GitHub są opisane w `infra/azure/README.md`.

## Dokumentacja

- [Rejestr decyzji architektonicznych](docs/ADR.md)
