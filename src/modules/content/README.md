# Content

Moduł współdzieli konfigurację pól redakcyjnych, generowanie adresów URL, reguły
publikacji oraz zapytania publicznego frontendu.

## Publiczne trasy

- `/[slug]` — opublikowane strony statyczne,
- `/blog` i `/blog/[slug]` — lista i szczegóły opublikowanych wpisów,
- `/category/[category]` i `/tag/[tag]` — listy wpisów według taksonomii.

Publiczne zapytania zawsze korzystają z kontroli dostępu Payload i dodatkowo ograniczają wyniki
do dokumentów ze statusem `published`.

## Dostęp w panelu

- prawa `create`, `read`, `update` i `delete` są konfigurowane w kolekcji `Roles`,
- brak prawa `read` ukrywa zasób przed zalogowanym użytkownikiem,
- ograniczenia `własne` i `opublikowane` są egzekwowane również przez API,
- uprawnienia wielu ról sumują się, a dostęp bez ograniczeń ma pierwszeństwo.

Panel Payload ukrywa przyciski akcji na podstawie praw `create`, `update` i `delete` zwracanych
przez te same reguły dostępu, które zabezpieczają API.
