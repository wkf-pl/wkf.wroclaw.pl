# ADR 0002: Prywatnościowa statystyka odwiedzin

- **Status:** Proposed
- **Data:** 2026-09-12

## Kontekst

WKF może w przyszłości potrzebować zbiorczych informacji o liczbie odwiedzin i zainteresowaniu poszczególnymi treściami. Celem byłaby wyłącznie techniczna optymalizacja serwisu i lepsze dopasowanie publikowanych materiałów, bez reklamy, sprzedaży danych, rozpoznawania konkretnych osób ani śledzenia ich pomiędzy serwisami.

Nowa aplikacja nie prowadzi obecnie takiej statystyki. Samo skonfigurowanie Matomo bez cookies nie oznacza, że pomiar jest obojętny dla prywatności: skrypt nadal może uzyskiwać informacje z urządzenia i przesyłać dane do serwera statystycznego.

## Proponowany kierunek

Jeżeli Klub zdecyduje się wdrożyć Matomo albo porównywalne narzędzie:

1. statystyka otrzyma osobną kategorię zgody, domyślnie wyłączoną;
2. wersja zapisanych preferencji zostanie podniesiona, aby każdy użytkownik podjął nową decyzję;
3. żaden skrypt, piksel ani endpoint statystyczny nie zostanie wywołany przed zgodą, również w konfiguracji bez cookies;
4. preferowane będzie rozwiązanie zarządzane przez Klub, z danymi przechowywanymi w EOG;
5. wyłączone pozostaną User ID, fingerprinting, śledzenie między domenami, łączenie aktywności z kontami CMS, nagrania sesji, mapy cieplne, reklamy i funkcje marketingowe;
6. adres IP zostanie zanonimizowany przed zapisem, a precyzyjna geolokalizacja wyłączona;
7. adresy URL, tytuły stron, parametry, referrery i zdarzenia będą filtrowane, aby nie zapisywały danych osobowych;
8. przed uruchomieniem zostaną określone krótkie okresy retencji danych surowych i uzasadniony okres przechowywania raportów zbiorczych;
9. dostęp do raportów otrzymają wyłącznie upoważnione osoby, a sygnał Do Not Track będzie respektowany jako dodatkowa ochrona;
10. polityka prywatności zostanie zaktualizowana przed rozpoczęciem pomiaru.

## Warunki odbioru przyszłego wdrożenia

- Brak decyzji, odmowa oraz zgoda wyłącznie na funkcje map nie powodują żadnego żądania do systemu statystycznego.
- Cofnięcie zgody zatrzymuje dalszy pomiar bez konieczności odświeżenia strony.
- Wysłane adresy i zdarzenia nie zawierają adresów e-mail, nazw użytkowników, tokenów, danych formularzy ani identyfikatorów kont.
- Raporty nie pozwalają odtworzyć historii konkretnego odwiedzającego.
- Automatyczne usuwanie danych po upływie ustalonego okresu zostało sprawdzone na danych testowych.
- Faktyczna konfiguracja, umowy z dostawcami, lokalizacja danych i podstawa prawna przeszły przegląd techniczny oraz prawny.

## Konsekwencje

Takie podejście ograniczy szczegółowość raportów i może zmniejszyć liczbę zarejestrowanych wizyt. Jest to świadomy koszt przyjęcia prywatności jako ważniejszej od kompletności statystyk. Wdrożenie wymaga osobnej decyzji i nie wynika automatycznie z przyjęcia tego ADR.

## Źródła do ponownej weryfikacji przed wdrożeniem

- [Matomo: praca bez cookies](https://matomo.org/faq/general/faq_157/)
- [Matomo: ustawienia prywatności](https://matomo.org/faq/general/configure-privacy-settings-in-matomo/)
- [EDPB: techniczny zakres art. 5 ust. 3 dyrektywy ePrivacy](https://www.edpb.europa.eu/system/files/documents/2024-10/edpb_guidelines_202302_technical_scope_art_53_eprivacydirective_v2_en_0.pdf)
- [Prawo komunikacji elektronicznej](https://eli.gov.pl/api/acts/DU/2024/1221/text.html)
