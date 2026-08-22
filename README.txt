MEASURE AR v0.7.0 — CORE DRAWING & STABILITY

Deze versie bouwt uitsluitend voort op de v0.6.9 core-stabilisatie.
Shapes/muren/extrusies zitten NIET in deze runtime.

BELANGRIJKSTE WIJZIGINGEN

1. LIJNLABEL VOLLEDIG HERBOUWD
- Geen Three.js CanvasTexture/Sprite meer voor tekst.
- Labels worden als scherpe DOM-overlay boven de 3D-lijn weergegeven.
- Formaat: AB · 41,3 cm
- Label wordt geprojecteerd vanuit het midden van de echte 3D-lijn.
- Verticale scherm-offset voorkomt dat de lijn door de tekst loopt.
- Dynamische schaal op kijkafstand.
- Als een lijn buiten beeld ligt, verdwijnt alleen het label.

2. DOORLOPEND TEKENEN
Menu:
Werken > Doorlopend tekenen

Workflow:
A plaatsen
B plaatsen -> AB
C plaatsen -> BC
D plaatsen -> CD
enz.

Na iedere lijn wordt het nieuwe eindpunt automatisch het startpunt van de volgende lijn.
Het menu hoeft dus niet opnieuw geopend te worden.

Tijdens doorlopend tekenen staan drie compacte cameraknoppen:
- Laatste: laatste segment/punt terug
- Voltooien: open tekenreeks bewaren
- Sluiten naar A: laatste punt automatisch met A verbinden

3. CONTOURDATA
Een voltooide tekenreeks wordt intern als contour opgeslagen:
- pointIds
- lineIds
- closed true/false
Dit is voorbereiding voor toekomstige fill/vloer/muurfuncties, zonder deze nu al in de core te mengen.

4. CORE-HARDENING BLIJFT BEHOUDEN
- standaard THREE.Line
- beveiligde A/B plaatsing
- rollback als lijncreatie mislukt
- groen AR hit-testpunt
- geel virtueel/verlengd bereik
- stabiliteitsfilter
- meten
- uitzetten
- horizontaal / oppervlak / vrij 3D
- meerdere lijnen
- vanaf laatste punt
- vanaf bestaand punt
- objecten
- lijnlengte aanpassen
- verbonden geometrie beschermen
- undo
- verwijderen
- AR verlaten en opnieuw starten
- runtime-foutmelding in de interface

TESTVOLGORDE

CORE:
1. Start AR
2. A -> B -> controleer AB + label
3. Nieuwe onafhankelijke C -> D
4. Vanaf B -> nieuwe lijn
5. Uitzetten 2,00 m horizontaal
6. Bestaand punt kiezen
7. Lijnlengte aanpassen + undo

DOORLOPEND:
8. Doorlopend tekenen
9. A -> B -> C -> D
10. Controleer dat AB, BC en CD automatisch ontstaan
11. Test Laatste
12. Maak opnieuw D
13. Sluiten naar A
14. Controleer dat DA automatisch ontstaat
15. Nieuwe reeks A-B-C en Voltooien (open)

LIFECYCLE:
16. Terug naar start
17. Start AR opnieuw
18. Herhaal A-B

STATISCHE CONTROLES:
- JavaScript node --check: OK
- Dubbele HTML IDs: geen
- Oude sprite-labelrenderer: verwijderd
- Core source assertions: OK
