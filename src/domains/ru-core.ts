import { RU_ERAS, RU_RULERS } from '@/data/ru-rulers';
import { nameKeys, norm, yearKeys, yearsText } from '@/lib/answers';
import type { DomainCore, FieldKey, FieldSpec, GivenKey, ModeKey } from '@/lib/domain';

/* Русский домен без картинок — как и us-core.ts, чистые данные, чтобы их мог
 * загрузить `npm test`. Портреты и фон подключаются в соседнем ru.ts.
 *
 * Главное отличие от американского домена: правители не нумеруются. Поле `no`
 * есть у каждой записи, но его не показывают и не спрашивают — оно не входит ни
 * в `order`, ни в `givens`, ни в `modeKeys`. Спецификация поля `no` ниже всё
 * равно объявлена: `fields` тотально по FieldKey, и это избавляет экраны от
 * проверок на undefined. Вызывать её здесь некому.
 */

const PRESENT_ALIASES = ['настоящее время', 'н. в.', 'наши дни', 'сейчас'];

const FIELDS: Record<FieldKey, FieldSpec> = {
  // Не используется: 'no' нет ни в order, ни в givens. См. комментарий выше.
  no: {
    label: 'Номер',
    placeholder: 'напр. 12',
    keyboardType: 'number-pad',
    show: (r) => `#${r.no}`,
    check: (r, v) => norm(v) === norm(r.no),
  },
  name: {
    label: 'Имя',
    placeholder: 'напр. Екатерина II',
    show: (r) => r.name,
    check: (r, v) => nameKeys(r).includes(norm(v)),
  },
  years: {
    label: 'Годы правления',
    placeholder: 'напр. 1762-1796',
    keyboardType: 'numbers-and-punctuation',
    show: (r) => yearsText(r, 'н. в.'),
    check: (r, v) => yearKeys(r, PRESENT_ALIASES).includes(norm(v)),
  },
};

const ORDER: FieldKey[] = ['name', 'years'];
const GIVENS: GivenKey[] = ['name', 'years', 'portrait'];
const MODE_KEYS: ModeKey[] = ['name', 'years', 'portrait', 'mixed'];

/** 1 правитель / 2 правителя / 5 правителей. */
function rulerCount(n: number): string {
  const ones = n % 10;
  const tens = n % 100;
  if (tens >= 11 && tens <= 14) return `${n} правителей`;
  if (ones === 1) return `${n} правитель`;
  if (ones >= 2 && ones <= 4) return `${n} правителя`;
  return `${n} правителей`;
}

export const RU_CORE: DomainCore = {
  key: 'ru',
  brand: 'Правители России',
  records: RU_RULERS,
  fields: FIELDS,
  order: ORDER,
  givens: GIVENS,
  modeKeys: MODE_KEYS,
  modes: {
    no: { title: '', blurb: '' }, // не используется — см. modeKeys
    name: { title: 'Дано имя', blurb: 'В каждом вопросе показано имя правителя.' },
    years: { title: 'Даны годы', blurb: 'В каждом вопросе показаны годы правления.' },
    portrait: { title: 'Дан портрет', blurb: 'Портрет — и оба ответа к нему.' },
    mixed: { title: 'Вперемешку', blurb: 'Подсказка меняется от вопроса к вопросу.' },
  },
  presets: [
    { label: 'Все', lo: 1, hi: RU_RULERS.length },
    { label: 'Романовы', ...RU_ERAS.romanov },
    { label: 'Советский период', ...RU_ERAS.soviet },
    { label: 'Россия', ...RU_ERAS.russia },
  ],
  // Без ползунка: номеров правителей игрок не видит, поэтому произвольный
  // числовой отрезок ему ничего не говорит — эпохи и есть весь выбор.
  slider: false,
  accent: '#0f4c81',
  strings: {
    lede:
      'В каждом раунде даётся одна часть правления — имя, годы или портрет — ' +
      'а остальное нужно вспомнить. Вопросы не кончаются, пока вы не остановитесь.',
    hint: 'Имя целиком. Порядковый номер — часть имени: Николай I и Николай II засчитываются порознь.',
    back: '← К режимам',
    browse: (terms) => `Посмотреть всех — ${terms} →`,
    listLede: (terms, people) =>
      `${rulerCount(terms)}, ${people} человек. Путин занимает два несмежных срока, ` +
      'поэтому записан дважды.',
    rangeTitle: 'Кто в игре',
    count: rulerCount,
    // Без «от … до»: имена пришлось бы склонять, а склонять их в коде — хуже,
    // чем обойтись тире.
    spanNames: (first, last) => ` — ${first} … ${last}`,
    rangeAll: 'Все правители',
    rangeSpan: (lo, hi) => `${lo}–${hi}`,
    thumbLo: 'Начало периода',
    thumbHi: 'Конец периода',
    portrait: 'Портрет',
    present: 'н. в.',
    presentAliases: PRESENT_ALIASES,
    check: 'Проверить',
    next: 'Следующий вопрос',
    emptyPool: 'В этом периоде никого нет.',
    correct: 'Верно',
    notQuite: 'Не совсем',
    bornPrefix: 'Настоящее имя —',
    bornSuffix: '— засчитывается любое из двух.',
  },
};
