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

Tożsamość OIDC stagingu otrzymuje rolę `Contributor` wyłącznie w `rg-wkf-staging` i `rg-wkf-shared`. Nie wymaga żadnej roli na poziomie całej subskrypcji ani uprawnień do zarządzania rolami.

Zarządzana tożsamość `wkf-staging-registry` jest tworzona przed pierwszym wdrożeniem i jednorazowo otrzymuje rolę `AcrPull` w `rg-wkf-shared`. Workflow nie może samodzielnie zmieniać tego przypisania.

Produkcja może dodatkowo otrzymać zmienną `CUSTOM_DOMAIN_CERTIFICATE_ID` z pełnym resource ID certyfikatu przypisanego do Container Apps Environment.

W obu środowiskach skonfiguruj sekrety:

- `PAYLOAD_SECRET`,
- `POSTGRES_ADMIN_PASSWORD`.

Produkcja wymaga dodatkowo zmiennej `SMTP_HOST` i sekretów:

- `SMTP_USER`,
- `SMTP_PASSWORD`.

Na stagingu SMTP jest początkowo wyłączone. Nie blokuje to działania strony ani panelu, ale funkcje wysyłające pocztę nie będą dostępne do czasu skonfigurowania serwera SMTP.

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
4. tworzy kopię PostgreSQL na żądanie i zapisuje aktywną rewizję,
5. wchodzi w jawny tryb maintenance przez dezaktywację aktywnej rewizji,
6. uruchamia job migracyjny,
7. dopiero po udanej migracji przełącza aplikację na nowy obraz,
8. sprawdza readiness oraz odpowiedzi HTTP dla `/`, `/blog` i `/health`,
9. zapisuje digest w podsumowaniu workflowu.

Skrypt wdrożeniowy wymaga parametru `--maintenance`. Jeżeli migracja lub testy HTTP nie
powiodą się, uruchamia `migrate:down` i ponownie aktywuje zapisaną rewizję. Gdy wycofanie
bazy się nie powiedzie, poprzednia rewizja celowo pozostaje nieaktywna, aby nie uruchomić
starego kodu na niezgodnym schemacie. Nazwa kopii i rewizji są wypisywane w logu wdrożenia.

`deploy-production.yml` jest uruchamiany ręcznie. Przyjmuje digest zatwierdzonego obrazu ze stagingu, sprawdza jego obecność w ACR, wykonuje migracje produkcyjne i przełącza aplikację. Obraz nie jest budowany ponownie.

## Domena produkcyjna

Parametry produkcji ustawiają `SERVER_URL=https://wkf.wroclaw.pl`. Samo przypięcie domeny i certyfikatu wymaga wcześniejszego skierowania DNS na Container Apps. Po utworzeniu certyfikatu przekaż jego resource ID jako `customDomainCertificateId`; dopóki parametr jest pusty, aplikacja pozostaje dostępna pod technicznym adresem Azure.

## Bezpieczeństwo sieciowe

Obecna wersja pozwala PostgreSQL przyjmować połączenia z usług Azure przez regułę `0.0.0.0`. Jest to działający punkt startowy, ale przed przetwarzaniem danych produkcyjnych należy rozważyć prywatne endpointy i osobne sieci wirtualne dla stagingu oraz produkcji. Połączenie aplikacji z bazą wymusza TLS przez `sslmode=require`.
