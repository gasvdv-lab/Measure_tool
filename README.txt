MEASURE AR v0.7.5 — CONSTRAINTS + WALLS + OPENINGS

NIEUW
- Algemene tekenrichting vanaf het begin: Vrij, Horizontaal, Verticaal, Op oppervlak, Parallel, 90°, Eigen hoek.
- Referentielijn instellen via Objecten > Lijn > Gebruik als referentielijn.
- Basis snapping naar bestaande punten en lijnen.
- Muur vanaf lijn met unieke naam, hoogte, dikte, kleur, transparantie en zijde.
- Echte rechthoekige openingen/deuren/ramen door de muur op te delen rond het gat.
- Opening met unieke naam, positie vanaf A, onderhoogte, breedte en hoogte.
- Tekenen in opening: doorlopend tekenen wordt op het lokale openingsvlak geprojecteerd.
- Nieuwe objectgroep Muren; openingen worden per muur beheerd.
- Dependency-waarschuwing blijft actief bij gekoppelde basislijnen.

BEHOUDEN
- v0.7.4 shapes/fill/oppervlakte
- immutable punten
- meten/uitzetten
- doorlopend tekenen + Voltooien
- zoom
- Alles wissen zonder AR te verlaten
- selectief wissen

BEKEND
- Label-oriëntatieprobleem blijft bewust uitgesteld.
- WebGL-lijndikte blijft toestelafhankelijk.

CONTROLE
- JavaScript node --check: OK
- dubbele HTML IDs: geen
