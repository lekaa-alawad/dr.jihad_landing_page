// All page copy, both locales, in one place.
//
// The Arabic here is not a fresh translation. It is carried over from the
// bilingual Astro build in ../dr.jihad, which was written and reviewed against
// the same brief — so the two builds say the same thing in the same voice.
//
// The four before/after captions used to be listed here — invented treatment
// names, added so the page read as finished in client review, describing real
// patients' work that nobody at the clinic had confirmed. They are gone: each
// case is now numbered and nothing more. A slider that says only "Case 1"
// claims nothing, which is the right amount to claim about a treatment we
// cannot name.
//
// The team section used to be listed here too — six invented dentists. It no
// longer is: every name and qualification in it came from the clinic, replaced
// one at a time. One portrait is still missing; search for !! PORTRAIT.
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
    // The practice's own name, and the site's. It is what the browser tab
    // shows, what an unfurl calls the site, and what sits beside the mark in
    // the bar — one field, so those four can never disagree.
    //
    // Written without a space after the point, as the clinic writes it.
    clinic: 'Dr.Jihad Alrashed',
    // The person, not the practice. Keeps the ordinary spacing: this one is
    // read as prose, in the description and as the founder in the JSON-LD.
    doctor: 'Dr. Jihad Alrashed',
    tagline: 'We create your smile',

    meta: {
      // 55 chars — fits Google's ~600px title budget without truncation. The
      // city earns its place ahead of a fourth treatment: almost every search
      // that can convert here is a local one.
      //
      // The name leads, and that is what a narrow tab is for: a browser cuts a
      // title from the right, so whatever comes first is the part still legible
      // when the tab is down to a few characters. Anything ahead of the name
      // would push it out of the only place most people ever read it.
      title: 'Dr.Jihad Alrashed Damascus — Implants, Veneers & Braces',
      description:
        'Full-service dental clinic in Damascus led by Dr. Jihad Alrashed: cosmetic dentistry, implants, endodontics, orthodontics, children’s dentistry, dental and skin laser, injectables and an in-house Carestream imaging suite.',
      ogLocale: 'en_US',
    },

    // A real link, not a JS toggle, so a crawler can walk to the other locale.
    // `href` is no longer fixed: the site is four pages now, and a reader on
    // /treatments/ who wants Arabic wants /ar/treatments/, not the Arabic front
    // door. Nav.jsx computes it from the page being viewed; what stays here is
    // the wording, which does not depend on where the link points.
    switchTo: { code: 'ar', label: 'عربي', title: 'اقرأ بالعربية' },

    // The menu: one entry per page, and no contact link — `call` and `whatsapp`
    // label the two buttons that ride in the bar on every page, so a visitor
    // reading about orthodontics is already one tap from the clinic and a third
    // link pointing back at the home page would say it a second time.
    //
    // `treatments` is the label on the entry that opens the nine departments.
    // The URL stays /treatments/: it is what people search for, and the word in
    // the bar is what they read.
    nav: {
      label: 'Clinic sections',
      home: 'Home',
      treatments: 'Our Services',
      about: 'The Centre',
      call: 'Call',
      whatsapp: 'WhatsApp',
      skip: 'Skip to content',
    },

    hero: {
      lines: ['Every treatment.', 'One roof.', 'One standard.'],
      // Supplied by the clinic in English. It no longer tracks the Arabic line
      // for line — the Arabic below is still the older, shorter wording — so
      // the two locales say the same thing in different shapes until the
      // Arabic is rewritten to match.
      //
      // The list names eight departments and the site runs nine: dental laser
      // is absent here exactly as it was in the previous version, because the
      // clinic's own write-up has never included it.
      lede: [
        'If you are looking for an integrated medical center specializing in advanced dental and aesthetic treatments, you are in the right place.',
        'Our multidisciplinary team of specialized doctors provides a comprehensive range of services, including:',
        'Cosmetic Dentistry • Dental Implants • Endodontics • Orthodontics • Pediatric Dentistry • Facial Injectables (Botox & Fillers) • Laser Hair Removal • Dental & Maxillofacial Imaging',
        'All in one location — from your very first consultation to the final touch of your treatment.',
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
      before: 'The first visit',
      after: 'The final touch',
      caseWord: 'Case',
      handle: 'drag to move the slider',
      compare: 'the same patient before and after treatment at the clinic. Drag the slider to compare.',
      shown: 'of the finished result shown',
    },

    treatments: {
      heading: 'Everything, in one place.',
      // The nine departments as the clinic lists them, in the clinic's order.
      // An item may carry a `list`: sub-capabilities rendered beneath the note.
      items: [
        {
          name: 'Cosmetic Dentistry',
          note: [
            'We design smiles that complement each patient’s unique facial features.',
            'Every smile is carefully planned according to tooth shape, color, facial proportions, and even the patient’s natural way of speaking and smiling — creating a result that feels balanced, harmonious, and personal.',
          ].join('\n'),
          lead: true,
        },
        {
          name: 'Dental Implants',
          note: [
            'Comprehensive implant treatment from beginning to end.',
            'Our care includes detailed treatment planning, implant placement, associated surgical procedures such as bone or gum grafting when required, and the final prosthetic restoration.',
            'From planning to placement — and from surgery to the final smile — every stage is managed within one integrated treatment plan.',
          ].join('\n'),
          lead: true,
        },
        {
          name: 'Endodontics',
          note: [
            'We provide advanced root canal treatment and retreatment using modern canal preparation systems, thermoplastic obturation technology, and microscopic magnification.',
            'These technologies allow our specialists to work with greater precision, particularly in complex endodontic cases.',
          ].join('\n'),
          lead: true,
        },
        {
          name: 'Orthodontics',
          note: [
            'Every orthodontic treatment plan is tailored to the patient’s age, dental condition, facial development, and individual needs.',
            'Treatment options may include:',
            'Functional Appliances • Metal Braces • Ceramic Braces • Invisalign® Clear Aligners',
            'Every stage of treatment is carefully monitored and adjusted — down to the final fraction of a millimeter.',
          ].join('\n'),
          gallery: {
            mode: 'dialog',
            title: 'One case, start to finish',
            // Ordered before, after, before, after — the grid reads across, so
            // a row is one view photographed twice. See `pairs` in Gallery.jsx.
            pairs: true,
            items: [
              { image: '/media/ortho-before-01.webp', w: 1100, h: 498, label: 'Before treatment — front bite', alt: 'Intraoral photograph before orthodontic treatment, the front bite' },
              { image: '/media/ortho-after-01.webp',  w: 1100, h: 498, label: 'After treatment — front bite', alt: 'The same view after orthodontic treatment, the front bite' },
              { image: '/media/ortho-before-02.webp', w: 1100, h: 618, label: 'Before treatment — right side', alt: 'Intraoral photograph before orthodontic treatment, the right side' },
              { image: '/media/ortho-after-02.webp',  w: 1100, h: 618, label: 'After treatment — right side', alt: 'The same view after orthodontic treatment, the right side' },
              { image: '/media/ortho-before-03.webp', w: 1100, h: 612, label: 'Before treatment — left side', alt: 'Intraoral photograph before orthodontic treatment, the left side' },
              { image: '/media/ortho-after-03.webp',  w: 1100, h: 612, label: 'After treatment — left side', alt: 'The same view after orthodontic treatment, the left side' },
              { image: '/media/ortho-before-04.webp', w: 1100, h: 822, label: 'Before treatment — upper arch', alt: 'Intraoral photograph before orthodontic treatment, the upper arch' },
              { image: '/media/ortho-after-04.webp',  w: 1100, h: 822, label: 'After treatment — upper arch', alt: 'The same view after orthodontic treatment, the upper arch' },
              { image: '/media/ortho-before-05.webp', w: 1100, h: 758, label: 'Before treatment — lower arch', alt: 'Intraoral photograph before orthodontic treatment, the lower arch' },
              { image: '/media/ortho-after-05.webp',  w: 1100, h: 758, label: 'After treatment — lower arch', alt: 'The same view after orthodontic treatment, the lower arch' },
            ],
            more: {
              title: 'A second case, photographed close',
              items: [
                { image: '/media/ortho-close-01.webp', w: 1100, h: 702, alt: 'Close-range intraoral photograph of the side teeth in occlusion' },
                { image: '/media/ortho-close-02.webp', w: 1100, h: 746, alt: 'Close-range intraoral photograph of the side teeth in occlusion' },
                { image: '/media/ortho-close-03.webp', w: 1100, h: 634, alt: 'Close-range intraoral photograph of the side teeth in occlusion' },
              ],
            },
            note: 'The first ten photographs are one patient, in the five standard views, before treatment and after it. The last three are a different patient and a different camera, and are not a before-and-after of the case above.',
          },
        },
        {
          name: 'Pediatric Dentistry',
          note: [
            'Our paediatric dental care begins even before the eruption of the first tooth.',
            'From preventive care and early guidance to comprehensive dental treatment, we provide children with continuous care throughout every stage of their dental development.',
            'Our goal is to create a positive, comfortable experience while building the foundations for lifelong oral health.',
          ].join('\n'),
          // !! CONSENT — children. Seven photographs of nine identifiable
          // children and one teenager, faces in frame, published at full size.
          // Nothing in this repository evidences that the clinic holds the
          // guardians' written consent to publish them. scripts/predeploy.mjs
          // names this before every deploy; the marker above is what it looks
          // for, and removing it is a statement that the consent exists.
          gallery: {
            mode: 'dialog',
            title: 'Children at the clinic',
            // Not the default "See results". These are visits, not outcomes —
            // nothing in the set is a before or an after, and calling them
            // results would be a claim about seven children's treatment.
            see: 'See the photographs',
            items: [
              { image: '/media/kids-01.webp', w: 658, h: 1200, alt: 'A young patient sitting with the paediatric dentist in the clinic' },
              { image: '/media/kids-02.webp', w: 675, h: 1200, alt: 'The paediatric dentist carrying a toddler in the yellow treatment room' },
              { image: '/media/kids-03.webp', w: 675, h: 1200, alt: 'Two boys in football shirts either side of the paediatric dentist, both giving a thumbs up' },
              { image: '/media/kids-04.webp', w: 675, h: 1200, alt: 'The paediatric dentist with two patients outside the imaging room' },
              { image: '/media/kids-05.webp', w: 675, h: 1200, alt: 'A girl holding a balloon beside the paediatric dentist in the treatment room' },
              { image: '/media/kids-06.webp', w: 900, h: 1200, alt: 'The paediatric dentist with three small girls under the clinic sign in reception' },
              { image: '/media/kids-07.webp', w: 900, h: 1200, alt: 'A girl holding a storybook, sitting with the paediatric dentist' },
            ],
          },
        },
        {
          // !! UNCONFIRMED COPY — the clinic's write-up covers eight departments
          // and the site runs nine. Asked, the clinic said the dental laser had
          // been missed rather than retired, so the row stays — but this note is
          // the only one on the page not written by the clinic. It is the short
          // line an earlier pass wrote, kept rather than replaced with anything
          // invented. Swap it for their paragraph when it arrives.
          name: 'Dental laser',
          note: 'Gum reshaping, soft-tissue work and laser-assisted whitening.',
        },
        {
          name: 'Facial Injectables',
          note: [
            'We provide a full range of facial injectable treatments, including Botox® and dermal fillers, for both therapeutic and aesthetic purposes.',
            'Every procedure is performed with a refined approach focused on enhancing the patient’s features while preserving the natural character, proportions, and expressions of the face.',
          ].join('\n'),
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
          name: 'Laser Hair Removal',
          note: [
            'Our laser hair removal treatments follow precise clinical protocols and are performed using internationally recognized advanced technology.',
            'Every treatment plan is customized according to the patient’s skin and hair characteristics, with the goal of achieving safe, effective, and long-lasting results.',
          ].join('\n'),
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
          name: 'Radiology',
          note: [
            'The centre includes a dedicated diagnostic imaging department equipped with advanced Carestream technology.',
            'The system provides a wide range of imaging options to support accurate diagnosis and comprehensive treatment planning, including:',
          ].join('\n'),
          // Each modality is a name and what it is for. A `list` entry may be
          // either that pair or a bare string — the Arabic side is still the
          // older flat list, and Treatments.jsx renders both.
          list: [
            { name: 'Panoramic Imaging', note: 'Complete panoramic imaging of the upper and lower jaws.' },
            { name: '3D Imaging / CBCT', note: 'Three-dimensional imaging for dental implant planning and complex endodontic procedures.' },
            { name: 'Cephalometric Imaging', note: 'Specialized imaging used for orthodontic diagnosis and treatment planning.' },
            { name: 'Hand & Wrist Radiography', note: 'Used to assess skeletal maturity and estimate the patient’s bone age.' },
            { name: 'TMJ Imaging', note: 'Imaging of the temporomandibular joints for diagnostic assessment.' },
            { name: 'Skull Base Imaging', note: 'Specialized imaging of the cranial base when clinically indicated.' },
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
        'Dr. Jihad Al-Rashed Center for Facial & Dental Aesthetics is one of the pioneering centers in Syria providing specialized dental and aesthetic treatments according to the highest academic and clinical standards.',
        'The center combines advanced medical technology with a carefully controlled clinical environment that follows the highest standards of sterilization and infection control.',
        'With more than 19 years of experience, we have built an integrated multidisciplinary team of specialized doctors who work together to develop the most appropriate treatment plan for every patient who chooses to place their care in our hands.',
        'Our goal is to accompany each patient throughout the entire treatment journey and achieve the best possible clinical and aesthetic outcome.',
      ],
      // !! STOCK IMAGERY — the seven photographs below are manufacturer
      // renders, not this clinic's own units. See MEDIA.md.
      kit: {
        lead: 'To support this commitment, the center is equipped with some of the latest specialized technologies available in modern dentistry and aesthetic medicine.',
        title: 'The newest specialist devices',
        // `model` is the make as the clinic writes it, in Latin script. It is
        // kept apart from the name so the markup can mark it as its own LTR
        // run — see the note in Kit.jsx.
        items: [
          {
            name: 'Diode Laser',
            photo: '/media/kit-diode.webp',
            w: 720,
            h: 900,
            alt: 'The clinic’s diode laser unit and its handpiece',
            note: [
            'Our diode laser enables precise soft-tissue procedures, including gingival cutting and curettage, while minimizing tissue trauma and bleeding.',
            'It can also support faster wound healing and is used in the management of a wide range of temporomandibular joint (TMJ) disorders.',
          ].join('\n'),
          },
          {
            name: 'Piezosurgery Device',
            photo: '/media/kit-piezo.webp',
            w: 720,
            h: 900,
            alt: 'The piezosurgery unit, its handpiece and cutting tips',
            note: [
            'Piezosurgery technology allows precise and controlled bone cutting during procedures such as tooth extraction and dental implant surgery.',
            'Its selective action on hard tissue helps protect surrounding soft tissues, blood vessels, and nerves within the surgical area.',
          ].join('\n'),
          },
          {
            name: 'Dental Microscope',
            photo: '/media/kit-microscope.webp',
            w: 720,
            h: 900,
            alt: 'The dental operating microscope on its arm',
            note: 'The dental microscope provides powerful magnification and enhanced visualization, allowing our doctors to perform highly precise surgical procedures and complex endodontic treatments with greater accuracy.',
          },
          {
            name: 'Advanced Endodontic Preparation & Thermoplastic Obturation Systems',
            photo: '/media/kit-obturation.webp',
            w: 720,
            h: 900,
            alt: 'The canal preparation motor beside the warm obturation gun',
            note: 'Our advanced root canal preparation and warm obturation systems are designed to achieve the highest possible level of precision during endodontic treatment.',
          },
          {
            name: 'Nitrous Oxide Sedation',
            photo: '/media/kit-sedation.webp',
            w: 720,
            h: 900,
            alt: 'The nitrous oxide sedation mask on its arm above the chair',
            note: 'Also known as “laughing gas,” nitrous oxide sedation helps provide children with a calmer and more comfortable experience during dental treatment.',
          },
          {
            name: 'Laser Hair Removal System',
            photo: '/media/kit-hair.webp',
            w: 720,
            h: 960,
            alt: 'The Cynosure Elite+ laser hair removal unit',
            model: 'Cynosure Elite+ 2026',
            note: [
            'The center is equipped with the Cynosure Elite+ 2026, one of the world’s leading technologies for laser hair removal.',
            'Its advanced technology allows us to deliver precise, effective treatments designed to achieve reliable and long-lasting results.',
          ].join('\n'),
          },
          {
            name: 'Radiographic Imaging System',
            photo: '/media/kit-imaging.webp',
            w: 720,
            h: 900,
            alt: 'The Carestream imaging unit, cephalometric arm extended',
            model: 'Carestream',
            note: 'Our Carestream imaging system provides clinicians with a comprehensive range of advanced radiographic imaging options, supporting accurate diagnosis and precise treatment planning before treatment begins.',
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
      sub: [
        'Guests and patients who put their trust in the clinic’s team.',
        'The same standard for everyone who comes here for treatment, whoever they are.',
      ].join('\n'),
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

    // Every name and qualification below is the clinic's own. Nothing here is
    // invented any more — the six placeholder dentists this section shipped with
    // were replaced one at a time, and each time the invented entry whose
    // discipline a real doctor covered was deleted rather than shuffled down.
    //
    // None carries a `bio`, because no biography came with any of them, and an
    // invented sentence under a confirmed person is worse than a short card.
    // Five have their portrait. The sixth is still a monogram — see the
    // !! PORTRAIT marker on his entry.
    //
    // The fifth is a plastic surgeon rather than a dentist. The clinic was asked
    // and confirmed he is one of the six, so `record` stays at six and the `sub`
    // keeps its wording — settled, not overlooked.
    // Confirmed entries lead, in the order they were supplied, and a placeholder
    // whose discipline a confirmed dentist covers is deleted rather than moved
    // down: the invented endodontist went when Dr. Haya Allouni arrived.
    // Six entries because `record` states six dentists; keep the two in step.
    // The remaining five portraits are monograms, not faces, for the reason in
    // scripts/team-placeholders.mjs.
    team: {
      heading: 'The hands behind the work.',
      sub: 'Six doctors, each with a discipline of their own.',
      members: [
        {
          // Confirmed by the clinic: name, qualification and portrait. Nothing
          // here was written for the page.
          name: 'Dr. Jihad Alrashed',
          credential: 'DDS, MSc in Periodontology',
          photo: '/img/team/doctor-01.webp',
        },
        {
          // Confirmed, as above. She is the clinic's endodontist, and the
          // invented one who used to hold this discipline was removed rather
          // than left standing beside her.
          name: 'Dr. Haya Allouni',
          credential: 'DDS, MSc in Endodontics',
          photo: '/img/team/doctor-02.webp',
        },
        {
          // Confirmed. The invented orthodontist went the same way the invented
          // endodontist did.
          name: 'Dr. Leen Barakat',
          credential: 'Specialist in Orthodontics and Dentofacial Orthopedics',
          photo: '/img/team/doctor-03.webp',
        },
        {
          // Confirmed — and she is the dentist in the children's gallery on the
          // treatments section; the name embroidered on the scrubs in kids-06
          // and kids-07 is hers. Until this week the page put an invented name
          // beside that photograph.
          name: 'Dr. Bushra Shamma',
          credential: 'DDS, MSc in Pediatric Dentistry and Special Needs',
          photo: '/img/team/doctor-04.webp',
        },
        {
          // Confirmed. His is the one portrait the clinic did not shoot in the
          // studio — see scripts/card-composite.mjs and MEDIA.md.
          name: 'Dr. Esmail Mousa',
          credential: 'Plastic & Reconstructive Surgeon',
          photo: '/img/team/doctor-05.webp',
        },
        {
          // Confirmed, and the last invented name on the page went with him.
          // !! PORTRAIT — the clinic has not supplied a card for him yet, so his
          // is the one monogram left, and it stands under a real name. When the
          // card arrives, add its row to PORTRAITS in scripts/media.sh and point
          // this at doctor-06.webp. scripts/predeploy.mjs looks for the marker
          // above; removing it is a statement that the portrait is in.
          name: 'Dr. Haidara Habib',
          credential: 'Postgraduate Studies in Plastic and Reconstructive Surgery',
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
    clinic: 'د.جهاد الراشد',
    doctor: 'د. جهاد الراشد',
    tagline: 'نصنع ابتسامتك',

    meta: {
      title: 'د.جهاد الراشد دمشق — زراعة وعدسات وتقويم',
      description:
        'مركز أسنان متكامل في دمشق بقيادة د. جهاد الراشد: تجميل، زراعة، معالجة لبية، تقويم، أسنان أطفال، ليزر الأسنان والبشرة، حقونات، وقسم تصوير شعاعي بجهاز Carestream.',
      ogLocale: 'ar_AE',
    },

    switchTo: { code: 'en', label: 'English', title: 'Read in English' },

    // See the note on the English side. `results` is the one label that is not
    // simply the section's own heading shortened: قبل وبعد says what the page
    // holds, where the heading is a sentence about the slider.
    nav: {
      label: 'أقسام العيادة',
      home: 'الرئيسية',
      treatments: 'خدماتنا',
      about: 'المركز',
      call: 'اتصل',
      whatsapp: 'واتساب',
      skip: 'انتقل إلى المحتوى',
    },

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
      heading: 'كل مؤشر (slider) على كل صورة ، يحفظ أثر اليد التي وصلت إلى هذه النتيجة .',
      sub: 'اسحب المؤشر. فوقه اللمسة الأخيرة، وتحته الزيارة الأولى.',
      before: 'الزيارة الأولى',
      after: 'اللمسة الأخيرة',
      caseWord: 'الحالة',
      handle: 'اسحب لتحريك المؤشر',
      compare: 'المريض نفسه قبل العلاج وبعده في العيادة. اسحب المؤشر للمقارنة.',
      shown: 'من النتيجة النهائية ظاهرة',
    },

    treatments: {
      heading: 'كل شيء، في مكان واحد.',
      // أقسام المركز التسعة، بترتيب المركز نفسه.
      items: [
        {
          name: 'تجميل الأسنان',
          note: 'تصميم الابتسامة بشكل يناسب وجه المريض من حيث الشكل و اللون و أسلوبه في الكلام أو الابتسام .',
          lead: true,
        },
        {
          name: 'زراعة الأسنان',
          note: 'بدءً من التخطيط مروراً بوضع الزرعة و الإجراءات الجراحية المرافقة ( تطعيم العظم أو اللثة ) و انتهاءً بالتعويض النهائي .',
          lead: true,
        },
        {
          name: 'المعالجة اللبية',
          note: 'إجراءات علاج و إعادة معالجة الأقنية الجذرية بالاعتماد على أحدث أجهزة التحضير و الحشي الحراري و تحت التكبير المجهري .',
          lead: true,
        },
        {
          name: 'تقويم الأسنان',
          note: 'تحديد الخطة العلاجية الأنسب للمريض بناءً على العمر و حالة الأسنان ، و باستخدام الأجهزة الوظيفية أو الحاصرات ( المعدنية أو الخزفية ) أو الراصفات الشفافة Invisalign ، و بمتابعة و مراقبة حتى آخر جزء من الميليمتر .',
          gallery: {
            mode: 'dialog',
            title: 'حالة كاملة، من أولها إلى آخرها',
            // مرتّبة: قبل، بعد، قبل، بعد — الشبكة تُقرأ بالعرض، فيصير كل سطر
            // منظراً واحداً مصوَّراً مرتين. انظر `pairs` في Gallery.jsx.
            pairs: true,
            items: [
              { image: '/media/ortho-before-01.webp', w: 1100, h: 498, label: 'كما كانت — الإطباق الأمامي', alt: 'صورة داخل الفم قبل المعالجة التقويمية، الإطباق الأمامي' },
              { image: '/media/ortho-after-01.webp',  w: 1100, h: 498, label: 'كما صارت — الإطباق الأمامي', alt: 'المنظر نفسه بعد المعالجة التقويمية، الإطباق الأمامي' },
              { image: '/media/ortho-before-02.webp', w: 1100, h: 618, label: 'كما كانت — الجانب الأيمن', alt: 'صورة داخل الفم قبل المعالجة التقويمية، الجانب الأيمن' },
              { image: '/media/ortho-after-02.webp',  w: 1100, h: 618, label: 'كما صارت — الجانب الأيمن', alt: 'المنظر نفسه بعد المعالجة التقويمية، الجانب الأيمن' },
              { image: '/media/ortho-before-03.webp', w: 1100, h: 612, label: 'كما كانت — الجانب الأيسر', alt: 'صورة داخل الفم قبل المعالجة التقويمية، الجانب الأيسر' },
              { image: '/media/ortho-after-03.webp',  w: 1100, h: 612, label: 'كما صارت — الجانب الأيسر', alt: 'المنظر نفسه بعد المعالجة التقويمية، الجانب الأيسر' },
              { image: '/media/ortho-before-04.webp', w: 1100, h: 822, label: 'كما كانت — الفك العلوي', alt: 'صورة داخل الفم قبل المعالجة التقويمية، الفك العلوي' },
              { image: '/media/ortho-after-04.webp',  w: 1100, h: 822, label: 'كما صارت — الفك العلوي', alt: 'المنظر نفسه بعد المعالجة التقويمية، الفك العلوي' },
              { image: '/media/ortho-before-05.webp', w: 1100, h: 758, label: 'كما كانت — الفك السفلي', alt: 'صورة داخل الفم قبل المعالجة التقويمية، الفك السفلي' },
              { image: '/media/ortho-after-05.webp',  w: 1100, h: 758, label: 'كما صارت — الفك السفلي', alt: 'المنظر نفسه بعد المعالجة التقويمية، الفك السفلي' },
            ],
            more: {
              title: 'حالة ثانية، بلقطات قريبة',
              items: [
                { image: '/media/ortho-close-01.webp', w: 1100, h: 702, alt: 'لقطة قريبة داخل الفم للأسنان الجانبية في وضع الإطباق' },
                { image: '/media/ortho-close-02.webp', w: 1100, h: 746, alt: 'لقطة قريبة داخل الفم للأسنان الجانبية في وضع الإطباق' },
                { image: '/media/ortho-close-03.webp', w: 1100, h: 634, alt: 'لقطة قريبة داخل الفم للأسنان الجانبية في وضع الإطباق' },
              ],
            },
            note: 'الصور العشر الأولى لمريض واحد، بالمناظر الخمسة المعتمدة، قبل المعالجة وبعدها. أما الصور الثلاث الأخيرة فلمريض آخر وبكاميرا أخرى، وليست «قبل وبعد» للحالة التي فوقها.',
          },
        },
        {
          name: 'أسنان الأطفال',
          note: 'رعاية قبل بزوغ أي سن ، مروراً بالتوجيه المبكر و انتهاءً بكافة الإجراءات العلاجية الخاصة بالأطفال .',
          // !! CONSENT — children. Seven photographs of nine identifiable
          // children and one teenager, faces in frame, published at full size.
          // Nothing in this repository evidences that the clinic holds the
          // guardians' written consent to publish them. scripts/predeploy.mjs
          // names this before every deploy; the marker above is what it looks
          // for, and removing it is a statement that the consent exists.
          gallery: {
            mode: 'dialog',
            title: 'الأطفال في المركز',
            // ليست «شاهد النتائج» الافتراضية. هذه زيارات لا نتائج — ما في
            // المجموعة صورة «قبل» ولا «بعد»، وتسميتها نتائج ادّعاء على علاج
            // سبعة أطفال.
            see: 'شاهد الصور',
            items: [
              { image: '/media/kids-01.webp', w: 658, h: 1200, alt: 'طفلة تجلس مع طبيبة أسنان الأطفال في المركز' },
              { image: '/media/kids-02.webp', w: 675, h: 1200, alt: 'طبيبة أسنان الأطفال تحمل طفلاً صغيراً في غرفة المعالجة الصفراء' },
              { image: '/media/kids-03.webp', w: 675, h: 1200, alt: 'طفلان بقميصي كرة قدم على جانبي طبيبة أسنان الأطفال، وكلاهما يرفع إبهامه' },
              { image: '/media/kids-04.webp', w: 675, h: 1200, alt: 'طبيبة أسنان الأطفال مع مراجعَين أمام غرفة التصوير' },
              { image: '/media/kids-05.webp', w: 675, h: 1200, alt: 'طفلة تحمل بالوناً إلى جانب طبيبة أسنان الأطفال في غرفة المعالجة' },
              { image: '/media/kids-06.webp', w: 900, h: 1200, alt: 'طبيبة أسنان الأطفال مع ثلاث طفلات تحت شعار المركز في الاستقبال' },
              { image: '/media/kids-07.webp', w: 900, h: 1200, alt: 'طفلة تحمل قصة، تجلس مع طبيبة أسنان الأطفال' },
            ],
          },
        },
        {
          // !! UNCONFIRMED COPY — انظر التعليق على النسخة الإنجليزية.
          name: 'ليزر الأسنان',
          note: 'إعادة تشكيل اللثة، أعمال الأنسجة الرخوة، وتبييض بمساعدة الليزر.',
        },
        {
          name: 'الحقونات — بوتوكس وفيلر',
          note: 'كافة إجراءات الحقن ضمن الجلد ( بوتوكس - فيلر … ) سواءً لغايات علاجية أو تجميلية ، بلمسة تحفظ الملامح الطبيعية للوجه .',
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
          note: 'إزالة شعر الجسم باتباع المعايير الأكاديمية الدقيقة و باستخدام أحدث الأجهزة المعروفة عالمياً للوصول إلى نتائج مضمونة على المدى البعيد .',
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
          note: 'يحتوي المركز على قسم خاص بالتصوير الشعاعي مزود بجهاز Carestream العالمي ، و الذي يتيح خيارات تصوير واسعة تتضمن :',
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
      // !! STOCK IMAGERY — the seven photographs below are manufacturer
      // renders, not this clinic's own units. See MEDIA.md.
      kit: {
        lead: 'و لضمان الوصول إلى النتيجة العلاجية المرجوة ، تم تجهيز المركز بأحدث الأجهزة التخصصية :',
        title: 'أحدث الأجهزة التخصصية',
        items: [
          {
            name: 'الدايود ليزر',
            photo: '/media/kit-diode.webp',
            w: 720,
            h: 900,
            alt: 'جهاز الدايود ليزر وقبضته',
            note:
            'لضمان الإجراءات الجراحية الخاصة باللثة ( قطع أو تجريف ) بأقل رض أو نزف ممكن ، بالإضافة إلى قدرة الجهاز على تسريع شفاء الجروح و شفاء قسم واسع من اضطرابات المفصل الفكي الصدغي .',
          },
          {
            name: 'جهاز البييزو',
            photo: '/media/kit-piezo.webp',
            w: 720,
            h: 900,
            alt: 'جهاز البييزو وقبضته ورؤوس القطع',
            note: 'لضمان إجراءات القطع العظمي الآمن ( خلال القلع أو الزرع ) دون إحداث أي رض على الأوعية الدموية أو الأعصاب في منطقة العمل .',
          },
          {
            name: 'المايكروسكوب',
            photo: '/media/kit-microscope.webp',
            w: 720,
            h: 900,
            alt: 'المجهر الجراحي على ذراعه',
            note: 'لضمان ساحة تكبير تساعد الطبيب خلال الإجراءات الجراحية الدقيقة أو إجراءات المعالجة اللبية ( سحب العصب ).',
          },
          {
            name: 'أجهزة التحضير و الحشي الحراري',
            photo: '/media/kit-obturation.webp',
            w: 720,
            h: 900,
            alt: 'محرّك تحضير الأقنية إلى جانب مسدس الحشي الحراري',
            note: 'لضمان أفضل نتيجة ممكنة خلال إجراءات المعالجة اللبية ( سحب العصب ).',
          },
          {
            name: 'قناع غاز التركين ( الغاز الضاحك )',
            photo: '/media/kit-sedation.webp',
            w: 720,
            h: 900,
            alt: 'قناع غاز التركين على ذراعه فوق الكرسي',
            note: 'لضمان جلسة علاج هادئة للطفل خلال المعالجة السنية .',
          },
          {
            name: 'جهاز إزالة الشعر',
            photo: '/media/kit-hair.webp',
            w: 720,
            h: 960,
            alt: 'جهاز إزالة الشعر Cynosure Elite+',
            model: 'Cynosure Elite+ 2026',
            note: 'الأفضل عالمياً في مجال إزالة الشعر و بنتائج مضمونة على المدى البعيد.',
          },
          {
            name: 'جهاز التصوير الشعاعي',
            photo: '/media/kit-imaging.webp',
            w: 720,
            h: 900,
            alt: 'جهاز التصوير Carestream وذراع التصوير السيفالومتري ممدودة',
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
      sub: [
        'ضيوف و مرضى وضعوا ثقتهم في فريق المركز .',
        'المعيار نفسه لكل من يقصد المركز لغاية العلاج ، أيّاً كان .',
      ].join('\n'),
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

    // كل الأسماء والشهادات هنا من المركز نفسه. صورة الطبيب السادس لم تصل بعد
    // — انظر التعليق على النسخة الإنجليزية.
    team: {
      heading: 'الأيدي التي وراء العمل.',
      sub: 'ستة أطباء، لكلٍّ منهم اختصاصه.',
      members: [
        {
          // مؤكَّد من المركز: الاسم والشهادة والصورة. لا شيء هنا كُتب للصفحة.
          name: 'د. جهاد الراشد',
          credential: 'ماجستير في علم النسج حول السنية',
          photo: '/img/team/doctor-01.webp',
        },
        {
          // مؤكَّد كذلك. هي طبيبة المعالجة اللبية في المركز، وقد حُذف الاسم
          // المُختلق الذي كان يحمل هذا الاختصاص بدل أن يبقى إلى جانبها.
          name: 'د. هيا علوني',
          credential: 'ماجستير في مداواة الأسنان اللبية',
          photo: '/img/team/doctor-02.webp',
        },
        {
          // مؤكَّد. ذهب اسم أخصائي التقويم المُختلق كما ذهب اسم أخصائي اللبية.
          name: 'د. لين بركات',
          credential: 'اختصاصية في تقويم الأسنان و الفكين',
          photo: '/img/team/doctor-03.webp',
        },
        {
          // مؤكَّد — وهي الطبيبة نفسها في معرض الأطفال ضمن قسم الأقسام؛ الاسم
          // المطرّز على المريول في kids-06 و kids-07 اسمها. انظر التعليق على
          // النسخة الإنجليزية بخصوص الصورة.
          name: 'د. بشرى شمة',
          credential: 'ماجستير في طب أسنان الأطفال وذوي الاحتياجات الخاصة',
          photo: '/img/team/doctor-04.webp',
        },
        {
          // مؤكَّد. صورته هي البطاقة الوحيدة التي لم تُصوَّر في الاستوديو — انظر
          // scripts/card-composite.mjs و MEDIA.md.
          name: 'د. اسماعيل موسى',
          credential: 'اختصاصي جراحة تجميلية وتصنيعية',
          photo: '/img/team/doctor-05.webp',
        },
        {
          // مؤكَّد، وبه ذهب آخر اسم مُختلق عن الصفحة. الصورة لم تصل بعد — انظر
          // التعليق على النسخة الإنجليزية.
          name: 'د. حيدره حبيب',
          credential: 'دراسات عليا في الجراحة التجميلية والترميمية',
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
