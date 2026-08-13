# Migracje Payload

Pliki migracji PostgreSQL generuje polecenie:

```bash
pnpm migrate:create
```

Migracje muszą być częścią commita zmieniającego schemat. Na stagingu i produkcji wykonuje je osobny Container Apps Job przed przełączeniem aplikacji na nowy digest obrazu.
