import { MenuScreen } from '@/screens/MenuScreen';

/** Route wrapper. The screen itself is shared; the domain comes from the layout
 *  above, so this file carries nothing but the route's existence. */
export default function USMenu() {
  return <MenuScreen />;
}
