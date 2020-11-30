import React from 'react'
import faker from 'faker'

import Kpi, { KpiItem } from '@Content/Kpi/Kpi'
import randomIcon from '@Design/Icon/faker'

faker.locale = 'it'

export default {
  title: 'Content/KPI',
  component: Kpi,
}

export const basicUsage = () =>
  <Kpi>
    <KpiItem amount={faker.random.number(10000)} icon={randomIcon()}>{faker.hacker.verb()}</KpiItem>
    <KpiItem amount={faker.random.number(10000)} icon={randomIcon()}>{faker.hacker.verb()}</KpiItem>
    <KpiItem amount={faker.random.number(10000)} icon={randomIcon()}>{faker.hacker.verb()}</KpiItem>
    <KpiItem amount={faker.random.number(10000)} icon={randomIcon()}>{faker.hacker.verb()}</KpiItem>
    <KpiItem amount={faker.random.number(10000)} icon={randomIcon()}>{faker.hacker.verb()}</KpiItem>
  </Kpi>

export const fewItems = () =>
  <Kpi>
    <KpiItem amount={faker.random.number(10000)} icon={randomIcon()}>{faker.hacker.verb()}</KpiItem>
    <KpiItem amount={faker.random.number(10000)} icon={randomIcon()}>{faker.hacker.verb()}</KpiItem>
    <KpiItem amount={faker.random.number(10000)} icon={randomIcon()}>{faker.hacker.verb()}</KpiItem>
  </Kpi>

export const manyItems = () =>
  <Kpi>
    <KpiItem amount={faker.random.number(10000)} icon={randomIcon()}>{faker.hacker.verb()}</KpiItem>
    <KpiItem amount={faker.random.number(10000)} icon={randomIcon()}>{faker.hacker.verb()}</KpiItem>
    <KpiItem amount={faker.random.number(10000)} icon={randomIcon()}>{faker.hacker.verb()}</KpiItem>
    <KpiItem amount={faker.random.number(10000)} icon={randomIcon()}>{faker.hacker.verb()}</KpiItem>
    <KpiItem amount={faker.random.number(10000)} icon={randomIcon()}>{faker.hacker.verb()}</KpiItem>
    <KpiItem amount={faker.random.number(10000)} icon={randomIcon()}>{faker.hacker.verb()}</KpiItem>
    <KpiItem amount={faker.random.number(10000)} icon={randomIcon()}>{faker.hacker.verb()}</KpiItem>
  </Kpi>

export const customColor = () =>
  <Kpi>
    <KpiItem className="background-color-adjust-tone-05 color-adjust-tone-12" amount={faker.random.number(10000)} icon={randomIcon()}>{faker.hacker.verb()}</KpiItem>
    <KpiItem className="background-color-adjust-tone-05 color-adjust-tone-12" amount={faker.random.number(10000)} icon={randomIcon()}>{faker.hacker.verb()}</KpiItem>
    <KpiItem className="background-color-adjust-tone-05 color-adjust-tone-12" amount={faker.random.number(10000)} icon={randomIcon()}>{faker.hacker.verb()}</KpiItem>
    <KpiItem className="background-color-adjust-tone-05 color-adjust-tone-12" amount={faker.random.number(10000)} icon={randomIcon()}>{faker.hacker.verb()}</KpiItem>
    <KpiItem className="background-color-adjust-tone-05 color-adjust-tone-12" amount={faker.random.number(10000)} icon={randomIcon()}>{faker.hacker.verb()}</KpiItem>
  </Kpi>
