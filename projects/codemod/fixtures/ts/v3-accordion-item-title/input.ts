export class FaqComponent {
  question = 'Come si paga?';

  // a whole template: the item that leaves typography out is reported
  answer = `<mds-accordion-item label="Chi puo' chiederlo?"></mds-accordion-item>`;

  // a template with ${} holding an item: checked by hand
  faq = `<mds-accordion-item label="${this.question}"></mds-accordion-item>`;

  // a template with ${} and no element the jump has markup rules on: not reported
  badge = `<mds-badge label="${this.question}"></mds-badge>`;
}
