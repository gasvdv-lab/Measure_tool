# Measure AR v0.8.9 — Unified Drawing Engine
Build: 20260822-1645

Deze release vervangt de dubbele tekenlogica door één centrale tekenengine.

- Eén actief vertrekpunt voor Handmatig en Op maat.
- Eén richtingstate: Vrij, Horizontaal, Verticaal, Op oppervlak, Parallel, Loodrecht en Eigen hoek.
- Eén referentielijnstate.
- Na ieder bevestigd punt wordt dat punt automatisch het nieuwe vertrekpunt.
- Doorlopend tekenen gebruikt dezelfde actieve-puntlogica.
- AR surface normal wordt gebruikt voor `Op oppervlak`.
- `AR afsluiten` is volledig uit het menu verwijderd.
- De oude `universal-placement.js` is verwijderd.
- Bestaande helpers `applyConstraint` en `nearestSnap` blijven compatibel.
- Fixed points, muren, vormen, zoom, menu repair en startup hardening blijven behouden.

Vaste app-link:
https://gasvdv-lab.github.io/Measure_tool/

Upload ALLE bestanden uit deze ZIP naar GitHub.
