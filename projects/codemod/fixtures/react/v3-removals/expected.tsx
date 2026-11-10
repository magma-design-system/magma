import {
  MdsBanner,
  MdsChip,
  MdsPushNotificationItem,
  MdsToast,
  MdsTree,
  MdsTreeItem,
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
    <MdsTree label="Archivio">
      <MdsTreeItem label="Ufficio" async />
    </MdsTree>
  </>
);
