# Skrypty operacyjne

- `seed.ts` ustawia dane początkowe strony: konfigurację globalną, stronę „O nas” oraz trzy
  przykładowe wpisy z mediami. Istniejące treści o tych samych adresach nie są nadpisywane.
- `SEED_REFRESH_MEDIA=true pnpm seed` ponownie zapisuje pliki przykładowych mediów w aktywnym
  adapterze. Przydaje się po przełączeniu między pamięcią lokalną a Azure/Azurite.
- skrypt tworzenia administratora zostanie dodany razem z ustaleniem procesu zarządzania dostępem,
- importer starej strony powstanie po zinwentaryzowaniu źródłowych treści i mediów.
