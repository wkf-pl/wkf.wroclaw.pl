---
target: strona główna
total_score: 17
max_score: 28
na_heuristics: 5,7,10
p0_count: 0
p1_count: 3
target_identity: 'file:/home/forseti/Kod/wkf.wroclaw.pl/src/app/(frontend)/page.tsx'
target_fingerprint: 'sha256:924da00fda0c672fbb2afa1164946e4e8d7657381b21b22451737baf99d3c479'
target_path: /home/forseti/Kod/wkf.wroclaw.pl/src/app/(frontend)/page.tsx
timestamp: 2026-10-01T20-46-28Z
slug: src-app-frontend-page-tsx
---

## Design Health Score

| #         | Heurystyka                              |     Wynik | Kluczowe ustalenie                                                                                                                    |
| --------- | --------------------------------------- | --------: | ------------------------------------------------------------------------------------------------------------------------------------- |
| 1         | Widoczność stanu systemu                |         2 | Kalendarz zmienia etykietę miesiąca przed zakończeniem pobierania i nie pokazuje stanu ładowania.                                     |
| 2         | Zgodność systemu ze światem użytkownika |         3 | Język jest naturalny, ale hero nie wyjaśnia, czym WKF jest i co konkretnie daje nowej osobie.                                         |
| 3         | Kontrola i swoboda                      |         2 | Zakładki i decyzje prywatności są czytelne, lecz kilka kluczowych tras kończy się atrapą `#top`.                                      |
| 4         | Spójność i standardy                    |         3 | System wizualny jest konsekwentny; fokus klawiatury, dostępna nazwa Discorda i zachowanie części linków już nie.                      |
| 5         | Zapobieganie błędom                     |       n/a | Na tej stronie nie ma procesu wprowadzania danych ani destrukcyjnej operacji pozwalającej uczciwie ocenić tę heurystykę.              |
| 6         | Rozpoznawanie zamiast przypominania     |         2 | Działania są nazwane, ale nowy użytkownik musi odgadnąć właściwą ścieżkę i znaczenie „Sekcji”.                                        |
| 7         | Elastyczność i efektywność              |       n/a | Akceleratory nie są istotnym kryterium publicznej strony typu Persuade.                                                               |
| 8         | Estetyka i minimalizm                   |         3 | Hierarchia jest dobra, ale pusty panel wydarzeń i powtarzana mgławica zużywają przestrzeń bez dowodu aktywności.                      |
| 9         | Rozpoznanie i naprawa błędów            |         2 | Błąd kalendarza ma sensowny fallback, ale puste wydarzenia i niedziałające destynacje nie prowadzą do skutecznego odzyskania ścieżki. |
| 10        | Pomoc i dokumentacja                    |       n/a | Osobna pomoc nie jest potrzebna na tej powierzchni.                                                                                   |
| **Razem** |                                         | **17/28** | **61% — akceptowalny fundament, wymagający istotnych poprawek przed uznaniem strony za wiarygodną ścieżkę dołączenia i współpracy.**  |

## Swoistość projektu

**Ocena niezależna:** wysoka swoistość wizualna, średnia swoistość produktowa. Panorama Wrocławia, znak WKF, granatowo-bursztynowy nocturne, slab-serif, kości i rasterowe ikony tworzą autorski świat. Nie jest to generyczny landing page wizualnie. Poniżej hero kompozycja wraca jednak do schematu „wydarzenia → aktualności → kafle”, a wyjątkowa rola WKF — młodej organizacji z osobowością prawną i możliwego zaplecza dla mniejszych inicjatyw — nie ma równie wyrazistej reprezentacji w treści ani architekturze.

**Skan deterministyczny:** jedyny skan pliku `src/app/(frontend)/page.tsx` zwrócił `[]`, exit `0`. To wynik prawdziwy, ale zakresowo niepełny: strona składa się głównie z importowanych komponentów i globalnego CSS. Runtime overlay znalazł cztery reguły: trafne `skipped heading level` oraz trzy kontekstowe false positives (`gray text on colored background`, `hairline border with wide shadow`, `decorative radial spotlight glow`). Ważniejsze problemy znalazła inspekcja runtime: atrapy `#top`, niezgodna dostępna nazwa linku Discord, ciemny domyślny fokus, cele dotykowe poniżej 44 px i dominujący banner prywatności.

**Nakładka wizualna:** iniekcja `detect.js` zadziałała w izolowanym Chromium i konsola zgłosiła `4 anti-patterns found`. Nie ma jednak wiarygodnej, widocznej dla użytkownika karty `[Human]`, ponieważ w tym środowisku brakowało natywnego narzędzia Browser; użyto headless Playwright i obejrzanych screenshotów.

## Ogólne wrażenie

Strona wygląda jak przemyślana, lokalna marka kulturalna, ale zachowuje się jeszcze jak częściowo skonfigurowany prototyp. Największa szansa nie polega na dodaniu większej ilości ozdobników, tylko na zamianie atmosfery w konkretną, wiarygodną ścieżkę: czym jest WKF, co realnie robi, dlaczego warto zaufać i dokąd prowadzi „Dołącz”.

## Co działa

1. **Hero jest autentycznie wrocławsko-fantastyczne.** Realna panorama, nocne niebo i bursztynowe światło budują lokalność bez fantasy-kiczu.
2. **System wizualny jest zdyscyplinowany.** Kolor, typografia, ramy, krzywizny, karty i aktywne zakładki tworzą spójny język.
3. **Responsywna geometria jest stabilna.** Przy `1440×1000` i `390×844` nie wystąpił poziomy overflow, obrazy się ładowały, a kolejne sekcje poprawnie przechodziły do jednej kolumny.

Cognitive load ma 2 z 8 niespełnionych kryteriów, czyli poziom umiarkowany: brak pojedynczego pierwszego celu oraz zbyt wiele równorzędnych ścieżek w pierwszej części strony. Chunking, grupowanie, hierarchia, rozdzielenie widoków, pamięć robocza i progressive disclosure działają poprawnie.

Emocjonalnie hero jest szczytem doświadczenia. Potem mobilny banner prywatności zasłania CTA, a domyślny pusty panel wydarzeń tworzy główną dolinę. Aktualności i sekcje odbudowują orientację, lecz identyczne fallbacki z mgławicą osłabiają ich dowodową wartość. Stopka kończy stronę formalnymi faktami, ale dociera do nich dopiero bardzo cierpliwy użytkownik.

## Priorytetowe problemy

### [P1] Kluczowe działania prowadzą donikąd albo komunikują błędny cel

**Co:** bieżący runtime zwraca `href="#top"` dla „Dołącz”, „Współpraca”, „Polityka prywatności” i „Polityka cookies”. Link do Discorda ma dostępną nazwę „Email”.

**Dlaczego to ważne:** podstawowy cel dołączenia jest zablokowany, instytucjonalna ścieżka współpracy nie działa, a linki prawne nie spełniają obietnicy etykiet. Czytnik ekranu komunikuje inny kanał kontaktu niż rzeczywisty.

**Naprawa:** poprawić rekordy CMS i dodać walidację/kontrakt uniemożliwiający publikację wymaganych linków jako lokalnej atrapy. Ujednolicić ikonę, etykietę dostępną i URL kanału kontaktowego.

**Sugerowana komenda:** `$impeccable harden`

### [P1] Hero sprzedaje nastrój, ale nie wyjaśnia produktu ani priorytetu

**Co:** tytuł „Witaj w klubie ludzi z wyobraźnią” nie ma bieżącego `hero.content`, a „Kalendarz” i „Dołącz” otrzymują podobną wagę. Status prawny, rola dla mniejszych inicjatyw i ścieżka współpracy pojawiają się dopiero nisko.

**Dlaczego to ważne:** nowa osoba rozumie klimat, lecz nie rozumie oferty. Gość instytucjonalny musi samodzielnie poskładać wiarygodność WKF ze stopki i dolnych kart.

**Naprawa:** dodać jedno–dwa factualne zdania definiujące WKF, wybrać jeden primary CTA i wcześnie umieścić spokojny blok „Kim jesteśmy” z wyłącznie potwierdzonymi faktami oraz linkami do współpracy i dokumentów.

**Sugerowana komenda:** `$impeccable shape`

### [P1] Najważniejszy blok aktywności domyślnie eksponuje pustkę

**Co:** `EventShowcase` startuje od „Najbliższe”; przy zerowej liczbie wydarzeń pokazuje duży panel „Wkrótce pojawią się kolejne wydarzenia. Zajrzyj do kalendarza”, ale „kalendarza” nie jest linkiem.

**Dlaczego to ważne:** strona organizacji społecznej komunikuje brak aktywności dokładnie w miejscu, które powinno dostarczać najnowszego dowodu życia.

**Naprawa:** przy pustej tablicy wydarzeń domyślnie otwierać kalendarz albo renderować zwarty empty state z działaniami „Otwórz kalendarz” i „Wszystkie wydarzenia”; usunąć sztuczną wysokość dla jednego zdania.

**Sugerowana komenda:** `$impeccable onboard`

### [P2] Mobilny pierwszy kontakt i dostępność działań są niedopracowane

**Co:** banner prywatności zajmuje około `342/844 px` i zasłania CTA hero. Linki mobilnego headera mają około `38 px` wysokości, „O nas” tylko około `32 px` szerokości; zakładki wydarzeń mają `42 px`. Większość linków dostaje ciemny domyślny fokus `1px`, słabo widoczny na granacie. Kalendarz przeskakuje z `h2` do `h4`, a `tablist` nie implementuje strzałek ani roving `tabIndex`.

**Dlaczego to ważne:** użytkownik mobilny zaczyna od dużej decyzji prawnej, a użytkownik klawiatury lub z ograniczeniami motorycznymi dostaje słabe sygnały i małe cele.

**Naprawa:** skrócić mobilny banner bez różnicowania ważności decyzji; zapewnić co najmniej `44×44 px`; wprowadzić wspólny bursztynowy `:focus-visible`; poprawić kolejność nagłówków i pełny wzorzec ARIA Tabs.

**Sugerowana komenda:** `$impeccable audit`

### [P2] Fallback medialny zastępuje realne dowody aktywności

**Co:** aktualności i sekcje bez obrazu używają tej samej mgławicy. „Dni Fantastyki 2026”, „Założenie WKF”, „Spotkania” i „O nas” wyglądają jak warianty tej samej karty.

**Dlaczego to ważne:** odmienne typy treści tracą tożsamość, a dekoracja zaczyna udawać materiał ilustracyjny. To osłabia zasadę „staged evidence” i wiarygodność dolnej części strony.

**Naprawa:** używać zatwierdzonych, rzeczywistych mediów; przy ich braku przełączyć kartę na uczciwy wariant typograficzny lub znacząco różnicować fallback według typu treści.

**Sugerowana komenda:** `$impeccable polish`

## Persona red flags

**Jordan — pierwszy raz na stronie:** w pięć sekund rozumie klimat, ale nie cel organizacji; „Dołącz” wraca do `#top`; pierwszy blok po hero może odczytać jako brak działalności; „Sekcje” jest terminem wewnętrznym.

**Riley — testujący krawędzie:** zerowa liczba wydarzeń zostawia aktywny pusty widok; zmiana miesiąca wyprzedza pobieranie; brak mediów zlewa różne treści; kilka opublikowanych linków wygląda poprawnie, lecz kończy się na `#top`.

**Casey — rozproszony użytkownik mobilny:** banner zajmuje około 41% viewportu i zasłania CTA; linki headera i zakładki są niższe niż 44 px; trzy decyzje prywatności są na szczęście równorzędne; formalne dane pojawiają się dopiero na końcu długiej strony.

**Marta — pracownica instytucji kultury:** oprawa buduje wstępne zaufanie, ale brak wczesnej informacji o osobowości prawnej i roli zaplecza; KRS, adres, dokumenty i współpraca są rozproszone; puste wydarzenia mogą wyglądać jak brak aktywności.

## Drobne obserwacje

- Link „Wszystkie wydarzenia” ma około `19 px` wysokości aktywnego obszaru.
- Bursztynowe słowo w hero przechodzi na mobile przez jasną fasadę; warstwa cienia powinna lepiej chronić lokalny kontrast.
- Trzy identycznie ceremonialne nagłówki sekcji budują spójność, lecz słabo różnicują ich role.
- Błąd kalendarza ma dobry, prosty komunikat i prowadzi do `/events`.
- Ustalenia o treści, linkach i mediach dotyczą sprawdzonego lokalnego runtime; nie są deklaracją o stanie produkcji.

## Pytania projektowe

- Gdyby użytkownik zobaczył tylko hero, czy potrafiłby jednym zdaniem powiedzieć, czym WKF różni się od luźnej grupy fanów?
- Czy klub bez wydarzeń w najbliższym oknie powinien eksponować pustkę, czy kalendarz i ostatni prawdziwy dowód aktywności?
- Jaki jeden zweryfikowany fakt ma przekonać instytucję kultury w pierwszych 30 sekundach?
- Które działanie ma naprawdę „posiadać” hero: dołączenie, poznanie klubu czy kalendarz?
