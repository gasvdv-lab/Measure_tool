WEBXR MEASURE — korte installatie

Wat doet deze versie?
- Start een WebXR/ARCore sessie in Chrome.
- Toont een richtpunt op gevonden oppervlakken.
- Eerste tik = punt A.
- Tweede tik = punt B.
- Berekent de rechte 3D-afstand tussen A en B.
- Reset wist de meting.

Belangrijk
- De pagina moet via HTTPS draaien. Een lokaal file://-bestand is niet voldoende voor WebXR.
- Gebruik Chrome op een ARCore-compatibel Android-toestel.
- De app gebruikt Three.js via jsDelivr, dus internetverbinding is nodig om de pagina de eerste keer te laden.

Snelste gratis publicatie via GitHub Pages
1. Maak een nieuwe GitHub repository, bijvoorbeeld webxr-measure.
2. Upload index.html naar de root van de repository.
3. Open Settings > Pages.
4. Bij Build and deployment: kies Deploy from a branch.
5. Branch: main, folder: /(root), Save.
6. Na korte tijd krijg je een HTTPS-adres van GitHub Pages.
7. Open dat adres in Chrome op je telefoon.
8. Tik op 'AR starten' en geef cameratoestemming.

Gebruik
1. Beweeg de telefoon rustig zodat ARCore een oppervlak vindt.
2. Als het richtkruis groen wordt: richt op punt A en tik.
3. Richt op punt B en tik opnieuw.
4. De afstand verschijnt bovenaan.
5. Tik op Reset om opnieuw te meten.

Meetnauwkeurigheid
- Dit is een eerste prototype.
- Test bij voorkeur eerst tegen een echte meterlat op 0,5 m, 1,0 m en 2,0 m.
- AR-metingen kunnen variëren door licht, textuur, reflecties en snelle bewegingen.
