# Deployment workflows

- `ci.yml` uruchamia sprawdzenia statyczne i testy. Pull request dodatkowo waliduje produkcyjny
  obraz z cache’em BuildKit. Po udanym pushu do `dev` wywołuje workflow stagingowy, który buduje
  i wysyła ten obraz tylko raz.
- `deploy-staging.yml` porównuje commit aktywnej rewizji z wdrażanym commitem. Pełny provisioning
  uruchamia tylko po zmianach `infra/azure`, a maintenance i migracje tylko po zmianach
  `migrations`. Ręczne uruchomienie pozwala nadpisać obie decyzje.
- `deploy-production.yml` promuje wskazany digest obrazu i SHA źródłowe raportowane przez staging
  po zatwierdzeniu środowiska `prod` i stosuje tę samą klasyfikację zmian.

Workflowy logują się do Azure przez federację OIDC. Cache obrazu jest współdzielony między
walidacją PR i buildem stagingowym. Wymagane role, zmienne i sekrety środowisk GitHub opisuje
`infra/azure/README.md`.
