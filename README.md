# Measure AR v0.8.8 — Module Consistency Fix
Build: 20260822-1605

Fixes:
- geometry.js exporteert nu getPoint en getLine.
- Alle named ES-module imports zijn automatisch gevalideerd tegen de exports van hun doelmodule.
- Alle interne modules gebruiken exact dezelfde cache-key: ?v=0.8.8-20260822-1605
- Oude v0.8.6/v0.8.7 verwijzingen zijn verwijderd.
- Startup hardening, universal drawing, muren, placement en fixed points blijven behouden.
- Alle JavaScriptmodules zijn syntactisch gecontroleerd.

Vaste app-link:
https://gasvdv-lab.github.io/Measure_tool/

Upload ALLE bestanden uit deze ZIP naar GitHub. Een gedeeltelijke upload kan opnieuw builds mengen.
