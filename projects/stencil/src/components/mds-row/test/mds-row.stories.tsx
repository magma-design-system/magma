/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { h } from '@stencil/core'

export default {
  title: 'Deprecated / Layout / Row',
}

export const Default = () =>
  <mds-row class="w-full">
    <mds-card class="gap-2 bg-label-amaranth-09 shadow-none">
      <mds-text>Il componente mds-row è un semplice wrapper che ha come default il display a <mds-text typography="hack">flex</mds-text> e <mds-text typography="hack">gap</mds-text> di distanza tra gli elementi predefinito.</mds-text>
    </mds-card>
    <mds-card class="gap-2 bg-label-yellow-09 shadow-none">
      <mds-text>Seconda colonna</mds-text>
    </mds-card>
    <mds-card class="gap-2 bg-label-green-09 shadow-none">
      <mds-text>Terza colonna</mds-text>
    </mds-card>
  </mds-row>

export const Wrap = () =>
  <mds-row class="flex-wrap w-full">
    <mds-card class="flex-grow gap-2 bg-label-amaranth-09 shadow-none">
      <mds-text>Il componente mds-row è un semplice wrapper che ha come default il display a <mds-text typography="hack">flex</mds-text> e <mds-text typography="hack">gap</mds-text> di distanza tra gli elementi predefinito.</mds-text>
    </mds-card>
    <mds-card class="flex-grow gap-2 bg-label-yellow-09 shadow-none">
      <mds-text>Seconda colonna</mds-text>
    </mds-card>
    <mds-card class="flex-grow gap-2 bg-label-green-09 shadow-none">
      <mds-text>Terza colonna</mds-text>
    </mds-card>
  </mds-row>

export const Grow = () =>
  <mds-row class="w-full">
    <mds-card class="flex-grow gap-2 bg-label-amaranth-09 shadow-none w-full">
      <mds-text>Il componente mds-row è un semplice wrapper che ha come default il display a <mds-text typography="hack">flex</mds-text> e <mds-text typography="hack">gap</mds-text> di distanza tra gli elementi predefinito.</mds-text>
    </mds-card>
    <mds-card class="gap-2 bg-label-green-09 shadow-none">
      <mds-text>Seconda colonna</mds-text>
    </mds-card>
  </mds-row>
