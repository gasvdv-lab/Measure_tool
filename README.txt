WEBXR MEASURE v0.5 — BEREIK + STABILITEIT / PRECISIEFILTER

Bevat ook alle fixes uit v0.4.1:
- nette Terug-knop uit AR
- correcte cleanup van WebXR
- kleinere, dynamisch schalende A/B-markeringen

Nieuwe fase: precisie & stabiliteit

1. Korte samplebuffer
De app bewaart continu de laatste AR-richtpunten.

2. Jitter-indicator
Bovenaan verschijnt:
- Stabiliteit: goed
- Stabiliteit: redelijk
- Stabiliteit: onrustig
plus de gemeten spreiding in cm.

Dit is nadrukkelijk GEEN absolute meetnauwkeurigheid.
Het is alleen de korte-termijn spreiding van het AR-richtpunt.

3. Gefilterde puntplaatsing
Wanneer je de ronde knop indrukt, gebruikt de app niet blind één frame.
Hij combineert recente richtpunten en verwijdert ongeveer de 20% grootste uitschieters.
Daarmee worden A, B en richtingen minder gevoelig voor één schok/frame.

4. Nieuwe samplecyclus
Na het plaatsen van A begint de stabiliteitsmeting voor B/richting opnieuw.

Aanbevolen veldtest:
- echte 0,50 m: 5 herhalingen
- echte 1,00 m: 5 herhalingen
- echte 2,00 m: 5 herhalingen
- echte 5,00 m: 5 herhalingen
- echte 10,00 m: 5 herhalingen

Noteer per afstand:
- gemeten waarden
- of kruis groen/geel was
- gemelde stabiliteit
- licht/terreincondities

Daarmee kunnen we in de volgende iteratie echte statistiek opbouwen:
gemiddelde fout, spreiding en fout versus afstand.

PUBLICEREN
Vervang alleen index.html in Measure_tool en commit naar main.
