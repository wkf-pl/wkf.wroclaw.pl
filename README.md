# WKF Online

Jedna aplikacja Node.js łącząca publiczny frontend Next.js, panel i API Payload oraz kod domenowy Wrocławskiego Klubu Fantastyki.

## Stack

- Next.js 16 i React 19,
- Payload 3,
- PostgreSQL,
- Azure Blob Storage lub lokalny filesystem,
- SMTP przez oficjalny adapter Nodemailer,
- Docker Compose z PostgreSQL, Azurite i Mailpit.

## Runtime lokalny

Projekt przypina Node.js 22.17.0 przez sekcję `volta` w `package.json`. Po zainstalowaniu Volty wejście do katalogu projektu automatycznie przełącza aktywny runtime na właściwą wersję. pnpm 11.16.0 jest przypięty przez pole `packageManager`.

## Uruchomienie w Dockerze

1. Skopiuj `.env.example` do `.env`.
2. Ustaw `PAYLOAD_SECRET`, na przykład wynikiem `openssl rand -base64 32`.
3. Uruchom `docker compose up --build`.
4. W osobnym terminalu uruchom `docker compose exec -T app pnpm verify:compose`, aby sprawdzić HTTP, bootstrap pierwszego administratora, upload do Azurite i wysyłkę do Mailpit. Test wymaga pustej kolekcji użytkowników i usuwa utworzone przez siebie rekordy oraz wiadomość.

Aplikacja będzie dostępna pod `http://localhost:3000`, panel Payload pod `http://localhost:3000/admin`, a Mailpit pod `http://localhost:8025`.

Compose nadpisuje `STORAGE_ADAPTER` na `azure`, dzięki czemu uploady przechodzą przez ten sam oficjalny adapter Azure co docelowo, ale trafiają do lokalnego Azurite.

## Uruchomienie aplikacji poza Dockerem

Można uruchamiać proces Next.js lokalnie, pozostawiając usługi pomocnicze w kontenerach:

```bash
docker compose up -d postgres azurite mailpit
pnpm install
pnpm dev
```

Domyślne `.env.example` używa adresów usług dostępnych z hosta. Ustaw `STORAGE_ADAPTER=local`, aby zapisywać media w katalogu `media/`, albo pozostaw `azure`, aby korzystać z Azurite.

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
├── storage/      wybór lokalnego lub Azure Blob Storage
└── lib/          małe narzędzia infrastrukturalne
```

`collections/` nie powinno przejmować logiki biznesowej. Operacje takie jak zapis na sesję, rezygnacja czy awans z listy rezerwowej będą implementowane w `modules/sessions/` i wywoływane z cienkich hooków, endpointów lub zadań.

## Infrastruktura

Katalog `infra/azure/` jest przygotowany pod Bicep, ale definicje zasobów nie są jeszcze wdrożone. Zanim powstaną moduły Container Apps, PostgreSQL, Storage, Key Vault, Registry i monitoringu, trzeba ustalić nazwy zasobów, subskrypcję, region oraz politykę sieciową.

Migracje produkcyjne powinny być uruchamiane jako osobny Azure Container Apps Job przed przełączeniem rewizji aplikacji. Nie są wykonywane automatycznie podczas startu serwera.
