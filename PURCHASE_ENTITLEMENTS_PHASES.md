# Purchase Entitlements: Phased Plan (Backward Compatible)

Context: app-ul are deja multe achizitii, iar in prezent "ce a fost cumparat" este reflectat in principal prin `isPaid` in `AsyncStorage`, apoi backup in Firestore dupa `userDetails.phone`. Confirmarea server-side exista pentru plata (Stripe PaymentIntent) si facturare (Oblio), dar nu exista un "ledger" unic, server-side, pentru entitlement-uri per user.

Obiectiv: un sistem robust de entitlement-uri care reduce riscul ca utilizatorul sa fi platit dar sa nu mai vada analiza, fara a strica achizitiile istorice si fara sa inlocuim brusc logica veche.

## Principii

- Additive first: nu stergem/mutam date vechi in faza 1.
- Idempotent: orice scriere server-side se poate repeta fara dubluri.
- Backward compatible: UI si backend continua sa functioneze pe achizitiile vechi.
- Recovery-friendly: suport pentru re-instalare / schimbare telefon / logout.

## Probleme actuale (high signal)

- Ownership/entitlement-ul nu este persistat server-side imediat la plata; se bazeaza pe `AsyncStorage` si pe backup ulterior din UI listelor.
- Recuperarea se bazeaza pe `userDetails.phone` (string brut), fara normalizare si fara fallback stabil.
- In unele ecrane, analizele incomplete sunt filtrate si pot "disparea" din lista chiar daca exista.
- PDF-ul este trimis pe email, nu arhivat server-side.

## Faza 1: Hotfix Aditiv (fara migrare)

Scop: zero breaking changes, reducere rapida a riscurilor de "am cumparat dar nu mai vad".

### 1) Data model nou: `purchaseEntitlements` (server-side ledger)

Colecție noua in Firestore, scrisa din Firebase Functions dupa confirmarea platii.

- Document key recomandat: `stripe:<transactionId>`
- Campuri minime:
  - `transactionId` (Stripe PaymentIntent ID)
  - `status`: `authorized` | `captured` | `succeeded` | `failed` (sau un subset clar)
  - `productCode`
  - `createdAt` / `updatedAt` (serverTimestamp)
  - `customer`: `email`, `phone` (raw), `emailLower`, `phoneNormalized`
  - `client`: `platform`, `appVersion` (optional)
  - `analysis`: `analysisId`, `analysisType` (optional in faza 1, dar pregatit)
  - `source`: `legacy=false`

Compatibilitate:
- Nu inlocuieste colecțiile vechi (`analize*`) si nici `AsyncStorage`.
- Pentru achizitii noi, ledgerul devine "source of truth" pentru entitlement.

### 2) Scrierea ledger-ului: cand si unde

Recomandare pragmatica:
- Scrie/actualizeaza `purchaseEntitlements` dupa capturarea cu succes a PaymentIntent (server-side verify).
- Daca flow-ul are `capturePaymentIntent` ca Function, acolo e locul ideal:
  - `capturePaymentIntent` -> verify PI -> capture -> upsert entitlement.

Idempotenta:
- Daca entitlement pentru `stripe:<transactionId>` exista deja, doar update non-destructiv.

### 3) Fixuri de consistenta in client (fara refactor mare)

- Nu seta `isPaid=true` inainte de confirmarea capturii.
- Cand Firestore e indisponibil, UI trebuie sa pastreze fallback la `AsyncStorage` (nu doar lista din Firestore).
- Nu ascunde analize cumparate dar incomplete:
  - in lista: afiseaza "needs recovery / regenerate" in loc sa le filtrezi complet.

### 4) Normalizare identificatori (compatibil)

In toate scrierile noi:
- Salveaza atat `phone` brut, cat si `phoneNormalized` (ex: doar cifre + optional prefix).
- Salveaza `emailLower`.

In toate citirile:
- Cauta in ordine:
  1. `purchaseEntitlements` dupa `ownerUid` (daca exista) sau `emailLower/phoneNormalized`.
  2. Colecțiile vechi dupa `phone` si `phoneNormalized`.
  3. Fallback la `AsyncStorage`.

### 5) Observabilitate

Adauga loguri si metrici simple:
- count entitlement upserts per zi
- mismatch-uri: plata succeeded dar entitlement lipsa
- cazuri recovery manual

### Criterii de succes (Faza 1)

- Utilizator care reinstaleaza app-ul isi poate recupera achizitiile cu minim de frictiune (telefon/email).
- Numarul de tichete suport "am platit dar nu vad" scade.
- Nicio regresie in flow-urile vechi (achizitii existente raman vizibile).

## Faza 2: Backfill/Migrare Istorica (non-distructiv)

Scop: sa populam ledgerul nou pentru achizitiile deja facute, fara a depinde de faptul ca userul mai are `AsyncStorage`.

### 1) Job de backfill (dry-run first)

Surse:
- Colecțiile de backup existente:
  - `analizeAstrogramaNatalaPersonala`
  - `analizeAstrogramaNatalaOthers`
  - `analizeSinastrieOnePerson`
  - `analizeSinastrieOthers`
- Facturi:
  - `oblioInvoices` (daca are `transactionId` si `productCode`)
- Optional (daca exista acces): Stripe API pentru confirmare suplimentara (nu obligatoriu in prima iteratie).

Chei idempotente:
- Daca exista `transactionId`: `stripe:<transactionId>`
- Altfel: `legacy:<collection>:<docId>`

Ce scriem:
- `source.legacy=true`
- `status`: `unknown` / `legacy_imported` (sau alt status explicit)
- `customer.phone`, `customer.email` daca sunt prezente in doc
- `analysis.analysisId = originalId` (acolo unde exista)

### 2) Matching conservator

Nu incercam "deduceri agresive". Matching recomandat:
- `transactionId` exact, daca exista.
- Altfel doar `phoneNormalized` + `emailLower` (ambele) cand sunt prezente.
- Cazurile ambigue:
  - raman fara merge automat
  - se rezolva prin recovery manual (Faza 2.3)

### 3) Recovery manual (support tooling)

Endpoint/admin screen care:
- cauta entitlement-uri dupa `emailLower` / `phoneNormalized`
- poate re-lega entitlement-ul la `ownerUid` cand userul e autentificat
- logheaza orice actiune (audit)

### Criterii de succes (Faza 2)

- Ledgerul nou acopera majoritatea achizitiilor istorice.
- Fallback-ul pe colecțiile vechi este rar folosit.
- Recovery manual rezolva cazurile edge fara modificari de schema in vechi.

## Rollout (recomandare)

1. Deploy Firebase Functions (additive): upsert `purchaseEntitlements`, loguri.
2. Deploy client: citire cu fallback + fix `isPaid` order + "nu filtra complet".
3. Ruleaza backfill in `dry-run` (doar raport).
4. Ruleaza backfill real (idempotent).
5. Monitorizeaza mismatch-uri + suport.
6. Pastreaza fallback-ul vechi minim 2-4 saptamani in productie.

## Non-goals (explicit)

- Nu stergem colecțiile existente de analize.
- Nu schimbam acum formatul analizelor sau modul de generare a continutului.
- Nu garantam recuperarea PDF-ului identic daca a fost livrat doar prin email.

