WEBXR MEASURE v0.6 — MEERDERE PUNTEN EN LIJNEN

Nieuwe geometrische kern:

- Meerdere punten A, B, C, D, ... tegelijk in dezelfde AR-sessie.
- Meerdere lijnen blijven tegelijk zichtbaar.
- Elke lijn krijgt automatisch een naam zoals AB, BC, CD.
- Afstand van elke lijn wordt bijgehouden.
- Objectenpaneel toont hoeveel punten en lijnen aanwezig zijn.
- Via 'Objecten tonen' kun je de huidige geometrie bekijken.
- Lijnen en punten kunnen afzonderlijk verwijderd worden.
- Als een punt verwijderd wordt, verdwijnen ook lijnen die eraan vastzitten.

Cameramenu:
- Nieuwe lijn
  Start een volledig nieuwe lijn vanaf een nieuw punt.
- Start vanaf laatste punt
  Handig om kettingen te maken zoals A-B, B-C, C-D...
- Huidige lijn annuleren
  Wist alleen de actieve/onvoltooide lijn.
- Alles wissen
  Verwijdert alle punten en lijnen uit de huidige AR-sessie.
- Andere functie
  Wisselt tussen meten en uitzetten.
- Terug naar beginscherm

Belangrijk:
De geometrie blijft in v0.6 alleen bestaan zolang dezelfde WebXR-sessie actief blijft.
Bij volledig teruggaan naar het beginscherm wordt de AR-sessie beëindigd en worden
de punten/lijnen gewist. Permanente projectopslag en herpositionering komen later.

Bestaande functies behouden:
- simpel A-B meten
- afstand uitzetten
- Vrij 3D / Horizontaal / Op oppervlak
- groter hybride AR-bereik
- stabiliteitsfilter
- kleine dynamische markers
- cameramenu
- correcte WebXR cleanup

Aanbevolen test:
1. Meet A-B.
2. ☰ > Start vanaf laatste punt.
3. Meet B-C.
4. Herhaal naar C-D.
5. Open Objecten tonen.
6. Verwijder één lijn.
7. Verwijder één punt en controleer of verbonden lijnen ook verdwijnen.
8. Test hetzelfde met Afstand uitzetten.

Publiceren:
Vervang alleen index.html in Measure_tool en commit naar main.
