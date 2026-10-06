---
target: tekst strony Sekcja RPG podany w rozmowie, porównany z oryginalnym O nas
total_score: 11
max_score: 20
na_heuristics: 1,3,5,7,9
p0_count: 0
p1_count: 3
target_identity: 'file:/home/forseti/Kod/wkf.wroclaw.pl/inline-text:Sekcja RPG'
timestamp: 2026-10-05T17-57-44Z
slug: inline-text-sekcja-rpg
---

# Critique tekstu „Sekcja RPG” w ścieżce „O nas” → „Sekcja RPG”

## Design Health Score

| #        | Heurystyka                          |     Wynik | Główny problem                                                                           |
| -------- | ----------------------------------- | --------: | ---------------------------------------------------------------------------------------- |
| 1        | Widoczność statusu                  |       n/a | Statyczny tekst nie ma stanów ani operacji.                                              |
| 2        | Zgodność z językiem odbiorcy        |       3/4 | Ton jest naturalny, lecz początkujący mogą potrzebować objaśnienia roli Mistrza Gry.     |
| 3        | Kontrola i swoboda                  |       n/a | Brak interaktywnego procesu w ocenianym materiale.                                       |
| 4        | Spójność i standardy                |       3/4 | Głos marki jest spójny, ale konstrukcja wygląda jak ponowne użycie tego samego szablonu. |
| 5        | Zapobieganie błędom                 |       n/a | Brak formularza lub ryzykownej czynności.                                                |
| 6        | Rozpoznawanie zamiast przypominania |       2/4 | Inicjatywy nie mają opisów ani rozpoznawalnych ścieżek udziału.                          |
| 7        | Elastyczność i efektywność          |       n/a | Nie dotyczy statycznej strony Persuade/Read.                                             |
| 8        | Estetyka i minimalizm               |       2/4 | Prawie dwukrotnie dłuższy tekst powtarza dużą część argumentacji „O nas”.                |
| 9        | Rozpoznawanie i naprawa błędów      |       n/a | Brak stanów błędu.                                                                       |
| 10       | Pomoc i dokumentacja                |       1/4 | Brakuje odpowiedzi, którą inicjatywę wybrać i jak wykonać pierwszy krok.                 |
| **Suma** |                                     | **11/20** | **Akceptowalne, lecz wymaga istotnej zmiany struktury.**                                 |

## Werdykt specyficzności

Obserwacja o podobieństwie jest trafna. Nie jest to bliska kopia leksykalna, lecz bardzo wyraźne powtórzenie struktury, funkcji akapitów i figur retorycznych. Czytelnik po „O nas” otrzymuje ponownie: tożsamość przez ludzi, wspólnotowy rozwój pasji, wzajemną inspirację, otwartość dla początkujących, zachętę do inicjatyw i końcowe zaproszenie.

Tekst jest RPG-owy, ale dopiero piąty akapit staje się wyraźnie WKF-owy dzięki nazwom trzech konkretnych inicjatyw. Pierwsze cztery akapity po zmianie kilku rzeczowników mogłyby opisywać niemal dowolny klub RPG.

Detektor zwrócił 0 wykryć dla minimalnego HTML-a. Mechaniczne porównanie potwierdziło brak wspólnych sekwencji pięciowyrazowych lub dłuższych, ale wykazało powtórzenie makrosekwencji oraz charakterystycznych konstrukcji: `X to przede wszystkim Y`, `Wierzymy, że...`, `Chcemy, aby...`, `zarówno... jak i...` i warunkowego zaproszenia na końcu.

## Ogólne wrażenie

Po „O nas” odwiedzający nie potrzebuje drugiego manifestu wspólnotowości. Potrzebuje praktycznej mapy wejścia do Sekcji RPG: dla kogo jest, co faktycznie robi, czym różnią się inicjatywy i jaki krok można wykonać teraz.

Tekst daje nową wartość, ale zdecydowanie za małą jak na niemal dwukrotnie większą objętość. Najbardziej wartościowe są konkrety: brak wymogu doświadczenia i drużyny, nazwy inicjatyw oraz rozpoznanie intencji gracza i prowadzącego.

## Porównanie struktury

| „O nas”                                       | „Sekcja RPG”                                             | Efekt w sekwencji                         |
| --------------------------------------------- | -------------------------------------------------------- | ----------------------------------------- |
| klub to przede wszystkim społeczność          | sekcja to przede wszystkim ludzie                        | natychmiastowe poczucie powtórki          |
| wspólna pasja rozwija się przez dzielenie     | RPG rozwija się jako doświadczenie wspólnotowe           | ta sama teza w węższej domenie            |
| inspirujemy się, uczymy i pomagamy sobie      | wymieniamy doświadczenia, uczymy się i inspirujemy       | niemal identyczna obietnica               |
| miejsce dla weteranów i początkujących        | otwartość dla doświadczonych i zaczynających             | spójne, ale ponownie obszernie wyjaśnione |
| tworzymy inicjatywy, wydarzenia i projekty    | inicjujemy sesje, spotkania i projekty                   | ponowienie modelu aktywnej wspólnoty      |
| zaproszenie do znalezienia ludzi i dołączenia | zaproszenie do znalezienia ludzi i poznania społeczności | brak nowego, wykonalnego kroku            |

Korzystne jest zachowanie wspólnotowego, niekomercyjnego tonu oraz otwartości na nowych uczestników. Niekorzystne jest ponowne rozwinięcie całej filozofii klubu zamiast krótkiego pomostu do treści charakterystycznej dla RPG.

## Co działa

- Konkret „nie trzeba znać dziesiątek systemów ani mieć własnej drużyny” skutecznie obniża próg wejścia.
- Nazwanie inicjatyw „RPG Wrocław”, „Sesje RPG w Mistrzu i Małgorzacie” oraz „RPGowy Wtorek” nadaje tekstowi lokalność i potencjalną wiarygodność.
- Tekst rozpoznaje kilka realnych intencji: pierwszą grę, znalezienie drużyny, prowadzenie sesji i poznanie środowiska.

## Priorytetowe problemy

### [P1] Strona powtarza „O nas” zamiast rozwijać narrację

**Dlaczego to ważne:** odwiedzający przechodzi głębiej, aby dowiedzieć się czegoś specyficznego o RPG, a przez pierwsze cztery akapity ponownie czyta manifest otwartej wspólnoty. Tekst zaczyna wyglądać jak szablon wypełniony innymi rzeczownikami.

**Naprawa:** pozostawić najwyżej jedno zdanie łączące sekcję z wartościami WKF. Otworzyć stronę informacją, co uczestnik może tu zrobić: zagrać pierwszy raz, znaleźć drużynę albo poprowadzić sesję.

**Sugerowane polecenie:** `$impeccable distill`

### [P1] Najmocniejsze dowody są zakopane i niewyjaśnione

**Dlaczego to ważne:** inicjatywy pojawiają się dopiero w piątym akapicie. Same nazwy nie wyjaśniają, czym się różnią, dla kogo są ani czy nadal działają.

**Naprawa:** przenieść je bezpośrednio pod krótki lead. Każdą opisać jednym zweryfikowanym zdaniem: czym jest, dla kogo, jaki ma format lub miejsce i gdzie sprawdzić aktualne terminy. Nie przedstawiać historycznej inicjatywy jako bieżącej.

**Sugerowane polecenie:** `$impeccable clarify`

### [P1] Zaproszenie nie jest CTA

**Dlaczego to ważne:** zakończenie rozpoznaje cztery potrzeby, ale odpowiada tylko „jesteś u nas mile widziany”. Czytelnik nadal nie wie, czy ma wejść na serwer, sprawdzić wydarzenie, napisać wiadomość czy wypełnić formularz.

**Naprawa:** wskazać jeden główny krok i jeden pomocniczy, podpięte do utrzymywanych miejsc docelowych. Przykładowe funkcje: „Zobacz najbliższe sesje” oraz „Chcę poprowadzić sesję”.

**Sugerowane polecenie:** `$impeccable clarify`

### [P2] Otwarcie ponownie ustanawia próg zaangażowania

**Dlaczego to ważne:** „RPG jest czymś więcej niż tylko kolejną formą rozrywki” powtarza finałowy warunek z „O nas” i sugeruje, że zwykła chęć zagrania może być niewystarczająca. Koliduje to z późniejszą otwartością na osoby początkujące.

**Naprawa:** zacząć od możliwości i działań, nie od testu intensywności pasji.

**Sugerowane polecenie:** `$impeccable clarify`

### [P2] Płaska hierarchia utrudnia skanowanie

**Dlaczego to ważne:** siedem podobnie ważonych akapitów miesza filozofię, onboarding, dowody i następny krok. Na telefonie najważniejszy akapit o inicjatywach może zostać pominięty.

**Naprawa:** zastosować strukturę: krótki lead → „Dla kogo” → „Co robimy” → „Jak zacząć”. Rozbić końcowe, czterdziestowyrazowe zdanie.

**Sugerowane polecenie:** `$impeccable layout`

## Obciążenie poznawcze i droga emocjonalna

Obciążenie jest umiarkowane: nie przechodzą 3 z 8 punktów checklisty — chunking, hierarchia i progressive disclosure. Problemem nie jest złożoność RPG, lecz konieczność samodzielnego odfiltrowania tego, co czytelnik już poznał na „O nas”.

Obecny łuk brzmi: **ponowne zapewnienie o wspólnocie → ponowne zapewnienie o otwartości → późny konkret → zaproszenie bez działania**. Pożądany łuk to: **to jest dla mnie → widzę, co faktycznie działa → rozpoznaję swoją ścieżkę → wiem, co zrobić teraz**.

## Persony i czerwone flagi

- **Jordan, pierwszy kontakt:** dostaje ważne zapewnienie, że nie potrzebuje doświadczenia ani drużyny, lecz nie wie, którą inicjatywę wybrać i jak wygląda pierwszy krok.
- **Riley, osoba sprawdzająca deklaracje:** nie może potwierdzić, czy wszystkie trzy inicjatywy nadal działają ani czym uzasadnione jest „stałe rozwijanie się”.
- **Casey, odbiorca mobilny:** widzi długi, równy blok tekstu; najważniejsze konkrety w piątym akapicie łatwo pominąć.
- **Potencjalna uczestniczka RPG:** tekst dobrze rozpoznaje jej potrzeby, ale łączy pierwszą grę, szukanie drużyny i prowadzenie w jednym zaproszeniu zamiast wskazać odpowiednie drogi.

## Drobniejsze obserwacje

- Tekst Sekcji RPG ma 371 słów wobec 191 słów „O nas”: jest o 94,2% dłuższy.
- Średnie zdanie ma 21,8 słowa wobec 17,4 w „O nas”; ostatnie zdanie ma 40 słów.
- `RPG` występuje 13 razy, `ludzi` 6 razy, a `może/mogą` łącznie 7 razy. Redukcji wymagają przede wszystkim abstrakcyjne szeregi, nie termin RPG.
- „Mistrzowie Gry” jest naturalne dla odbiorców RPG, ale przy deklarowanej otwartości można pierwszy raz dopowiedzieć „osoby prowadzące”.
- Zdanie o przynależności do szerszego WKF-u jest dobrym pomostem, ale wystarczy mu krótsza forma; nie musi ponownie opisywać całej korzyści wspólnotowej.

## Pytania do rozważenia

- Co pierwsze 100 słów może powiedzieć wyłącznie o RPG w WKF-ie, a nie o całym klubie?
- Jaki jeden rzeczywisty krok może dziś wykonać osoba początkująca?
- Czy każdą z trzech inicjatyw można opisać jednym aktualnym, weryfikowalnym zdaniem i podpiąć do czynnej ścieżki udziału?
