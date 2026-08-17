# Deployment workflows

- `ci.yml` waliduje kod i obraz kontenera. Po udanym pushu do `dev` wywołuje workflow stagingowy.
- `deploy-staging.yml` jest workflowem wielokrotnego użytku: buduje obraz w ACR, wykonuje migracje i automatycznie wdraża staging po pomyślnym CI dla `dev`.
- `deploy-production.yml` promuje wskazany digest obrazu ze stagingu po zatwierdzeniu środowiska `prod`.

Oba workflowy logują się do Azure przez federację OIDC. Wymagane zmienne i sekrety środowisk GitHub opisuje `infra/azure/README.md`.
