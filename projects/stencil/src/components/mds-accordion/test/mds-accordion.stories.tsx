import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';

export default {
  title: 'UI / Structure / Accordion',
  id: 'ui-accordion',
  argTypes: {
    'disable-close': {
      name: 'disableClose',
      type: { name: 'boolean' },
      label: 'Prevents the user from closing the currently open item',
    },
    multiple: {
      type: { name: 'boolean' },
      label: 'Choose if multiple siblings can be opened simultaneously',
    },
  },
};

const Template = (args) => (
  <mds-accordion {...args}>
    <mds-accordion-item label="Blipbug">
      <mds-text>
        Blipbug presenta delle fattezze riconducibili agli insetti nello stadio pre-crisalide. Il
        suo corpo si sviluppa in lunghezza, ed è formato principalmente da tre parti: la sua grande
        testa, il suo collo (molto simile ad un collare), e il corpo vero e proprio. La prima di
        queste è suddivisa in una parte color crema e una parte color denim; dello stesso colore
        sono le appenidici a forma di "V" che si trovano sopra e ai lati della testa. I suoi occhi
        sono enormi e grigi, ed hanno delle sottilissime sopracciglia sopra di essi. Il suo
        "collare", anch'esso color denim, presenta delle "setole" giallo sabbia, con le quali
        percepisce i segnali esterni: stesso colore si presenta nel segmento centrale della sua
        parte inferiore, dove sono presenti un primo paio di zampe crema. Il segmento superiore del
        corpo è bianco e ospita delle zampe anteriori color crema, ed infine, la parte finale, o la
        "coda", è color denim e finisce con un'appendice a "V" un po' piú grossa.
      </mds-text>
    </mds-accordion-item>
    <mds-accordion-item label="Drednaw">
      <mds-text>
        Drednaw è un Pokémon quadrupede simile ad una tartaruga alligatore. Il corpo è
        principalmente di colore turchese così come le zampe cilindriche e tozze, le quali terminano
        con tre unghie allungate e bianche. Sulle zampe anteriori, circa sulla loro metà, spuntanto
        delle protuberanze simili a scaglie di roccia color marroncino, ricorrenti anche nel resto
        del corpo: ad esempio, sul muso c'è una protuberanza a zig-zag che ospita le sue narici;
        sulla coda sono alternate delle scaglie e attorno al guscio c'è una cornice dello stesso
        colore; anche le placche superiori sembrano essere fatte di roccia, ma sono di un colore
        marrone scuro, invece che chiaro. Queste parti rocciose sembrano essere frastagliate, per
        niente levigate. Il suo volto presenta occhi bassi e imbronciati, con delle guance arancioni
        e sporgenti ed una bocca a zig-zag, la cui parte inferiore è simile al beige, colore
        presente anche nelle placche del guscio inferiori, che stavolta fanno vedere la pelle a
        volte grinzosa del Pokémon (in particolare attorno al collo e sulle zampe). Le sue scaglie
        di roccia sono spesso rivolte verso di dietro, dando l'idea di una roccia grezza e non
        liscia e lavorata.
      </mds-text>
    </mds-accordion-item>
    <mds-accordion-item label="Orbeetle">
      <mds-text>
        Orbeetle presenta aspetti comuni ad una coccinella ormai matura. Il suo corpo si sviluppa
        attorno al guscio che è di forma semisferica ed è metallizzato in grigio (lo si può vedere
        in particolare dalla parte inferiore di esso): la sua scocca è rossa, con dei pois denim
        sopra di essa; è bisezionata per permettere di aprirsi e attaccare con degli strani poteri.
        All'estremità del taglio intermedio è incastonato il volto di Orbeetle, il quale presenta
        delle guance bianche con occhi imbronciati celesti, aventi sclere concentriche; sopra di
        essi ci sono due lunghe sopracciglia dorate a forma di "V" e ad incorniciare la faccia del
        Pokémon è una cornice grigia, che finisce, con delle striature, sul naso dello stesso. La
        bocca, assieme alle ginocchia e alla pancia, è rossa. Il suo corpo è piccolo ed è costituito
        da una vita stretta con una bacino largo, da dove si sviluppano due cosce secche ed esili
        per poi finire con appuntiti gambali dorati; le sue braccia sono magre e biforcute, come se
        avessero artigli.
      </mds-text>
    </mds-accordion-item>
    <mds-accordion-item label="Dottler">
      <mds-text>
        Dottler può essere considerato la "crisalide" della linea evolutiva di Blipbug, vista la sua
        forma e il suo comportamento. Presenta un guscio di forma poligonale (molto simile a quella
        di un radar Doppler o di un radome) di color giallo sabbia, con dei pois blu scuro sugli
        spigoli; leggermente in basso è presente la sua faccia di color arancione chiaro, sulla
        quale ci sono degli occhi celesti attorniati da un contorno arancione, da linee sottili e
        nere e da delle appendici blu simili a quelle dei Blipbug. Il Pokémon non sembra essere
        dedito a muoversi se non fosse per le quattro zampette blu scuro su cui cammina.
      </mds-text>
    </mds-accordion-item>
    <mds-accordion-item label="Centiskorch">
      <mds-text>
        Con l'evoluzione Sizzlipede diventa più aggressivo, soprattutto grazie alla sua stazza più
        grande e al suo enorme potenziale. Il corpo diventa più lungo e si "seziona" in dodici
        parti, anche qui un'estremità è la "coda" e l'altra è la testa, queste due parti, assieme
        all'intera parte inferiore del corpo sono del rosso mattone presente nella sua pre-evo,
        mentre le "parti" comprese tra la coda e la testa restano marroni/bordeaux; questa volte,
        dello stesso colore della "schiena" sono le zampe, le quali son diventate più minacciose e
        uncinate, questa volta sono dieci per ogni lato; marrone/bordeaux sono anche delle tenaglie.
        presenti in paia, sulla coda e sulla testa; su queste estremità son presenti quattro sbuffi
        o "baffi" di fuoco. Sulla testa è presente un simbolo arancione chiaro a forma di punto
        esclamativo; stessa gamma cromatica è presente nei segni circolari situati nella zona
        inferiore del corpo, i quali son formati, però, anche da un anello e da un cerchio, più
        interno, di colore giallo sabbia; non sono altro che i punti che Sizzlipede riscalda per
        attaccare e scottare le prede. I suoi occhi sono giallo elettrico con pupille triangolari
        color marrone e rovesciati.
      </mds-text>
    </mds-accordion-item>
  </mds-accordion>
);

const TemplateMultiple = (args) => (
  <mds-accordion {...args}>
    <mds-accordion-item selected label="Blipbug">
      <mds-text>
        Blipbug presenta delle fattezze riconducibili agli insetti nello stadio pre-crisalide. Il
        suo corpo si sviluppa in lunghezza, ed è formato principalmente da tre parti: la sua grande
        testa, il suo collo (molto simile ad un collare), e il corpo vero e proprio. La prima di
        queste è suddivisa in una parte color crema e una parte color denim; dello stesso colore
        sono le appenidici a forma di "V" che si trovano sopra e ai lati della testa. I suoi occhi
        sono enormi e grigi, ed hanno delle sottilissime sopracciglia sopra di essi. Il suo
        "collare", anch'esso color denim, presenta delle "setole" giallo sabbia, con le quali
        percepisce i segnali esterni: stesso colore si presenta nel segmento centrale della sua
        parte inferiore, dove sono presenti un primo paio di zampe crema. Il segmento superiore del
        corpo è bianco e ospita delle zampe anteriori color crema, ed infine, la parte finale, o la
        "coda", è color denim e finisce con un'appendice a "V" un po' piú grossa.
      </mds-text>
    </mds-accordion-item>
    <mds-accordion-item selected label="Drednaw">
      <mds-text>
        Drednaw è un Pokémon quadrupede simile ad una tartaruga alligatore. Il corpo è
        principalmente di colore turchese così come le zampe cilindriche e tozze, le quali terminano
        con tre unghie allungate e bianche. Sulle zampe anteriori, circa sulla loro metà, spuntanto
        delle protuberanze simili a scaglie di roccia color marroncino, ricorrenti anche nel resto
        del corpo: ad esempio, sul muso c'è una protuberanza a zig-zag che ospita le sue narici;
        sulla coda sono alternate delle scaglie e attorno al guscio c'è una cornice dello stesso
        colore; anche le placche superiori sembrano essere fatte di roccia, ma sono di un colore
        marrone scuro, invece che chiaro. Queste parti rocciose sembrano essere frastagliate, per
        niente levigate. Il suo volto presenta occhi bassi e imbronciati, con delle guance arancioni
        e sporgenti ed una bocca a zig-zag, la cui parte inferiore è simile al beige, colore
        presente anche nelle placche del guscio inferiori, che stavolta fanno vedere la pelle a
        volte grinzosa del Pokémon (in particolare attorno al collo e sulle zampe). Le sue scaglie
        di roccia sono spesso rivolte verso di dietro, dando l'idea di una roccia grezza e non
        liscia e lavorata.
      </mds-text>
    </mds-accordion-item>
    <mds-accordion-item selected label="Orbeetle">
      <mds-text>
        Orbeetle presenta aspetti comuni ad una coccinella ormai matura. Il suo corpo si sviluppa
        attorno al guscio che è di forma semisferica ed è metallizzato in grigio (lo si può vedere
        in particolare dalla parte inferiore di esso): la sua scocca è rossa, con dei pois denim
        sopra di essa; è bisezionata per permettere di aprirsi e attaccare con degli strani poteri.
        All'estremità del taglio intermedio è incastonato il volto di Orbeetle, il quale presenta
        delle guance bianche con occhi imbronciati celesti, aventi sclere concentriche; sopra di
        essi ci sono due lunghe sopracciglia dorate a forma di "V" e ad incorniciare la faccia del
        Pokémon è una cornice grigia, che finisce, con delle striature, sul naso dello stesso. La
        bocca, assieme alle ginocchia e alla pancia, è rossa. Il suo corpo è piccolo ed è costituito
        da una vita stretta con una bacino largo, da dove si sviluppano due cosce secche ed esili
        per poi finire con appuntiti gambali dorati; le sue braccia sono magre e biforcute, come se
        avessero artigli.
      </mds-text>
    </mds-accordion-item>
    <mds-accordion-item label="Dottler">
      <mds-text>
        Dottler può essere considerato la "crisalide" della linea evolutiva di Blipbug, vista la sua
        forma e il suo comportamento. Presenta un guscio di forma poligonale (molto simile a quella
        di un radar Doppler o di un radome) di color giallo sabbia, con dei pois blu scuro sugli
        spigoli; leggermente in basso è presente la sua faccia di color arancione chiaro, sulla
        quale ci sono degli occhi celesti attorniati da un contorno arancione, da linee sottili e
        nere e da delle appendici blu simili a quelle dei Blipbug. Il Pokémon non sembra essere
        dedito a muoversi se non fosse per le quattro zampette blu scuro su cui cammina.
      </mds-text>
    </mds-accordion-item>
    <mds-accordion-item label="Centiskorch">
      <mds-text>
        Con l'evoluzione Sizzlipede diventa più aggressivo, soprattutto grazie alla sua stazza più
        grande e al suo enorme potenziale. Il corpo diventa più lungo e si "seziona" in dodici
        parti, anche qui un'estremità è la "coda" e l'altra è la testa, queste due parti, assieme
        all'intera parte inferiore del corpo sono del rosso mattone presente nella sua pre-evo,
        mentre le "parti" comprese tra la coda e la testa restano marroni/bordeaux; questa volte,
        dello stesso colore della "schiena" sono le zampe, le quali son diventate più minacciose e
        uncinate, questa volta sono dieci per ogni lato; marrone/bordeaux sono anche delle tenaglie.
        presenti in paia, sulla coda e sulla testa; su queste estremità son presenti quattro sbuffi
        o "baffi" di fuoco. Sulla testa è presente un simbolo arancione chiaro a forma di punto
        esclamativo; stessa gamma cromatica è presente nei segni circolari situati nella zona
        inferiore del corpo, i quali son formati, però, anche da un anello e da un cerchio, più
        interno, di colore giallo sabbia; non sono altro che i punti che Sizzlipede riscalda per
        attaccare e scottare le prede. I suoi occhi sono giallo elettrico con pupille triangolari
        color marrone e rovesciati.
      </mds-text>
    </mds-accordion-item>
  </mds-accordion>
);

const AddedElementTemplate = (args) => (
  <mds-accordion {...args}>
    <mds-accordion-item label="Blipbug">
      <mds-text>
        Blipbug presenta delle fattezze riconducibili agli insetti nello stadio pre-crisalide. Il
        suo corpo si sviluppa in lunghezza, ed è formato principalmente da tre parti: la sua grande
        testa, il suo collo (molto simile ad un collare), e il corpo vero e proprio. La prima di
        queste è suddivisa in una parte color crema e una parte color denim; dello stesso colore
        sono le appenidici a forma di "V" che si trovano sopra e ai lati della testa. I suoi occhi
        sono enormi e grigi, ed hanno delle sottilissime sopracciglia sopra di essi. Il suo
        "collare", anch'esso color denim, presenta delle "setole" giallo sabbia, con le quali
        percepisce i segnali esterni: stesso colore si presenta nel segmento centrale della sua
        parte inferiore, dove sono presenti un primo paio di zampe crema. Il segmento superiore del
        corpo è bianco e ospita delle zampe anteriori color crema, ed infine, la parte finale, o la
        "coda", è color denim e finisce con un'appendice a "V" un po' piú grossa.
      </mds-text>
    </mds-accordion-item>
    {args.added && (
      <mds-accordion-item label="New element" selected>
        <mds-text>
          Con l'evoluzione Sizzlipede diventa più aggressivo, soprattutto grazie alla sua stazza più
          grande e al suo enorme potenziale. Il corpo diventa più lungo e si "seziona" in dodici
          parti, anche qui un'estremità è la "coda" e l'altra è la testa, queste due parti, assieme
          all'intera parte inferiore del corpo sono del rosso mattone presente nella sua pre-evo,
          mentre le "parti" comprese tra la coda e la testa restano marroni/bordeaux; questa volte,
          dello stesso colore della "schiena" sono le zampe, le quali son diventate più minacciose e
          uncinate, questa volta sono dieci per ogni lato; marrone/bordeaux sono anche delle
          tenaglie. presenti in paia, sulla coda e sulla testa; su queste estremità son presenti
          quattro sbuffi o "baffi" di fuoco. Sulla testa è presente un simbolo arancione chiaro a
          forma di punto esclamativo; stessa gamma cromatica è presente nei segni circolari situati
          nella zona inferiore del corpo, i quali son formati, però, anche da un anello e da un
          cerchio, più interno, di colore giallo sabbia; non sono altro che i punti che Sizzlipede
          riscalda per attaccare e scottare le prede. I suoi occhi sono giallo elettrico con pupille
          triangolari color marrone e rovesciati.
        </mds-text>
      </mds-accordion-item>
    )}
    <mds-accordion-item label="Drednaw">
      <mds-text>
        Drednaw è un Pokémon quadrupede simile ad una tartaruga alligatore. Il corpo è
        principalmente di colore turchese così come le zampe cilindriche e tozze, le quali terminano
        con tre unghie allungate e bianche. Sulle zampe anteriori, circa sulla loro metà, spuntanto
        delle protuberanze simili a scaglie di roccia color marroncino, ricorrenti anche nel resto
        del corpo: ad esempio, sul muso c'è una protuberanza a zig-zag che ospita le sue narici;
        sulla coda sono alternate delle scaglie e attorno al guscio c'è una cornice dello stesso
        colore; anche le placche superiori sembrano essere fatte di roccia, ma sono di un colore
        marrone scuro, invece che chiaro. Queste parti rocciose sembrano essere frastagliate, per
        niente levigate. Il suo volto presenta occhi bassi e imbronciati, con delle guance arancioni
        e sporgenti ed una bocca a zig-zag, la cui parte inferiore è simile al beige, colore
        presente anche nelle placche del guscio inferiori, che stavolta fanno vedere la pelle a
        volte grinzosa del Pokémon (in particolare attorno al collo e sulle zampe). Le sue scaglie
        di roccia sono spesso rivolte verso di dietro, dando l'idea di una roccia grezza e non
        liscia e lavorata.
      </mds-text>
    </mds-accordion-item>
    <mds-accordion-item label="Orbeetle">
      <mds-text>
        Orbeetle presenta aspetti comuni ad una coccinella ormai matura. Il suo corpo si sviluppa
        attorno al guscio che è di forma semisferica ed è metallizzato in grigio (lo si può vedere
        in particolare dalla parte inferiore di esso): la sua scocca è rossa, con dei pois denim
        sopra di essa; è bisezionata per permettere di aprirsi e attaccare con degli strani poteri.
        All'estremità del taglio intermedio è incastonato il volto di Orbeetle, il quale presenta
        delle guance bianche con occhi imbronciati celesti, aventi sclere concentriche; sopra di
        essi ci sono due lunghe sopracciglia dorate a forma di "V" e ad incorniciare la faccia del
        Pokémon è una cornice grigia, che finisce, con delle striature, sul naso dello stesso. La
        bocca, assieme alle ginocchia e alla pancia, è rossa. Il suo corpo è piccolo ed è costituito
        da una vita stretta con una bacino largo, da dove si sviluppano due cosce secche ed esili
        per poi finire con appuntiti gambali dorati; le sue braccia sono magre e biforcute, come se
        avessero artigli.
      </mds-text>
    </mds-accordion-item>
    <mds-accordion-item label="Dottler">
      <mds-text>
        Dottler può essere considerato la "crisalide" della linea evolutiva di Blipbug, vista la sua
        forma e il suo comportamento. Presenta un guscio di forma poligonale (molto simile a quella
        di un radar Doppler o di un radome) di color giallo sabbia, con dei pois blu scuro sugli
        spigoli; leggermente in basso è presente la sua faccia di color arancione chiaro, sulla
        quale ci sono degli occhi celesti attorniati da un contorno arancione, da linee sottili e
        nere e da delle appendici blu simili a quelle dei Blipbug. Il Pokémon non sembra essere
        dedito a muoversi se non fosse per le quattro zampette blu scuro su cui cammina.
      </mds-text>
    </mds-accordion-item>
    <mds-accordion-item label="Centiskorch">
      <mds-text>
        Con l'evoluzione Sizzlipede diventa più aggressivo, soprattutto grazie alla sua stazza più
        grande e al suo enorme potenziale. Il corpo diventa più lungo e si "seziona" in dodici
        parti, anche qui un'estremità è la "coda" e l'altra è la testa, queste due parti, assieme
        all'intera parte inferiore del corpo sono del rosso mattone presente nella sua pre-evo,
        mentre le "parti" comprese tra la coda e la testa restano marroni/bordeaux; questa volte,
        dello stesso colore della "schiena" sono le zampe, le quali son diventate più minacciose e
        uncinate, questa volta sono dieci per ogni lato; marrone/bordeaux sono anche delle tenaglie.
        presenti in paia, sulla coda e sulla testa; su queste estremità son presenti quattro sbuffi
        o "baffi" di fuoco. Sulla testa è presente un simbolo arancione chiaro a forma di punto
        esclamativo; stessa gamma cromatica è presente nei segni circolari situati nella zona
        inferiore del corpo, i quali son formati, però, anche da un anello e da un cerchio, più
        interno, di colore giallo sabbia; non sono altro che i punti che Sizzlipede riscalda per
        attaccare e scottare le prede. I suoi occhi sono giallo elettrico con pupille triangolari
        color marrone e rovesciati.
      </mds-text>
    </mds-accordion-item>
  </mds-accordion>
);

export const Default = {
  render: Template,
};

export const ItemNotClosable = {
  render: Template,

  args: {
    'disable-close': true,
  },
};

export const Multiple = {
  render: TemplateMultiple,

  args: {
    multiple: true,
  },
};

export const DynamicAddedElement = {
  render: AddedElementTemplate,

  args: {
    added: true,
  },
};

/**
 * Every state of the accordion once the story has opened (#1440, @fixture/states), each an
 * accordion of three questions of its own (two regions with one name are two landmarks a screen
 * reader cannot tell apart): all closed, the open item first, in the middle and last (the
 * separators follow its place), several open with `multiple`, and what the accordion decides on
 * a click: one open at a time, several with `multiple`, the open item kept by `disable-close`.
 * The states an item has of its own (the style and the level of its title, the long label, the
 * keys, the focus) are in the story of mds-accordion-item. A state only an interaction reaches
 * (`play: true`) is brought there by the play function, which clicks the button of an item and
 * checks `selected` on each item, not the look.
 */
interface AccordionState {
  state: string;
  play?: boolean;
  multiple?: boolean;
  'disable-close'?: boolean;
  /** the questions, the open ones marked */
  items: { label: string; selected?: boolean }[];
}

const accordionStates: AccordionState[] = [
  {
    state: 'all closed',
    items: [
      { label: 'Come presento la domanda?' },
      { label: 'Quali documenti servono?' },
      { label: 'Quanto costa il servizio?' },
    ],
  },
  {
    state: 'the first open',
    items: [
      { label: 'Chi ha diritto al contributo?', selected: true },
      { label: 'Entro quando si presenta?' },
      { label: "Come ricevo l'esito?" },
    ],
  },
  {
    state: 'the middle one open',
    items: [
      { label: "Posso delegare un'altra persona?" },
      { label: 'Come firmo i documenti?', selected: true },
      { label: 'Dove trovo la ricevuta?' },
    ],
  },
  {
    state: 'the last open',
    items: [
      { label: 'Come modifico una domanda inviata?' },
      { label: 'Posso ritirare la domanda?' },
      { label: 'Chi contatto per assistenza?', selected: true },
    ],
  },
  {
    state: 'multiple, two next to each other open',
    multiple: true,
    items: [
      { label: 'Quali sono i requisiti di reddito?', selected: true },
      { label: "Come calcolo l'ISEE?", selected: true },
      { label: 'Serve la marca da bollo?' },
    ],
  },
  {
    state: 'multiple, all open',
    multiple: true,
    items: [
      { label: 'Come pago i diritti di segreteria?', selected: true },
      { label: 'Posso pagare con pagoPA?', selected: true },
      { label: 'Quando arriva il rimborso?', selected: true },
    ],
  },
  {
    state: 'another opened by a click closes the open one',
    play: true,
    items: [
      { label: 'Come scarico il modulo?', selected: true },
      { label: 'Come allego un file?' },
      { label: 'Quali formati sono accettati?' },
    ],
  },
  {
    state: 'multiple, another opened by a click',
    play: true,
    multiple: true,
    items: [
      { label: "Quanto dura l'istruttoria?", selected: true },
      { label: 'Posso sollecitare la pratica?' },
      { label: 'Come vengo avvisato?' },
    ],
  },
  {
    state: 'disable-close, the open one clicked stays open',
    play: true,
    'disable-close': true,
    items: [
      { label: 'Come accedo con SPID?', selected: true },
      { label: 'Posso usare la CIE?' },
      { label: 'Cosa faccio se ho perso le credenziali?' },
    ],
  },
  {
    state: 'multiple and disable-close, the last open one clicked stays open',
    play: true,
    multiple: true,
    'disable-close': true,
    items: [
      { label: "Dove si trova l'ufficio?" },
      { label: 'Quali sono gli orari di apertura?', selected: true },
      { label: 'Serve un appuntamento?' },
    ],
  },
];

const TemplateStates = () => (
  <StatesGrid>
    {accordionStates.map(({ state, play, items, ...accordion }) => (
      <StateCell key={state} state={state} play={play}>
        <mds-accordion {...accordion}>
          {items.map((item) => (
            <mds-accordion-item key={item.label} {...item}>
              <mds-text>La risposta, con i passi da seguire e i riferimenti utili.</mds-text>
            </mds-accordion-item>
          ))}
        </mds-accordion>
      </StateCell>
    ))}
  </StatesGrid>
);

/** The items of a cell, once every Magma element of the cell has loaded. */
const loadedItems = async (canvasElement: HTMLElement, state: string) => {
  const cell = stateCell(canvasElement, state);
  const elements = Array.from(cell.querySelectorAll('*')).filter((element) =>
    element.tagName.startsWith('MDS-'),
  );
  await waitFor(() => elements.forEach((element) => expect(element).toHaveAttribute('hydrated')));
  return Array.from(cell.querySelectorAll('mds-accordion-item')) as HTMLMdsAccordionItemElement[];
};

/** A click on the button of an item, in its shadow root: the host does not listen to it. */
const click = (item: HTMLMdsAccordionItemElement) =>
  (item.shadowRoot!.querySelector('button.action') as HTMLButtonElement).click();

/** The open items of a cell, as `selected` says. */
const opened = (items: HTMLMdsAccordionItemElement[]) =>
  items.map((item) => item.selected === true);

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const single = await loadedItems(canvasElement, 'another opened by a click closes the open one');
  click(single[1]);
  const multiple = await loadedItems(canvasElement, 'multiple, another opened by a click');
  click(multiple[1]);
  const kept = await loadedItems(canvasElement, 'disable-close, the open one clicked stays open');
  click(kept[0]);
  const keptMultiple = await loadedItems(
    canvasElement,
    'multiple and disable-close, the last open one clicked stays open',
  );
  click(keptMultiple[1]);

  // the property, not the attribute: Stencil reflects it on the next frame, and a hidden page
  // draws no frame
  await waitFor(() => expect(opened(single)).toEqual([false, true, false]));
  await waitFor(() => expect(opened(multiple)).toEqual([true, true, false]));
  await waitFor(() => expect(opened(kept)).toEqual([true, false, false]));
  await waitFor(() => expect(opened(keptMultiple)).toEqual([false, true, false]));
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
