# Infrastruktura Azure

Projekt utrzymuje dwa izolowane środowiska Azure oraz lokalne środowisko Compose:

| Środowisko | Grupa zasobów | Adres                                    |
| ---------- | ------------- | ---------------------------------------- |
| local      | nie dotyczy   | `http://127.0.0.1:3000`                  |
| staging    | `wkf-staging` | techniczny adres `azurecontainerapps.io` |
| prod       | `wkf-prod`    | `https://wkf.wroclaw.pl`                 |

`shared.bicep` tworzy grupę `wkf-shared` i wspólny Azure Container Registry. `main.bicep` tworzy zasoby konkretnego środowiska z modułów w `modules/`: Container Apps Environment, aplikację, ręczny job migracyjny, PostgreSQL Flexible Server, Blob Storage oraz Log Analytics.

Pliki `environments/staging.bicepparam` i `environments/prod.bicepparam` zawierają wyłącznie niesekretne różnice środowisk. Sekrety są pobierane w czasie kompilacji parametrów ze zmiennych środowiskowych.

## GitHub environments

Utwórz środowiska GitHub `staging` i `prod`. Środowisko `prod` powinno mieć wymagane ręczne zatwierdzenie.

W obu środowiskach skonfiguruj zmienne:

- `AZURE_CLIENT_ID` — identyfikator aplikacji używanej przez GitHub OIDC,
- `AZURE_SUBSCRIPTION_ID`,
- `AZURE_TENANT_ID`,
- `SMTP_HOST`.

Tożsamość OIDC używana przez workflowy musi móc tworzyć grupy zasobów i zasoby oraz nadawać rolę `AcrPull` zarządzanej tożsamości aplikacji. Najprostszy wariant startowy to role `Contributor` i `User Access Administrator` na poziomie subskrypcji; po pierwszym wdrożeniu warto zawęzić ich zakres.

Produkcja może dodatkowo otrzymać zmienną `CUSTOM_DOMAIN_CERTIFICATE_ID` z pełnym resource ID certyfikatu przypisanego do Container Apps Environment.

W obu środowiskach skonfiguruj sekrety:

- `PAYLOAD_SECRET`,
- `POSTGRES_ADMIN_PASSWORD`,
- `SMTP_USER`,
- `SMTP_PASSWORD`.

Staging wymaga dodatkowo zmiennych:

- `ENTRA_TENANT_ID`,
- `ENTRA_CLIENT_ID`,
- `ENTRA_ALLOWED_GROUP_ID` — identyfikator grupy zawierającej Zarząd i osoby techniczne,

oraz sekretu `ENTRA_CLIENT_SECRET`.

Rejestracja aplikacji stagingowej musi emitować identyfikatory grup w tokenie. Dostęp jest ograniczony do grupy wskazanej przez `ENTRA_ALLOWED_GROUP_ID`; sam fakt posiadania konta w tenantcie nie wystarcza.

Po pierwszym utworzeniu stagingu dodaj do rejestracji aplikacji Entra URI przekierowania:

```text
https://<adres-stagingu>/.auth/login/aad/callback
```

## Wdrożenia

Udane zakończenie `ci.yml` po zmianie w `main` lub `master` uruchamia `deploy-staging.yml`. Workflow:

1. uzgadnia wspólne zasoby,
2. buduje obraz w ACR i odczytuje jego digest,
3. uzgadnia infrastrukturę stagingu,
4. uruchamia job migracyjny,
5. dopiero po udanej migracji przełącza aplikację na nowy obraz,
6. zapisuje digest w podsumowaniu workflowu.

`deploy-production.yml` jest uruchamiany ręcznie. Przyjmuje digest zatwierdzonego obrazu ze stagingu, sprawdza jego obecność w ACR, wykonuje migracje produkcyjne i przełącza aplikację. Obraz nie jest budowany ponownie.

## Domena produkcyjna

Parametry produkcji ustawiają `SERVER_URL=https://wkf.wroclaw.pl`. Samo przypięcie domeny i certyfikatu wymaga wcześniejszego skierowania DNS na Container Apps. Po utworzeniu certyfikatu przekaż jego resource ID jako `customDomainCertificateId`; dopóki parametr jest pusty, aplikacja pozostaje dostępna pod technicznym adresem Azure.

## Bezpieczeństwo sieciowe

Obecna wersja pozwala PostgreSQL przyjmować połączenia z usług Azure przez regułę `0.0.0.0`. Jest to działający punkt startowy, ale przed przetwarzaniem danych produkcyjnych należy rozważyć prywatne endpointy i osobne sieci wirtualne dla stagingu oraz produkcji. Połączenie aplikacji z bazą wymusza TLS przez `sslmode=require`.
