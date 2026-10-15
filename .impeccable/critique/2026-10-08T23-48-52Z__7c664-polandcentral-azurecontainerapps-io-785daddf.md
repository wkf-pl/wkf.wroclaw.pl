---
target: staging projektu WKF
total_score: 23
max_score: 32
na_heuristics: 5,9
p0_count: 0
p1_count: 3
target_identity: 'url:https://wkf-staging.redmushroom-5037c664.polandcentral.azurecontainerapps.io/'
timestamp: 2026-10-08T23-48-52Z
slug: 7c664-polandcentral-azurecontainerapps-io-785daddf
---

Method: dual-agent (A: /root/assessment_a · B: /root/assessment_b)

## Design Health Score

Powierzchnia łączy tryby `Persuade` (strona główna, „Dołącz do nas”) i `Read` (listy, szczegóły, strony informacyjne). Dwie heurystyki związane z procesami błędów są `n/a`, bo sprawdzony publiczny serwis nie zawierał formularza ani destrukcyjnego przepływu.

| #           | Heurystyka                          |     Wynik | Najważniejszy problem                                                                                                |
| ----------- | ----------------------------------- | --------: | -------------------------------------------------------------------------------------------------------------------- |
| 1           | Widoczność stanu systemu            |       2/4 | Archiwalne wydarzenia nadal mają status „ZAPLANOWANE”, a ten sam wpis ma różne daty na liście i w szczególe.         |
| 2           | Zgodność ze światem użytkownika     |       3/4 | Język jest zwykle naturalny, lecz „TTRPG”, „fandom” i „one-shot” nie są objaśnione nowym osobom.                     |
| 3           | Kontrola i swoboda                  |       3/4 | Okruszki, mapa, ICS i sterowanie kalendarzem dają bezpieczne drogi; nie wykryto pułapek.                             |
| 4           | Spójność i standardy                |       3/4 | System wizualny jest spójny, ale daty, statusy i hierarchia semantyczna miejscami sobie przeczą.                     |
| 5           | Zapobieganie błędom                 |       n/a | Brak formularza lub destrukcyjnego procesu pozwalającego uczciwie ocenić tę heurystykę.                              |
| 6           | Rozpoznawanie zamiast przypominania |       3/4 | Główne działania są podpisane, lecz na 320 px część nawigacji i CTA znika poza ekranem.                              |
| 7           | Elastyczność i efektywność          |       3/4 | ICS, subskrypcja cyklu, mapa i tagi zapewniają kilka dobrych dróg działania.                                         |
| 8           | Estetyka i minimalizm               |       3/4 | Hierarchia jest wyraźna; puste gridy, bardzo krótkie publikacje i powtarzalny hero osłabiają rytm.                   |
| 9           | Rozpoznawanie i naprawa błędów      |       n/a | W sprawdzonych ścieżkach nie wystąpił stan błędu, który pozwalałby ocenić komunikat naprawczy.                       |
| 10          | Pomoc i dokumentacja                |       3/4 | „Dołącz do nas” i szczegół wydarzenia dobrze instruują; brakuje kontekstu dla kilku terminów środowiskowych.         |
| **Łącznie** |                                     | **23/32** | **Dobry (72%): solidna podstawa, ale trzy problemy P1 osłabiają zaufanie lub blokują część użytkowników mobilnych.** |

## Design Specificity Verdict

**Ocena projektowa:** silna specyficzność wizualna, nierówna specyficzność informacyjna. Nocny Wrocław, logotyp, bursztynowa „trasa”, slab-serifowa typografia i realne zdjęcia tworzą autorski świat WKF. Nie jest to szablon, który bez zmian mógłby należeć do banku, SaaS-u czy dowolnego stowarzyszenia. Największa luka leży w dowodach: oprawa obiecuje szeroki, dojrzały klub fantastyki, podczas gdy widoczny korpus treści jest wąski, mocno RPG-owy, a jedna z dwóch aktualności wygląda jak szkic.

**Skan deterministyczny:** dla zdalnego URL-a prawidłowo pominięto CLI `impeccable detect`; detektor przeglądarkowy uruchomiono na pięciu trasach (`/`, `/events`, `/events/erpegowy-wtorek-6`, `/o-nas`, `/dolacz-do-nas`) w desktopie i mobile. W dziesięciu renderach wskazał łącznie 74 trafione elementy. Większość emisji dla `radial-spotlight-glow`, `dark-glow`, `gpt-thin-border-wide-shadow`, `gray-on-color` i `hero-eyebrow-chip` to false positive’y względem zatwierdzonego `DESIGN.md`: nocne warstwy, bursztynowy glow, cienkie ramy i pills są świadomym językiem marki, a Mist Silver ma kontrast około 10.36–10.57:1.

Potwierdzone sygnały, których ocena projektowa nie powinna zignorować:

- `/o-nas`: pięć justowanych bloków bez `hyphens:auto`; na desktopie część ma około 110–141 znaków w wierszu.
- `/events/erpegowy-wtorek-6`: sześć desktopowych akapitów ma około 94 znaki w wierszu; na mobile problem znika.
- `/dolacz-do-nas`: jeden blok ma około 92 znaki w wierszu; struktura przeskakuje z H1 do H3 oraz z H2 do H4.
- `/events`: w DOM są dwa landmarki `<main>` — wprowadzenie generowane przez `CmsPageDocument` oraz właściwa lista w `events/page.tsx`.
- Mobile: zakładki strony głównej mają 42 px wysokości, pill `TTRPG` i „Dodaj do kalendarza” po 32 px, a „O nas” w nagłówku około 20×55 px.

Nie potwierdzono brakujących `alt`, poziomego overflow należącego do treści przy 390 px ani problemu kontrastu wskazanego przez `gray-on-color`. Homepage’owy `skipped-heading` jest prawdopodobnie false positive’em nieaktywnej gałęzi kalendarza i nie powinien być poprawiany bez sprawdzenia źródła.

**Nakładki wizualne:** iniekcja `detect.js` powiodła się w izolowanym headless Chromium, ale środowisko nie udostępniało widocznej karty `[Human]`. Nie ma więc trwałej, wiarygodnie widocznej dla użytkownika nakładki; dowodami były logi konsoli, DOM, snapshoty ARIA i tymczasowe screenshots.

## Overall Impression

Pierwsze wrażenie jest bardzo dobre: serwis od razu komunikuje Wrocław, fantastykę, wspólnotę i własny punkt widzenia. Największą szansą nie jest „więcej efektów”, tylko doprowadzenie dowodów, metadanych i mobilnej ścieżki do poziomu już osiągniętego przez oprawę. Projekt wizualny obiecuje dojrzałość; teraz treść i semantyka muszą ją dowieźć.

## Co działa

1. **Rozpoznawalne połączenie miejsca i fantastyki.** Hero strony głównej nie opiera się na anonimowym fantasy-arcie: panorama Wrocławia, logo i bursztynowa trasa budują historię przynależną WKF.
2. **Szczegół wydarzenia realnie obniża próg wejścia.** Termin, miejsce, harmonogram, mapa, ICS, limit miejsc, partner i komunikat „Nowe osoby mile widziane” odpowiadają na pytania, które decydują o udziale.
3. **„Dołącz do nas” łączy ciepło z formalnością.** Realne zdjęcie ludzi, kryteria, trzy kroki, kontakt, zasada dla osób poniżej 16 lat i Statut tworzą wiarygodną drogę od zainteresowania do działania.

## Problemy priorytetowe

### [P1] Mobilny nagłówek odcina najważniejszą ścieżkę

- **Co:** przy 320×844 `scrollWidth` wynosi 389 px wobec `clientWidth` 320 px; „Dołącz do nas” zaczyna się przy x=315 i jest ucięte. Przy 390 px „O nas” ma około 20×55 px i łamie się na trzy wiersze. Część mobilnych kontrolek ma tylko 32–42 px wysokości.
- **Dlaczego to ważne:** użytkownik z najmniejszym ekranem traci dokładnie ten CTA, który ma zamieniać zainteresowanie w kontakt. Ściśnięte etykiety i małe cele dotykowe obniżają też dostępność i jakość odczuwaną.
- **Naprawa:** poniżej właściwego breakpointu pozostawić logo i jeden priorytetowy CTA, a resztę przenieść do dostępnego menu; alternatywnie zaprojektować kontrolowany układ dwurzędowy bez poziomego przewijania. Zachować pełne etykiety oraz cele co najmniej 44×44 px.
- **Sugerowane polecenie:** `$impeccable adapt`.

### [P1] Daty i statusy przeczą sobie

- **Co:** `/aktualnosci` pokazuje dla „Dni Fantastyki 2026” datę 19 sierpnia 2026, a `/blog/dni-fantastyki-2026` — 18 sierpnia 2026. W `/events` sekcja „Archiwum” zawiera minione wydarzenia nadal oznaczone jako „ZAPLANOWANE”.
- **Dlaczego to ważne:** termin i status są podstawowymi dowodami rzetelności. Sprzeczność szkodzi osobie planującej wizytę i instytucji prowadzącej due diligence bardziej niż niedoskonałość czysto wizualna.
- **Naprawa:** ujednolicić strefę czasową i formatter we wszystkich projekcjach; status wyprowadzać z aktualnego stanu czasowego albo w archiwum zastąpić neutralną etykietą. Zweryfikować finalny wynik w przeglądarce, nie tylko helper.
- **Sugerowane polecenie:** `$impeccable harden`.

### [P1] Siła deklaracji przewyższa opublikowane dowody działalności

- **Co:** strona główna mówi o szerokim spektrum fantastyki, ale widoczne wydarzenie, jedyna sekcja i karta działalności są RPG-owe. `/blog/dni-fantastyki-2026` po dużym hero zawiera tylko jedno potoczne zdanie, a lista aktualności ma dwa wpisy. Pojedyncza karta sekcji zostawia na desktopie dwie puste kolumny.
- **Dlaczego to ważne:** fan może odebrać to jako niedokończoną stronę, a partner instytucjonalny — jako rozjazd między aspiracją a materiałem dowodowym. To jest luka wiarygodności, nie problem z liczbą ozdobników.
- **Naprawa:** eksponować tylko konkretne, potwierdzone informacje; niedokończone publikacje zdjąć z roli głównego dowodu. Uczciwie komunikować, że dziś najbardziej widoczne są inicjatywy RPG, albo sukcesywnie dodać potwierdzone materiały z innych obszarów. Przy jednym elemencie użyć celowej kompozycji featured zamiast pustego trzykolumnowego gridu. Nie dopisywać osiągnięć ani zobowiązań.
- **Sugerowane polecenie:** `$impeccable clarify`.

### [P2] Czytanie i semantyka nie dorównują warstwie wizualnej

- **Co:** `/o-nas` łączy justowanie bez dzielenia wyrazów z bardzo długą miarą wiersza; detal wydarzenia i „Dołącz do nas” także przekraczają komfortową długość na desktopie. `/dolacz-do-nas` przeskakuje poziomy nagłówków, a `/events` ma dwa landmarki `<main>` (źródłowo w `CmsPageDocument` i `events/page.tsx`).
- **Dlaczego to ważne:** długie, nierówne bloki zwiększają wysiłek czytania, a błędna hierarchia utrudnia nawigację czytnikiem ekranu. W serwisie informacyjnym nie jest to kosmetyka.
- **Naprawa:** ograniczyć miarę tekstu do około 65–75 znaków, na wąskich ekranach wyłączyć justowanie albo dodać poprawne `hyphens:auto`; uporządkować H1→H2→H3. Zostawić jeden `<main>` na dokument — obecny drugi widać w `src/app/(frontend)/events/page.tsx`, podczas gdy wprowadzenie już opakowuje `CmsPageDocument`.
- **Sugerowane polecenie:** `$impeccable audit`.

### [P2] Baner zgód przejmuje pierwszy ekran mobilny

- **Co:** przy 390×844 baner zajmuje około 340 px wysokości, zasłania dolną część hero i początek wprowadzenia; na szczególe wydarzenia nachodzi na najważniejszy panel czasu i miejsca.
- **Dlaczego to ważne:** pierwsza wizyta zaczyna się od ciężkiej decyzji administracyjnej zamiast od wartości WKF. Trzy duże, równorzędne przyciski zwiększają koszt poznawczy.
- **Naprawa:** zachować wszystkie wymagane wybory i równie łatwe odrzucenie, ale skompresować panel, skrócić tekst widoczny od razu i przenieść szczegóły do rozwijanej warstwy. Nie osłabiać dostępności ani równorzędności zgody i odmowy.
- **Sugerowane polecenie:** `$impeccable distill`.

## Obciążenie poznawcze i droga emocjonalna

Obciążenie jest **umiarkowane: 2 z 8 kryteriów zawodzą konsekwentnie** — minimalizacja wyborów i progressive disclosure w mobilnym nagłówku. Punkty z więcej niż czterema opcjami to nagłówek (pięć celów), kalendarz (około 35 kontrolek, częściowo nieuniknionych i dobrze pogrupowanych) oraz górna część wydarzenia (cykl, subskrypcja, tag, miejsce, ICS, mapa; poprawnie rozdzielone wizualnie).

Droga emocjonalna zaczyna się wysoko: nocny Wrocław i „Witaj w klubie ludzi z wyobraźnią” są pamiętne. Zaufanie rośnie dzięki zdjęciom, KRS, miejscu, terminom i stronie dołączenia. Dolina pojawia się w skąpych aktualnościach i jednym niemal pustym wpisie. „Erpegowy Wtorek VI” oraz „Dołącz do nas” odzyskują wiarygodność, lecz strona główna kończy się pojedynczą kartą Sekcji RPG zamiast mocnego finału: następnego realnego kroku albo formalnego dowodu.

## Persona Red Flags

**Jordan — nowa osoba:** na szczególe wydarzenia dostaje świetne zapewnienia i instrukcje, ale gdzie indziej trafia na nieobjaśnione „TTRPG”, „fandom” i „one-shot”. Przy 320 px nie widzi całego CTA „Dołącz do nas”. Jednozdaniowy wpis nie odpowiada na naturalne pytanie „co WKF faktycznie tam robi?”.

**Casey — osoba mobilna i rozproszona:** nagłówek przy 390 px jest ściśnięty, przy 320 px przelewa się i ucina CTA, a baner zgód zajmuje znaczną część pierwszego ekranu. Długie strony poprawnie przechodzą do jednej kolumny i zachowują czytelny kontakt mailowy — to ważna przeciwwaga.

**Riley — osoba sprawdzająca wiarygodność:** natychmiast znajdzie różnicę 19/18 sierpnia, „ZAPLANOWANE” w archiwum, przeskoki nagłówków i dwa landmarki główne. Potoczny, jednozdaniowy wpis przy szerokiej deklaracji odczyta jako niedojrzały proces publikacji.

## Drobniejsze obserwacje

- Nad H1 „Dołącz do nas” widnieje „O nas”; wygląda to jak okruszek bez affordance albo błędna etykieta bieżącej strony.
- Powtarzany gwiezdny hero buduje spójność, ale na wielu listach zaczyna zastępować informację kontekstową.
- KRS i adres są wartościowe, lecz mało odkrywalne w drobnym footerze; dla partnera instytucjonalnego zasługują na mocniejszy kontekst.
- Kalendarz ma poprawny `aria-selected`, a zmiana miesiąca aktualizuje nagłówek. Nie wykryto obrazów bez `alt` ani overflow należącego do treści przy 390 px.
- Wbudowany viewer Statutu był biały w headless Chromium; nie jest to potwierdzony defekt, bo wbudowane przeglądarki PDF zachowują się inaczej w headless.
- Znany odnośnik „Polityka prywatności” → `#top` został całkowicie pominięty zgodnie z zakresem.

## Pytania do rozważenia

1. Jaki jeden zweryfikowany dowód działalności ma zapamiętać osoba z urzędu lub instytucji kultury, jeśli odwiedzi tylko jedną stronę WKF?
2. Czy uczciwszą obietnicą na dziś jest „klub szerokiej fantastyki, którego najbardziej widoczną aktywnością jest RPG”, czy obecna szeroka deklaracja ma zostać utrzymana i szybciej pokryta treścią?
3. Co ma być emocjonalnym finałem strony głównej: następne realne wydarzenie, ścieżka dołączenia czy formalny dowód wiarygodności?
