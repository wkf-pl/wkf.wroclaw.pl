# Deployment workflows

- `ci.yml` waliduje kod i obraz kontenera.
- `deploy-staging.yml` buduje obraz w ACR, wykonuje migracje i automatycznie wdraża staging.
- `deploy-production.yml` promuje wskazany digest obrazu ze stagingu po zatwierdzeniu środowiska `prod`.

Oba workflowy logują się do Azure przez federację OIDC. Wymagane zmienne i sekrety środowisk GitHub opisuje `infra/azure/README.md`.
