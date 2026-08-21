WEBXR MEASURE v0.4 — VERLENGD AR-BEREIK

Nieuw:
- Groen kruis = echte WebXR/ARCore hit-test.
- Geel kruis = mathematisch geprojecteerd richtpunt vanuit de AR-camera.
- Wit = op dat moment geen geldig richtpunt.

Punt A:
- blijft verplicht een echt groen AR-oppervlak gebruiken.

Afstand meten:
- B gebruikt eerst een echte hit-test.
- Valt die weg, dan projecteert de app B op het lokale vlak van A.
- Dit verlengt het bruikbare bereik op hetzelfde vlak.

Afstand uitzetten:
- na A is geen oppervlak op grote afstand meer vereist.
- Vrij 3D gebruikt de camerakijkrichting.
- Horizontaal projecteert die richting horizontaal.
- Op oppervlak projecteert de richting in het vlak van A.
- B wordt daarna exact op de ingegeven afstand berekend.

B terugvinden:
- de app blijft fysieke hit-test gebruiken als die beschikbaar is.
- anders schakelt hij over op virtuele projectie.

Virtuele projectie is begrensd op 40 m. Dit is een technische bereikgrens, geen garantie op centimeternauwkeurigheid op 40 m.

Test buiten bij voorkeur 2 m, 5 m, 10 m en eventueel 15 m.

Publiceren:
1. Vervang index.html in Measure_tool.
2. Commit naar main.
3. GitHub Pages publiceert automatisch.
4. Vernieuw de bestaande site in Chrome.
