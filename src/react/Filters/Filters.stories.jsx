import React, { Fragment, useState } from 'react'
import { storiesOf } from '@storybook/react'
import Page from '../Page/Page'

import Modal from '../Modal/Modal'
import Checkbox from '../Form/Checkbox/Checkbox'
import FilterInstallation from '../Filter/FilterInstallation'
import FilterConnection from '../Filter/FilterConnection'
import FilterModel from '../Filter/FilterModel'
import FilterSerial from '../Filter/FilterSerial'
import FilterTag from '../Filter/FilterTag'
import Filters from './Filters'

const ContextFilters = props => {
  const [isInstallationActive, activateInstallation] = useState(false)
  const [isConnectionActive, activateConnection] = useState(false)
  const [isModelActive, activateModel] = useState(false)
  const [isSerialActive, activateSerial] = useState(false)
  const [isTagActive, activateTag] = useState(false)
  const [show, showModal] = useState(false)

  return (
    <Fragment>
      <Filters>
        <Checkbox sync={true} isChecked={isInstallationActive} onChange={isChecked => { activateInstallation(isChecked); showModal(isChecked) }}>Installazione</Checkbox>
        <Checkbox sync={true} isChecked={isConnectionActive} onChange={isChecked => { activateConnection(isChecked); showModal(isChecked) }}>Connessione</Checkbox>
        <Checkbox sync={true} isChecked={isModelActive} onChange={isChecked => { activateModel(isChecked); showModal(isChecked) }}>Modello</Checkbox>
        <Checkbox sync={true} isChecked={isSerialActive} onChange={isChecked => { activateSerial(isChecked); showModal(isChecked) }}>Seriale</Checkbox>
        <Checkbox sync={true} isChecked={isTagActive} onChange={isChecked => { activateTag(isChecked); showModal(isChecked) }}>Tag</Checkbox>
      </Filters>
      <Modal title="Handle filters" contentOnly={true} show={show} onClose={() => { showModal(false) }}>
        <FilterInstallation isActive={isInstallationActive} onActivation={isActive => { activateInstallation(isActive) }}/>
        <FilterConnection isActive={isConnectionActive} onActivation={isActive => { activateConnection(isActive) }}/>
        <FilterModel isActive={isModelActive} onActivation={isActive => { activateModel(isActive) }}/>
        <FilterSerial isActive={isSerialActive} onActivation={isActive => { activateSerial(isActive) }}/>
        <FilterTag isActive={isTagActive} onActivation={isActive => { activateTag(isActive) }}/>
      </Modal>
    </Fragment>
  )
}

storiesOf('Filters', module)
  .addDecorator(story => <Page>{story()}</Page>)
  .add('Default', () => <ContextFilters/>)
