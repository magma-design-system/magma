import { h } from '@stencil/core';
import { StateCell, StatesGrid } from '@fixture/states';
import { iconsDictionary, mggIconsDictionary, svgIconsDictionary } from '@type/icon';
import { useState } from 'react';
import svgIconPackage from '@maggioli-design-system/svg-icons/package.json';

const urlIcon = new URL('svg/mi/baseline/email.svg', location.href).href;
const base64IconEncoded =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgLTk2MCA5NjAgOTYwIiB3aWR0aD0iMjQiPjxwYXRoIGQ9Im0yMzMtODAgNjUtMjgxTDgwLTU1MGwyODgtMjUgMTEyLTI2NSAxMTIgMjY1IDI4OCAyNS0yMTggMTg5IDY1IDI4MS0yNDctMTQ5TDIzMy04MFoiLz48L3N2Zz4=';
const svgIconDecoded =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6s-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8s-3.58-8-8-8z"/></svg>';

export default {
  title: 'UI / Content / Icon',
  id: 'design-icon',
  argTypes: {
    name: {
      type: { name: 'string' },
      description: 'The name of the icon or a base64 string to render it as an svg',
      options: mggIconsDictionary.concat(iconsDictionary).concat(svgIconsDictionary),
      control: { type: 'select' },
    },
  },
};

const Template = (args) => <mds-icon {...args} />;

export const Default = {
  render: Template,

  args: {
    name: 'mdi/alien',
    class: 'fill-label-blue-05',
  },
};

export const NameBase64 = {
  render: Template,

  args: {
    name: base64IconEncoded,
  },
};

export const NameSVGIcon = {
  render: Template,

  args: {
    name: svgIconDecoded,
  },
};

export const ExternalSVG = {
  render: Template,

  args: {
    name: urlIcon,
    class: 'fill-label-green-06',
  },
};

export const NoIcon = {
  render: Template,
};

const ButtonTemplate = (args) => (
  <div>
    <button
      onClick={() => {
        const pathName = window.location.pathname.replace('/iframe.html', '');
        const svgPath =
          pathName.charAt(pathName.length - 1) === '/' ? `${pathName}svg/` : `${pathName}/svg/`;
        window.sessionStorage.setItem('mdsIconSvgPath', svgPath);
        window.dispatchEvent(new CustomEvent('mdsIconSvgPathUpdate'));
      }}
    >
      Cliccami
    </button>
    <br />
    <mds-icon {...args}></mds-icon>
    <br />
    <mds-icon {...args}></mds-icon>
    <br />
    <mds-icon {...args}></mds-icon>
    <br />
    <mds-icon {...args}></mds-icon>
    <br />
    <mds-icon {...args}></mds-icon>
    <br />
    <mds-icon {...args}></mds-icon>
    <br />
    <mds-icon {...args}></mds-icon>
  </div>
);

export const StorageTest = {
  render: ButtonTemplate,

  args: {
    name: 'mdi/alien',
    class: 'fill-label-green-05',
  },
};

const ListIconsTemplate = () => {
  const [filteredIcons, setFilteredIcons] = useState<string[]>(mggIconsDictionary);

  return (
    <div class="flex flex-col gap-y-400">
      <div class="flex flex-col gap-y-600">
        <mds-text>
          La seguente è una lista delle icone presenti nel pacchetto{' '}
          <strong>@maggioli-design-system/svg-icons {svgIconPackage.version}</strong>, facente
          riferimento alle icone di Maggioli
        </mds-text>
        <mds-text>
          Oltre a questo set, <strong>@maggioli-design-system/icons</strong> fa uso anche delle
          librerie di <a href="https://fonts.google.com/icons">Material Icons</a> e{' '}
          <a href="https://pictogrammers.com/library/mdi/">Material Design Icons</a>, la cui lista
          può essere consultata sui relativi siti.
        </mds-text>
      </div>
      <div class="flex flex-col gap-y-600">
        <mds-input
          name="filter"
          placeholder="Cerca icona ..."
          onInput={(event) => {
            const _filter = (event.target as HTMLMdsInputElement).value ?? '';

            if (!_filter) {
              setFilteredIcons([...mggIconsDictionary]);
              return;
            }

            setFilteredIcons(mggIconsDictionary.filter((item) => item.includes(_filter)));
          }}
        />
        <div class="grid grid-cols-5 gap-400">
          {filteredIcons.map((icon) => (
            <div key={icon} class="flex flex-col justify-center items-center">
              <mds-icon class="w-1200 fill-brand-maggioli-05" name={icon} />
              <mds-text>{icon}</mds-text>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ListIcons = {
  render: ListIconsTemplate,
};

/**
 * Every state of an icon once the story has opened (#1440, @fixture/states): an icon of each
 * set, by name, and the two other sources it takes (a base64 `data:` URI and the markup of an
 * svg); its sizes, set by the width of the host (24 px by default, `w-600`); the inks it takes,
 * the `fill` of the roles a product paints an icon with, the last one on the solid fill it goes
 * with; without a name, it draws nothing; with a name that is no file of the set, it draws
 * nothing either, after the request for the file fails (a 404 in the console, the state itself).
 * An icon has no interaction: no play function.
 */
interface IconState {
  state: string;
  icon: { name?: string; class?: string };
  surface?: string;
}

const iconStates: IconState[] = [
  { state: 'rest, no ink', icon: { name: 'mi/baseline/home' } },
  { state: 'set mi, outline', icon: { name: 'mi/outline/home', class: 'fill-fg-default' } },
  { state: 'set mi, round', icon: { name: 'mi/round/email', class: 'fill-fg-default' } },
  { state: 'set mdi', icon: { name: 'mdi/alien', class: 'fill-fg-default' } },
  { state: 'set mgg', icon: { name: 'mgg/abitazione-principale', class: 'fill-fg-default' } },
  { state: 'base64', icon: { name: base64IconEncoded, class: 'fill-fg-default' } },
  { state: 'svg markup', icon: { name: svgIconDecoded, class: 'fill-fg-default' } },
  { state: 'size 400', icon: { name: 'mi/baseline/home', class: 'fill-fg-default w-400' } },
  { state: 'size 600, default', icon: { name: 'mi/baseline/home', class: 'fill-fg-default' } },
  { state: 'size 900', icon: { name: 'mi/baseline/home', class: 'fill-fg-default w-900' } },
  { state: 'size 1200', icon: { name: 'mi/baseline/home', class: 'fill-fg-default w-1200' } },
  { state: 'size 2400', icon: { name: 'mi/baseline/home', class: 'fill-fg-default w-2400' } },
  { state: 'ink fg-default', icon: { name: 'mi/baseline/email', class: 'fill-fg-default' } },
  { state: 'ink fg-muted', icon: { name: 'mi/baseline/email', class: 'fill-fg-muted' } },
  { state: 'ink fg-subtle', icon: { name: 'mi/baseline/email', class: 'fill-fg-subtle' } },
  { state: 'ink fg-disabled', icon: { name: 'mi/baseline/email', class: 'fill-fg-disabled' } },
  { state: 'ink accent-fg', icon: { name: 'mi/baseline/email', class: 'fill-accent-fg' } },
  { state: 'ink info-fg', icon: { name: 'mi/baseline/info', class: 'fill-info-fg' } },
  { state: 'ink success-fg', icon: { name: 'mi/baseline/check-circle', class: 'fill-success-fg' } },
  { state: 'ink warning-fg', icon: { name: 'mi/baseline/warning', class: 'fill-warning-fg' } },
  { state: 'ink danger-fg', icon: { name: 'mi/baseline/cancel', class: 'fill-danger-fg' } },
  {
    state: 'ink accent-on-emphasis, on its fill',
    icon: { name: 'mi/baseline/email', class: 'fill-accent-on-emphasis' },
    surface: 'bg-accent-emphasis',
  },
  { state: 'without a name', icon: {} },
  { state: 'a name that is no file', icon: { name: 'mi/baseline/icona-inesistente' } },
];

const TemplateStates = () => (
  <StatesGrid>
    {iconStates.map(({ state, icon, surface }) => (
      <StateCell key={state} state={state}>
        <div class={`flex p-200 rounded-md ${surface ?? ''}`}>
          {/* `name` is required: one state leaves it out on purpose */}
          <mds-icon {...(icon as { name: string })}></mds-icon>
        </div>
      </StateCell>
    ))}
  </StatesGrid>
);

export const States = {
  render: TemplateStates,
};
