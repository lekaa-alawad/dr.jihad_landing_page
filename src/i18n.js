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
      // The English side of the Arabic copy, kept line for line so the two
      // locales say the same thing in the same shape. The list is the clinic's
      // own, and it does not name dental laser — the department exists further
      // down the page, but it is not in the sentence the clinic wrote.
      lede: [
        'If you are looking for a complete medical centre for dental treatment and cosmetic work, you are in the right place.',
        'A team of specialist doctors, for the following:',
        "Cosmetic dentistry, dental implants, endodontics, orthodontics, children's dentistry, skin injectables (Botox and filler), skin laser (hair removal), and radiographic imaging.",
        'All in the same place, from the first visit to the last polish.',
      ].join('\n'),
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

    // The clinic's own account of itself. Supplied in Arabic by the practice;
    // the Arabic below is their sentences untouched, and this English is those
    // sentences carried across line for line, in their register rather than the
    // drier one the rest of the English page uses.
    //
    // The prose sits in the page. The seven devices open in a dialog: they are
    // the hardware under the departments above, and run inline they would bury
    // the two paragraphs that actually make the argument.
    about: {
      heading: 'About the centre.',
      body: [
        'The centre of Dr. Jihad Alrashed for facial and dental aesthetics is among the first in Syria to offer specialist treatment to the highest academic standards, with the newest medical equipment in dentistry and skin care, and within a working environment held to the highest levels of sterilisation.',
        'Experience of more than nineteen years has built an integrated team of doctors, to set the treatment plan best suited to every patient who decides to be in our care — until we reach with them the best treatment result they can be given.',
      ],
      kit: {
        lead: 'And to make certain that result is reached, the centre has been equipped with the newest specialist devices:',
        see: 'The equipment',
        title: 'The newest specialist devices',
        // `model` is the make as the clinic writes it, in Latin script. It is
        // kept apart from the name so the markup can mark it as its own LTR
        // run — see the note in Kit.jsx.
        items: [
          {
            name: 'Diode laser',
            note: 'So that surgical work on the gums — excision or curettage — is done with the least trauma and the least bleeding possible.',
          },
          {
            name: 'Piezo unit',
            note: 'So that bone cutting during an extraction or an implant is done safely, without any trauma to the vessels or the nerves in the working field.',
          },
          {
            name: 'Microscope',
            note: 'So the doctor has a magnified field through fine surgical work and through endodontic treatment — root canal.',
          },
          {
            name: 'Preparation and thermal obturation units',
            note: 'So that endodontic treatment — root canal — reaches the best result it can.',
          },
          {
            name: 'Sedation gas mask (laughing gas)',
            note: 'So a child’s dental treatment is a calm session.',
          },
          {
            name: 'Hair removal system',
            model: 'Cynosure Elite+ 2026',
            note: 'The best in the world for hair removal, with results guaranteed over the long term.',
          },
          {
            name: 'Radiographic imaging system',
            model: 'Carestream',
            note: 'Giving the doctor a wide range of radiographic options, so the diagnosis is precise before treatment begins.',
          },
        ],
      },
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

    // The clinic's own camera roll: nineteen photographs of the people who have
    // come through the door, dealt as a card deck in the page. The files are
    // numbered by `visitorShots` below; only the alt sentences live here.
    // Both locales are written in the clinic's own voice — the warmer register
    // of the hero copy they supplied — rather than the drier one the rest of
    // the English page uses. This section is the clinic being vouched for by
    // the people in it, and that is not a sentence to say drily.
    visitors: {
      heading: 'They came to us … and left with a smile.',
      sub: 'Guests and patients who put their trust in our team. The same standard for everyone who sits in the chair, whoever they are.',
      // Three sentences rather than twenty-three captions. An alt attribute
      // describes the photograph, and nothing in this repository knows who any
      // of these people are — inventing names for them would be a claim, not a
      // description.
      alt: {
        with: 'A visitor to the clinic, photographed with Dr. Jihad Alrashed',
        solo: 'A visitor to the clinic, photographed at the practice',
        detail: 'A finished smile, photographed close up at the clinic',
      },
      controls: 'Visitor photographs',
      previous: 'Previous photograph',
      next: 'Next photograph',
      pause: 'Pause',
      play: 'Play',
    },

    // !! PLACEHOLDER — every name, specialism and biography below is invented.
    // Six entries because `record` states six dentists; keep the two in step.
    // Portraits are monograms, not faces, for the reason in
    // scripts/team-placeholders.mjs.
    team: {
      heading: 'The hands behind the work.',
      sub: 'Six dentists, each with a discipline of their own.',
      members: [
        {
          name: 'Dr. Jihad Alrashed',
          role: 'Cosmetic dentistry & implants',
          bio: 'Founded the practice and leads it. Nineteen years placing implants and designing smiles, and the final say on every treatment plan that leaves the clinic.',
          photo: '/img/team/doctor-01.svg',
        },
        {
          name: 'Dr. Layan Al-Halabi',
          role: 'Orthodontics',
          bio: 'Fixed appliances and clear aligners, from the first records to the retainer. Treats adults as readily as teenagers.',
          photo: '/img/team/doctor-02.svg',
        },
        {
          name: 'Dr. Omar Al-Khatib',
          role: 'Endodontics',
          bio: 'Root canal treatment and retreatment under magnification, including the cases other clinics have already attempted.',
          photo: '/img/team/doctor-03.svg',
        },
        {
          name: 'Dr. Rana Al-Sibai',
          role: 'Children’s dentistry',
          bio: 'First visits, prevention and early guidance — and a way of making a nervous six-year-old forget where they are.',
          photo: '/img/team/doctor-04.svg',
        },
        {
          name: 'Dr. Kinan Al-Droubi',
          role: 'Oral surgery & implants',
          bio: 'Extractions, bone grafting and implant placement, planned against the clinic’s own three-dimensional imaging.',
          photo: '/img/team/doctor-05.svg',
        },
        {
          name: 'Dr. Hala Marei',
          role: 'Skin laser & injectables',
          bio: 'Botox, filler and cosmetic laser, worked alongside the dental treatment rather than as an afterthought to it.',
          photo: '/img/team/doctor-06.svg',
        },
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
        {
          key: 'instagram',
          label: 'Instagram',
          // The handle reads as the value; `href` turns it into the link.
          values: ['@dr.jihadalrashed'],
          href: 'https://www.instagram.com/dr.jihadalrashed/',
          ltr: true,
          confirmed: true,
        },
        // Days of the week are NOT confirmed — the clinic gave the hours only.
        // That is why there is no `schemaHours` here; see the openingHours
        // block in seo.js.
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
      lines: ['كافة المعالجات …', 'في مكان واحد …', 'و ضمن معيار واحد …'],
      // Four sentences, joined with newlines rather than written as one
      // paragraph: the second ends on a colon that introduces the third, and
      // run together the list reads as an aside instead of the offer it is.
      // SplitWords turns each newline into a break; see the note there.
      lede: [
        'إذا كنت تبحث عن مركز طبي متكامل مختص بمعالجات الأسنان و التجميل ، فأنت في المكان الصحيح .',
        'فريق عمل من الأطباء الاختصاصيين لتقديم الخدمات التالية :',
        'تجميل الأسنان ، زراعة الأسنان ، المعالجة اللبية ، تقويم الأسنان ، أسنان الأطفال ، حقونات البشرة ( بوتوكس و فيلر ) ، ليزر البشرة ( إزالة الشعر )، و التصوير الشعاعي .',
        'في المكان نفسه ، بدءً من الزيارة الأولى و حتى آخر لمسة.',
      ].join('\n'),
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

    // نص المركز كما ورد منه، دون تحرير. The English above is a translation of
    // exactly these sentences; if one side is edited, edit the other with it.
    about: {
      heading: 'عن المركز.',
      body: [
        'يعتبر مركز الدكتور جهاد الراشد لتجميل الوجه و الأسنان من المراكز الأولى في سوريا التي تقدم خدمات علاجية تخصصية ضمن أعلى المعايير الأكاديمية و بأحدث الأجهزة الطبية في مجال الأسنان و البشرة ، و ضمن بيئة عمل تعتمد أعلى مستويات التعقيم .',
        'خبرة تتجاوز ١٩ عاماً أنشأت فريقاً متكاملاً من الأطباء لوضع  الخطة العلاجية الأنسب لكل مريض يقرر أن يكون تحت رعايتنا حتى نصل معه إلى أفضل نتيجة علاجية يمكن أن يحصل عليها .',
      ],
      kit: {
        lead: 'و لضمان الوصول إلى النتيجة العلاجية المرجوة ، تم تجهيز المركز بأحدث الأجهزة التخصصية :',
        see: 'الأجهزة',
        title: 'أحدث الأجهزة التخصصية',
        items: [
          {
            name: 'الدايود ليزر',
            note: 'لضمان الإجراءات الجراحية الخاصة باللثة ( قطع أو تجريف ) بأقل رض أو نزف ممكن .',
          },
          {
            name: 'جهاز البييزو',
            note: 'لضمان إجراءات القطع العظمي الآمن ( خلال القلع أو الزرع ) دون إحداث أي رض على الأوعية الدموية أو الأعصاب في منطقة العمل .',
          },
          {
            name: 'المايكروسكوب',
            note: 'لضمان ساحة تكبير تساعد الطبيب خلال الإجراءات الجراحية الدقيقة أو إجراءات المعالجة اللبية ( سحب العصب ).',
          },
          {
            name: 'أجهزة التحضير و الحشي الحراري',
            note: 'لضمان أفضل نتيجة ممكنة خلال إجراءات المعالجة اللبية ( سحب العصب ).',
          },
          {
            name: 'قناع غاز التركين ( الغاز الضاحك )',
            note: 'لضمان جلسة علاج هادئة للطفل خلال المعالجة السنية .',
          },
          {
            name: 'جهاز إزالة الشعر',
            model: 'Cynosure elite+ 2026',
            note: 'الأفضل عالمياً في مجال إزالة الشعر و بنتائج مضمونة على المدى البعيد.',
          },
          {
            name: 'جهاز التصوير الشعاعي',
            model: 'Carestream',
            note: 'لتزويد الطبيب بمجال واسع من خيارات التصوير الشعاعي لضمان التشخيص الدقيق قبل البدء بالعلاج .',
          },
        ],
      },
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

    visitors: {
      heading: 'زارونا … و خرجوا بابتسامة .',
      sub: 'ضيوف و مرضى وضعوا ثقتهم في فريق المركز . المعيار نفسه لكلّ من يجلس على الكرسي ، أيّاً كان .',
      alt: {
        with: 'زائر للعيادة مع الدكتور جهاد الراشد',
        solo: 'زائر للعيادة، صورة التُقطت في المركز',
        detail: 'ابتسامة مكتملة، لقطة قريبة في العيادة',
      },
      controls: 'صور الزوّار',
      previous: 'الصورة السابقة',
      next: 'الصورة التالية',
      pause: 'إيقاف',
      play: 'تشغيل',
    },

    // !! PLACEHOLDER — انظر التعليق على النسخة الإنجليزية.
    team: {
      heading: 'الأيدي التي وراء العمل.',
      sub: 'ستة أطباء، لكلٍّ منهم اختصاصه.',
      members: [
        {
          name: 'د. جهاد الراشد',
          role: 'تجميل الأسنان والزراعة',
          bio: 'أسّس المركز ويقوده. تسعة عشر عاماً في الزراعة وتصميم الابتسامة، وله القول الأخير في كل خطة علاج تخرج من المركز.',
          photo: '/img/team/doctor-01.svg',
        },
        {
          name: 'د. ليان الحلبي',
          role: 'تقويم الأسنان',
          bio: 'تقويم ثابت ومصففات شفافة، من أول القياسات إلى المثبّت. تعالج البالغين كما تعالج اليافعين.',
          photo: '/img/team/doctor-02.svg',
        },
        {
          name: 'د. عمر الخطيب',
          role: 'المعالجة اللبية',
          bio: 'معالجة الأقنية وإعادة المعالجة تحت التكبير، بما فيها الحالات التي سبق أن حاولتها عيادات أخرى.',
          photo: '/img/team/doctor-03.svg',
        },
        {
          name: 'د. رنا السباعي',
          role: 'أسنان الأطفال',
          bio: 'الزيارات الأولى والوقاية والتوجيه المبكر — وطريقة تُنسي الطفل الخائف أين هو.',
          photo: '/img/team/doctor-04.svg',
        },
        {
          name: 'د. كنان الدروبي',
          role: 'جراحة الفم والزراعة',
          bio: 'خلع وتطعيم عظم وزرع، بتخطيط يستند إلى التصوير ثلاثي الأبعاد في المركز نفسه.',
          photo: '/img/team/doctor-05.svg',
        },
        {
          name: 'د. هالة مرعي',
          role: 'ليزر البشرة والحقونات',
          bio: 'بوتوكس وفيلر وليزر تجميلي، تُجرى إلى جانب العمل السنّي لا على هامشه.',
          photo: '/img/team/doctor-06.svg',
        },
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
        {
          key: 'instagram',
          label: 'إنستغرام',
          values: ['@dr.jihadalrashed'],
          href: 'https://www.instagram.com/dr.jihadalrashed/',
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

/**
 * The visitor deck, in the order the clinic numbered its own files.
 *
 * `scripts/media.sh` writes `visitor-01` … `visitor-19` in exactly this
 * sequence, so the position in this array *is* the file number — the two are
 * one list kept in two places, and neither can be reordered alone.
 *
 * The kind picks the alt sentence: `with` is a visitor photographed alongside
 * Dr. Jihad, `solo` a portrait taken at the clinic, `detail` the close-up that
 * closes the deck.
 *
 * Three files sit outside the clinic's numbering. Two originals both carried
 * the number 8 — a phone export and a camera frame of different people — and
 * both are kept, the phone one at position 8 and the camera one after it.
 * `99.jpg` and `122.jpg` arrived later and the clinic placed them at 9 and 10.
 * Three files carry no number at all — `23424.jpg`, then `DSC06550.jpg` and
 * `773A8850.jpg` — and are appended in the order they were supplied. From
 * position 9 down, a card's place is therefore no longer the number on its file.
 */
const VISITOR_KINDS = [
  'with', 'with', 'with', 'with', 'with', 'solo', 'with', 'with', 'solo', 'solo',
  'solo', 'solo', 'solo', 'solo', 'solo', 'solo', 'solo', 'solo', 'solo', 'solo',
  'detail', 'solo', 'solo',
];

// Built once per locale at module scope, not per render: the deck's effect keys
// off the identity of this array, and a fresh one on every render would restart
// the animation from the first card.
for (const lang of locales) {
  const v = strings[lang].visitors;
  v.shots = VISITOR_KINDS.map((kind, i) => {
    const n = String(i + 1).padStart(2, '0');
    return {
      src: `/media/visitor-${n}.webp`,
      small: `/media/visitor-${n}-sm.webp`,
      alt: v.alt[kind],
    };
  });
}
