import { h } from '@stencil/core'

export default {
  title: 'UI / Accordion',
  argTypes: {
    multiple: {
      type: { name: 'boolean' },
      description: 'Choose if multiple siblings can be opened simultaneously',
    },
  },
}

const Template = args =>
  <mds-accordion {...args}>
    <mds-accordion-item description="Blipbug">
      <mds-text>Blipbug presenta delle fattezze riconducibili agli insetti nello stadio pre-crisalide. Il suo corpo si sviluppa in lunghezza, ed è formato principalmente da tre parti: la sua grande testa, il suo collo (molto simile ad un collare), e il corpo vero e proprio. La prima di queste è suddivisa in una parte color crema e una parte color denim; dello stesso colore sono le appenidici a forma di "V" che si trovano sopra e ai lati della testa. I suoi occhi sono enormi e grigi, ed hanno delle sottilissime sopracciglia sopra di essi. Il suo "collare", anch'esso color denim, presenta delle "setole" giallo sabbia, con le quali percepisce i segnali esterni: stesso colore si presenta nel segmento centrale della sua parte inferiore, dove sono presenti un primo paio di zampe crema. Il segmento superiore del corpo è bianco e ospita delle zampe anteriori color crema, ed infine, la parte finale, o la "coda", è color denim e finisce con un'appendice a "V" un po' piú grossa.</mds-text>
    </mds-accordion-item>
    <mds-accordion-item description="Drednaw">
      <mds-text>Drednaw è un Pokémon quadrupede simile ad una tartaruga alligatore. Il corpo è principalmente di colore turchese così come le zampe cilindriche e tozze, le quali terminano con tre unghie allungate e bianche. Sulle zampe anteriori, circa sulla loro metà, spuntanto delle protuberanze simili a scaglie di roccia color marroncino, ricorrenti anche nel resto del corpo: ad esempio, sul muso c'è una protuberanza a zig-zag che ospita le sue narici; sulla coda sono alternate delle scaglie e attorno al guscio c'è una cornice dello stesso colore; anche le placche superiori sembrano essere fatte di roccia, ma sono di un colore marrone scuro, invece che chiaro. Queste parti rocciose sembrano essere frastagliate, per niente levigate. Il suo volto presenta occhi bassi e imbronciati, con delle guance arancioni e sporgenti ed una bocca a zig-zag, la cui parte inferiore è simile al beige, colore presente anche nelle placche del guscio inferiori, che stavolta fanno vedere la pelle a volte grinzosa del Pokémon (in particolare attorno al collo e sulle zampe). Le sue scaglie di roccia sono spesso rivolte verso di dietro, dando l'idea di una roccia grezza e non liscia e lavorata.</mds-text>
    </mds-accordion-item>
    <mds-accordion-item description="Orbeetle">
      <mds-text>Orbeetle presenta aspetti comuni ad una coccinella ormai matura. Il suo corpo si sviluppa attorno al guscio che è di forma semisferica ed è metallizzato in grigio (lo si può vedere in particolare dalla parte inferiore di esso): la sua scocca è rossa, con dei pois denim sopra di essa; è bisezionata per permettere di aprirsi e attaccare con degli strani poteri. All'estremità del taglio intermedio è incastonato il volto di Orbeetle, il quale presenta delle guance bianche con occhi imbronciati celesti, aventi sclere concentriche; sopra di essi ci sono due lunghe sopracciglia dorate a forma di "V" e ad incorniciare la faccia del Pokémon è una cornice grigia, che finisce, con delle striature, sul naso dello stesso. La bocca, assieme alle ginocchia e alla pancia, è rossa. Il suo corpo è piccolo ed è costituito da una vita stretta con una bacino largo, da dove si sviluppano due cosce secche ed esili per poi finire con appuntiti gambali dorati; le sue braccia sono magre e biforcute, come se avessero artigli.</mds-text>
    </mds-accordion-item>
    <mds-accordion-item description="Dottler">
      <mds-text>Dottler può essere considerato la "crisalide" della linea evolutiva di Blipbug, vista la sua forma e il suo comportamento. Presenta un guscio di forma poligonale (molto simile a quella di un radar Doppler o di un radome) di color giallo sabbia, con dei pois blu scuro sugli spigoli; leggermente in basso è presente la sua faccia di color arancione chiaro, sulla quale ci sono degli occhi celesti attorniati da un contorno arancione, da linee sottili e nere e da delle appendici blu simili a quelle dei Blipbug. Il Pokémon non sembra essere dedito a muoversi se non fosse per le quattro zampette blu scuro su cui cammina.</mds-text>
    </mds-accordion-item>
    <mds-accordion-item description="Centiskorch">
      <mds-text>Con l'evoluzione Sizzlipede diventa più aggressivo, soprattutto grazie alla sua stazza più grande e al suo enorme potenziale. Il corpo diventa più lungo e si "seziona" in dodici parti, anche qui un'estremità è la "coda" e l'altra è la testa, queste due parti, assieme all'intera parte inferiore del corpo sono del rosso mattone presente nella sua pre-evo, mentre le "parti" comprese tra la coda e la testa restano marroni/bordeaux; questa volte, dello stesso colore della "schiena" sono le zampe, le quali son diventate più minacciose e uncinate, questa volta sono dieci per ogni lato; marrone/bordeaux sono anche delle tenaglie. presenti in paia, sulla coda e sulla testa; su queste estremità son presenti quattro sbuffi o "baffi" di fuoco. Sulla testa è presente un simbolo arancione chiaro a forma di punto esclamativo; stessa gamma cromatica è presente nei segni circolari situati nella zona inferiore del corpo, i quali son formati, però, anche da un anello e da un cerchio, più interno, di colore giallo sabbia; non sono altro che i punti che Sizzlipede riscalda per attaccare e scottare le prede. I suoi occhi sono giallo elettrico con pupille triangolari color marrone e rovesciati.</mds-text>
    </mds-accordion-item>
  </mds-accordion>

export const Default = Template.bind({})
// console.log(Default)

export const Multiple = Template.bind({})
Multiple.args = {
  multiple: true,
}
