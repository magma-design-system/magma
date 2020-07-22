# Install as dependance

Creare un file `.npmrc` nella radice del progetto con il seguente contenuto

```
registry=<url-group>
```

quindi

```
registry=http://nexus.maggioli.it:8081/repository/npm-group/
```

Assicurarsi di aver effettuato l'autenticazione. come descritto sulla sezione Login.

Installa il design system nel tuo progetto Maggioli:

```
npm install --save-dev @maggioli/design-system
```

Di default npm contolla la dipendenza prima nei repo privati e in fallback su quelli pubblici.

Una volta installato il modulo, questo si porterà dietro alcuni moduli vendor, necessari utilizzare, fonts, icone e reset per il browser.

## Installazione come dipendenza nei progetti

Creare un file .npmrc nella radice del progetto con il seguente contenuto

```
registry=<url-group>
```

quindi

```
registry=http://nexus.maggioli.it:8081/repository/npm-group/
```

Assicurarsi di aver effettuato l’autenticazione. come descritto sulla sezione Login.

Installa il design system nel tuo progetto Maggioli:

```
npm install --save-dev @maggioli/design-system
```

Di default npm contolla la dipendenza prima nei repo privati e in fallback su quelli pubblici.

Una volta installato il modulo, questo si porterà dietro alcuni moduli vendor, necessari utilizzare, fonts, icone e reset per il browser.
