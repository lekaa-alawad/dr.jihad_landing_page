// All page copy, both locales, in one place.
//
// The Arabic here is not a fresh translation. It is carried over from the
// bilingual Astro build in ../dr.jihad, which was written and reviewed against
// the same brief — so the two builds say the same thing in the same voice.
//
// !! PLACEHOLDER DATA !!
// The case treatment labels are still DUMMY values, added so the page reads as
// finished in client review. They are NOT facts about this practice. This is a
// medical clinic: they must be replaced with confirmed information before
// launch. Search for PLACEHOLDER.
//
// The nine departments, the imaging list, the `record` figures and every row in
// `reach` came from the clinic itself and are confirmed.
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
 * A displayed number reduced to what a dialer will accept: digits and the
 * leading `+` only. The spacing in `reach` is grouped for reading, and a
 * `tel:` href carrying those spaces is not reliably dialable.
 */
export const dialable = (n) => n.replace(/[^\d+]/g, '');

/** wa.me refuses the `+`, and wants the country code with no separators. */
export const waLink = (n) => `https://wa.me/${n.replace(/\D/g, '')}`;

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
      // 61 chars — fits Google's ~600px title budget without truncation. The
      // city earns its place ahead of a fourth treatment: almost every search
      // that can convert here is a local one.
      title: 'Jihad Dental Care Damascus — Implants, Veneers & Braces',
      description:
        'Full-service dental clinic in Damascus led by Dr. Jihad Alrashed: cosmetic dentistry, implants, endodontics, orthodontics, children’s dentistry, dental and skin laser, injectables and an in-house Carestream imaging suite.',
      ogLocale: 'en_US',
    },

    // A real link, not a JS toggle, so a crawler can walk to the other locale.
    switchTo: { code: 'ar', href: '/ar/', label: 'عربي', title: 'اقرأ بالعربية' },

    hero: {
      lines: ['Every treatment.', 'One roof.', 'One standard.'],
      lede:
        "Dr. Jihad Alrashed and the clinic's dentists handle cosmetic work, implants, root canals, orthodontics, children's teeth, laser and injectables — with the imaging done on site, from the first appointment to the last polish.",
      alt: 'Close-up of a finished smile, photographed at the clinic',
      primary: 'Contact the clinic',
      secondary: 'See real results',
    },

    // The hairline index along the bottom of the hero.
    // The nine departments, in the clinic's own order.
    scope: [
      'Cosmetic',
      'Implants',
      'Endodontics',
      'Orthodontics',
      "Children's",
      'Dental laser',
      'Botox & filler',
      'Skin laser',
      'Imaging',
    ],

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
      // The nine departments as the clinic lists them, in the clinic's order.
      // An item may carry a `list`: sub-capabilities rendered beneath the note.
      items: [
        {
          name: 'Cosmetic dentistry',
          note: 'Veneers, whitening and smile design — shade-matched to the face it belongs to.',
          lead: true,
        },
        {
          name: 'Dental implants',
          note: 'A permanent foundation: planning, placement and the crown that sits on top.',
          lead: true,
        },
        {
          name: 'Endodontics',
          note: 'Root canal treatment and retreatment, worked under magnification.',
          lead: true,
        },
        {
          name: 'Orthodontics',
          note: 'Fixed braces and clear aligners, monitored to the last millimetre.',
        },
        {
          name: "Children's dentistry",
          note: 'Care from the first tooth: prevention, fillings and early guidance.',
        },
        {
          name: 'Dental laser',
          note: 'Gum reshaping, soft-tissue work and laser-assisted whitening.',
        },
        {
          name: 'Injectables — botox & filler',
          note: 'Administered at the clinic, alongside the dental work.',
          gallery: {
            mode: 'dialog',
            title: 'Lip filler, treated at the clinic',
            note: 'Photographed immediately after treatment. Some swelling at this stage is normal and settles over the following days.',
            items: [
              { image: '/media/filler-01.webp', w: 1100, h: 1956, alt: 'Lips immediately after filler treatment, front view' },
              { image: '/media/filler-02.webp', w: 1100, h: 1956, alt: 'Lips immediately after filler treatment, three-quarter view' },
              { image: '/media/filler-03.webp', w: 1100, h: 1956, alt: 'Lips immediately after filler treatment, profile' },
              { image: '/media/filler-04.webp', w: 1100, h: 1956, alt: 'Lips immediately after filler treatment, close profile' },
            ],
          },
        },
        {
          name: 'Skin laser & hair removal',
          note: 'Cosmetic skin treatment on the same visit, at the same clinic.',
          gallery: {
            mode: 'dialog',
            title: 'Skin laser at the clinic',
            items: [
              { video: 'laser-face', alt: 'A facial laser treatment at the clinic, patient in protective eyewear' },
              { video: 'laser-hair', alt: 'Laser hair removal in progress, with the treatment laser behind' },
            ],
          },
        },
        {
          name: 'Radiographic imaging',
          note:
            'A department of its own, built around the Carestream system — so the images a treatment plan depends on are taken here, not somewhere else:',
          list: [
            'Panoramic imaging of both jaws',
            'Three-dimensional imaging for implants and endodontics',
            'Cephalometric imaging for orthodontic treatment',
            'Hand-wrist imaging, to estimate a patient’s skeletal age',
            'Temporomandibular joint imaging',
            'Skull base imaging',
          ],
          gallery: {
            mode: 'dialog',
            title: 'The imaging department',
            // Not "see results": this room and its console are equipment, not
            // anyone's outcome, and the shared label would misdescribe them.
            see: 'See the department',
            items: [
              { video: 'xray-room', alt: 'The clinic’s imaging room and the Carestream unit' },
              { image: '/media/console-01.webp', w: 1200, h: 879, alt: 'A jaw volume set up on the Carestream console' },
              { image: '/media/console-05.webp', w: 1200, h: 884, alt: 'A three-dimensional volume positioned on the console' },
              { image: '/media/console-02.webp', w: 963, h: 1200, alt: 'Choosing the programme and the region to be imaged' },
              { image: '/media/console-03.webp', w: 990, h: 1200, alt: 'The cephalometric programmes, hand-wrist imaging among them' },
              { image: '/media/console-04.webp', w: 900, h: 1200, alt: 'The temporomandibular joint programmes' },
            ],
          },
        },
      ],
    },

    // Chrome for the media components. Kept out of `treatments` because the
    // same strings serve every gallery on the page.
    gallery: {
      see: 'See results',
      play: 'Play video',
      close: 'Close',
    },

    record: {
      heading: 'The record.',
      sub: 'The practice in numbers.',
      // Confirmed by the clinic. Numbers, not strings: they are counted up on
      // screen and rendered through formatNumber(), which handles grouping per
      // locale.
      items: [
        { label: 'Years in practice', value: 19 },
        { label: 'Cases completed', value: 4127 },
        { label: 'Dentists in the clinic', value: 6 },
        { label: 'Treatment rooms', value: 6 },
      ],
    },

    reach: {
      heading: 'Reach us.',
      // Confirmed by the clinic. `values` is always a list, even of one, so a
      // row that grew a second number needs no change here or in the markup.
      // `tel` makes each value a dialable link; `wa` adds the WhatsApp link.
      // `ltr` forces Latin-digit runs to render left-to-right when the
      // surrounding paragraph direction is RTL.
      items: [
        {
          key: 'address',
          label: 'Address',
          values: ['Mazzeh Autostrad, Al-Naql Building, Damascus, Syria'],
          confirmed: true,
        },
        {
          key: 'phone',
          label: 'Phone',
          values: ['+963 11 613 1118', '+963 11 612 0010'],
          tel: true,
          ltr: true,
          confirmed: true,
        },
        {
          key: 'whatsapp',
          label: 'Mobile & WhatsApp',
          values: ['+963 99 33 258 44'],
          tel: true,
          wa: true,
          ltr: true,
          confirmed: true,
        },
        // Days of the week are NOT confirmed — the clinic gave the hours only.
        // That is why there is no `schemaHours` here; see reach.hoursNote below
        // and the openingHours block in seo.js.
        { key: 'hours', label: 'Hours', values: ['10:00 – 20:00'], ltr: true, confirmed: true },
      ],
      waLabel: 'WhatsApp',
    },
  },

  ar: {
    lang: 'ar',
    dir: 'rtl',
    clinic: 'جهاد لطب الأسنان',
    doctor: 'د. جهاد الراشد',
    tagline: 'نصنع ابتسامتك',

    meta: {
      title: 'جهاد لطب الأسنان دمشق — زراعة وعدسات وتقويم',
      description:
        'مركز أسنان متكامل في دمشق بقيادة د. جهاد الراشد: تجميل، زراعة، معالجة لبية، تقويم، أسنان أطفال، ليزر الأسنان والبشرة، حقونات، وقسم تصوير شعاعي بجهاز Carestream.',
      ogLocale: 'ar_AE',
    },

    switchTo: { code: 'en', href: '/', label: 'English', title: 'Read in English' },

    hero: {
      lines: ['كافة العلاجات', 'مكان واحد', 'معيار واحد'],
      lede:
        'د. جهاد الراشد وأطباء المركز: تجميل الأسنان، زراعة، معالجة لبية، تقويم، أسنان أطفال، ليزر وحقونات — والتصوير الشعاعي في المكان نفسه، من أول موعد إلى آخر لمسة.',
      alt: 'صورة قريبة لابتسامة بعد العلاج، مُلتقطة في العيادة',
      primary: 'تواصل مع العيادة',
      secondary: 'شاهد النتائج',
    },

    scope: [
      'تجميل الأسنان',
      'الزراعة',
      'المعالجة اللبية',
      'التقويم',
      'أسنان الأطفال',
      'ليزر الأسنان',
      'بوتوكس وفيلر',
      'ليزر البشرة',
      'التصوير الشعاعي',
    ],

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
      // أقسام المركز التسعة، بترتيب المركز نفسه.
      items: [
        {
          name: 'تجميل الأسنان',
          note: 'عدسات وتبييض وتصميم ابتسامة، بلونٍ يُختار ليناسب الوجه الذي ينتمي إليه.',
          lead: true,
        },
        {
          name: 'زراعة الأسنان',
          note: 'أساسٌ دائم: التخطيط، الزرع، والتعويض الذي يعلوه.',
          lead: true,
        },
        {
          name: 'المعالجة اللبية',
          note: 'معالجة الأقنية وإعادة المعالجة، بعملٍ تحت التكبير.',
          lead: true,
        },
        {
          name: 'تقويم الأسنان',
          note: 'تقويم ثابت ومصففات شفافة، بمتابعة حتى آخر مليمتر.',
        },
        {
          name: 'أسنان الأطفال',
          note: 'رعاية من أول سن: وقاية، حشوات، وتوجيه مبكر.',
        },
        {
          name: 'ليزر الأسنان',
          note: 'إعادة تشكيل اللثة، أعمال الأنسجة الرخوة، وتبييض بمساعدة الليزر.',
        },
        {
          name: 'الحقونات — بوتوكس وفيلر',
          note: 'تُجرى داخل المركز، إلى جانب العمل السنّي.',
          gallery: {
            mode: 'dialog',
            title: 'فيلر الشفاه، في المركز',
            note: 'الصور ملتقطة مباشرة بعد الجلسة. بعض التورّم في هذه المرحلة أمر طبيعي ويزول خلال الأيام التالية.',
            items: [
              { image: '/media/filler-01.webp', w: 1100, h: 1956, alt: 'الشفاه مباشرة بعد جلسة الفيلر، من الأمام' },
              { image: '/media/filler-02.webp', w: 1100, h: 1956, alt: 'الشفاه مباشرة بعد جلسة الفيلر، بزاوية ثلاثة أرباع' },
              { image: '/media/filler-03.webp', w: 1100, h: 1956, alt: 'الشفاه مباشرة بعد جلسة الفيلر، من الجانب' },
              { image: '/media/filler-04.webp', w: 1100, h: 1956, alt: 'الشفاه مباشرة بعد جلسة الفيلر، لقطة جانبية قريبة' },
            ],
          },
        },
        {
          name: 'ليزر البشرة — إزالة الشعر',
          note: 'علاج البشرة في الزيارة نفسها، وفي المركز نفسه.',
          gallery: {
            mode: 'dialog',
            title: 'ليزر البشرة في المركز',
            items: [
              { video: 'laser-face', alt: 'جلسة ليزر للوجه في المركز، مع نظارات واقية للعينين' },
              { video: 'laser-hair', alt: 'جلسة إزالة شعر بالليزر، وجهاز الليزر في الخلف' },
            ],
          },
        },
        {
          name: 'التصوير الشعاعي',
          note:
            'قسم خاص مزوّد بجهاز Carestream العالمي، يتيح خيارات تصوير واسعة تتضمن:',
          list: [
            'التصوير البانورامي للفكين',
            'التصوير ثلاثي الأبعاد الخاص بالزرع والمعالجة اللبية',
            'التصوير السيفالومتري الخاص بالمعالجة التقويمية',
            'تصوير كف اليد لتقدير العمر العظمي للمريض',
            'تصوير المفصل الفكي الصدغي',
            'تصوير قاعدة الجمجمة',
          ],
          gallery: {
            mode: 'dialog',
            title: 'قسم التصوير الشعاعي',
            see: 'شاهد القسم',
            items: [
              { video: 'xray-room', alt: 'غرفة التصوير في المركز وجهاز Carestream' },
              { image: '/media/console-01.webp', w: 1200, h: 879, alt: 'تحديد حجم التصوير للفكين على شاشة جهاز Carestream' },
              { image: '/media/console-05.webp', w: 1200, h: 884, alt: 'تحديد حجم تصوير ثلاثي الأبعاد على الشاشة' },
              { image: '/media/console-02.webp', w: 963, h: 1200, alt: 'اختيار البرنامج والمنطقة المراد تصويرها' },
              { image: '/media/console-03.webp', w: 990, h: 1200, alt: 'برامج التصوير السيفالومتري، ومنها تصوير كف اليد' },
              { image: '/media/console-04.webp', w: 900, h: 1200, alt: 'برامج تصوير المفصل الفكي الصدغي' },
            ],
          },
        },
      ],
    },

    gallery: {
      see: 'شاهد النتائج',
      play: 'تشغيل الفيديو',
      close: 'إغلاق',
    },

    record: {
      heading: 'السجل.',
      sub: 'العيادة بالأرقام.',
      // Confirmed by the clinic. See the note on the English figures.
      items: [
        { label: 'سنوات الممارسة', value: 19 },
        { label: 'حالات مكتملة', value: 4127 },
        { label: 'أطباء العيادة', value: 6 },
        { label: 'غرف العلاج', value: 6 },
      ],
    },

    reach: {
      heading: 'تواصل معنا.',
      // Confirmed by the clinic. See the note on the English rows.
      items: [
        {
          key: 'address',
          label: 'العنوان',
          values: ['دمشق، سوريا — أوتوستراد المزة، بناء النقل'],
          confirmed: true,
        },
        {
          key: 'phone',
          label: 'الهاتف',
          values: ['+963 11 613 1118', '+963 11 612 0010'],
          tel: true,
          ltr: true,
          confirmed: true,
        },
        {
          key: 'whatsapp',
          label: 'الموبايل وواتساب',
          values: ['+963 99 33 258 44'],
          tel: true,
          wa: true,
          ltr: true,
          confirmed: true,
        },
        // No `ltr` here: unlike the phone rows this value is Arabic text with
        // Arabic-Indic numerals, and forcing it LTR throws the dash to the
        // wrong end of the line.
        { key: 'hours', label: 'الدوام', values: ['من ١٠:٠٠ صباحاً إلى ٨:٠٠ مساءً'], confirmed: true },
      ],
      waLabel: 'واتساب',
    },
  },
};
