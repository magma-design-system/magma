import React from 'react'
import faker from 'faker'
import ThemeProvider from '@Design/Theme/ThemeProvider'
import H3 from '@Typography/H3/H3'
import Paragraph from '@Typography/Paragraph/Paragraph'
import Button from '@Form/Button/Button'
import Grid from '../Policy/Layout/Grid/Grid'
import Row from '@Layout/Row/Row'
import InputEmail from '@Form/Input/InputEmail'
import InputPhone from '@Form/Input/InputPhone'
import InputText from '@Form/Input/InputText'
import Checkbox from '@Form/Checkbox/Checkbox'
import Textarea from '@Form/Textarea/Textarea'
import logo from '#Assets/logo/gruppo-maggioli.svg'
faker.locale = 'it'

export default {
  title: 'Form/Theming',
  component: Grid,
}

const h3Sentence = faker.lorem.sentence()
const paragraph = faker.lorem.paragraph()
const checkSentence1 = faker.lorem.sentence()
const checkSentence2 = faker.lorem.sentence()
const checkSentence3 = faker.lorem.sentence()
const firstName = faker.name.firstName()
const lastName = faker.name.lastName()
const phoneNumber = faker.phone.phoneNumber()
const email = faker.internet.email()
const buttonAction = faker.hacker.verb()

const Form = () =>
  <Grid>
    <H3>{h3Sentence}</H3>
    <Paragraph>{paragraph}</Paragraph>
    <Grid columns="2">
      <InputText label="Nome" placeholder={firstName}/>
      <InputText label="Cognome" placeholder={lastName}/>
    </Grid>
    <InputPhone label="Telefono" placeholder={phoneNumber}/>
    <InputEmail label="E-mail" placeholder={email}/>
    <Textarea label="Messaggio" placeholder="Scrivi il mesaggio qui..."></Textarea>
    <Checkbox>{checkSentence1}</Checkbox>
    <Checkbox>{checkSentence2}</Checkbox>
    <Checkbox>{checkSentence3}</Checkbox>
    <Button>{buttonAction}</Button>
    <Row>
      <img src="//via.placeholder.com/30x30"/>
      <Paragraph>Consulta la nostra Privacy Policy per ulteriori informazioni.</Paragraph>
    </Row>
  </Grid>

export const defaultTheme = () =>
  <ThemeProvider>
    <Form/>
  </ThemeProvider>

export const flatTheme = () =>
  <ThemeProvider name="flat">
    <Form/>
  </ThemeProvider>
