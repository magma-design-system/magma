import { h } from '@stencil/core';
import { MdsTreeItemEventDetail } from 'src/components';
import { useEffect, useState } from 'react';

export default {
  title: 'UI / Tree / Usecase hyperSIC',
};

const durations = [500, 750, 1000, 1250, 1500, 1750, 2000];
const randomDuration = () => durations[Math.floor(Math.random() * durations.length)];

const TemplateNavigationMenu = () => {
  const [isExpanded, setExpand] = useState(false);
  return (
    <div class="grid gap-400 bg-tone-porcelain-10 rounded-lg p-600">
      <div class="flex items-center justify-between gap-400">
        <mds-text typography="h5">Menu</mds-text>
        <mds-button
          onClick={() => {
            setExpand(!isExpanded);
          }}
          icon={isExpanded ? 'mi/baseline/unfold-less' : 'mi/baseline/unfold-more'}
          title={isExpanded ? 'Close' : 'Open'}
          variant="light"
        ></mds-button>
      </div>
      <mds-tree
        class="bg-tone-neutral shadow"
        toggle="chevron"
        toggle-position="right"
        actions="auto"
        appearance="none"
        expanded={isExpanded}
      >
        <mds-tree-item
          label="Protocollazione documenti"
          style={{
            '--mds-tree-label-hover-background': 'rgb(var(--variant-primary-10))',
          }}
        >
          <mds-tree-item label="Attività protocollo generale">
            <mds-tree-item label="Nuovo protocollo in arrivo" actions="visible">
              <mds-button
                slot="action"
                icon="mi/baseline/favorite"
                class="fill-tone-neutral-04"
                variant="dark"
                tone="text"
              ></mds-button>
            </mds-tree-item>
            <mds-tree-item label="Nuovo protocollo in partenza">
              <mds-button
                slot="action"
                icon="mi/baseline/favorite-border"
                class="fill-tone-neutral-07"
                variant="dark"
                tone="text"
              ></mds-button>
            </mds-tree-item>
          </mds-tree-item>
          <mds-tree-item label="Digitalizzazione documenti">
            <mds-tree-item label="Scansione Multipla">
              <mds-button
                slot="action"
                icon="mi/baseline/favorite-border"
                class="fill-tone-neutral-07"
                variant="dark"
                tone="text"
              ></mds-button>
            </mds-tree-item>
            <mds-tree-item label="Gestione Allegati">
              <mds-button
                slot="action"
                icon="mi/baseline/favorite-border"
                class="fill-tone-neutral-07"
                variant="dark"
                tone="text"
              ></mds-button>
            </mds-tree-item>
            <mds-tree-item label="Autenticazione Documenti" actions="visible">
              <mds-button
                slot="action"
                icon="mi/baseline/favorite"
                class="fill-tone-neutral-04"
                variant="dark"
                tone="text"
              ></mds-button>
            </mds-tree-item>
          </mds-tree-item>
          <mds-tree-item label="Documenti protocollati">
            <mds-tree-item label="Archivio Documenti">
              <mds-button
                slot="action"
                icon="mi/baseline/favorite-border"
                class="fill-tone-neutral-07"
                variant="dark"
                tone="text"
              ></mds-button>
            </mds-tree-item>
            <mds-tree-item label="Fascicoli">
              <mds-button
                slot="action"
                icon="mi/baseline/favorite-border"
                class="fill-tone-neutral-07"
                variant="dark"
                tone="text"
              ></mds-button>
            </mds-tree-item>
            <mds-tree-item label="Iter Documentale" actions="visible">
              <mds-button
                slot="action"
                icon="mi/baseline/favorite"
                class="fill-tone-neutral-04"
                variant="dark"
                tone="text"
              ></mds-button>
            </mds-tree-item>
            <mds-tree-item label="Pratiche">
              <mds-button
                slot="action"
                icon="mi/baseline/favorite-border"
                class="fill-tone-neutral-07"
                variant="dark"
                tone="text"
              ></mds-button>
            </mds-tree-item>
          </mds-tree-item>
        </mds-tree-item>
      </mds-tree>
    </div>
  );
};

const TemplateOrganizationalChart = () => {
  useEffect(() => {
    const treeItemElement = document.querySelectorAll('.mds-tree-item')?.[0];
    if (treeItemElement) {
      treeItemElement.addEventListener(
        'mdsTreeItemExpand',
        (event: CustomEvent<MdsTreeItemEventDetail>) => {
          const { element } = event.detail;
          if (!element.async) return;
          setTimeout(() => {
            element.expand();
            // element.async = false
          }, randomDuration());
        },
      );
    }
  }, []);

  return (
    <mds-tree toggle="chevron" toggle-position="right">
      <mds-tree-item label="Comune di Rimini" icon="mgg/historic-building">
        <mds-tree-item label="Sindaco" icon="mdi/handshake">
          <mds-tree-item label="Segretario generale" icon="mi/baseline/draw">
            <mds-tree-item label="Assessorato" icon="mi/baseline/account-balance">
              <mds-tree-item label="Settore" icon="mi/baseline/location-city">
                <mds-tree-item label="Sezione" icon="mi/baseline/meeting-room">
                  <mds-tree-item label="Elone Muschio" icon="mi/baseline/person"></mds-tree-item>
                  <mds-tree-item
                    label="Ufficio"
                    icon="mi/baseline/desk"
                    async
                    class="mds-tree-item"
                  >
                    <mds-tree-item label="Andrea Rossi" icon="mi/baseline/person"></mds-tree-item>
                    <mds-tree-item
                      label="Mirco Romanelli"
                      icon="mi/baseline/person"
                    ></mds-tree-item>
                    <mds-tree-item label="Elone Muschio" icon="mi/baseline/person"></mds-tree-item>
                  </mds-tree-item>
                </mds-tree-item>
              </mds-tree-item>
            </mds-tree-item>
          </mds-tree-item>
        </mds-tree-item>
      </mds-tree-item>
    </mds-tree>
  );
};

const TemplateWorkflow = () => (
  <mds-tree
    toggle="folder"
    toggle-position="left"
    actions="visible"
    style={{
      '--mds-tree-toggle-icon-folder-default-color': 'rgb(var(--tone-neutral-04))',
    }}
  >
    <mds-tree-item label="Nr: 144 Data: 29/01/2025 (DIREZIONE GENERALE)">
      <div
        slot="action"
        title="Protocollo generale in uscita"
        class="flex items-center gap-50 text-label-orange-03 bg-label-orange-09 fill-label-orange-04 p-100 pl-200 rounded-md"
      >
        <mds-text typography="label">pg</mds-text>
        <mds-icon name="mdi/file-upload-outline"></mds-icon>
      </div>
      <mds-tree-item label="Settore Data: 29/01/2025 (direzione generale)">
        <div
          slot="action"
          title="Messaggio interno in entrata"
          class="flex items-center gap-50 text-label-blue-03 bg-label-blue-09 fill-label-blue-04 p-100 pl-200 rounded-md"
        >
          <mds-text typography="label">mi</mds-text>
          <mds-icon name="mdi/file-download-outline"></mds-icon>
        </div>
        <mds-tree-item label="Data: 29/01/2025 (direzione generale)">
          <div
            slot="action"
            title="Messaggio interno in entrata"
            class="flex items-center gap-50 text-label-blue-03 bg-label-blue-09 fill-label-blue-04 p-100 pl-200 rounded-md"
          >
            <mds-text typography="label">mi</mds-text>
            <mds-icon name="mdi/file-download-outline"></mds-icon>
          </div>
        </mds-tree-item>
      </mds-tree-item>
    </mds-tree-item>
  </mds-tree>
);

const TemplateClassification = () => {
  useEffect(() => {
    const treeItemElement = document.querySelectorAll('.mds-tree-item')?.[0];
    if (treeItemElement) {
      treeItemElement.addEventListener(
        'mdsTreeItemExpand',
        (event: CustomEvent<MdsTreeItemEventDetail>) => {
          const { element } = event.detail;
          if (!element.async) return;
          setTimeout(() => {
            element.expand();
            // element.async = false
          }, randomDuration());
        },
      );
    }
  }, []);
  return (
    <mds-tree toggle="chevron" toggle-position="left">
      <mds-tree-item label="Titolario">
        <mds-tree-item label="1 - AMMINISTRAZIONE GENERALE (Non Utilizzare)">
          <mds-tree-item
            label="1.0.0 - AMMINISTRAZIONE GENERALE (Non Utilizzare"
            async
            class="mds-tree-item"
          >
            <mds-tree-item label="2/2025 - Riapertura annuale"></mds-tree-item>
            <mds-tree-item label="6/2024 - Ristrutturazione campanile"></mds-tree-item>
            <mds-tree-item label="99791/2023 - Causa viadotto">
              <mds-tree-item label="1/2023 - Rossi Mario"></mds-tree-item>
            </mds-tree-item>
            <mds-tree-item label="3/2022 - Facsicolo numerazione generale"></mds-tree-item>
            <mds-tree-item label="1001/2019 - Accesso Civico"></mds-tree-item>
            <mds-tree-item label="1/2009 - Linee programmatiche di mandato"></mds-tree-item>
          </mds-tree-item>
        </mds-tree-item>
      </mds-tree-item>
    </mds-tree>
  );
};

export const NavigationMenu = {
  render: TemplateNavigationMenu,
};
export const OrganizationalChart = {
  render: TemplateOrganizationalChart,
};
export const Workflow = {
  render: TemplateWorkflow,
};
export const Classification = {
  render: TemplateClassification,
};
