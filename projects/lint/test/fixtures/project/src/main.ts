import { setAssetPath } from '@maggioli-design-system/magma/components';
import { IconsSetService } from '@maggioli-design-system/magma/services';

IconsSetService.setSvgPath('/svg/');
setAssetPath(window.location.origin);
