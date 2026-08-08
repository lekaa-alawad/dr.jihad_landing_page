// Shared content for the React directions.
//
// !! PLACEHOLDER DATA !!
// The contact details, dentist names, case labels and figures below are DUMMY
// values, added so the layouts read as finished in client review. They are not
// facts about the clinic. Every one of them must be replaced with confirmed
// information before anything here goes near production. See README.
//
// English-only on purpose — these exist to compare visual directions.

export const clinic = {
  name: 'Jihad Dental Care',
  doctor: 'Dr. Jihad Alrashed',
  tagline: 'We create your smile',
};

export const headline = {
  lines: ['Every treatment.', 'One roof.', 'One standard.'],
  lede:
    "Dr. Jihad Alrashed and the clinic's dentists handle checkups, implants, orthodontics, veneers, laser and facial aesthetics — from the first appointment to the last polish, in one place.",
};

export const treatments = [
  {
    short: 'Veneers',
    name: 'Veneers, whitening & smile design',
    note: 'Porcelain and composite work, shade-matched to the face it belongs to.',
    lead: true,
  },
  {
    short: 'Implants',
    name: 'Implants & oral surgery',
    note: 'A permanent foundation: placement, extractions and bone work.',
    lead: true,
  },
  {
    short: 'General',
    name: 'General & family dentistry',
    note: 'Checkups, cleanings, fillings, root canals and crowns — for every age.',
    lead: true,
  },
  {
    short: 'Orthodontics',
    name: 'Orthodontics & clear aligners',
    note: 'Fixed braces and clear trays, monitored to the last millimetre.',
  },
  {
    short: 'Botox & filler',
    name: 'Botox & lip filler',
    note: 'Injectables administered at the clinic, alongside the dental work.',
  },
  {
    short: 'Dental laser',
    name: 'Dental laser',
    note: 'Gum reshaping, soft-tissue work and laser-assisted whitening.',
  },
  {
    short: 'Skin laser',
    name: 'Cosmetic skin laser',
    note: 'Skin treatment on the same visit, at the same clinic.',
  },
];

// Each file stacks the original above the result with the clinic watermark on
// the join, so one download carries both states.
export const cases = [
  { id: '01', src: '/img/pair-01.webp', label: 'Porcelain veneers, upper arch' },
  { id: '02', src: '/img/pair-02.webp', label: 'Full smile reconstruction' },
  { id: '03', src: '/img/pair-03.webp', label: 'Composite bonding & whitening' },
  { id: '04', src: '/img/pair-04.webp', label: 'Crowns, lower anterior' },
];

export const record = [
  { label: 'Years in practice', value: '15' },
  { label: 'Cases completed', value: '4,200' },
  { label: 'Dentists in the clinic', value: '4' },
  { label: 'Treatment rooms', value: '6' },
];

export const contact = [
  { label: 'Address', value: 'Sheikh Zayed Road, Business Bay, Dubai' },
  { label: 'Phone', value: '+971 4 123 4567' },
  { label: 'WhatsApp', value: '+971 50 123 4567' },
  { label: 'Hours', value: 'Sat – Thu, 9:00 – 21:00' },
];
