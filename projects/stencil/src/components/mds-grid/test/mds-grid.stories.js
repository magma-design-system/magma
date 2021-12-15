import React, { Fragment } from 'react'
import MdsGrid from '@component/mds-grid/mds-grid'

export default {
  title: 'Layout / Grid',
  component: MdsGrid,
}

export const Default = () =>
  <mds-grid class="gap-4 grid-cols-fit-md">
    <mds-card class="gap-2 bg-label-amaranth-18 shadow-none">
      <mds-text>Il “bonus facciate” è il nuovo sconto fiscale previsto nella Legge di Bilancio 2020 (n.160 del 27 dicembre 2019). Gli interventi, finalizzati al recupero o restauro della facciata esterna, ammessi al beneficio fiscale, sono individuati nella circolare n. 2 del 2020 dell’Agenzia delle Entrate.</mds-text>
      <mds-text>A differenza di altre agevolazioni per gli interventi sugli immobili, per il “bonus facciate” non sono previsti limiti massimi di spesa né un limite massimo di detrazione.</mds-text>
    </mds-card>
    <mds-card class="gap-2 bg-label-yellow-18 shadow-none">
      <mds-text>Possono usufruire della detrazione tutti i contribuenti residenti e non residenti, anche se titolari di reddito d’impresa, che sostengono le spese per l’esecuzione degli interventi agevolati e che possiedono a qualsiasi titolo l’immobile oggetto di intervento.</mds-text>
      <mds-text>L’agevolazione consiste in una detrazione d’imposta, da ripartire in 10 quote annuali costanti, pari al 90% delle spese sostenute nel 2020 per interventi, compresi quelli di sola pulitura o tinteggiatura esterna, finalizzati al recupero o restauro della facciata esterna degli edifici esistenti.</mds-text>
    </mds-card>
    <mds-card class="gap-2 bg-label-green-18 shadow-none">
      <mds-text>L’agevolazione riguarda, in pratica, tutti i lavori effettuati sull’involucro esterno visibile dell’edificio, cioè sulla parte anteriore frontale e principale dell’edificio, sia sugli altri lati dello stabile (intero perimetro esterno).</mds-text>
      <mds-text>Per aver diritto al bonus è necessario che gli edifici siano ubicati nelle zone “A” e “B”, come individuate dal Decreto Ministeriale n. 1444/1968, o in zone a queste assimilabili in base alla normativa e ai regolamenti edilizi comunali.</mds-text>
    </mds-card>
  </mds-grid>
