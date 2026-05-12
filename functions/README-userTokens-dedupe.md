# `userTokens` dedupe script

Script local, one-off, pentru curatarea documentelor duplicate din colectia `userTokens`.

Curatarea este sigura prin:
- `dry-run` implicit
- `--apply` necesar pentru stergere
- pastrarea unui singur document per token
- completarea doar a campurilor lipsa: `language`, `isIos`, `projectId`

Scriptul curata duplicatele existente acum. Nu previne duplicate noi in viitor.

## Prerequisites

1. Ruleaza comenzile din folderul `functions/`
2. Asigura-te ca dependintele sunt instalate:

```bash
npm install
```

3. Seteaza credentialele locale pentru Admin SDK:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

Credentialul nu trebuie tinut in repo.

## Important

Ruleaza mereu intai `dry-run` si verifica rezultatul in terminal inainte de `--apply`.

## Exact commands

Dry run pentru toate duplicatele:

```bash
cd functions
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
node scripts/dedupe-userTokens.js
```

Dry run pentru un singur token:

```bash
cd functions
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
node scripts/dedupe-userTokens.js --token "ExponentPushToken[YOUR_TOKEN_HERE]"
```

Apply pentru un singur token:

```bash
cd functions
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
node scripts/dedupe-userTokens.js --apply --token "ExponentPushToken[YOUR_TOKEN_HERE]"
```

Apply pentru toate duplicatele:

```bash
cd functions
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
node scripts/dedupe-userTokens.js --apply
```

## Optional flags

Limiteaza cate grupuri duplicate sunt procesate:

```bash
node scripts/dedupe-userTokens.js --limit 10
```

Schimba page size-ul de scanare:

```bash
node scripts/dedupe-userTokens.js --page-size 300
```

## Ce face scriptul

- scaneaza `userTokens` paginat
- grupeaza documentele dupa `token.trim()`
- sare peste documentele cu `token` invalid
- alege un singur document canon pentru fiecare token duplicat
- completeaza doar campurile lipsa din documentul pastrat
- sterge celelalte documente duplicate doar cu `--apply`
- afiseaza un sumar clar la final
