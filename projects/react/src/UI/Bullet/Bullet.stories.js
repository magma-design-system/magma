import React from 'react'
import faker from 'faker'

import Bullet from '@UI/Bullet/Bullet'

export default {
  title: 'UI/Bullet',
  component: Bullet,
}

export const basicUsage = () =>
  <Bullet>{faker.hacker.verb()}</Bullet>

export const value = () =>
  <Bullet value="36">{faker.hacker.verb()}</Bullet>

export const fillWidth = () =>
  <Bullet className="flex" value="36">{faker.hacker.verb()}</Bullet>

export const color = () =>
  <Bullet className="bg-label-amaranth-08 text-label-amaranth-18" value="36">{faker.hacker.verb()}</Bullet>
