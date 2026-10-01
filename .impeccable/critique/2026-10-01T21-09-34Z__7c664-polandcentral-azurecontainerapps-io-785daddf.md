---
target: "https://wkf-staging.redmushroom-5037c664.polandcentral.azurecontainerapps.io"
total_score: 16
max_score: 28
na_heuristics: 7,9,10
p0_count: 0
p1_count: 4
target_identity: "url:https://wkf-staging.redmushroom-5037c664.polandcentral.azurecontainerapps.io/"
timestamp: 2026-10-01T21-09-34Z
slug: 7c664-polandcentral-azurecontainerapps-io-785daddf
---
Method: dual-agent (A: /root/critique_design_a · B: /root/critique_detector_b)

## Design Health Score

| # | Heurystyka | Ocena | Najważniejszy problem |
|---|---|---:|---|
| 1 | Widoczność stanu systemu | 2/4 | Zakładki i fokus są czytelne, ale nawigacja nie wskazuje bieżącej sekcji, a mobilny banner zgody zasłania pierwszy istotny stan strony. |
| 2 | Zgodność systemu ze światem użytkownika | 2/4 | Treści wydarzeń są konkretne, lecz strona dołączenia nie daje realnego kroku i używa żartobliwego tonu, który osłabia zaufanie. |
| 3 | Kontrola i swoboda użytkownika | 3/4 | Zgoda prywatności daje równorzędne wybory, ale linki prowadzące do `#top` zachowują się inaczej, niż obiecują. |
| 4 | Spójność i standardy | 2/4 | Warstwa wizualna jest spójna, lecz „Aktualności”/„blog”, martwe cele oraz dwa landmarki `main` rozszczelniają wzorzec. |
| 5 | Zapobieganie błędom | 3/4 | Mało ryzykownych operacji i uczciwy wybór cookies; pojedyncze cele nawigacyjne nadal udają gotowe miejsca docelowe. |
| 6 | Rozpoznawanie zamiast przypominania | 2/4 | Etykiety zwykle są jawne, ale odwiedzający musi sam wywnioskować, czym jest WKF i jak faktycznie do niego dołączyć. |
| 7 | Elastyczność i efektywność | n/a | Publiczna powierzchnia Persuade/Read bez zadania eksperckiego. |
| 8 | Estetyka i minimalizm | 2/4 | System ma charakter, lecz 41% viewportu zajęte przez banner, powtarzana galaktyka i długie mobilne karty osłabiają priorytety. |
| 9 | Rozpoznawanie i naprawianie błędów | n/a | W badanych ścieżkach nie wystąpił formularz ani stan błędu użytkownika. |
| 10 | Pomoc i dokumentacja | n/a | Osobny system pomocy nie jest wymagany na tej informacyjno-perswazyjnej powierzchni. |
| **Razem** |  | **16/28** | **Akceptowalne, ale przed produkcją wymaga znaczących poprawek ścieżki zaufania, mobile i semantyki.** |

## Design Specificity Verdict

**Werdykt:** identyfikacja jest mocno autorska w pierwszym ekranie, ale słabnie wraz z przewijaniem. Nocna panorama Wrocławia, logo, granatowo-bursztynowa paleta, Roboto Slab i hasło „Witaj w klubie ludzi z wyobraźnią” są jednoznacznie WKF-owe. Poniżej hero powtarzana galaktyka w aktualnościach i trzech kartach sekcji staje się kategoriowym skrótem „fantastyka” zamiast opowieścią o rzeczywistych ludziach, inicjatywach i miejscach. Projekt ma własny świat wizualny; nie ma jeszcze równie własnej struktury zaufania i uczestnictwa.

**Kontrola deterministyczna:** osiem kombinacji czterech tras (`/`, `/events`, `/aktualnosci`, `/dolacz-do-nas`) i dwóch viewportów (1440×1100 oraz 390×844) zwróciło HTTP 200, `lang="pl"`, jeden widoczny H1, brak poziomego overflow, brak zduplikowanych ID, brak zepsutych załadowanych obrazów i brak błędów konsoli/HTTP ≥400. Wszystkie pierwsze 15 tab-stopów na homepage miało widoczny outline. Kontrola wykryła jednak banner prywatności zajmujący 342 z 844 px wysokości mobile, 9–14 widocznych celów mniejszych niż 44 px na badanych trasach mobilnych, dwa landmarki `main` na `/events`, brak działania członkowskiego na `/dolacz-do-nas` oraz źródłowe sklejenie tekstu H1 `Witaj w klubieludzi z wyobraźnią` do dalszej weryfikacji czytnikiem ekranu.

**Overlay detektora:** nie ma wiarygodnej nakładki widocznej dla użytkownika. Mutowalny preflight zadziałał, lecz Chromium zablokowało `http://localhost:8400/detect.js` przez Private Network Access/CORS dla strony HTTPS. Detektor nie wykonał reguł i nie wyemitował logów `impeccable`; wnioski techniczne pochodzą z powtarzalnych pomiarów DOM, geometrii, klawiatury, sieci i konsoli. CLI został prawidłowo pominięty, ponieważ celem był URL, nie drzewo plików.

## Ogólne wrażenie

To wizualnie dojrzała i rozpoznawalna baza, lepsza niż typowa „strona klubu fantasy”. Największa szansa nie leży w dodaniu większej liczby efektów, lecz w zamianie atmosfery w argument: **czym jest WKF → dlaczego można mu zaufać → co robi → jak wejść do środka**. Obecnie strona pokazuje aktywność, lecz ścieżkę decyzji trzeba składać samodzielnie, a finał „Dołącz do nas” nie pozwala wykonać obiecanego działania.

## Co działa

1. **Lokalna kotwica wizualna.** Panorama Wrocławia i zatwierdzone logo nadają stronie miejsce, tożsamość i wiarygodność, której nie dałaby generyczna ilustracja fantasy.
2. **Dyscyplina systemu.** Granat, pergaminowa biel i oszczędny bursztyn są konsekwentne; bursztyn prowadzi wzrok, ale nie staje się dekoracyjną zalewą. Typografia utrzymuje równowagę między literackością a instytucjonalnym tonem.
3. **Wydarzenie jako dowód działania.** „Erpegowy Wtorek V” podaje datę, miejsce, opis i działania kalendarzowe. To najskuteczniejszy moduł strony, bo jednocześnie buduje zaufanie i pomaga wykonać praktyczny krok.

## Priorytetowe problemy

### 1. [P1] „Dołącz do nas” kończy się przed właściwym działaniem

**Co:** strona członkostwa nie ma formularza, linku mailowego, przycisku, danych kontaktowych ani instrukcji następnego kroku. Treść „napisz do naszego ponurego Zarządu”, „znój, harówka i ciężka praca”, „wszechstronna lustracja” oraz żart o „Komisarzach-Rewizorach” dominuje nad informacją.

**Dlaczego to ważne:** to moment najwyższej intencji. Pierwsza osoba nie wie, co zrobić; przedstawiciel instytucji może odczytać ton jako wykluczający lub niepoważny. Sama etykieta w nagłówku nie jest ścieżką dołączenia.

**Naprawa:** podać, kto może dołączyć, czego się spodziewać, jak skontaktować się przez istniejący i potwierdzony kanał, jaki jest kolejny krok i orientacyjny czas odpowiedzi. Zostawić osobowość marki w detalach, a główny przekaz oprzeć na faktach i gościnności.

**Sugerowane polecenie:** `$impeccable onboard`

### 2. [P1] Umowa zaufania pęka na linkach prowadzących do `#top`

**Co:** „Polityka prywatności”, „Polityka cookies” i „Filk” wyglądają jak pełnoprawne miejsca docelowe, lecz prowadzą do góry strony. „Aktualności” i „blog” nazywają tę samą przestrzeń dwoma językami.

**Dlaczego to ważne:** dla osoby sprawdzającej organizację martwy link prawny jest mocniejszym sygnałem niż ładna oprawa. Użytkownik traci zaufanie dokładnie tam, gdzie próbuje je potwierdzić.

**Naprawa:** podpiąć rzeczywiste treści lub do czasu ich publikacji nie renderować elementów jako aktywnych linków. Wybrać jedną publiczną nazwę dla aktualności i używać jej w nagłówku, kartach, breadcrumbach i stopce.

**Sugerowane polecenie:** `$impeccable harden`

### 3. [P1] Homepage sprzedaje klimat wcześniej niż zweryfikowaną wartość WKF

**Co:** po emocjonalnym hero strona przechodzi od razu do wydarzeń. Nie wyjaśnia wcześnie, że WKF jest organizacją z osobowością prawną, integruje fandom i może stanowić zaplecze dla mniejszych inicjatyw. Dalej generyczne galaktyczne karty mają podobną wagę jak autentyczne zdjęcia i realne dowody aktywności.

**Dlaczego to ważne:** potencjalny członek widzi „fantastykę”, ale nie rozumie zasad wejścia i korzyści. Instytucja widzi aktywność, lecz status, misję i rolę organizacyjną odnajduje dopiero w stopce. Powtarzany placeholder wygląda jak dowód fotograficzny, choć nim nie jest.

**Naprawa:** wstawić po hero krótki, weryfikowalny blok „kim jesteśmy / dla kogo / co umożliwiamy” z dwoma krokami: „Poznaj klub” i „Dołącz”. Autentycznym zdjęciom dać największy lift; brak zdjęcia obsłużyć odrębnym wariantem typograficzno-kartograficznym, który nie udaje dokumentacji wydarzenia.

**Sugerowane polecenie:** `$impeccable shape`

### 4. [P1] Mobilny pierwszy kontakt jest zasłonięty i przeładowany

**Co:** banner prywatności ma 358×342 px na ekranie 390×844, czyli zasłania 41% viewportu na każdej z czterech badanych tras. Równocześnie nagłówek wciska markę i cztery cele w jeden rząd; „O nas” ma zmierzony cel 20×55 px, „Wydarzenia” 67×38, a „Aktualności” 68×38.

**Dlaczego to ważne:** użytkownik mobile widzi część strony przez dużą warstwę zgody, a potem dostaje ciasną nawigację. Formalnie strona nie overflowuje, lecz jej pierwsza decyzja jest bardziej pracochłonna niż treść, po którą przyszedł.

**Naprawa:** skrócić mobilną kopię i odstępy bannera bez uprzywilejowania „Akceptuję”; zachować trzy jasne decyzje. Nawigację przenieść do dostępnego disclosure/menu albo przeprojektować tak, by każdy cel miał wygodny obszar dotyku i czytelną etykietę.

**Sugerowane polecenie:** `$impeccable adapt`

### 5. [P2] Semantyka i geometria dyskretnych działań nie trzymają jakości warstwy wizualnej

**Co:** `/events` ma dwa landmarki `main`; źródło lokalne potwierdza zagnieżdżenie `CmsPageDocument` i drugiego `<main>`. Dyskretne działania wydarzeń mają zaledwie 19–24 px wysokości (`Wszystkie wydarzenia`, `Dodaj do kalendarza`, link miejsca), a zakładki 42 px. H1 może sklejać granicę fraz w nazwie dostępnej. Na `/aktualnosci` tytuł sekcji i tytuły kart są równorzędnymi H2.

**Dlaczego to ważne:** problemy nie blokują myszy na desktopie, ale pogarszają nawigację landmarkami, obsługę dotykową i strukturę czytnika ekranu. To dług jakościowy, który będzie powielany wraz z nowymi treściami.

**Naprawa:** zostawić jeden `<main>` na dokument; wewnętrzne regiony oznaczyć `section`/`article`, obniżyć tytuły kart do H3, zapewnić co najmniej wygodny padding dla dyskretnych akcji oraz potwierdzić H1 w rzeczywistym accessibility tree.

**Sugerowane polecenie:** `$impeccable audit`

## Cognitive load

**2 z 8 kryteriów niezaliczone — obciążenie umiarkowane.** Grupowanie, hierarchia, liniowy rytm i progresywne ujawnianie przez zakładki działają. Nie przechodzą:

- **Pojedynczy fokus:** hero nie wyjaśnia produktu ani głównego następnego kroku; wydarzenia, aktualności, sekcje i dołączenie konkurują o rolę wejścia.
- **Minimalna liczba wyborów:** moduł wydarzeń pokazuje jednocześnie sześć decyzji: „Najbliższe”, „Kalendarz”, „Wszystkie wydarzenia”, „Zobacz wydarzenie”, „Dodaj do kalendarza”, „Subskrybuj kalendarz WKF”.

Stopka również pokazuje sześć celów, ale grupowanie łagodzi koszt. Kalendarz ma 31 przycisków dni w DOM; to oczekiwany wzorzec kalendarza, nie automatycznie przeciążenie, o ile focus i opis miesiąca pozostają czytelne.

## Emocjonalna podróż

- **Wejście — szczyt:** nocny Wrocław, logo i spokojny bursztyn natychmiast mówią „lokalna organizacja fantastyczna”.
- **Dowód:** konkretne wydarzenie potwierdza, że klub działa tu i teraz.
- **Dolina znaczenia:** strona nie odpowiada jeszcze „czym dokładnie jest WKF i dlaczego warto wejść głębiej”.
- **Drugi szczyt:** autentyczne zdjęcie ludzi przy „Założeniu WKF” ma więcej mocy niż wszystkie galaktyczne placeholdery razem.
- **Dolina zaufania:** martwe linki prawne i żartobliwa strona dołączenia osłabiają wiarygodność w punktach wysokiej stawki.
- **Finał:** KRS, adres i statut są wartościowe, lecz mobile kończy się długim blokiem administracyjnym bez ponownego, ciepłego zaproszenia do działania.

## Persona red flags

**Jordan — pierwsza wizyta:** w pięć sekund rozpoznaje klub fantasy we Wrocławiu, ale nie wie, czym klub się zajmuje, kto może dołączyć ani co oznacza „Filk”. Po wejściu na „Dołącz do nas” nadal nie dostaje działania.

**Casey — rozproszony użytkownik mobile:** banner zasłania 41% ekranu, nawigacja ma małe i łamiące się cele, a pełna homepage ma około 4394 px. Po kilku ekranach kart nie ma drugiego punktu wejścia do dołączenia.

**Riley — tester spójności:** natychmiast wykryje `#top`, rozjazd „Aktualności”/„blog”, puste stany mediów i dwa landmarki `main`. Te drobne pęknięcia podważają deklarowaną dojrzałość systemu.

**Marta — pracownica instytucji kultury:** szuka statusu prawnego, misji, KRS, statutu i realnej działalności. Znajduje wydarzenie oraz KRS w stopce, ale osobowość prawna i rola zaplecza dla inicjatyw nie są widoczne wcześnie; martwe polityki oraz żartobliwe członkostwo obniżają zaufanie.

## Drobne obserwacje

- Daty aktualności pokazują dzień i miesiąc, ale bez roku; starsze wpisy szybko tracą chronologiczny kontekst.
- Pierwsza karta na `/aktualnosci` ma dużą pustą połowę medialną bez zepsutego obrazu — to słaby layout stanu bez zdjęcia, nie błąd requestu.
- Lista `/events` zostawia duży pusty pas i przy jednym wydarzeniu wykorzystuje tylko lewą trzecią część desktopu.
- Banner cookies ma uczciwe, równorzędne decyzje i właściwe etykiety; problemem jest rozmiar i zasłanianie, nie dark pattern.
- Ikony Facebooka i e-maila są bez widocznych etykiet, ale mają poprawne `aria-label`.
- Surowy licznik celów <44 px zawiera także zwykłe linki tekstowe; nie każdy jest defektem. Priorytet dotyczący rozmiaru opiera się na dyskretnych kontrolach i skrajnie wąskich celach nawigacji.
- Anulowane requesty Next.js `?_rsc=…` nie zostały uznane za awarię: dokumenty miały 200, brak było odpowiedzi błędnych, a powód `net::ERR_ABORTED` odpowiada anulowanemu prefetchowi.

## Pytania do rozważenia

1. Czy homepage ma przede wszystkim prowadzić nową osobę do uczestnictwa, czy najpierw legitymizować WKF wobec instytucji — i który jeden blok ma wykonać drugie zadanie bez rozmywania pierwszego?
2. Czy galaktyczne obrazy są docelowym językiem dla treści bez zdjęć, czy placeholderem, który powinien ustąpić autorskiej warstwie kartograficzno-redakcyjnej?
3. Czy „Dołącz do nas” ma być pozycją nawigacji, czy pełnym finałem opowieści: „zobacz aktywność → poznaj ludzi i zasady → wykonaj pierwszy krok”?
