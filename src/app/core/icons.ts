import { addIcons } from 'ionicons';
import {
  add,
  alertCircleOutline,
  checkmark,
  chatboxOutline,
  chevronBackOutline,
  chevronDownOutline,
  chevronForwardOutline,
  clipboardOutline,
  constructOutline,
  homeOutline,
  leafOutline,
  listOutline,
  locateOutline,
  searchOutline,
  shieldOutline,
  cameraOutline,
  closeCircle,
  wifiOutline,
} from 'ionicons/icons';

/** Registers every ionicon the app uses, once at startup. */
export function registerIcons(): void {
  addIcons({
    add,
    'alert-circle-outline': alertCircleOutline,
    checkmark,
    'chatbox-outline': chatboxOutline,
    'chevron-back-outline': chevronBackOutline,
    'chevron-down-outline': chevronDownOutline,
    'chevron-forward-outline': chevronForwardOutline,
    'clipboard-outline': clipboardOutline,
    'construct-outline': constructOutline,
    'home-outline': homeOutline,
    'leaf-outline': leafOutline,
    'list-outline': listOutline,
    'locate-outline': locateOutline,
    'search-outline': searchOutline,
    'shield-outline': shieldOutline,
    'camera-outline': cameraOutline,
    'close-circle': closeCircle,
    'wifi-outline': wifiOutline,
  });
}

export const CATEGORY_ICONS: Record<string, string> = {
  Maintenance: 'construct-outline',
  Safety: 'shield-outline',
  'IT and network': 'wifi-outline',
  Grounds: 'leaf-outline',
};
