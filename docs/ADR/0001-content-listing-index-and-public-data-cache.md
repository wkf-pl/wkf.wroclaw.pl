# 0001. Indeks treści i cache publicznych danych

- Status: Accepted
- Data: 2026-08-21

## Kontekst

Publiczne listingi łączą strony, wpisy, wydarzenia i cykle wydarzeń. Dotychczas każda kolekcja była odpytywana osobno o liczbę rekordów równą numerowi strony pomnożonemu przez rozmiar strony. Wyniki były następnie łączone, sortowane i przycinane w aplikacji. Koszt zapytania, transfer danych i zużycie pamięci rosły liniowo wraz z numerem strony. Pobieranie pełnego `layout` tylko po to, by zbudować streszczenie, dodatkowo zwiększało koszt.

Publiczne odczyty tych kolekcji mają jeden wariant dostępu: anonimowy. Zalogowanie do aplikacji nie poszerza widoczności publicznych stron, wpisów, wydarzeń ani cykli. Dokumenty i pliki chronione nadal wymagają dynamicznej kontroli dostępu i nie są częścią tej decyzji.

## Decyzja

### Denormalizowany indeks listingowy

Wprowadzamy ukrytą kolekcję Payload `content-listing-items`. Nie ma ona panelu administracyjnego, REST ani GraphQL, a zewnętrzne mutacje są zabronione. Każdy opublikowany dokument źródłowy ma jeden rekord identyfikowany unikalną parą źródła i ID dokumentu.

Indeks przechowuje wyłącznie pola potrzebne listingom: źródło, ID i czas aktualizacji dokumentu, tytuł, URL, streszczenie, daty sortowania i wydarzenia, widoczność, obraz, taksonomie, stronę nadrzędną oraz cykl wydarzenia. Indeksy bazy obejmują parę źródło–ID, datę sortowania, tytuł, rodzica, cykl i terminy wydarzeń.

Hooki Pages, Posts, Events i EventCycles odczytują kanoniczną opublikowaną wersję w tej samej transakcji co zapis dokumentu. Wykonują upsert indeksu albo usuwają rekord po wycofaniu publikacji. Autosave szkicu jest pomijany, jeśli czas aktualizacji opublikowanej wersji nie zmienił się. Usunięcie źródła usuwa również rekord indeksu.

Listing wykonuje jedno zapytanie z właściwymi `page` i `limit`, `depth: 1`, ograniczonym `select` i `populate`. Nie pobiera `layout`. Zachowuje istniejące filtry, a remisy rozstrzyga stabilnie tytułem, typem źródła i ID. `sortDate` oznacza początek wydarzenia lub datę publikacji, z datą utworzenia jako wartością zapasową.

Wybraliśmy kolekcję Payload zamiast widoku SQL, ponieważ używa tych samych relacji, kontroli dostępu, typów i mechanizmu migracji co reszta aplikacji. Zwykły widok nadal wymagałby kosztownego łączenia tabel wersjonowanych. Materialized view wymagałby osobnego mechanizmu odświeżania, trudniejszego do powiązania transakcyjnie z publikacją.

### Generowanie `listingExcerpt`

Przy publikacji strony puste `listingExcerpt` jest wypełniane tekstem pierwszego niepustego akapitu pierwszego bloku rich text. Nagłówki i puste akapity są pomijane, tekst z linków i formatowanych elementów jest zachowywany, białe znaki normalizowane, a wynik skracany do 500 znaków na granicy słowa. Wartość wpisana ręcznie nigdy nie jest nadpisywana. Brak akapitu pozostawia pole puste.

Migracja uzupełnia streszczenia istniejących opublikowanych stron porcjami. Runtime nie odczytuje już `layout` w celu zbudowania listingu.

### Cache publicznych danych

Cache obejmuje dane, nie pełny statyczny HTML. Listingi treści, katalog wizytówek, filtrowane listingi mediów i dane strony głównej są przechowywane przez 5 minut. Szczegóły treści, partnerów i wizytówek, relacje wydarzeń, cykli i wpisów oraz sitemapa są przechowywane przez godzinę. Granica infrastrukturalna otacza `unstable_cache`, dzięki czemu logika domenowa nie zależy bezpośrednio od interfejsu cache Next.js. `connection()` zapobiega odczytom bazy podczas `next build`, nie wyłączając Data Cache. Publiczny HTML nadal jest renderowany dynamicznie.

Klucze uwzględniają wszystkie argumenty zapytania, w tym znormalizowane źródła, rodzaj i tryb bloku, stronę, rozmiar strony, sortowanie, filtry oraz kolejność ręcznie wskazanych mediów. Ręcznie wskazane media są pobierane jednym zapytaniem i porządkowane zgodnie z kolejnością redakcyjną. Odczyty relacyjne otrzymują tagi obu stron zależności, na przykład wydarzenia partnera mają tagi `events` i `partners`.

Szerokie tagi kolekcji oraz tagi `content-listings`, `homepage` i `public-sitemap` pozwalają unieważniać zależne dane po utworzeniu, publikacji, aktualizacji, wycofaniu publikacji i usunięciu. Zmiana partnera unieważnia dane partnerów, wydarzeń, cykli i sitemapy. Zmiana wizytówki unieważnia jej katalog i szczegół oraz szczegóły stron, wpisów, wydarzeń, cykli i partnerów, które mogą zawierać osadzony profil; zmiana zdjęcia wykonuje ten sam zestaw unieważnień bez sitemapy. Zmiany kategorii i tagów obejmują także listingi mediów, a zmiana medium lub ustawień dostępu WWW unieważnia cały publiczny cache. Szerokie zależności są celowe, ponieważ dokumenty pobierane z większą głębokością zawierają osadzone dane relacji.

Każdy cache'owany odczyt używa anonimowego użytkownika, kontekstu publicznej witryny i nie omija kontroli dostępu. Dotyczy to również partnerów, wizytówek, mediów oraz relacji wydarzeń i cykli. Wydarzenia i cykle członkowskie pozostają niewidoczne również dla zalogowanego użytkownika na publicznych trasach. Dokumenty i pliki chronione, logowanie, kalendarze ICS oraz `robots.txt` pozostają dynamiczne i poza cache opisanym w tej decyzji.

### Jedna replika

Next Data Cache nie jest współdzielony pomiędzy niezależnymi replikami aplikacji. Do czasu wprowadzenia współdzielonego cache Azure Container App ma `minimumReplicas: 0` i `maximumReplicas: 1`. Po restarcie lub wybudzeniu cache odbudowuje się z PostgreSQL. Ograniczenie zapobiega obsłudze kolejnych żądań przez repliki z różnym stanem lokalnego cache.

## Odrzucone warianty

- Pobieranie wielu kolekcji i łączenie w pamięci pozostawia liniowy koszt głębokiej paginacji.
- Cache Components wymagają szerszej migracji sposobu renderowania; izolacja cache pozwala wrócić do tej opcji później.
- Cache per rola nie ma wartości dla treści z jedną anonimową wersją publiczną i zwiększa liczbę wariantów oraz ryzyko wycieku uprawnień.
- Redis i wiele replik zwiększają koszty operacyjne przed potwierdzeniem, że ruch wymaga skalowania poziomego.
- Pełne statyczne HTML wymagałoby utrzymywania grafu zależności między szczegółami, listingami, stroną główną i sitemapą. Cache danych z tagami daje prostsze, kontrolowane unieważnianie.

## Konsekwencje i ryzyka

Głęboka strona listingu pobiera najwyżej rozmiar strony, niezależnie od jej numeru. Odczyty są prostsze i nie potrzebują dużych struktur rich text. Kosztem jest denormalizacja oraz konieczność utrzymania synchronizacji indeksu.

Awaria hooka powoduje wycofanie transakcji zapisu, więc źródło i indeks nie rozchodzą się. Błędy w logice projekcji mogą jednak dać spójny technicznie, lecz niepoprawny rekord; testy integracyjne obejmują pełny cykl publikacji. Unieważnianie cache po synchronizacji ma szerokie tagi i może wykonywać więcej ponownych odczytów niż minimalny graf zależności. Jedna replika ogranicza przepustowość i dostępność podczas restartu.

## Migracja i rollback

Migracja tworzy tabelę, relacje i indeksy, następnie porcjami generuje brakujące streszczenia oraz buduje indeks opublikowanych dokumentów. Kontekst migracji wyłącza wtórną synchronizację i unieważnianie cache. `down` usuwa kolekcję indeksową i jej typy, ale zachowuje wygenerowane streszczenia, ponieważ po migracji mogły zostać zmienione redakcyjnie.

Rollback aplikacji wymaga wykonania migracji `down` przed uruchomieniem wersji nieznającej indeksu. Powrót do wielu replik wymaga najpierw współdzielonego cache albo rezygnacji z cache danych zależnego od lokalnego stanu.

## Dalszy rozwój

Jeśli jedna replika stanie się ograniczeniem, warstwa infrastrukturalna cache może zostać przeniesiona do współdzielonego magazynu bez zmiany zapytań domenowych. Można wtedy zwiększyć liczbę replik i zawęzić tagi na podstawie pomiarów. Cache Components pozostają możliwą ścieżką po ustabilizowaniu ich użycia w aplikacji i potwierdzeniu korzyści w profilowaniu.
