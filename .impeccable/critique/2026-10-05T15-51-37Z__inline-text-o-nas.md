---
target: tekst strony O nas podany w rozmowie
total_score: 9
max_score: 16
na_heuristics: 1,3,5,7,9,10
p0_count: 0
p1_count: 2
target_identity: "file:/home/forseti/Kod/wkf.wroclaw.pl/inline-text:O nas"
timestamp: 2026-10-05T15-51-37Z
slug: inline-text-o-nas
---
# Ocena tekstu strony „O nas”

## Design Health Score

| # | Heurystyka | Wynik | Główny problem |
|---|---|---:|---|
| 1 | Widoczność statusu | n/a | Statyczny tekst nie ma stanu systemu. |
| 2 | Zgodność z językiem odbiorcy | 3/4 | Język jest naturalny, lecz opis organizacji pozostaje abstrakcyjny. |
| 3 | Kontrola i swoboda | n/a | Brak interaktywnego procesu w ocenianym materiale. |
| 4 | Spójność i standardy | 2/4 | Otwartość wobec początkujących zderza się z warunkiem „więcej niż hobby”. |
| 5 | Zapobieganie błędom | n/a | Brak formularza lub ryzykownej czynności. |
| 6 | Rozpoznawanie zamiast przypominania | 2/4 | Łatwo rozpoznać zainteresowania, trudno rozpoznać realną ofertę i kolejny krok. |
| 7 | Elastyczność i efektywność | n/a | Nie dotyczy statycznego tekstu Persuade/Read. |
| 8 | Estetyka i minimalizm | 2/4 | Powtórzenia oraz dwa długie wyliczenia spłaszczają hierarchię. |
| 9 | Rozpoznawanie i naprawa błędów | n/a | Brak stanów błędu. |
| 10 | Pomoc i dokumentacja | n/a | Nie jest to mechanizm pomocy dla zadania. |
| **Suma** |  | **9/16** | **Akceptowalna podstawa, wymagająca konkretyzacji.** |

## Werdykt specyficzności

Tekst jest wyraźnie napisany dla społeczności fanów fantastyki, ale słabo dla konkretnego Wrocławskiego Klubu Fantastyki. Po podmianie nazwy niemal w całości pasowałby do dowolnego klubu fandomowego. Nie przekazuje dwóch najmocniejszych, potwierdzonych wyróżników WKF: formalnej wiarygodności organizacji oraz zdolności do wspierania mniejszych inicjatyw.

Deterministyczny skan pomocniczego HTML-a zwrócił 0 wykryć. To wynik poprawny dla minimalnego wrappera, lecz nie jest oceną jakości redakcyjnej ani pełnego interfejsu. Nie było dostępnego natywnego narzędzia przeglądarkowego z mutowalnym DOM, dlatego nie powstał overlay.

## Ogólne wrażenie

Tekst ma dobrą temperaturę: jest serdeczny, niekomercyjny i obniża próg wejścia. Największa szansa polega na zamianie części deklaracji o wspólnocie na zwięzłą odpowiedź: kim WKF jest, co realnie robi i jaki pierwszy krok może wykonać czytelnik.

## Co działa

- Szerokie spektrum zainteresowań pozwala wielu osobom rozpoznać siebie w opisie.
- Zdanie o miejscu dla weteranów i początkujących skutecznie redukuje lęk przed wejściem do istniejącej grupy.
- Ton odpowiada organizacji społecznej i kulturalnej: jest wspólnotowy, prosty i pozbawiony komercyjnej przesady.

## Priorytetowe problemy

### [P1] Tożsamość oparta na deklaracjach, nie na faktach

**Dlaczego to ważne:** potencjalny członek nie wie, co WKF robi obecnie, a przedstawiciel instytucji nie otrzymuje podstaw do oceny wiarygodności. Zwroty „tworzymy przestrzeń” i „chcemy tworzyć” nie odróżniają organizacji od nieformalnej grupy.

**Naprawa:** otworzyć tekst krótką, zweryfikowaną definicją WKF, następnie podać 2–3 realne formy działania i wyraźnie oddzielić stan obecny od planów. Nie dodawać osiągnięć, partnerów ani liczb bez potwierdzenia.

**Sugerowane polecenie:** `$impeccable clarify`

### [P1] CTA nie prowadzi do konkretnego działania

**Dlaczego to ważne:** „Dołącz do WKF!” nie wyjaśnia, czy kolejnym krokiem jest spotkanie, formularz, wiadomość czy formalne członkostwo.

**Naprawa:** nazwać realną czynność i rezultat, np. „Sprawdź, jak dołączyć” albo „Przyjdź na najbliższe spotkanie”, wyłącznie jeśli strona rzeczywiście prowadzi do takiej ścieżki. Dodać mniej zobowiązującą opcję dla osób chcących najpierw poznać klub.

**Sugerowane polecenie:** `$impeccable clarify`

### [P2] Finał podważa wcześniejszą otwartość

**Dlaczego to ważne:** warunek „jeśli fantastyka jest dla Ciebie czymś więcej niż tylko hobby” tworzy test intensywności zaangażowania tuż po zapewnieniu, że początkujący są mile widziani.

**Naprawa:** zakończyć zaproszeniem bez warunku, który może zabrzmieć jak gatekeeping. Hobby jest wystarczającym powodem, by przyjść i poznać klub.

**Sugerowane polecenie:** `$impeccable clarify`

### [P2] Płaska hierarchia i powtórzenia

**Dlaczego to ważne:** „społeczność”, „dzielenie się”, „przestrzeń”, „miejsce spotkań” i „wspólne działanie” powtarzają podobną obietnicę. Dwa rozbudowane wyliczenia utrudniają skanowanie na telefonie.

**Naprawa:** ułożyć narrację: **kim jesteśmy → co robimy dziś → dla kogo → dlaczego można nam zaufać → pierwszy krok**. Skrócić listy do reprezentatywnych przykładów.

**Sugerowane polecenie:** `$impeccable distill`

## Persony i czerwone flagi

- **Jordan, pierwszy kontakt:** rozumie, że jest mile widziany, lecz nie dowiaduje się, jak wygląda pierwszy kontakt ani co zrobić po lekturze.
- **Riley, osoba sprawdzająca deklaracje:** nie potrafi odróżnić aktualnej działalności od aspiracji i nie znajduje faktów potwierdzających status WKF.
- **Casey, odbiorca mobilny:** najpewniej przeskanuje początek i koniec; długie listy oraz niekonkretne CTA nie tworzą szybkiej ścieżki.
- **Przedstawiciel instytucji:** widzi sympatyczną społeczność, ale nie otrzymuje informacji o wiarygodności organizacyjnej, zakresie działania ani możliwości współpracy.

## Drobniejsze obserwacje

- Tekst ma 191 słów, 6 akapitów i 11 zdań; 4 zdania przekraczają 20 słów, a najdłuższe ma 39 słów.
- „Chcemy” występuje dwa razy w jednym akapicie; rodzina „miejsce/miejscem” wraca trzykrotnie.
- Fragment „Wrocławski Klub Fantastyki to przede wszystkim społeczność. Ludzie, których…” ma zamierzony rytm manifestu, ale jako otwarcie oficjalnej strony może brzmieć składniowo urwanie.
- „fantastyczny świat” jest sympatyczną grą słów, lecz mniej precyzyjną niż reszta zaproszenia.

## Pytania do rozważenia

- Jaki jeden zweryfikowany fakt najlepiej dowodzi, że WKF jest czymś więcej niż luźną grupą fanów?
- Czy podstawowym celem strony jest członkostwo, pierwsza wizyta na wydarzeniu, czy również wiarygodność wobec instytucji?
- Czy WKF chce zapraszać osoby już mocno zaangażowane, czy także dawać bezpieczne miejsce tym, którzy dopiero odkrywają fantastyczne zainteresowania?
