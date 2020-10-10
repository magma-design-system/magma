import React from 'react'
import faker from 'faker'

import PropTypes from 'prop-types'

import Menu, { MenuItem, MenuItemTitle, MenuItemAction } from '@Backoffice/Element/Menu/Menu'
import Page, { PageHeader, PageFooter } from '@Backoffice/Layout/Page/Page'
import Table, { TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '@Layout/Table/Table'
import InputText from '@Backoffice/Form/Input/InputText'
import Switch from '@Backoffice/Form/Switch/Switch'
import Button from '@Backoffice/Form/Button/Button'
import Textarea from '@Backoffice/Form/Textarea/Textarea'
import FileImage from '@Backoffice/Form/FileImage/FileImage'
import Grid from '@Layout/Grid/Grid'
import Hr from '@Backoffice/Element/Hr/Hr'
import Download from '@Content/Download/Download'
faker.locale = 'it'

export default {
  title: 'Backend/Layout/Page',
  component: Page,
}

const PageTemplate = props =>
  <Page
    title="Approfondimenti"
    header={
      <PageHeader>
        Libro
      </PageHeader>
    }
    menu={
      <Menu>
        <MenuItem>
          <MenuItemTitle icon="document-book">Libri</MenuItemTitle>
          <MenuItemAction icon="data-view" to="/edit">Gestisci</MenuItemAction>
          <MenuItemAction active={true} icon="data-add" to="/new">Aggiungi</MenuItemAction>
        </MenuItem>
        <MenuItem>
          <MenuItemTitle icon="security-code">Codici</MenuItemTitle>
          <MenuItemAction icon="data-view" to="/edit">Gestisci</MenuItemAction>
          <MenuItemAction icon="data-add" to="/new">Genera</MenuItemAction>
        </MenuItem>
        <MenuItem>
          <MenuItemTitle icon="user-groups">Utenti</MenuItemTitle>
          <MenuItemAction icon="data-view" to="/edit">Gestisci</MenuItemAction>
          <MenuItemAction icon="data-add" to="/new">Aggiungi</MenuItemAction>
        </MenuItem>
      </Menu>
    }
    footer={
      <PageFooter email="pippo@gmail.com"/>
    }>
    {props.children}
  </Page>

PageTemplate.propTypes = {
  title: PropTypes.string,
}

PageTemplate.defaultProps = {
  title: faker.internet.email(),
}

export const basicUsage = () =>
  <PageTemplate title="Volume">
    <Grid template="single-column-form">
      <Grid>
        <InputText label="Titolo" placeholder="Titolo del volume" icon="text-title" required={true} error="Il campo non sembra essere valido"/>
        <Textarea label="Descrizione" placeholder="Inserisci una breve descrizione del volume" icon="text-description" required={true} />
        <InputText label="ISBN" placeholder="Un codice ISBN di 13 cifre" icon="code-isbn" required={true}/>
        <Grid columns="2">
          <FileImage label="Copertina" placeholder="Carica un immagine JPG o JPEG"/>
        </Grid>
        <Switch sChecked={true}>Questo libro può ricevere codici per approfondimento</Switch>
        <Button>Salva</Button>
      </Grid>
    </Grid>
    <Hr/>
  </PageTemplate>

export const table = () =>
  <PageTemplate title="Tabella con contenuti random">
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
