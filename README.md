# Measure AR v0.8.2 — Fixed Points Core Fix

Deze release bouwt verder op v0.8.1 en behoudt `js/walls.js`.

## Fix: punt A lijkt te verschuiven wanneer B wordt gezocht
De puntworkflow is aangescherpt:

- ieder geplaatst punt krijgt één immutable world-space snapshot;
- die snapshot is de enige autoritatieve positie van het punt;
- markerpositie wordt elke render opnieuw aan die snapshot gekoppeld;
- het bewegende AR-richtpunt blijft volledig los van permanente punten;
- na het plaatsen van A wordt de tracking/stabiliteitsbuffer onmiddellijk leeggemaakt;
- samples waarmee A werd bepaald kunnen B dus niet meer beïnvloeden;
- hetzelfde gebeurt na ieder nieuw bevestigd punt;
- ieder plaatsingsmoment gebruikt een eigen `Vector3.clone()` snapshot.

## Visuele verbetering
Permanente punten zien er nu bewust anders uit dan de reticle:
- grotere vaste pin/halo;
- eigen schermlabel A, B, C, ...;
- reticle blijft het bewegende groene/witte richtinstrument.

Hierdoor is visueel direct duidelijk wat vast staat en wat nog beweegt.

## Behouden uit v0.8.1
- modulaire structuur
- universele constraints
- meten
- uitzetten
- doorlopend tekenen
- vormen
- muren via `js/walls.js`
- zoom
- Alles wissen zonder AR te verlaten

## Test
1. Start AR.
2. Plaats A.
3. Beweeg de telefoon links/rechts en dichter/verder.
4. De reticle moet bewegen, A + label A moeten op hun wereldpositie blijven.
5. Plaats B.
6. Controleer AB.
7. Selecteer AB > Maak muur van lijn.
8. Controleer dat de muurfunctie uit v0.8.1 nog werkt.

## Bekend
Het eerder gemelde label-oriëntatieprobleem van lijnlabels blijft apart geparkeerd.
