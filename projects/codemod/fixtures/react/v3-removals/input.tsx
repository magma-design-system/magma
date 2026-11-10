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
    <MdsBanner deletable headline="Salvato">
      Le modifiche sono salvate.
    </MdsBanner>
    <MdsToast visible={open} deletable={true} duration={0}>
      Invio non riuscito
    </MdsToast>
    <MdsPushNotificationItem deletable={open} message="Nuovo documento" />
    <MdsChip label="Tag" deletable />
    <MdsTree async label="Archivio">
      <MdsTreeItem label="Ufficio" async />
    </MdsTree>
  </>
);
