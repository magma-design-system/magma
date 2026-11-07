import { MdsAccordion, MdsAccordionItem } from '@maggioli-design-system/magma-react';

export const Faq = ({ level }: { level: 'h5' | 'h6' }) => (
  <MdsAccordion>
    <MdsAccordionItem label="Come si paga?">Con PagoPA.</MdsAccordionItem>
    <MdsAccordionItem label="Chi puo' chiederlo?" typography="h6">
      Chi risiede nel comune.
    </MdsAccordionItem>
    <MdsAccordionItem label="Quanto dura?" typography={level}>
      Trenta giorni.
    </MdsAccordionItem>
  </MdsAccordion>
);
