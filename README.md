# Measure AR v0.8.9.2 — Menu Action Repair
Build: 20260822-1840

Deze release volgt op een volledige audit van alle menu's en statische knoppen.

Belangrijkste fixes:
- `Punt op maat plaatsen` reageert nu ook wanneer nog geen vertrekpunt bestaat:
  de app vraagt eerst punt A en opent daarna automatisch opnieuw `Op maat`.
- Alle button-handlers lopen via een veilige action-wrapper; fouten worden zichtbaar in de AR-status in plaats van stil te falen.
- `Nieuwe lijn` heeft nu ook werkelijk `Bestaand punt kiezen`.
- `Uitzetten vanaf punt` gebruikt daadwerkelijk het geselecteerde punt als vertrekpunt.
- Knoppen die een bestaand punt/lijn vereisen geven een zichtbare melding wanneer dat object ontbreekt.
- Vorm-objecten hebben nu een werkende detailknop en een detailpagina met verwijderen.
- Undo meldt zichtbaar wanneer er niets te herstellen is.
- Muurhoek wordt alleen getoond bij `Eigen hoek`.
- Menutitels zijn leesbaar Nederlands in plaats van interne pagina-ID's.
- Bootstrap-versie is gecorrigeerd; geen `v0.8.9.1.1` meer.
- Constraint/core-fixes van v0.8.9.1 blijven behouden.

Automatische releasecontrole:
- alle statische HTML-knoppen hebben een handler of geldige navigatie;
- alle menu-pagina's bestaan;
- alle UI-ID-referenties bestaan;
- geen dubbele HTML-ID's;
- alle ES-module named imports bestaan;
- alle JavaScriptbestanden slagen voor syntaxcontrole.

Vaste app-link:
https://gasvdv-lab.github.io/Measure_tool/

Upload ALLE bestanden uit deze ZIP naar GitHub.
