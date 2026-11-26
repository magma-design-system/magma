import { h } from '@stencil/core';
import { useEffect, useRef, useState, FC } from 'react';
import { expect, waitFor } from 'storybook/test';
import { MdsTableHeaderCellSortEventDetail } from '@component/mds-table-header-cell/meta/event-detail';
import { MdsPaginatorEventDetail } from '@component/mds-paginator/meta/event-detail';
import { SortDirectionType } from '@component/mds-table-header-cell/meta/types';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';
import { ButtonVariantType } from '@type/button';

export default {
  title: 'UI / Data / Table',
  id: 'layout-table',
  argTypes: {
    interactive: {
      type: { name: 'boolean' },
      description: 'Specifies if the table rows are higlighted on mouseover event',
    },
    selectable: {
      type: { name: 'boolean' },
      description: 'Specifies if the table rows are selectable by a checkbox',
    },
    sorting: {
      type: { name: 'string' },
      description: 'Specifies who sorts the rows when a sortable header cell changes direction',
      options: ['internal', 'external'],
      control: { type: 'select' },
    },
  },
};

type ComponentRowProps = {
  key?: number;
  name: string;
  email: string;
  date?: string;
};

const TemplateRow: FC<ComponentRowProps> = ({ name, email, date }) => {
  return (
    <mds-table-row>
      <mds-table-cell value={name}>
        <mds-text class="text-nowrap" typography="detail">
          {name}
        </mds-text>
      </mds-table-cell>
      <mds-table-cell class="w-full" value={email}>
        <mds-text class="text-nowrap" typography="detail">
          {email}
        </mds-text>
      </mds-table-cell>
      {date && (
        <mds-table-cell class="w-full" value={date}>
          <mds-text class="text-nowrap" typography="detail">
            {date}
          </mds-text>
        </mds-table-cell>
      )}
    </mds-table-row>
  );
};

const TemplateRowActions: FC<ComponentRowProps> = ({ name, email, date }) => {
  return (
    <mds-table-row>
      <mds-table-cell value={name}>
        <mds-text class="text-nowrap" typography="detail">
          {name}
        </mds-text>
      </mds-table-cell>
      <mds-table-cell class="w-full" value={email}>
        <mds-text class="text-nowrap" typography="detail">
          {email}
        </mds-text>
      </mds-table-cell>
      {date && (
        <mds-table-cell class="w-full" value={date}>
          <mds-text class="text-nowrap" typography="detail">
            {date}
          </mds-text>
        </mds-table-cell>
      )}
      <mds-button
        slot="action"
        icon="mi/baseline/delete"
        title="Remove record"
        variant="error"
        tone="text"
      ></mds-button>
    </mds-table-row>
  );
};

const Template = (args) => (
  <mds-table {...args}>
    <mds-table-header>
      <mds-table-header-cell label="Username"></mds-table-header-cell>
      <mds-table-header-cell label="Email"></mds-table-header-cell>
      <mds-table-header-cell label="Date"></mds-table-header-cell>
    </mds-table-header>
    <mds-table-body>
      <TemplateRow name="Mario Rossi" email="mario.rossi@nintendo.com" date="12 ottobre 1985" />
      <TemplateRow name="Luigi Verdi" email="luigi.verdi@nintendo.com" date="12 ottobre 1985" />
      <TemplateRow name="Wario Gialli" email="wario.gialli@nintendo.com" date="3 marzo 1993" />
      <TemplateRow
        name="Waluigi Violini"
        email="waluigi.violini@nintendo.com"
        date="8 giugno 1999"
      />
    </mds-table-body>
    <mds-table-footer>
      <mds-table-cell>
        <mds-text typography="action">Username</mds-text>
      </mds-table-cell>
      <mds-table-cell>
        <mds-text typography="action">Email</mds-text>
      </mds-table-cell>
      <mds-table-cell>
        <mds-text typography="action">Date</mds-text>
      </mds-table-cell>
    </mds-table-footer>
  </mds-table>
);

const TemplateNestedTab = (args) => (
  <mds-tab>
    <mds-tab-item label="Tab"></mds-tab-item>
    <div slot="content">
      <mds-table {...args}>
        <mds-table-header>
          <mds-table-header-cell label="Username"></mds-table-header-cell>
          <mds-table-header-cell label="Email"></mds-table-header-cell>
          <mds-table-header-cell label="Date"></mds-table-header-cell>
        </mds-table-header>
        <mds-table-body>
          <TemplateRowActions
            name="Mario Rossi"
            email="mario.rossi@nintendo.com"
            date="12 ottobre 1985"
          />
          <TemplateRowActions
            name="Luigi Verdi"
            email="luigi.verdi@nintendo.com"
            date="12 ottobre 1985"
          />
          <TemplateRowActions
            name="Wario Gialli"
            email="wario.gialli@nintendo.com"
            date="3 marzo 1993"
          />
          <TemplateRowActions
            name="Waluigi Violini"
            email="waluigi.violini@nintendo.com"
            date="8 giugno 1999"
          />
        </mds-table-body>
        <mds-table-footer>
          <mds-table-cell>
            <mds-text typography="action">Username</mds-text>
          </mds-table-cell>
          <mds-table-cell>
            <mds-text typography="action">Email</mds-text>
          </mds-table-cell>
          <mds-table-cell>
            <mds-text typography="action">Date</mds-text>
          </mds-table-cell>
        </mds-table-footer>
      </mds-table>
    </div>
  </mds-tab>
);

const TemplateSortable = (args) => (
  <mds-table {...args}>
    <mds-table-header>
      <mds-table-header-cell sortable label="Numbers"></mds-table-header-cell>
      <mds-table-header-cell sortable label="Strings"></mds-table-header-cell>
      <mds-table-header-cell sortable label="Strings from cell"></mds-table-header-cell>
      <mds-table-header-cell label="No sortable column"></mds-table-header-cell>
    </mds-table-header>
    <mds-table-body>
      <mds-table-row>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            3
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            01
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            Tower Plaza
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            +22 777 892301
          </mds-text>
        </mds-table-cell>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            1
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            05
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            22nd Evenue
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            +22 433 471047
          </mds-text>
        </mds-table-cell>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            2
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            11
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            ARK Plaza
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            +22 334 187366
          </mds-text>
        </mds-table-cell>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            4
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            22
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            _Underscore Building
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            +22 333 997741
          </mds-text>
        </mds-table-cell>
      </mds-table-row>
    </mds-table-body>
  </mds-table>
);

const TemplateSortableActions = (args) => (
  <mds-table {...args}>
    <mds-table-header>
      <mds-table-header-cell sortable label="Numbers"></mds-table-header-cell>
      <mds-table-header-cell sortable label="Strings"></mds-table-header-cell>
      <mds-table-header-cell sortable label="Strings from cell"></mds-table-header-cell>
      <mds-table-header-cell label="No sortable column"></mds-table-header-cell>
    </mds-table-header>
    <mds-table-body>
      <mds-table-row>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            3
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            01
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            Tower Plaza
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            +22 777 892301
          </mds-text>
        </mds-table-cell>
        <mds-button
          slot="action"
          icon="mi/baseline/send"
          title="Write message"
          variant="dark"
          tone="text"
        ></mds-button>
        <mds-button
          slot="action"
          icon="mi/baseline/call"
          title="Call number"
          variant="dark"
          tone="text"
        ></mds-button>
        <mds-button
          slot="action"
          icon="mi/baseline/delete"
          title="Remove record"
          variant="error"
          tone="text"
        ></mds-button>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            1
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            05
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            22nd Evenue
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            +22 433 471047
          </mds-text>
        </mds-table-cell>
        <mds-button
          slot="action"
          icon="mi/baseline/send"
          title="Write message"
          variant="dark"
          tone="text"
        ></mds-button>
        <mds-button
          slot="action"
          icon="mi/baseline/call"
          title="Call number"
          variant="dark"
          tone="text"
        ></mds-button>
        <mds-button
          slot="action"
          icon="mi/baseline/delete"
          title="Remove record"
          variant="error"
          tone="text"
        ></mds-button>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            2
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            11
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            ARK Plaza
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            +22 334 187366
          </mds-text>
        </mds-table-cell>
        <mds-button
          slot="action"
          icon="mi/baseline/send"
          title="Write message"
          variant="dark"
          tone="text"
        ></mds-button>
        <mds-button
          slot="action"
          icon="mi/baseline/call"
          title="Call number"
          variant="dark"
          tone="text"
        ></mds-button>
        <mds-button
          slot="action"
          icon="mi/baseline/delete"
          title="Remove record"
          variant="error"
          tone="text"
        ></mds-button>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            4
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            22
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            _Underscore Building
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            +22 333 997741
          </mds-text>
        </mds-table-cell>
        <mds-button
          slot="action"
          icon="mi/baseline/send"
          title="Write message"
          variant="dark"
          tone="text"
        ></mds-button>
        <mds-button
          slot="action"
          icon="mi/baseline/call"
          title="Call number"
          variant="dark"
          tone="text"
        ></mds-button>
        <mds-button
          slot="action"
          icon="mi/baseline/delete"
          title="Remove record"
          variant="error"
          tone="text"
        ></mds-button>
      </mds-table-row>
    </mds-table-body>
  </mds-table>
);

const TemplateSelectable = (args) => (
  <mds-table {...args}>
    <mds-table-header>
      <mds-table-header-cell sortable label="Numbers"></mds-table-header-cell>
      <mds-table-header-cell sortable label="Strings"></mds-table-header-cell>
      <mds-table-header-cell sortable label="Strings from cell"></mds-table-header-cell>
      <mds-table-header-cell label="No sortable column"></mds-table-header-cell>
    </mds-table-header>
    <mds-table-body>
      <mds-table-row value="first element">
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            3
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            01
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            Tower Plaza
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            +22 777 892301
          </mds-text>
        </mds-table-cell>
        <mds-button
          slot="action"
          icon="mi/baseline/send"
          title="Write message"
          variant="dark"
          tone="text"
        ></mds-button>
        <mds-button
          slot="action"
          icon="mi/baseline/call"
          title="Call number"
          variant="dark"
          tone="text"
        ></mds-button>
        <mds-button
          slot="action"
          icon="mi/baseline/delete"
          title="Remove record"
          variant="error"
          tone="text"
        ></mds-button>
      </mds-table-row>
      <mds-table-row value="second element">
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            1
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            05
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            22nd Evenue
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            +22 433 471047
          </mds-text>
        </mds-table-cell>
        <mds-button
          slot="action"
          icon="mi/baseline/send"
          title="Write message"
          variant="dark"
          tone="text"
        ></mds-button>
        <mds-button
          slot="action"
          icon="mi/baseline/call"
          title="Call number"
          variant="dark"
          tone="text"
        ></mds-button>
        <mds-button
          slot="action"
          icon="mi/baseline/delete"
          title="Remove record"
          variant="error"
          tone="text"
        ></mds-button>
      </mds-table-row>
      <mds-table-row value={33}>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            2
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            11
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            ARK Plaza
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            +22 334 187366
          </mds-text>
        </mds-table-cell>
        <mds-button
          slot="action"
          icon="mi/baseline/send"
          title="Write message"
          variant="dark"
          tone="text"
        ></mds-button>
        <mds-button
          slot="action"
          icon="mi/baseline/call"
          title="Call number"
          variant="dark"
          tone="text"
        ></mds-button>
        <mds-button
          slot="action"
          icon="mi/baseline/delete"
          title="Remove record"
          variant="error"
          tone="text"
        ></mds-button>
      </mds-table-row>
      <mds-table-row value="forth element">
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            4
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            22
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            _Underscore Building
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            +22 333 997741
          </mds-text>
        </mds-table-cell>
        <mds-button
          slot="action"
          icon="mi/baseline/send"
          title="Write message"
          variant="dark"
          tone="text"
        ></mds-button>
        <mds-button
          slot="action"
          icon="mi/baseline/call"
          title="Call number"
          variant="dark"
          tone="text"
        ></mds-button>
        <mds-button
          slot="action"
          icon="mi/baseline/delete"
          title="Remove record"
          variant="error"
          tone="text"
        ></mds-button>
      </mds-table-row>
    </mds-table-body>
  </mds-table>
);

const TemplateBatchActions = (args) => (
  <mds-table {...args}>
    <mds-table-header>
      <mds-table-header-cell sortable label="Numbers"></mds-table-header-cell>
      <mds-table-header-cell sortable label="Strings"></mds-table-header-cell>
      <mds-table-header-cell sortable label="Strings from cell"></mds-table-header-cell>
      <mds-table-header-cell label="No sortable column"></mds-table-header-cell>
    </mds-table-header>
    <mds-table-body>
      <mds-table-row value="first element">
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            3
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            01
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            Tower Plaza
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            +22 777 892301
          </mds-text>
        </mds-table-cell>
        <mds-button
          slot="action"
          icon="mi/baseline/send"
          title="Write message"
          variant="dark"
          tone="text"
        ></mds-button>
        <mds-button
          slot="action"
          icon="mi/baseline/call"
          title="Call number"
          variant="dark"
          tone="text"
        ></mds-button>
        <mds-button
          slot="action"
          icon="mi/baseline/delete"
          title="Remove record"
          variant="error"
          tone="text"
        ></mds-button>
      </mds-table-row>
      <mds-table-row value="second element">
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            1
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            05
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            22nd Evenue
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            +22 433 471047
          </mds-text>
        </mds-table-cell>
        <mds-button
          slot="action"
          icon="mi/baseline/send"
          title="Write message"
          variant="dark"
          tone="text"
        ></mds-button>
        <mds-button
          slot="action"
          icon="mi/baseline/call"
          title="Call number"
          variant="dark"
          tone="text"
        ></mds-button>
        <mds-button
          slot="action"
          icon="mi/baseline/delete"
          title="Remove record"
          variant="error"
          tone="text"
        ></mds-button>
      </mds-table-row>
      <mds-table-row value={33}>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            2
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            11
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            ARK Plaza
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            +22 334 187366
          </mds-text>
        </mds-table-cell>
        <mds-button
          slot="action"
          icon="mi/baseline/send"
          title="Write message"
          variant="dark"
          tone="text"
        ></mds-button>
        <mds-button
          slot="action"
          icon="mi/baseline/call"
          title="Call number"
          variant="dark"
          tone="text"
        ></mds-button>
        <mds-button
          slot="action"
          icon="mi/baseline/delete"
          title="Remove record"
          variant="error"
          tone="text"
        ></mds-button>
      </mds-table-row>
      <mds-table-row value="forth element">
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            4
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            22
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            _Underscore Building
          </mds-text>
        </mds-table-cell>
        <mds-table-cell>
          <mds-text class="text-nowrap" typography="detail">
            +22 333 997741
          </mds-text>
        </mds-table-cell>
        <mds-button
          slot="action"
          icon="mi/baseline/send"
          title="Write message"
          variant="dark"
          tone="text"
        ></mds-button>
        <mds-button
          slot="action"
          icon="mi/baseline/call"
          title="Call number"
          variant="dark"
          tone="text"
        ></mds-button>
        <mds-button
          slot="action"
          icon="mi/baseline/delete"
          title="Remove record"
          variant="error"
          tone="text"
        ></mds-button>
      </mds-table-row>
    </mds-table-body>
    <mds-button
      slot="batch-action"
      icon="mi/outline/send"
      label="Write message"
      variant="dark"
      tone="text"
    ></mds-button>
    <mds-button
      slot="batch-action"
      icon="mi/outline/call"
      label="Call number"
      variant="dark"
      tone="text"
    ></mds-button>
    <mds-button
      slot="batch-action"
      icon="mi/outline/delete"
      label="Remove record"
      variant="error"
      tone="text"
    ></mds-button>
  </mds-table>
);

const AsyncSlottedRow: FC<ComponentRowProps> = ({ name, email }) => {
  return (
    <mds-table-row>
      <mds-table-cell value={name}>
        <mds-text class="text-nowrap" typography="detail">
          {name}
        </mds-text>
      </mds-table-cell>
      <mds-table-cell class="w-full" value={email}>
        <mds-text class="text-nowrap" typography="detail">
          {email}
        </mds-text>
      </mds-table-cell>
      <mds-button
        slot="action"
        icon="mi/baseline/delete"
        title="Remove record"
        variant="error"
        tone="text"
      ></mds-button>
    </mds-table-row>
  );
};

const TemplateAsyncSlottedContents = () => {
  const firstList = [
    { name: 'Mario Rossi', email: 'mario.rossi@nintendo.com' },
    { name: 'Luigi Verdi', email: 'luigi.verdi@nintendo.com' },
    { name: 'Wario Gialli', email: 'wario.gialli@nintendo.com' },
    { name: 'Waluigi Violetti', email: 'waluigi.violetti@nintendo.com' },
  ];
  const secondList = [
    {
      name: 'Devastatore Decepticoni',
      email: 'devastatore.decepticoni@hasbro.com',
    },
    { name: 'Galvatrone Megatroni', email: 'galvatrone.megatroni@hasbro.com' },
    { name: 'Ottimo Primo', email: 'ottimo.primo@hasbro.com' },
    { name: 'Strillo Stella', email: 'strillo.stella@hasbro.com' },
  ];

  const [dataList, setData] = useState(firstList);
  const [changedList, setListStatus] = useState(false);

  function updateData() {
    setListStatus(true);
    if (dataList.length > 4) {
      setData(firstList);
      return;
    }
    setData(firstList.concat(secondList));
  }

  function resetData() {
    setListStatus(false);
    setData(firstList);
  }

  return (
    <div class="grid grid-cols-1 gap-600">
      <div class="inline-flex gap-200 justify-between">
        <mds-button
          icon={dataList.length > 4 ? 'mi/baseline/check' : 'mi/baseline/add'}
          variant={dataList.length > 4 ? 'success' : 'primary'}
          disabled={dataList.length > 4 ? true : undefined}
          onClick={() => updateData()}
        >
          {dataList.length > 4 ? 'Users added successfully' : 'Add users'}
        </mds-button>
        {changedList && (
          <mds-button
            icon="mi/baseline/undo"
            onClick={() => resetData()}
            variant="dark"
            tone="text"
          >
            Reset list
          </mds-button>
        )}
      </div>
      <mds-table selectable interactive>
        <mds-table-header>
          <mds-table-header-cell sortable label="Full Name"></mds-table-header-cell>
          <mds-table-header-cell sortable label="Email"></mds-table-header-cell>
        </mds-table-header>
        <mds-table-body>
          {dataList.map((user, index) => (
            <AsyncSlottedRow key={index} name={user.name} email={user.email} />
          ))}
        </mds-table-body>
      </mds-table>
    </div>
  );
};

// a table that shows one page of a larger set (#943): the headers ask for an order, and the back
// end, an array here, answers with the page in that order
const people = [
  { number: 7, name: 'Grace Hopper' },
  { number: 2, name: 'Alan Turing' },
  { number: 11, name: 'Margaret Hamilton' },
  { number: 4, name: 'Ada Lovelace' },
  { number: 9, name: 'Edsger Dijkstra' },
  { number: 1, name: 'Barbara Liskov' },
  { number: 12, name: 'Donald Knuth' },
  { number: 5, name: 'Frances Allen' },
  { number: 10, name: 'Ken Thompson' },
  { number: 3, name: 'Radia Perlman' },
  { number: 8, name: 'John Backus' },
  { number: 6, name: 'Hedy Lamarr' },
];
const pageSize = 4;

const TemplateSortingExternal = (args) => {
  const [sort, setSort] = useState<MdsTableHeaderCellSortEventDetail>({
    direction: 'none',
    index: 0,
  });
  const [page, setPage] = useState(1);
  const table = useRef<HTMLMdsTableElement>(null);
  const paginator = useRef<HTMLMdsPaginatorElement>(null);

  useEffect(() => {
    const onSort = (event: CustomEvent<MdsTableHeaderCellSortEventDetail>) => {
      setSort(event.detail);
      setPage(1);
    };
    const onPage = (event: CustomEvent<MdsPaginatorEventDetail>) => setPage(event.detail.page);
    const tableElement = table.current;
    const paginatorElement = paginator.current;
    tableElement?.addEventListener('mdsTableHeaderCellSort', onSort);
    paginatorElement?.addEventListener('mdsPaginatorChange', onPage);
    return () => {
      tableElement?.removeEventListener('mdsTableHeaderCellSort', onSort);
      paginatorElement?.removeEventListener('mdsPaginatorChange', onPage);
    };
  }, []);

  const key = sort.sortKey as 'number' | 'name' | undefined;
  const sorted =
    sort.direction === 'none' || key === undefined
      ? people
      : [...people].sort((a, b) => {
          const order = key === 'number' ? a.number - b.number : a.name.localeCompare(b.name);
          return sort.direction === 'ascending' ? order : -order;
        });
  const rows = sorted.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div class="grid gap-400">
      <mds-table {...args} ref={table}>
        <mds-table-header>
          <mds-table-header-cell sortable sort-key="number" label="Number"></mds-table-header-cell>
          <mds-table-header-cell sortable sort-key="name" label="Name"></mds-table-header-cell>
        </mds-table-header>
        <mds-table-body>
          {rows.map((person) => (
            <mds-table-row key={person.number}>
              <mds-table-cell>
                <mds-text typography="detail">{person.number}</mds-text>
              </mds-table-cell>
              <mds-table-cell class="w-full">
                <mds-text typography="detail">{person.name}</mds-text>
              </mds-table-cell>
            </mds-table-row>
          ))}
        </mds-table-body>
      </mds-table>
      <mds-paginator
        ref={paginator}
        current-page={page}
        pages={Math.ceil(people.length / pageSize)}
      ></mds-paginator>
    </div>
  );
};

export const Default = {
  render: Template,
};

export const Interactive = {
  render: Template,

  args: {
    interactive: true,
  },
};

export const Sortable = {
  render: TemplateSortable,

  args: {
    interactive: true,
  },
};

export const SortingExternal = {
  render: TemplateSortingExternal,

  args: {
    sorting: 'external',
  },
  play: async ({ canvasElement, userEvent }) => {
    const header = canvasElement.querySelector('mds-table-header-cell') as HTMLElement;
    const firstNumber = () =>
      canvasElement.querySelector('mds-table-row mds-table-cell')!.textContent!.trim();
    await waitFor(() => expect(header).toHaveAttribute('hydrated'));
    await expect(firstNumber()).toBe('7');

    // the whole set in order, not the four rows on screen: 1 is on another page at first
    await userEvent.click(header.shadowRoot!.querySelector('.action')!);
    await waitFor(() => expect(firstNumber()).toBe('1'));
    await userEvent.click(header.shadowRoot!.querySelector('.action')!);
    await waitFor(() => expect(firstNumber()).toBe('12'));
    await expect(header).toHaveAttribute('aria-sort', 'descending');
  },
};

export const Actions = {
  render: TemplateSortableActions,

  args: {
    interactive: true,
  },
};

export const Selectable = {
  render: TemplateSelectable,

  args: {
    interactive: false,
    selectable: true,
  },
};

export const AsyncSlottedContents = {
  render: TemplateAsyncSlottedContents,

  args: {
    interactive: false,
    selectable: true,
  },
};

export const NestedTable = {
  render: TemplateNestedTab,
};

export const BatchActions = {
  render: TemplateBatchActions,

  args: {
    interactive: false,
    selectable: true,
  },
};

/**
 * Every state of the table once the story has opened (#1440, @fixture/states), with the states of
 * its parts, which have no story of their own (mds-table-header, mds-table-header-cell,
 * mds-table-body, mds-table-row, mds-table-cell, mds-table-footer): header, rows and footer and
 * without the footer, the interactive rows, the sortable columns at rest, sorted either way and
 * sorted by a click, the order asked of the application (`sorting="external"`), which leaves the
 * rows where they are, the selectable rows with none, some and all selected and the selections
 * made by a click on a row and on the header, the bar of the batch actions closed and open, the
 * Actions column of the rows, the table wider than its box, which scrolls and lays the actions of
 * its rows over it, the long text that wraps and the empty body. The table has no loading or empty
 * message of its own: an empty body shows the header alone. The rows lit under the pointer
 * (`interactive`) and the overlaid actions revealed by it need a real pointer, which a play does
 * not move: mds-table.e2e.ts and mds-table-row.e2e.ts test them. A table with the bar of the batch
 * actions needs the width of a page, not of one column of the grid: those cells span the whole
 * grid. A state only an interaction reaches (`play: true`) is brought there by the play function,
 * which checks the `direction` of the column, the order of the rows by their `value`, the
 * `selected` of the rows and the `selection` of the table, not their look.
 */
interface Pratica {
  numero: string;
  richiedente: string;
  stato: string;
  ufficio?: string;
  data?: string;
}

interface TableState {
  state: string;
  play?: boolean;
  /** the cell spans the whole grid */
  wide?: boolean;
  table?: Record<string, string | boolean>;
  sortable?: boolean;
  /** the column written sorted, by its index */
  direction?: [number, SortDirectionType];
  /** two more columns, with text that does not wrap */
  extended?: boolean;
  rows?: Pratica[];
  /** the indexes of the rows written `selected` */
  selected?: number[];
  /** the actions of each row, by their number */
  actions?: number;
  footer?: boolean;
  batch?: boolean;
}

const pratiche: Pratica[] = [
  {
    numero: '142',
    richiedente: 'Mario Rossi',
    stato: 'Aperta',
    ufficio: 'Edilizia privata',
    data: '12 ottobre 2026',
  },
  {
    numero: '98',
    richiedente: 'Giulia Bianchi',
    stato: 'Chiusa',
    ufficio: 'Commercio e attivita produttive',
    data: '3 marzo 2026',
  },
  {
    numero: '127',
    richiedente: 'Luca Verdi',
    stato: 'In attesa',
    ufficio: 'Tributi',
    data: '8 giugno 2026',
  },
];
const baseColumns: [string, keyof Pratica][] = [
  ['N.', 'numero'],
  ['Richiedente', 'richiedente'],
  ['Stato', 'stato'],
];
const extraColumns: [string, keyof Pratica][] = [
  ['Ufficio', 'ufficio'],
  ['Ricevuta il', 'data'],
];
const rowActions: { icon: string; label: string; variant: ButtonVariantType }[] = [
  { icon: 'mi/baseline/visibility', label: 'Apri la pratica', variant: 'dark' },
  { icon: 'mi/baseline/edit', label: 'Modifica la pratica', variant: 'dark' },
  { icon: 'mi/baseline/delete', label: 'Elimina la pratica', variant: 'error' },
];

const sortedByClick = 'sorted by a click';
const rowByClick = 'a row selected by a click';
const allFromHeader = 'all selected from the header';

const tableStates: TableState[] = [
  { state: 'header, rows and footer', footer: true },
  { state: 'no footer' },
  { state: 'interactive (rows lit under the pointer)', table: { interactive: true } },
  { state: 'sortable columns, none sorted', sortable: true },
  { state: 'sorted ascending', sortable: true, direction: [0, 'ascending'] },
  { state: 'sorted descending', sortable: true, direction: [1, 'descending'] },
  { state: sortedByClick, play: true, sortable: true },
  {
    state: 'sorting external, the rows left in the order of the application',
    table: { sorting: 'external' },
    sortable: true,
    direction: [0, 'ascending'],
  },
  { state: 'selectable, none selected', table: { selectable: true } },
  { state: 'selectable, some selected', table: { selectable: true }, selected: [1] },
  { state: 'selectable, all selected', table: { selectable: true }, selected: [0, 1, 2] },
  { state: rowByClick, play: true, table: { selectable: true } },
  { state: allFromHeader, play: true, table: { selectable: true } },
  { state: 'selectable, with a footer', table: { selectable: true }, footer: true },
  { state: 'row actions, the Actions column', actions: 1 },
  { state: 'row actions, with a footer', actions: 1, footer: true },
  { state: 'wider than its box, scrolls', extended: true },
  {
    state: 'wider than its box, row actions laid over it',
    extended: true,
    actions: 3,
  },
  {
    state: 'long text, wrapped',
    rows: [
      {
        numero: '142',
        richiedente: 'Studio associato Bianchi Fontana, per conto di Giulia Bianchi',
        stato: 'In attesa della documentazione integrativa',
      },
      ...pratiche.slice(1),
    ],
  },
  { state: 'empty body, the header alone', rows: [] },
  {
    state: 'batch actions, nothing selected (bar closed)',
    wide: true,
    table: { selectable: true },
    batch: true,
    actions: 3,
  },
  {
    state: 'batch actions, rows selected (bar open, with the count)',
    wide: true,
    table: { selectable: true },
    batch: true,
    actions: 3,
    selected: [0, 2],
  },
];

const TemplateStates = () => (
  <StatesGrid>
    {tableStates.map(
      ({
        state,
        play,
        wide,
        table,
        sortable,
        direction,
        extended,
        rows,
        selected,
        actions,
        footer,
        batch,
      }) => {
        const columns = extended ? [...baseColumns, ...extraColumns] : baseColumns;
        return (
          <div key={state} class={wide ? 'col-span-full' : undefined}>
            <StateCell state={state} play={play}>
              <mds-table {...table}>
                <mds-table-header>
                  {columns.map(([label], index) => (
                    <mds-table-header-cell
                      key={label}
                      label={label}
                      sortable={sortable || undefined}
                      direction={direction?.[0] === index ? direction[1] : undefined}
                    ></mds-table-header-cell>
                  ))}
                </mds-table-header>
                <mds-table-body>
                  {(rows ?? pratiche).map((row, index) => (
                    <mds-table-row
                      key={row.numero}
                      value={row.numero}
                      selected={selected?.includes(index) || undefined}
                    >
                      {columns.map(([label, key]) => (
                        <mds-table-cell key={label}>
                          <mds-text
                            typography="detail"
                            class={extended ? 'text-nowrap' : undefined}
                          >
                            {row[key]}
                          </mds-text>
                        </mds-table-cell>
                      ))}
                      {rowActions.slice(0, actions ?? 0).map(({ icon, label, variant }) => (
                        <mds-button
                          key={label}
                          slot="action"
                          icon={icon}
                          aria-label={`${label} ${row.numero}`}
                          variant={variant}
                          tone="text"
                        ></mds-button>
                      ))}
                    </mds-table-row>
                  ))}
                </mds-table-body>
                {footer && (
                  <mds-table-footer>
                    <mds-table-cell>
                      <mds-text typography="action">Totale</mds-text>
                    </mds-table-cell>
                    <mds-table-cell>
                      <mds-text typography="action">3 richiedenti</mds-text>
                    </mds-table-cell>
                    <mds-table-cell>
                      <mds-text typography="action">1 aperta</mds-text>
                    </mds-table-cell>
                  </mds-table-footer>
                )}
                {batch && (
                  <mds-button
                    slot="batch-action"
                    icon="mi/baseline/download"
                    label="Scarica"
                    variant="dark"
                    tone="text"
                  ></mds-button>
                )}
                {batch && (
                  <mds-button
                    slot="batch-action"
                    icon="mi/baseline/send"
                    label="Inoltra"
                    variant="dark"
                    tone="text"
                  ></mds-button>
                )}
                {batch && (
                  <mds-button
                    slot="batch-action"
                    icon="mi/baseline/delete"
                    label="Elimina"
                    variant="error"
                    tone="text"
                  ></mds-button>
                )}
              </mds-table>
            </StateCell>
          </div>
        );
      },
    )}
  </StatesGrid>
);

/** The table of a cell, once every Magma element of the cell has loaded. */
const loadedTable = async (canvasElement: HTMLElement, state: string) => {
  const cell = stateCell(canvasElement, state);
  const elements = Array.from(cell.querySelectorAll('*')).filter((element) =>
    element.tagName.startsWith('MDS-'),
  );
  await waitFor(() => elements.forEach((element) => expect(element).toHaveAttribute('hydrated')));
  return cell.querySelector('mds-table') as HTMLMdsTableElement;
};

/**
 * Clicks the checkbox a row or the header renders in its shadow root, once it has loaded: click()
 * runs the activation of the native control, the change included, with or without the focus of
 * the document.
 */
const clickCheckbox = async (host: HTMLElement) => {
  const control = () => host.shadowRoot!.querySelector('mds-input-switch') as HTMLElement;
  await waitFor(() => expect(control()).toHaveAttribute('hydrated'));
  (control().shadowRoot!.querySelector('input') as HTMLInputElement).click();
};

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const sorted = await loadedTable(canvasElement, sortedByClick);
  const column = sorted.querySelector('mds-table-header-cell') as HTMLMdsTableHeaderCellElement;
  // the cell listens on the button in its shadow root
  (column.shadowRoot!.querySelector('.action') as HTMLElement).click();

  const oneRow = await loadedTable(canvasElement, rowByClick);
  const row = oneRow.querySelectorAll('mds-table-row')[1] as HTMLMdsTableRowElement;
  await clickCheckbox(row);

  const allRows = await loadedTable(canvasElement, allFromHeader);
  await clickCheckbox(allRows.querySelector('mds-table-header') as HTMLElement);

  // the properties, not the attributes: Stencil reflects them on the next frame, and a hidden
  // page draws no frame
  await waitFor(() => expect(column).toHaveProperty('direction', 'ascending'));
  await waitFor(() => expect(sorted.querySelector('mds-table-row')).toHaveProperty('value', '98'));
  await waitFor(() => expect(row).toHaveProperty('selected', true));
  await waitFor(() => expect(oneRow).toHaveProperty('selection', true));
  await waitFor(() =>
    allRows
      .querySelectorAll('mds-table-row')
      .forEach((each) => expect(each).toHaveProperty('selected', true)),
  );
  await waitFor(() => expect(allRows).toHaveProperty('selection', true));
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
