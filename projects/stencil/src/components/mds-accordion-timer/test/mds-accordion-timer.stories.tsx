import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';

export default {
  title: 'UI / Structure / Accordion Timer',
  id: 'ui-accordion-timer',
  argTypes: {
    duration: {
      type: { name: 'number' },
      description: 'Sets the duration of the single accordion item',
    },
    paused: {
      type: { name: 'boolean' },
      description: 'When paused is defined, the timer stops run',
    },
  },
};

const Template = (args) => (
  <div>
    <mds-accordion-timer {...args}>
      <mds-accordion-timer-item selected description="Blipbug">
        <mds-text>
          Blipbug presenta delle fattezze riconducibili agli insetti nello stadio pre-crisalide. Il
          suo corpo si sviluppa in lunghezza, ed è formato principalmente da tre parti: la sua
          grande testa, il suo collo (molto simile ad un collare), e il corpo vero e proprio. La
          prima di queste è suddivisa in una parte color crema e una parte color denim; dello stesso
          colore sono le appenidici a forma di "V" che si trovano sopra e ai lati della testa. I
          suoi occhi sono enormi e grigi, ed hanno delle sottilissime sopracciglia sopra di essi. Il
          suo "collare", anch'esso color denim, presenta delle "setole" giallo sabbia, con le quali
          percepisce i segnali esterni: stesso colore si presenta nel segmento centrale della sua
          parte inferiore, dove sono presenti un primo paio di zampe crema. Il segmento superiore
          del corpo è bianco e ospita delle zampe anteriori color crema, ed infine, la parte finale,
          o la "coda", è color denim e finisce con un'appendice a "V" un po' piú grossa.
        </mds-text>
      </mds-accordion-timer-item>
      <mds-accordion-timer-item description="Drednaw">
        <mds-text>
          Drednaw è un Pokémon quadrupede simile ad una tartaruga alligatore. Il corpo è
          principalmente di colore turchese così come le zampe cilindriche e tozze, le quali
          terminano con tre unghie allungate e bianche. Sulle zampe anteriori, circa sulla loro
          metà, spuntanto delle protuberanze simili a scaglie di roccia color marroncino, ricorrenti
          anche nel resto del corpo: ad esempio, sul muso c'è una protuberanza a zig-zag che ospita
          le sue narici; sulla coda sono alternate delle scaglie e attorno al guscio c'è una cornice
          dello stesso colore; anche le placche superiori sembrano essere fatte di roccia, ma sono
          di un colore marrone scuro, invece che chiaro. Queste parti rocciose sembrano essere
          frastagliate, per niente levigate. Il suo volto presenta occhi bassi e imbronciati, con
          delle guance arancioni e sporgenti ed una bocca a zig-zag, la cui parte inferiore è simile
          al beige, colore presente anche nelle placche del guscio inferiori, che stavolta fanno
          vedere la pelle a volte grinzosa del Pokémon (in particolare attorno al collo e sulle
          zampe). Le sue scaglie di roccia sono spesso rivolte verso di dietro, dando l'idea di una
          roccia grezza e non liscia e lavorata.
        </mds-text>
      </mds-accordion-timer-item>
      <mds-accordion-timer-item description="Orbeetle">
        <mds-text>
          Orbeetle presenta aspetti comuni ad una coccinella ormai matura. Il suo corpo si sviluppa
          attorno al guscio che è di forma semisferica ed è metallizzato in grigio (lo si può vedere
          in particolare dalla parte inferiore di esso): la sua scocca è rossa, con dei pois denim
          sopra di essa; è bisezionata per permettere di aprirsi e attaccare con degli strani
          poteri. All'estremità del taglio intermedio è incastonato il volto di Orbeetle, il quale
          presenta delle guance bianche con occhi imbronciati celesti, aventi sclere concentriche;
          sopra di essi ci sono due lunghe sopracciglia dorate a forma di "V" e ad incorniciare la
          faccia del Pokémon è una cornice grigia, che finisce, con delle striature, sul naso dello
          stesso. La bocca, assieme alle ginocchia e alla pancia, è rossa. Il suo corpo è piccolo ed
          è costituito da una vita stretta con una bacino largo, da dove si sviluppano due cosce
          secche ed esili per poi finire con appuntiti gambali dorati; le sue braccia sono magre e
          biforcute, come se avessero artigli.
        </mds-text>
      </mds-accordion-timer-item>
      <mds-accordion-timer-item description="Dottler">
        <mds-text>
          Dottler può essere considerato la "crisalide" della linea evolutiva di Blipbug, vista la
          sua forma e il suo comportamento. Presenta un guscio di forma poligonale (molto simile a
          quella di un radar Doppler o di un radome) di color giallo sabbia, con dei pois blu scuro
          sugli spigoli; leggermente in basso è presente la sua faccia di color arancione chiaro,
          sulla quale ci sono degli occhi celesti attorniati da un contorno arancione, da linee
          sottili e nere e da delle appendici blu simili a quelle dei Blipbug. Il Pokémon non sembra
          essere dedito a muoversi se non fosse per le quattro zampette blu scuro su cui cammina.
        </mds-text>
      </mds-accordion-timer-item>
      <mds-accordion-timer-item description="Centiskorch">
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
      </mds-accordion-timer-item>
    </mds-accordion-timer>
  </div>
);

const TemplateVariableDuration = (args) => (
  <div>
    <mds-accordion-timer {...args}>
      <mds-accordion-timer-item selected description="Blipbug" duration={2000}>
        <mds-text>
          Blipbug presenta delle fattezze riconducibili agli insetti nello stadio pre-crisalide. Il
          suo corpo si sviluppa in lunghezza, ed è formato principalmente da tre parti: la sua
          grande testa, il suo collo (molto simile ad un collare), e il corpo vero e proprio. La
          prima di queste è suddivisa in una parte color crema e una parte color denim; dello stesso
          colore sono le appenidici a forma di "V" che si trovano sopra e ai lati della testa. I
          suoi occhi sono enormi e grigi, ed hanno delle sottilissime sopracciglia sopra di essi. Il
          suo "collare", anch'esso color denim, presenta delle "setole" giallo sabbia, con le quali
          percepisce i segnali esterni: stesso colore si presenta nel segmento centrale della sua
          parte inferiore, dove sono presenti un primo paio di zampe crema. Il segmento superiore
          del corpo è bianco e ospita delle zampe anteriori color crema, ed infine, la parte finale,
          o la "coda", è color denim e finisce con un'appendice a "V" un po' piú grossa.
        </mds-text>
      </mds-accordion-timer-item>
      <mds-accordion-timer-item description="Drednaw" duration={6000}>
        <mds-text>
          Drednaw è un Pokémon quadrupede simile ad una tartaruga alligatore. Il corpo è
          principalmente di colore turchese così come le zampe cilindriche e tozze, le quali
          terminano con tre unghie allungate e bianche. Sulle zampe anteriori, circa sulla loro
          metà, spuntanto delle protuberanze simili a scaglie di roccia color marroncino, ricorrenti
          anche nel resto del corpo: ad esempio, sul muso c'è una protuberanza a zig-zag che ospita
          le sue narici; sulla coda sono alternate delle scaglie e attorno al guscio c'è una cornice
          dello stesso colore; anche le placche superiori sembrano essere fatte di roccia, ma sono
          di un colore marrone scuro, invece che chiaro. Queste parti rocciose sembrano essere
          frastagliate, per niente levigate. Il suo volto presenta occhi bassi e imbronciati, con
          delle guance arancioni e sporgenti ed una bocca a zig-zag, la cui parte inferiore è simile
          al beige, colore presente anche nelle placche del guscio inferiori, che stavolta fanno
          vedere la pelle a volte grinzosa del Pokémon (in particolare attorno al collo e sulle
          zampe). Le sue scaglie di roccia sono spesso rivolte verso di dietro, dando l'idea di una
          roccia grezza e non liscia e lavorata.
        </mds-text>
      </mds-accordion-timer-item>
      <mds-accordion-timer-item description="Orbeetle" duration={1000}>
        <mds-text>
          Orbeetle presenta aspetti comuni ad una coccinella ormai matura. Il suo corpo si sviluppa
          attorno al guscio che è di forma semisferica ed è metallizzato in grigio (lo si può vedere
          in particolare dalla parte inferiore di esso): la sua scocca è rossa, con dei pois denim
          sopra di essa; è bisezionata per permettere di aprirsi e attaccare con degli strani
          poteri. All'estremità del taglio intermedio è incastonato il volto di Orbeetle, il quale
          presenta delle guance bianche con occhi imbronciati celesti, aventi sclere concentriche;
          sopra di essi ci sono due lunghe sopracciglia dorate a forma di "V" e ad incorniciare la
          faccia del Pokémon è una cornice grigia, che finisce, con delle striature, sul naso dello
          stesso. La bocca, assieme alle ginocchia e alla pancia, è rossa. Il suo corpo è piccolo ed
          è costituito da una vita stretta con una bacino largo, da dove si sviluppano due cosce
          secche ed esili per poi finire con appuntiti gambali dorati; le sue braccia sono magre e
          biforcute, come se avessero artigli.
        </mds-text>
      </mds-accordion-timer-item>
      <mds-accordion-timer-item description="Dottler">
        <mds-text>
          Dottler può essere considerato la "crisalide" della linea evolutiva di Blipbug, vista la
          sua forma e il suo comportamento. Presenta un guscio di forma poligonale (molto simile a
          quella di un radar Doppler o di un radome) di color giallo sabbia, con dei pois blu scuro
          sugli spigoli; leggermente in basso è presente la sua faccia di color arancione chiaro,
          sulla quale ci sono degli occhi celesti attorniati da un contorno arancione, da linee
          sottili e nere e da delle appendici blu simili a quelle dei Blipbug. Il Pokémon non sembra
          essere dedito a muoversi se non fosse per le quattro zampette blu scuro su cui cammina.
        </mds-text>
      </mds-accordion-timer-item>
      <mds-accordion-timer-item description="Centiskorch" duration={6000}>
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
      </mds-accordion-timer-item>
    </mds-accordion-timer>
  </div>
);

const TemplateClickPaused = (args) => {
  const startSecond = () => {
    const elements = document.querySelectorAll('mds-accordion-timer-item');

    const elemSecond = elements[1];
    elemSecond.selected = true;
  };
  return (
    <div>
      <div>
        <mds-button onClick={startSecond}>Start second element</mds-button>
      </div>
      <mds-accordion-timer {...args}>
        <mds-accordion-timer-item selected description="Blipbug">
          <mds-text>
            Blipbug presenta delle fattezze riconducibili agli insetti nello stadio pre-crisalide.
            Il suo corpo si sviluppa in lunghezza, ed è formato principalmente da tre parti: la sua
            grande testa, il suo collo (molto simile ad un collare), e il corpo vero e proprio. La
            prima di queste è suddivisa in una parte color crema e una parte color denim; dello
            stesso colore sono le appenidici a forma di "V" che si trovano sopra e ai lati della
            testa. I suoi occhi sono enormi e grigi, ed hanno delle sottilissime sopracciglia sopra
            di essi. Il suo "collare", anch'esso color denim, presenta delle "setole" giallo sabbia,
            con le quali percepisce i segnali esterni: stesso colore si presenta nel segmento
            centrale della sua parte inferiore, dove sono presenti un primo paio di zampe crema. Il
            segmento superiore del corpo è bianco e ospita delle zampe anteriori color crema, ed
            infine, la parte finale, o la "coda", è color denim e finisce con un'appendice a "V" un
            po' piú grossa.
          </mds-text>
        </mds-accordion-timer-item>
        <mds-accordion-timer-item description="Drednaw">
          <mds-text>
            Drednaw è un Pokémon quadrupede simile ad una tartaruga alligatore. Il corpo è
            principalmente di colore turchese così come le zampe cilindriche e tozze, le quali
            terminano con tre unghie allungate e bianche. Sulle zampe anteriori, circa sulla loro
            metà, spuntanto delle protuberanze simili a scaglie di roccia color marroncino,
            ricorrenti anche nel resto del corpo: ad esempio, sul muso c'è una protuberanza a
            zig-zag che ospita le sue narici; sulla coda sono alternate delle scaglie e attorno al
            guscio c'è una cornice dello stesso colore; anche le placche superiori sembrano essere
            fatte di roccia, ma sono di un colore marrone scuro, invece che chiaro. Queste parti
            rocciose sembrano essere frastagliate, per niente levigate. Il suo volto presenta occhi
            bassi e imbronciati, con delle guance arancioni e sporgenti ed una bocca a zig-zag, la
            cui parte inferiore è simile al beige, colore presente anche nelle placche del guscio
            inferiori, che stavolta fanno vedere la pelle a volte grinzosa del Pokémon (in
            particolare attorno al collo e sulle zampe). Le sue scaglie di roccia sono spesso
            rivolte verso di dietro, dando l'idea di una roccia grezza e non liscia e lavorata.
          </mds-text>
        </mds-accordion-timer-item>
        <mds-accordion-timer-item description="Orbeetle">
          <mds-text>
            Orbeetle presenta aspetti comuni ad una coccinella ormai matura. Il suo corpo si
            sviluppa attorno al guscio che è di forma semisferica ed è metallizzato in grigio (lo si
            può vedere in particolare dalla parte inferiore di esso): la sua scocca è rossa, con dei
            pois denim sopra di essa; è bisezionata per permettere di aprirsi e attaccare con degli
            strani poteri. All'estremità del taglio intermedio è incastonato il volto di Orbeetle,
            il quale presenta delle guance bianche con occhi imbronciati celesti, aventi sclere
            concentriche; sopra di essi ci sono due lunghe sopracciglia dorate a forma di "V" e ad
            incorniciare la faccia del Pokémon è una cornice grigia, che finisce, con delle
            striature, sul naso dello stesso. La bocca, assieme alle ginocchia e alla pancia, è
            rossa. Il suo corpo è piccolo ed è costituito da una vita stretta con una bacino largo,
            da dove si sviluppano due cosce secche ed esili per poi finire con appuntiti gambali
            dorati; le sue braccia sono magre e biforcute, come se avessero artigli.
          </mds-text>
        </mds-accordion-timer-item>
        <mds-accordion-timer-item description="Dottler">
          <mds-text>
            Dottler può essere considerato la "crisalide" della linea evolutiva di Blipbug, vista la
            sua forma e il suo comportamento. Presenta un guscio di forma poligonale (molto simile a
            quella di un radar Doppler o di un radome) di color giallo sabbia, con dei pois blu
            scuro sugli spigoli; leggermente in basso è presente la sua faccia di color arancione
            chiaro, sulla quale ci sono degli occhi celesti attorniati da un contorno arancione, da
            linee sottili e nere e da delle appendici blu simili a quelle dei Blipbug. Il Pokémon
            non sembra essere dedito a muoversi se non fosse per le quattro zampette blu scuro su
            cui cammina.
          </mds-text>
        </mds-accordion-timer-item>
        <mds-accordion-timer-item description="Centiskorch">
          <mds-text>
            Con l'evoluzione Sizzlipede diventa più aggressivo, soprattutto grazie alla sua stazza
            più grande e al suo enorme potenziale. Il corpo diventa più lungo e si "seziona" in
            dodici parti, anche qui un'estremità è la "coda" e l'altra è la testa, queste due parti,
            assieme all'intera parte inferiore del corpo sono del rosso mattone presente nella sua
            pre-evo, mentre le "parti" comprese tra la coda e la testa restano marroni/bordeaux;
            questa volte, dello stesso colore della "schiena" sono le zampe, le quali son diventate
            più minacciose e uncinate, questa volta sono dieci per ogni lato; marrone/bordeaux sono
            anche delle tenaglie. presenti in paia, sulla coda e sulla testa; su queste estremità
            son presenti quattro sbuffi o "baffi" di fuoco. Sulla testa è presente un simbolo
            arancione chiaro a forma di punto esclamativo; stessa gamma cromatica è presente nei
            segni circolari situati nella zona inferiore del corpo, i quali son formati, però, anche
            da un anello e da un cerchio, più interno, di colore giallo sabbia; non sono altro che i
            punti che Sizzlipede riscalda per attaccare e scottare le prede. I suoi occhi sono
            giallo elettrico con pupille triangolari color marrone e rovesciati.
          </mds-text>
        </mds-accordion-timer-item>
      </mds-accordion-timer>
    </div>
  );
};

export const Default = {
  render: Template,
};

export const Duration = {
  render: Template,

  args: {
    duration: 1000,
  },
};

export const VariableDuration = {
  render: TemplateVariableDuration,

  args: {
    duration: 3000,
  },
};

export const Paused = {
  render: Template,

  args: {
    paused: true,
  },
};

export const Programmatic = {
  render: TemplateClickPaused,

  args: {
    paused: true,
  },
};

/**
 * Every state of the timer once the story has opened (#1440, @fixture/states), each a timer of
 * three items of its own (two regions with one name are two landmarks a screen reader cannot
 * tell apart). The picture holds: a timer runs only while an item is open and it is not
 * `paused`, so every timer here is idle or paused once the play is over, and the countdown of a
 * long `duration` (ten minutes) shows no progress in the moment a play lets it run. Idle with no
 * item open, paused on the first item, the rotation to the next item when the countdown of the
 * open one ends (a first item of 300 ms), and the countdown moved to another item by a click or
 * from code, which clear `paused` (the play pauses the timer again once it has checked it). The
 * states an item has of its own (the countdown on its bar, the style and the level of its title,
 * the long description, the focus) are in the story of mds-accordion-timer-item, and the pause
 * under the pointer needs a real pointer, which a play does not move. A state only an
 * interaction reaches (`play: true`) is brought there by the play function, which checks
 * `selected` and `paused`, not the look.
 */
interface TimerState {
  state: string;
  play?: boolean;
  paused?: boolean;
  duration?: number;
  /** the items, the open one marked, with the duration of their own */
  items: { description: string; selected?: boolean; duration?: number }[];
}

// ten minutes: what a play lets run of it does not move the bar
const long = 600000;

const timerStates: TimerState[] = [
  {
    state: 'idle, no item open',
    items: [
      { description: 'Firma digitale remota' },
      { description: 'Conservazione sostitutiva' },
      { description: 'Protocollo in uscita' },
    ],
  },
  {
    state: 'paused on the first item',
    paused: true,
    items: [
      { description: 'Pagamenti spontanei', selected: true },
      { description: 'Avvisi di pagamento' },
      { description: 'Rendicontazione degli incassi' },
    ],
  },
  {
    state: 'the next item opened when the countdown ends',
    play: true,
    items: [
      { description: 'Richiesta del certificato', selected: true, duration: 300 },
      { description: 'Verifica dei dati', duration: long },
      { description: 'Rilascio del documento', duration: long },
    ],
  },
  {
    state: 'the countdown moved to another item by a click',
    play: true,
    paused: true,
    duration: long,
    items: [
      { description: 'Iscrizione al nido', selected: true },
      { description: 'Mensa scolastica' },
      { description: 'Trasporto scolastico' },
    ],
  },
  {
    state: 'the countdown moved to another item from code',
    play: true,
    paused: true,
    duration: long,
    items: [
      { description: 'Segnalazioni al Comune', selected: true },
      { description: 'Prenotazione degli appuntamenti' },
      { description: 'Accesso agli atti' },
    ],
  },
];

const TemplateStates = () => (
  <StatesGrid>
    {timerStates.map(({ state, play, items, ...timer }) => (
      <StateCell key={state} state={state} play={play}>
        <mds-accordion-timer {...timer}>
          {items.map((item) => (
            <mds-accordion-timer-item key={item.description} {...item}>
              <mds-text>Una breve descrizione del servizio e di cosa permette di fare.</mds-text>
            </mds-accordion-timer-item>
          ))}
        </mds-accordion-timer>
      </StateCell>
    ))}
  </StatesGrid>
);

/** The timer of a cell and its items, once every Magma element of the cell has loaded. */
const loadedTimer = async (canvasElement: HTMLElement, state: string) => {
  const cell = stateCell(canvasElement, state);
  const elements = Array.from(cell.querySelectorAll('*')).filter((element) =>
    element.tagName.startsWith('MDS-'),
  );
  await waitFor(() => elements.forEach((element) => expect(element).toHaveAttribute('hydrated')));
  const timer = cell.querySelector('mds-accordion-timer') as HTMLMdsAccordionTimerElement;
  const items = Array.from(
    cell.querySelectorAll('mds-accordion-timer-item'),
  ) as HTMLMdsAccordionTimerItemElement[];
  return { timer, items };
};

/** The open items of a timer, as `selected` says. */
const opened = (items: HTMLMdsAccordionTimerItemElement[]) =>
  items.map((item) => item.selected === true);

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  // the button in the shadow root of the item listens to the click, not the host
  const clicked = await loadedTimer(
    canvasElement,
    'the countdown moved to another item by a click',
  );
  (clicked.items[2].shadowRoot!.querySelector('button.action') as HTMLButtonElement).click();
  const code = await loadedTimer(canvasElement, 'the countdown moved to another item from code');
  code.items[1].selected = true;
  const next = await loadedTimer(canvasElement, 'the next item opened when the countdown ends');

  // the property, not the attribute: Stencil reflects it on the next frame, and a hidden page
  // draws no frame
  await waitFor(() => expect(opened(clicked.items)).toEqual([false, false, true]));
  await waitFor(() => expect(opened(code.items)).toEqual([false, true, false]));
  await waitFor(() => expect(opened(next.items)).toEqual([false, true, false]), {
    timeout: 3000,
  });

  // a click and a selection from code clear `paused`
  await expect(clicked.timer).toHaveProperty('paused', false);
  await expect(code.timer).toHaveProperty('paused', false);
  // and the rotation runs on: paused, the picture holds
  for (const { timer } of [clicked, code, next]) timer.paused = true;
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
