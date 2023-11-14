import React from 'react'
import faker from 'faker'
import Action from '@Typography/Action/Action'
import H1 from '@Typography/H1/H1'
import H2 from '@Typography/H2/H2'
import H3 from '@Typography/H3/H3'
import H4 from '@Typography/H4/H4'
import H5 from '@Typography/H5/H5'
import H6 from '@Typography/H6/H6'
import Overline from '@Typography/Overline/Overline'
import Paragraph from '@Typography/Paragraph/Paragraph'
import Detail from '@Typography/Detail/Detail'
import Caption from '@Typography/Caption/Caption'
import LabelParagraph from '@Typography/LabelParagraph/LabelParagraph'
import LabelDetail from '@Typography/LabelDetail/LabelDetail'
import LabelCaption from '@Typography/LabelCaption/LabelCaption'
import Code from '@Typography/Code/Code'
import Hack from '@Typography/Hack/Hack'
faker.locale = 'it'

export default {
  title: 'Design/Typography',
  component: Paragraph,
}

export const primaryH1 = () =>
  <H1>{faker.lorem.paragraph()}</H1>

export const Anchor = () =>
  <H1 anchor>{faker.lorem.paragraph()}</H1>

export const AutomaticID = () =>
  <H1 autoId>{faker.lorem.paragraph()}</H1>

export const ManualID = () =>
  <H1 id="Hello world!">{faker.lorem.paragraph()}</H1>

export const ManualIDWithBeautify = () =>
  <H1 id="Hello world!" beautifyId>{faker.lorem.paragraph()}</H1>

export const primaryH2 = () =>
  <H2>{faker.lorem.paragraph()}</H2>

export const primaryH3 = () =>
  <H3>{faker.lorem.paragraph()}</H3>

export const primaryH4 = () =>
  <H4>{faker.lorem.paragraph()}</H4>

export const primaryH5 = () =>
  <H5>{faker.lorem.paragraph()}</H5>

export const primaryH6 = () =>
  <H6>{faker.lorem.paragraph()}</H6>

export const primaryAction = () =>
  <Action>{faker.lorem.paragraph()}</Action>

export const primaryOverline = () =>
  <Overline>{faker.lorem.paragraph()}</Overline>

export const secondaryParagraph = () =>
  <Paragraph>{faker.lorem.paragraph()}</Paragraph>

export const secondaryDetail = () =>
  <Detail>{faker.lorem.paragraph()}</Detail>

export const secondaryCaption = () =>
  <Caption>{faker.lorem.paragraph()}</Caption>

export const secondaryLabelParagraph = () =>
  <LabelParagraph>{faker.lorem.paragraph()}</LabelParagraph>

export const secondaryLabelDetail = () =>
  <LabelDetail>{faker.lorem.paragraph()}</LabelDetail>

export const secondaryLabelCaption = () =>
  <LabelCaption>{faker.lorem.paragraph()}</LabelCaption>

export const monoCode = () =>
  <Code>{faker.lorem.paragraph()}</Code>

export const monoHack = () =>
  <Hack>{faker.lorem.paragraph()}</Hack>
