// All page copy, both locales, in one place.
//
// The Arabic here is not a fresh translation. It is carried over from the
// bilingual Astro build in ../dr.jihad, which was written and reviewed against
// the same brief — so the two builds say the same thing in the same voice.
//
// !! PLACEHOLDER DATA !!
// Contact details, case treatment labels and every figure in `record` are DUMMY
// values, added so the page reads as finished in client review. They are NOT
// facts about this practice. This is a medical clinic: each one must be
// replaced with confirmed information before launch. Search for PLACEHOLDER.
//
// Anything still unconfirmed carries `confirmed: false` and is deliberately
// withheld from the JSON-LD in seo.js — publishing a fabricated address or
// phone number as structured data would feed a wrong NAP into Google's local
// index, which is markedly harder to undo than a wrong line of body copy.

// The production origin, no trailing slash. Every canonical, hreflang, og:url
// and sitemap entry is built from it, so a wrong value here points search
// engines at the wrong host. Override at build time with SITE_URL=... npm run build
//
// Pick one host and keep it: if the site also answers on www.drjihad.care or a
// .pages.dev subdomain, those must 301 here rather than serve the same pages,
// or the duplicates compete with this origin in search.
export const SITE = 'https://drjihad.care';

export const locales = ['en', 'ar'];

/** English lives at the root so it doubles as x-default; Arabic at /ar/. */
export const pathFor = (lang) => (lang === 'en' ? '/' : `/${lang}/`);

/** The hero photograph — the LCP element. Preloaded, and never lazy. */
export const HERO = { src: '/img/smile-a.webp', w: 1080, h: 1440 };

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/**
 * Renders a record figure for one locale.
 *
 * Grouping is done by hand rather than through `toLocaleString`, because this
 * runs once on the server and again in the browser: any disagreement between
 * Node's ICU build and the visitor's would be a hydration mismatch. Arabic
 * takes Arabic-Indic digits and no separator, matching the reviewed build.
 */
export function formatNumber(n, lang) {
  const whole = String(Math.round(n));
  return lang === 'ar'
    ? whole.replace(/\d/g, (d) => AR_DIGITS[+d])
    : whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// The four stacked before/after composites. Each source file is one image with
// the original on top and the result below, the clinic watermark on the join —
// so a full comparison costs a single download. Labels come from `strings`.
export const casePairs = [
  { id: '01', src: '/img/pair-01.webp' },
  { id: '02', src: '/img/pair-02.webp' },
  { id: '03', src: '/img/pair-03.webp' },
  { id: '04', src: '/img/pair-04.webp' },
];

export const strings = {
  en: {
    lang: 'en',
    dir: 'ltr',
    clinic: 'Jihad Dental Care',
    doctor: 'Dr. Jihad Alrashed',
    tagline: 'We create your smile',

    meta: {
      // 62 chars — fits Google's ~600px title budget without truncation, and
      // leads with the three treatments people actually search by name.
      title: 'Jihad Dental Care — Implants, Veneers & Orthodontics',
      description:
        'Full-service dental clinic led by Dr. Jihad Alrashed: implants, veneers, orthodontics, general dentistry, dental laser and facial aesthetics under one roof.',
      ogLocale: 'en_US',
    },

    // A real link, not a JS toggle, so a crawler can walk to the other locale.
    switchTo: { code: 'ar', href: '/ar/', label: 'عربي', title: 'اقرأ بالعربية' },

    hero: {
      lines: ['Every treatment.', 'One roof.', 'One standard.'],
      lede:
        "Dr. Jihad Alrashed and the clinic's dentists handle checkups, implants, orthodontics, veneers, laser and facial aesthetics — from the first appointment to the last polish, in one place.",
      alt: 'Close-up of a finished smile, photographed at the clinic',
      primary: 'Contact the clinic',
      secondary: 'See real results',
    },

    // The hairline index along the bottom of the hero.
    scope: ['Veneers', 'Implants', 'General', 'Orthodontics', 'Botox & filler', 'Dental laser', 'Skin laser'],

    cases: {
      heading: 'Every seam remembers a hand.',
      sub: 'Drag the seam. Above it the work as it stands, below it as it came.',
      before: 'As it came',
      after: 'As it stands',
      caseWord: 'Case',
      handle: 'drag to move the seam',
      compare: 'the same patient before and after treatment at the clinic. Drag the seam to compare.',
      shown: 'of the finished result shown',
      // PLACEHOLDER
      labels: [
        'Porcelain veneers, upper arch',
        'Full smile reconstruction',
        'Composite bonding & whitening',
        'Crowns, lower anterior',
      ],
    },

    treatments: {
      heading: 'Everything, in one place.',
      items: [
        {
          name: 'Veneers, whitening & smile design',
          note: 'Porcelain and composite work, shade-matched to the face it belongs to.',
          lead: true,
        },
        {
          name: 'Implants & oral surgery',
          note: 'A permanent foundation: placement, extractions and bone work.',
          lead: true,
        },
        {
          name: 'General & family dentistry',
          note: 'Checkups, cleanings, fillings, root canals and crowns — for every age.',
          lead: true,
        },
        {
          name: 'Orthodontics & clear aligners',
          note: 'Fixed braces and clear trays, monitored to the last millimetre.',
        },
        {
          name: 'Botox & lip filler',
          note: 'Injectables administered at the clinic, alongside the dental work.',
        },
        {
          name: 'Dental laser',
          note: 'Gum reshaping, soft-tissue work and laser-assisted whitening.',
        },
        {
          name: 'Cosmetic skin laser',
          note: 'Skin treatment on the same visit, at the same clinic.',
        },
      ],
    },

    record: {
      heading: 'The record.',
      sub: 'The practice in numbers.',
      // PLACEHOLDER. Numbers, not strings: they are counted up on screen and
      // rendered through formatNumber(), which handles grouping per locale.
      items: [
        { label: 'Years in practice', value: 15 },
        { label: 'Cases completed', value: 4200 },
        { label: 'Dentists in the clinic', value: 4 },
        { label: 'Treatment rooms', value: 6 },
      ],
    },

    reach: {
      heading: 'Reach us.',
      // PLACEHOLDER, every one. `ltr` forces Latin-digit runs to render
      // left-to-right when the surrounding paragraph direction is RTL.
      items: [
        { key: 'address', label: 'Address', value: 'Sheikh Zayed Road, Business Bay, Dubai', confirmed: false },
        { key: 'phone', label: 'Phone', value: '+971 4 123 4567', ltr: true, confirmed: false },
        { key: 'whatsapp', label: 'WhatsApp', value: '+971 50 123 4567', ltr: true, confirmed: false },
        { key: 'hours', label: 'Hours', value: 'Sat – Thu, 9:00 – 21:00', ltr: true, confirmed: false },
      ],
    },
  },

  ar: {
    lang: 'ar',
    dir: 'rtl',
    clinic: 'جهاد لطب الأسنان',
    doctor: 'د. جهاد الراشد',
    tagline: 'نصنع ابتسامتك',

    meta: {
      title: 'جهاد لطب الأسنان — زراعة وعدسات وتقويم',
      description:
        'عيادة أسنان متكاملة بقيادة د. جهاد الراشد: زراعة، عدسات، تقويم، طب أسنان عام، ليزر الأسنان وتجميل الوجه تحت سقف واحد.',
      ogLocale: 'ar_AE',
    },

    switchTo: { code: 'en', href: '/', label: 'English', title: 'Read in English' },

    hero: {
      lines: ['كافة العلاجات', 'مكان واحد', 'معيار واحد'],
      lede:
        'د. جهاد الراشد وأطباء العيادة: فحوصات وحشوات، زراعة، تقويم، عدسات، ليزر وتجميل الوجه — من أول موعد إلى آخر لمسة، في مكان واحد.',
      alt: 'صورة قريبة لابتسامة بعد العلاج، مُلتقطة في العيادة',
      primary: 'تواصل مع العيادة',
      secondary: 'شاهد النتائج',
    },

    scope: ['العدسات', 'الزراعة', 'طب عام', 'التقويم', 'بوتوكس وفيلر', 'ليزر الأسنان', 'ليزر البشرة'],

    cases: {
      heading: 'كل وصلة تحفظ أثر اليد.',
      sub: 'اسحب الوصلة. فوقها العمل كما صار، وتحتها كما كان.',
      before: 'كما كانت',
      after: 'كما صارت',
      caseWord: 'الحالة',
      handle: 'اسحب لتحريك الوصلة',
      compare: 'المريض نفسه قبل العلاج وبعده في العيادة. اسحب الوصلة للمقارنة.',
      shown: 'من النتيجة النهائية ظاهرة',
      // PLACEHOLDER
      labels: [
        'عدسات بورسلين، الفك العلوي',
        'إعادة بناء كاملة للابتسامة',
        'كومبوزيت وتبييض',
        'تيجان، الأمامية السفلية',
      ],
    },

    treatments: {
      heading: 'كل شيء، في مكان واحد.',
      items: [
        {
          name: 'العدسات، التبييض وتصميم الابتسامة',
          note: 'بورسلين وكومبوزيت، بلونٍ يُختار ليناسب الوجه الذي ينتمي إليه.',
          lead: true,
        },
        {
          name: 'الزراعة وجراحة الفم',
          note: 'أساسٌ دائم: زراعة، خلع، وأعمال العظم.',
          lead: true,
        },
        {
          name: 'طب الأسنان العام والعائلي',
          note: 'فحوصات، تنظيف، حشوات، علاج عصب وتيجان — لكل الأعمار.',
          lead: true,
        },
        {
          name: 'التقويم والمصففات الشفافة',
          note: 'تقويم ثابت ومصففات شفافة، بمتابعة حتى آخر مليمتر.',
        },
        {
          name: 'البوتوكس وفيلر الشفاه',
          note: 'حقن تجميلية داخل العيادة، إلى جانب العمل السنّي.',
        },
        {
          name: 'ليزر الأسنان',
          note: 'إعادة تشكيل اللثة، أعمال الأنسجة الرخوة، وتبييض بمساعدة الليزر.',
        },
        {
          name: 'ليزر البشرة التجميلي',
          note: 'علاج البشرة في الزيارة نفسها، وفي العيادة نفسها.',
        },
      ],
    },

    record: {
      heading: 'السجل.',
      sub: 'العيادة بالأرقام.',
      // PLACEHOLDER. See the note on the English figures.
      items: [
        { label: 'سنوات الممارسة', value: 15 },
        { label: 'حالات مكتملة', value: 4200 },
        { label: 'أطباء في العيادة', value: 4 },
        { label: 'غرف العلاج', value: 6 },
      ],
    },

    reach: {
      heading: 'تواصل معنا.',
      // PLACEHOLDER
      items: [
        { key: 'address', label: 'العنوان', value: 'شارع الشيخ زايد، الخليج التجاري، دبي', confirmed: false },
        { key: 'phone', label: 'الهاتف', value: '+971 4 123 4567', ltr: true, confirmed: false },
        { key: 'whatsapp', label: 'واتساب', value: '+971 50 123 4567', ltr: true, confirmed: false },
        // No `ltr` here: unlike the phone rows this value is Arabic text with
        // Arabic-Indic numerals, and forcing it LTR throws the comma to the
        // wrong end of the line.
        { key: 'hours', label: 'الدوام', value: 'السبت – الخميس، ٩:٠٠ – ٢١:٠٠', confirmed: false },
      ],
    },
  },
};
