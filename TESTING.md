# AURA — Cumulatieve TESTING

## Testbeleid

Bij iedere release:
1. alle softwarematig/automatisch uitvoerbare tests worden vóór oplevering uitgevoerd;
2. resultaten worden hier cumulatief bijgehouden;
3. alleen tests die echte hardware/omgeving vereisen blijven manueel;
4. een release met open fysieke tests wordt niet als fysiek gevalideerde baseline beschouwd totdat de gebruiker die tests heeft uitgevoerd.

---

# v0.0.1 — Fase 0

## Automatische tests

Uitgevoerd met `scripts/validate_phase0.py`.

Te controleren:
- verplichte bestanden bestaan;
- verplichte kernbegrippen komen voor;
- geen expliciete Human Internet write capability;
- shutdown wordt extern/privileged/onwaarneembaar beschreven;
- Observatory is read-only richting AURA;
- autobiografisch geheugen bij genesis = 0;
- AURA fysisch geslachtsloos;
- geen vaste man/vrouw-identiteit;
- geen geprogrammeerde pregnancy/reproduction;
- identiteit niet vooraf bepaald;
- Android-first is gedocumenteerd;
- iOS is uitgesteld;
- releasebeleid met ZIP + cumulatieve TESTING is aanwezig.

Resultaat bij oplevering: zie validator-output onderaan deze release.

## Manuele praktijktests

Geen. Fase 0 bevat geen runtime, WebXR, camera, audio, GPS of rendering.

## Toekomstige fysieke testcategorieën

Deze worden pas actief zodra de betreffende module bestaat:

### Android / browser
- Chrome-versie en WebXR-capability;
- PWA lifecycle;
- hervatten na scherm uit/browser suspend;
- performance en thermische belasting.

### ARCore / WebXR
- session start/stop;
- hit-test;
- world tracking;
- indoor tracking;
- outdoor tracking;
- schaalstabiliteit;
- persistent spatial alignment.

### Camera / audio
- gedeelde camera-feed;
- microfoon;
- toestemming;
- privacy prompts;
- storage uitsluitend met expliciete toestemming.

### Locatie
- GPS;
- kaartcontext;
- persistent places;
- terugkeer na uren/dagen;
- locatie-herkenning.

### Humanoid
- correcte schaal;
- body-state/render synchronisatie;
- motorisch geleerde beweging versus animaties;
- degradatie visueel en causaal consistent.

---

## v0.0.1 validator-resultaat

```text
AURA Phase 0 validation: PASS
Validated 15 required documents and 11 core rules.
```
