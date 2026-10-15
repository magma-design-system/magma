import { h } from '@stencil/core';
import { useEffect, useRef, useState, FC } from 'react';
import { expect, waitFor } from 'storybook/test';
import { MdsTableHeaderCellSortEventDetail } from '@component/mds-table-header-cell/meta/event-detail';
import { MdsPaginatorEventDetail } from '@component/mds-paginator/meta/event-detail';

export default {
  title: 'Layout / Table',
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
    const header = canvasElement.querySelector<HTMLElement>('mds-table-header-cell')!;
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
