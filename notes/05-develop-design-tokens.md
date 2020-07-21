# Develop design tokens

I design token sono essenziali per permettere alla documentazione di essere generata dinamicamente e di espandere in modo dinamico i colori, basati sulle scale di contrasto di [Adobe Leonardo][leonardo]. Esiste una guida introduttiva molto esauriente sul [perché utilizzare Leonardo][leonardo-intro].

La generazione della palette si basa su questo comando:

```
npm run tokens:rebuild-palette
```

A sua volta la palette generata si basa su una configurazione del colore presente nel file json:

```
/design-system/src/style-dictionary/colors.json
```

[leonardo]: https://leonardocolor.io/
[leonardo-intro]: https://medium.com/@NateBaldwin/leonardo-an-open-source-contrast-based-color-generator-92d61b6521d2
