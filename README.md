# Measure AR v0.8.12 — Core Stability & Regression
Build: 20260822-2015

Deze release voegt bewust geen grote nieuwe tekenfunctie toe. De Unified Drawing Core uit v0.8.11 is grondig gestabiliseerd.

## Hersteld
- Muur aanmaken gebruikte nog de verwijderde `S.undo`-state en kon daardoor na het maken van de mesh crashen. Muren gebruiken nu `S.history`.
- Dubbele tik op de witte plaatsknop wordt ook in de core geblokkeerd.
- Als lijncreatie mislukt nadat een nieuw punt werd aangemaakt, wordt dat tijdelijke punt terug opgeruimd.
- Een Vorm houdt één vast tekenvlak gedurende de hele vorm.
- `Vrij` tekenen bij Vorm betekent vrij binnen dat actieve vlak, niet willekeurig uit het vlak.
- Vormen worden vóór triangulatie op vlakheid gecontroleerd; >3 cm afwijking wordt geweigerd.
- Na Voltooien/Sluiten worden tool-transacties vergrendeld zodat Undo geen afgewerkte contour kan beschadigen.
- Bestaande sluitlijn wordt correct aan een vormcontour toegevoegd.
- Dependency-controle omvat nu ook contouren.
- Alleen-vorm verwijderen en vorm+contour verwijderen blijven behouden.
- AR cleanup wist ook stale target-state en maakt de startknop opnieuw bruikbaar.
- Candidate updates herbouwen niet langer tientallen keren per seconde alle HUD-selects.

## Interne regressiecontrole
- Alle JavaScriptmodules: syntax OK.
- Alle named imports/exports: OK.
- Geen dubbele HTML-ID's.
- Alle UI-ID-referenties bestaan.
- Alle statische knoppen hebben een handler.
- Oude placement/drawing/constraint modules blijven verwijderd.
- Runtime projectvalidator controleert punten, lijnen, contouren, vormen en muren op gebroken referenties.

## Testvolgorde op toestel
1. Lijn: A → B; controleer dat B vast blijft en de tool stopt.
2. Polyline: A → B → C → D; controleer dat B, C en D telkens nieuw vertrekpunt worden; Voltooien moet open blijven.
3. Vorm: A → B → C → D; Sluiten moet D → A toevoegen.
4. Wissel per segment tussen AUTO en exacte afstand.
5. Test Vrij, Horizontaal, Verticaal en Op oppervlak.
6. Test Parallel, Loodrecht en Eigen hoek met referentielijn.
7. Test Undo vóór Voltooien.
8. Maak een muur uit een bestaande lijn.
9. Test afzonderlijk Vorm verwijderen en Vorm + contour verwijderen.
10. Alles wissen en opnieuw beginnen zonder AR af te sluiten.

Vaste app-link:
https://gasvdv-lab.github.io/Measure_tool/

Upload alle bestanden uit deze ZIP. De oude bestanden `js/placement.js`, `js/drawing.js`, `js/drawing-engine.js` en `js/constraints.js` horen NIET terug te komen.
