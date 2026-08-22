MEASURE AR v0.7.1 — NAVIGATION + PRECISION

Nieuw:
- Labels reageren op schermoriëntatie.
- Portrait / landscape / 180° worden meegenomen.
- Label blijft als schermoverlay gekoppeld aan het midden van de 3D-lijn.

Zoom:
- Visuele AR-zoom 1.0x tot 4.0x.
- Pinch-to-zoom met twee vingers.
- + / - knoppen als alternatief.
- 1x resetknop.
- Zoomen verandert GEEN puntcoördinaten, lijnlengtes of contourdata.
- Alleen het virtuele camerabeeld/FOV verandert.

Contour sluiten:
- Tijdens Doorlopend tekenen wordt startpunt A extra geholpen.
- Als A in beeld is verschijnt 'Startpunt A' bij de geprojecteerde positie.
- Als A buiten beeld ligt verschijnt een melding om zoom/oriëntatie te gebruiken.
- Sluiten naar A blijft geometrisch exact: de laatste lijn wordt rechtstreeks aan het opgeslagen startpunt gekoppeld.

Behouden uit v0.7.0:
- core meten
- uitzetten
- groen/geel bereik
- stabiliteitsfilter
- meerdere lijnen
- doorlopend tekenen
- open contour voltooien
- sluiten naar A
- objectbeheer
- lijnbewerking
- undo
- runtime foutmeldingen

Technische checks:
- JavaScript syntax: OK
- dubbele IDs: geen
