# Login

### Registri
Di seguito una lista dei registri in uso:

| Consigliato  | Tipo | URL |
|:-:|--|--|
| ❌ | privato | http://nexus.maggioli.it:8081/repository/npm/ |
| ❌ | proxy a npm | http://nexus.maggioli.it:8081/repository/npm-proxy/ |

Repo per utilizzare i moduli node come dipendenze nei progetti

| Consigliato  | Tipo | URL |
|:-:|--|--|
| ✅ | group | http://nexus.maggioli.it:8081/repository/npm-group/ |

 Raggruppa i registri precedenti, da usare per accedere contemporaneamente ai pacchetti pubblici e privati

È ammesso il redeploy.

### Autenticazione

Tabella degli utenti disponibili

| Username | Password | Descrizione |
|-- |-- |-- |
| `nexusUser` | `nexusUser` | Per i download dei pacchetti |
| `nexusupload` | `nexusupload` | Per la pubblicazione dei pacchetti |


Per l'autenticazione è necessario creare il file `.npmrc` con contenuto di seguito.
È consigliabile **non salvare mai** la riga `_auth` in un file nelle cartelle di progetto per non versionarla.

Usare un altro path (Es: `~/.npmrc`).

```
cat > ~/.npmrc
```
Al suo interno, inserire le informazioni necessarie all'autenticazione:

```
registry=<url>
_auth=<hash>
```

Per calcolare l'hash di autenticazione:

```bash
echo -n '<user>:<password>' | openssl base64
```

Per utilizzare le dipendenze con `nexusUser` nel file `.npmrc`
```
registry=http://nexus.maggioli.it:8081/repository/npm-group/
_auth=bmV4dXNVc2VyOm5leHVzVXNlcg==
```

Per utilizzare le dipendenze con `nexusupload` nel file `.npmrc`
```
registry=http://nexus.maggioli.it:8081/repository/npm-group/
_auth=bmV4dXN1cGxvYWQ6bmV4dXN1cGxvYWQ=
```

D'ora in poi, tutte le dipendenze del progetto verranno scaricate attraverso Nexus.

Al momento non è possibile fare login tramite utente `nexusUser` con `npm` a causa delle maiuscole che non sono consentite. Con `yarn` è possibile ma in ogni caso il comando di login non funziona correttamente perché su Nexus non è supportato il token NpmToken generato.

**Si può facilmente risolvere il problema calcolando manualmente l'hash di autenticazione come descritto sopra.**

===

### Non funziona su nexus

Se si desidera fare login e cancellare il file `~/.npmrc` riporto di seguito il comando:

```bash
npm login --registry=<url-group>
```

oppure per fare logout:

```bash
npm logout --registry=<url>
```

Yarn supporta sia `.npmrc` sia un personale `.yarnrc` (sconsigliato).
