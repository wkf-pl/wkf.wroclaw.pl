# Migracje Payload

Pliki migracji PostgreSQL generuje polecenie:

```bash
pnpm migrate:create
```

Migracje muszą być częścią commita zmieniającego schemat. W środowiskach Azure powinien je wykonywać osobny Container Apps Job przed wdrożeniem nowej rewizji aplikacji.
