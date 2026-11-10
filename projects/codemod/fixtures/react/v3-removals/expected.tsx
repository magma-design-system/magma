import {
  MdsBanner,
  MdsChip,
  MdsPushNotificationItem,
  MdsToast,
} from '@maggioli-design-system/magma-react';

export const Messages = ({ open }: { open: boolean }) => (
  <>
    <MdsBanner dismissible headline="Salvato">
      Le modifiche sono salvate.
    </MdsBanner>
    <MdsToast visible={open} dismissible={true} duration={0}>
      Invio non riuscito
    </MdsToast>
    <MdsPushNotificationItem dismissible={open} message="Nuovo documento" />
    <MdsChip label="Tag" deletable />
  </>
);
