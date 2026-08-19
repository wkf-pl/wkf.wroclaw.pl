# Infrastruktura Azure

Projekt utrzymuje dwa izolowane środowiska Azure oraz lokalne środowisko Compose:

| Środowisko | Grupa zasobów    | Adres                                    |
| ---------- | ---------------- | ---------------------------------------- |
| local      | nie dotyczy      | `http://127.0.0.1:3000`                  |
| staging    | `rg-wkf-staging` | techniczny adres `azurecontainerapps.io` |
| prod       | `rg-wkf-prod`    | `https://wkf.wroclaw.pl`                 |

Grupy zasobów tworzymy wcześniej, poza workflowem. `shared.bicep` wdraża wspólny Azure Container Registry do `rg-wkf-shared`. `main.bicep` wdraża zasoby konkretnego środowiska do wskazanej grupy z modułów w `modules/`: Container Apps Environment, aplikację, ręczny job migracyjny, PostgreSQL Flexible Server, Blob Storage oraz Log Analytics. Wszystkie zasoby domyślnie powstają w regionie `Poland Central` (`polandcentral`).

Pliki `environments/staging.bicepparam` i `environments/prod.bicepparam` zawierają wyłącznie niesekretne różnice środowisk. Sekrety są pobierane w czasie kompilacji parametrów ze zmiennych środowiskowych.

## GitHub environments

Utwórz środowiska GitHub `staging` i `prod`. Środowisko `prod` powinno mieć wymagane ręczne zatwierdzenie.

W obu środowiskach skonfiguruj zmienne:

- `AZURE_CLIENT_ID` — identyfikator aplikacji używanej przez GitHub OIDC,
- `AZURE_SUBSCRIPTION_ID`,
- `AZURE_TENANT_ID`.

Tożsamość OIDC stagingu otrzymuje rolę `Contributor` wyłącznie w `rg-wkf-staging` i
`rg-wkf-shared`. Ponieważ obraz jest budowany raz na runnerze GitHub i wysyłany bezpośrednio do
ACR, tożsamość wymaga również roli danych `AcrPush` na rejestrze w `rg-wkf-shared`. Nie wymaga
żadnej roli na poziomie całej subskrypcji ani uprawnień do zarządzania rolami. `AcrPush` nadaje
administrator jednorazowo poza workflowem; sam workflow nie może rozszerzać swoich uprawnień.

Przypisanie dla obecnego rejestru używającego klasycznego trybu RBAC można wykonać jako właściciel
subskrypcji lub administrator RBAC:

```bash
registry_id="$(az acr show --name <registry-name> --query id --output tsv)"
az role assignment create --assignee <github-oidc-client-id> --role AcrPush --scope "$registry_id"
```

Zarządzana tożsamość `wkf-staging-registry` jest tworzona przed pierwszym wdrożeniem i jednorazowo otrzymuje rolę `AcrPull` w `rg-wkf-shared`. Workflow nie może samodzielnie zmieniać tego przypisania.

Produkcja może dodatkowo otrzymać zmienną `CUSTOM_DOMAIN_CERTIFICATE_ID` z pełnym resource ID certyfikatu przypisanego do Container Apps Environment.

W obu środowiskach skonfiguruj sekrety:

- `PAYLOAD_SECRET`,
- `POSTGRES_ADMIN_PASSWORD`.

Produkcja wymaga dodatkowo zmiennej `SMTP_HOST` i sekretów:

- `SMTP_USER`,
- `SMTP_PASSWORD`.

Na stagingu SMTP jest początkowo wyłączone. Nie blokuje to działania strony ani panelu, ale funkcje wysyłające pocztę nie będą dostępne do czasu skonfigurowania serwera SMTP.

Staging utrzymuje konfigurację Microsoft Entra na potrzeby opcjonalnego logowania Easy Auth i
wymaga dodatkowo zmiennych:

- `ENTRA_TENANT_ID`,
- `ENTRA_CLIENT_ID`,
- `ENTRA_ALLOWED_GROUP_ID` — identyfikator grupy zawierającej Zarząd i osoby techniczne,

oraz sekretu `ENTRA_CLIENT_SECRET`.

Rejestracja aplikacji stagingowej musi emitować identyfikatory grup w tokenie. Easy Auth
przepuszcza anonimowe żądania do strony i panelu Payload, a grupa wskazana przez
`ENTRA_ALLOWED_GROUP_ID` ogranicza konta używane przy opcjonalnym logowaniu Microsoft.
Panel Payload nadal wymaga własnego uwierzytelnienia. Staging zwraca również `robots.txt`
blokujący indeksowanie całej witryny.

Po pierwszym utworzeniu stagingu dodaj do rejestracji aplikacji Entra URI przekierowania:

```text
https://<adres-stagingu>/.auth/login/aad/callback
```

Włącz również wydawanie ID tokenów wymaganych przez przepływ logowania Easy Auth:

```bash
az ad app update --id "$ENTRA_CLIENT_ID" --enable-id-token-issuance true
```

## Wdrożenia

Udane zakończenie `ci.yml` po pushu do `dev` wywołuje wielokrotnego użytku
`deploy-staging.yml`. Pull request uruchamia walidację obrazu z cache’em BuildKit, ale nie
wdrożenie. Push do `dev` nie buduje obrazu w jobie `verify`; docelowy obraz powstaje i jest
wysyłany do ACR tylko raz w workflowie stagingowym.

Każda rewizja zapisuje `DEPLOYED_SOURCE_SHA`. Workflow porównuje ten commit z docelowym i
automatycznie ustala, czy potrzebne są nowy obraz, pełny provisioning i migracje. Jeżeli aktywna
rewizja nie ma jeszcze metadanej SHA, bezpiecznie wykonuje wszystkie operacje. Ręczne uruchomienie
pozwala wymusić lub pominąć provisioning i migracje.

Workflow stagingowy:

1. pomija nieaktualny commit oczekujący w kolejce,
2. klasyfikuje zmiany względem aktywnej rewizji,
3. uzgadnia wspólne zasoby i pełną infrastrukturę tylko wtedy, gdy są potrzebne,
4. buduje i wysyła jeden niezmienny obraz albo ponownie wykorzystuje aktywny digest,
5. przed zmianami zapisuje faktycznie aktywną rewizję i jej obraz jako punkt rollbacku,
6. po zmianach migracji tworzy kopię PostgreSQL, wchodzi w maintenance i uruchamia job migracyjny,
7. przełącza aplikację na nowy obraz; bez migracji pozostawia bezprzerwowe przełączenie trybowi
   pojedynczej rewizji Container Apps,
8. przez maksymalnie 10 minut sprawdza readiness oraz odpowiedzi HTTP dla `/`, `/admin` i
   `/health`, a na stagingu
   także blokadę indeksowania w `/robots.txt`,
9. zapisuje digest w podsumowaniu workflowu.

Jeżeli migracja lub testy HTTP nie powiodą się, skrypt uruchamia `migrate:down` tylko wtedy, gdy
wcześniej zakończył `migrate`, dezaktywuje inne rewizje i przywraca zapisany punkt rollbacku.
Aktywnej już rewizji nie próbuje ponownie aktywować. Gdy wycofanie bazy się nie powiedzie,
poprzednia rewizja celowo pozostaje nieaktywna, aby nie uruchomić starego kodu na niezgodnym
schemacie.

`deploy-production.yml` jest uruchamiany ręcznie. Przyjmuje digest zatwierdzonego obrazu i pełny
SHA źródłowy raportowane przez staging, sprawdza obecność obrazu w ACR, automatycznie klasyfikuje
zmiany i przełącza aplikację. Obraz nie jest budowany ponownie. Operator może jawnie wymusić lub
pominąć pełny provisioning i migracje.

## Domena produkcyjna

Parametry produkcji ustawiają `SERVER_URL=https://wkf.wroclaw.pl`. Samo przypięcie domeny i certyfikatu wymaga wcześniejszego skierowania DNS na Container Apps. Po utworzeniu certyfikatu przekaż jego resource ID jako `customDomainCertificateId`; dopóki parametr jest pusty, aplikacja pozostaje dostępna pod technicznym adresem Azure.

## Bezpieczeństwo sieciowe

Obecna wersja pozwala PostgreSQL przyjmować połączenia z usług Azure przez regułę `0.0.0.0`. Jest to działający punkt startowy, ale przed przetwarzaniem danych produkcyjnych należy rozważyć prywatne endpointy i osobne sieci wirtualne dla stagingu oraz produkcji. Połączenie aplikacji z bazą wymusza TLS przez `sslmode=require`.
