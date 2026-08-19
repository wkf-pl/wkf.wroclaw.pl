# Skrypty operacyjne

- `seed.ts` ustawia dane początkowe strony: konfigurację globalną, stronę „O nas” oraz trzy
  przykładowe wpisy z mediami. Istniejące treści o tych samych adresach nie są nadpisywane.
- `SEED_REFRESH_MEDIA=true pnpm seed` ponownie zapisuje pliki przykładowych mediów w Azurite lub
  Azure Blob Storage, zależnie od skonfigurowanego connection stringa.
- `classify-deployment.sh <wdrożony-sha> <docelowy-sha>` klasyfikuje zmiany na wymagające nowego
  obrazu, pełnego provisioningu lub migracji. Brak znanego wdrożonego SHA wybiera wszystkie trzy
  operacje jako bezpieczny wariant początkowy.
- `deploy-azure.sh <staging|prod> <obraz>` wykonuje szybki rollout istniejącego środowiska.
  `--provision` uzgadnia pełną infrastrukturę, a `--maintenance` wyłącza aktywne rewizje, wykonuje
  migracje i w razie późniejszego błędu wycofuje bazę. Bez `--maintenance` Container Apps wykonuje
  standardowy rollout w trybie pojedynczej rewizji.
- skrypt tworzenia administratora zostanie dodany razem z ustaleniem procesu zarządzania dostępem,
- importer starej strony powstanie po zinwentaryzowaniu źródłowych treści i mediów.
