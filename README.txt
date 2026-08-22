MEASURE AR v0.7.4 — SHAPES + FILL

NIEUW
- Voltooien sluit de contour zoals in v0.7.3 en opent daarna 'Vorm aanmaken'.
- Naam is verplicht en uniek binnen dezelfde AR-sessie.
- Hoofdletters tellen niet als verschil: Hut / hut / HUT is dezelfde naam.
- Bij aanmaken kiest de gebruiker meteen:
  * vulkleur
  * transparantie
  * randkleur
  * randdikte
  * randlabels zichtbaar/verborgen
- Gesloten contour wordt als transparant 3D-vlak getrianguleerd.
- Oppervlakte wordt berekend in m².
- Objecten bevat nu aparte groepen: Vormen, Lijnen, Punten.
- Vormeditor: naam, vulkleur, randkleur, transparantie, randdikte,
  opvulling zichtbaar/verborgen en labels zichtbaar/verborgen.
- Vorm verwijderen:
  * alleen vorm/opvulling verwijderen; contour blijft
  * vorm + contour verwijderen
- Lijn of punt apart wissen blijft mogelijk.
- Als lijn/punt onderdeel is van een vorm verschijnt eerst een interne
  waarschuwing. Geen native browser-confirm.
- Alles wissen blijft in dezelfde AR-sessie.

ANNULEREN BIJ VORM AANMAKEN
- De reeds gesloten contour blijft veilig bestaan.
- Alleen de shape/vulling wordt niet aangemaakt.

BEHOUDEN
- vaste/immutable punten
- meten
- uitzetten
- doorlopend tekenen
- Voltooien -> sluitlijn naar A
- zoom
- objectbeheer
- Alles wissen zonder AR te verlaten

BEKEND / BEWUST UITGESTELD
- Het label-oriëntatieprobleem is NIET opgelost in v0.7.4.
  Dit wordt later afzonderlijk aangepakt.

TECHNISCHE CONTROLES
- JavaScript node --check: OK
- dubbele HTML IDs: geen
