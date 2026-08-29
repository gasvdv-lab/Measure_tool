# Test Results — Measure AR v0.8.21.4 World Lock Core
Build: 20260829-1030

## AUTO — PASS
- JavaScript syntax: PASS voor alle modules.
- Relatieve ES-module-imports: PASS; alle doelen bestaan.
- Cache/build-key: PASS; `0.8.21.4-20260829-1255` uniform.
- WebXR sessie: `hit-test` required, `anchors` optional: PASS.
- Point create → anchor queue lifecycle: PASS (statisch).
- Point delete → anchor cleanup lifecycle: PASS (statisch).
- Projectpositie gescheiden van `worldPosition`: PASS.
- Definitieve lijnrender gebruikt world-lock eindpunten: PASS.
- Punt- en lijnlabels gebruiken world-lock posities: PASS.
- Muur world-lock resyncpad: PASS.
- Relocalization reset/requeue van anchors: PASS.
- Runtime fallback zonder `XRFrame.createAnchor()`: PASS (statisch).

## AR-IN/ROOM — OPEN / GO-NO-GO
Niet automatisch simuleerbaar. Verplicht vóór verdere Relocalization-tests:
- bevestigde A→B blijft fysiek staan bij camerabeweging;
- HUD meldt of `World Lock: actief` of `lokale tracking`;
- Vrij, Horizontaal exact en Verticaal exact world-locken;
- muur op basislijn blijft world-locked;
- Undo/Redo blijft world-lockbaar.
