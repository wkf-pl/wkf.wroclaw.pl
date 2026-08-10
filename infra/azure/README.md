# Infrastruktura Azure

Docelowo ten katalog będzie zawierał definicje Bicep dla:

- Azure Container Apps Environment,
- aplikacji webowej i zadania migracyjnego,
- Azure Database for PostgreSQL Flexible Server,
- Storage Account i kontenera Blob,
- Key Vault,
- Azure Container Registry,
- Log Analytics i monitoringu.

`modules/` jest przeznaczony na wielokrotnego użycia moduły zasobów, a `environments/` na niesekretne parametry stagingu i produkcji. Sekrety nie mogą trafiać do plików parametrów.
