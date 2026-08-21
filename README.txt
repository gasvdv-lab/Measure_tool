WEBXR MEASURE v0.6.5 — AR-UX & DYNAMISCHE GEOMETRIE

Deze versie focust bewust op gebruiksgemak en zichtbaarheid.

1. OBJECTENPANEEL UIT CAMERABEELD
- Het permanente paneel onderaan is verwijderd uit de actieve AR-weergave.
- Punten en lijnen beheer je via ☰ > Objecten beheren.
- Daardoor blijft het camerabeeld rustiger.

2. DIKKERE, DYNAMISCHE LIJNEN
- De oude WebGL 1-pixel lijn is vervangen door echte 3D-cylindergeometrie.
- Lijnen worden visueel dikker naarmate ze verder van de camera staan.
- Dichtbij blijven ze relatief precies.

3. DYNAMISCHE PUNTEN
- Punten schalen sterker mee met de afstand.
- Dichtbij: klein genoeg voor nauwkeurig plaatsen.
- Verder weg: duidelijker zichtbaar.

4. LABEL OP DE LIJN
Elke voltooide lijn krijgt automatisch een label in het midden:
AB · 2,50 m
BC · 4,08 m
enzovoort.
Het label is een billboard/sprite en blijft naar de camera gericht.

5. VERDER BOUWEN ZONDER BEGINMENU
In het cameramenu kun je nu rechtstreeks:
- afstand ingeven
- meter/cm kiezen
- Horizontaal / Op oppervlak / Vrij 3D kiezen
- 'Zet afstand uit vanaf laatste punt' gebruiken

Voorbeeld:
- teken AB
- open ☰
- geef 4,08 m
- kies Horizontaal
- kies 'Zet afstand uit vanaf laatste punt'
- B wordt automatisch het startpunt
- richt alleen de gewenste richting
- C wordt op exact 4,08 m berekend
- BC blijft staan met label

6. OBJECTEN BEHEREN
Via ☰ > Objecten beheren:
- lijnen bekijken + verwijderen
- punten bekijken
- een bestaand punt als actief startpunt gebruiken

Behouden:
- hybride bereik
- stabiliteitsfilter
- meerdere punten/lijnen
- meten
- uitzetten
- cameramenu
- WebXR cleanup

BELANGRIJKE TEST
Test vooral:
A-B tekenen -> ☰ -> 3,00 m -> Horizontaal ->
Zet afstand uit vanaf laatste punt -> richting kiezen -> BC.

Controleer:
- leesbaarheid van AB/BC labels
- lijnzichtbaarheid op 1, 5 en 10 m
- puntzichtbaarheid dichtbij en veraf
- of objectbeheer voldoende uit de weg zit
