import { RU_PORTRAITS } from '@/components/ru-portraits';
import type { Domain } from '@/lib/domain';
import { RU_CORE } from './ru-core';

/** Русский домен вместе с картинками. Ср. src/domains/us.ts: всё, что тянет
 *  require(), живёт здесь, а не в ru-core.ts, который загружает `npm test`. */
export const RU: Domain = {
  ...RU_CORE,
  portraits: RU_PORTRAITS,
  background: require('@/assets/images/ru-background.jpg'),
};
