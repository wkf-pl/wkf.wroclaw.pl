# Content

Moduł współdzieli konfigurację pól redakcyjnych, generowanie adresów URL, reguły
publikacji oraz zapytania publicznego frontendu.

## Publiczne trasy

- `/[slug]` — opublikowane strony statyczne,
- `/blog` i `/blog/[slug]` — lista i szczegóły opublikowanych wpisów,
- `/category/[category]` i `/tag/[tag]` — listy wpisów według taksonomii.

Publiczne zapytania zawsze korzystają z kontroli dostępu Payload i dodatkowo ograniczają wyniki
do dokumentów ze statusem `published`.
