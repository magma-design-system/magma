## Publish module

Per utilizzare il registro privato bisogna configurare la voce registry nel file package.json.

```json
{
  "name": "@maggioli/npm-app1",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "files": [],
  "publishConfig": {
    "registry": "<url>"
  },
  "repository": {
    "type": "git",
    "url": "http://git.maggioli.it/<url-privato>"
  },
  "keywords": [],
  "author": "",
  "license": "UNLICENSED",
  ...
}
```

Prima di pubblicare è obbligatorio essere collegati con l'utente `nexusupload`.

Per pubblicare il pacchetto posizionarsi nella cartella radice del progetto ed eseguire

```bash
npm publish
```
