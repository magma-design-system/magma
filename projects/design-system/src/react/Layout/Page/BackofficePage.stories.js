import React from 'react'
import faker from 'faker'

import BackofficeMenu, { BackofficeMenuItem, BackofficeMenuItemAction, BackofficeMenuItemTitle } from '@Layout/Menu/BackofficeMenu'
import BackofficePage, { BackofficePageAside, BackofficePageSectionHeader, BackofficePageSection, BackofficePageContent, BackofficePageAsideFooter } from '@Layout/Page/BackofficePage'
import Table, { TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '@UI/Table/Table'
import Button from '@UI/Button/Button'
import Download from '@UI/Download/Download'
import Grid from '@Layout/Grid/Grid'
import Hr from '@UI/Hr/BackofficeHr'
import InputText from '@UI/Input/InputText'
import BackofficeInputText from '@UI/Input/BackofficeInputText'
import BackofficeSwitch from '@UI/Switch/BackofficeSwitch'
import BackofficeTextarea from '@UI/Textarea/BackofficeTextarea'
import UploadFileImage from '@UI/UploadFileImage/UploadFileImage'
faker.locale = 'it'

export default {
  title: 'Layout/BackofficePage',
  component: BackofficePage,
  decorators: [Story => <div style={{ margin: -15 }}><Story/></div>],
}

const PageTemplate = props =>
  <BackofficePage>
    <BackofficePageAside title="Backoffice" description="Gruppo Maggioli" logo={true}>
      <BackofficeMenu>
        <BackofficeMenuItem>
          <BackofficeMenuItemTitle icon="user">
            Utenti
          </BackofficeMenuItemTitle>
          <BackofficeMenuItemAction active={true} icon="design-component">Aggiungi</BackofficeMenuItemAction>
          <BackofficeMenuItemAction icon="design-palette">Aggiungi</BackofficeMenuItemAction>
        </BackofficeMenuItem>
      </BackofficeMenu>
      <BackofficePageAsideFooter/>
    </BackofficePageAside>
    <BackofficePageSection>
      <BackofficePageSectionHeader title="Modello" description="Descrizione modello">
        <InputText icon="data-search"/>
      </BackofficePageSectionHeader>
      <BackofficePageContent>
        { props.children }
      </BackofficePageContent>
    </BackofficePageSection>
  </BackofficePage>

export const basicUsage = () =>
  <PageTemplate>
    <div>Contents here.</div>
  </PageTemplate>

/*
<BackofficeInputText label="Titolo" placeholder="Titolo del volume" icon="text-title" required={true} error={faker.lorem.paragraphs()}/>
*/

export const simpleForm = () =>
  <PageTemplate>
    <Grid template="single-column-form">
      <Grid>
        <BackofficeInputText label="Titolo" required={true} error={faker.lorem.paragraphs()}/>
        <BackofficeTextarea label="Descrizione" placeholder="Inserisci una breve descrizione del volume" icon="text-description" required={true} />
        <BackofficeInputText label="ISBN" placeholder="Un codice ISBN di 13 cifre" icon="format-isbn" required={true}/>
        <Grid columns="2">
          <UploadFileImage label="Copertina" placeholder="Carica un immagine JPG o JPEG"/>
        </Grid>
        <BackofficeSwitch sChecked={true}>Questo libro può ricevere codici per approfondimento</BackofficeSwitch>
        <Button>Salva</Button>
      </Grid>
    </Grid>
    <Hr/>
  </PageTemplate>

export const table = () =>
  <PageTemplate>
    <Table>
      <TableHeader>
        <TableHeaderCell>{faker.database.column()}</TableHeaderCell>
        <TableHeaderCell>{faker.database.column()}</TableHeaderCell>
        <TableHeaderCell>{faker.database.column()}</TableHeaderCell>
        <TableHeaderCell>{faker.database.column()}</TableHeaderCell>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell><b>{faker.name.findName()}</b></TableCell>
          <TableCell><code>{faker.internet.email()}</code></TableCell>
          <TableCell>{faker.phone.phoneNumber()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell><b>{faker.name.findName()}</b></TableCell>
          <TableCell><code>{faker.internet.email()}</code></TableCell>
          <TableCell>{faker.phone.phoneNumber()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell><b>{faker.name.findName()}</b></TableCell>
          <TableCell><code>{faker.internet.email()}</code></TableCell>
          <TableCell>{faker.phone.phoneNumber()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </PageTemplate>

export const Allegati = () =>
  <PageTemplate title="File downloads">
    <Table interactive={true}>
      <TableHeader>
        <TableHeaderCell>File</TableHeaderCell>
        <TableHeaderCell>Categoria</TableHeaderCell>
        <TableHeaderCell>Creato</TableHeaderCell>
        <TableHeaderCell>Riscattato</TableHeaderCell>
        <TableHeaderCell>Azioni</TableHeaderCell>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>
            <Download fileName={faker.system.commonFileName()}/>
          </TableCell>
          <TableCell><code>{faker.internet.email()}</code></TableCell>
          <TableCell>{faker.phone.phoneNumber()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Download fileName={faker.system.commonFileName()}/>
          </TableCell>
          <TableCell><code>{faker.internet.email()}</code></TableCell>
          <TableCell>{faker.phone.phoneNumber()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Download fileName={faker.system.commonFileName()}/>
          </TableCell>
          <TableCell><code>{faker.internet.email()}</code></TableCell>
          <TableCell>{faker.phone.phoneNumber()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Download fileName={faker.system.commonFileName()}/>
          </TableCell>
          <TableCell><code>{faker.internet.email()}</code></TableCell>
          <TableCell>{faker.phone.phoneNumber()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Download fileName={faker.system.commonFileName()}/>
          </TableCell>
          <TableCell><code>{faker.internet.email()}</code></TableCell>
          <TableCell>{faker.phone.phoneNumber()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
          <TableCell>{faker.company.companyName()}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </PageTemplate>
