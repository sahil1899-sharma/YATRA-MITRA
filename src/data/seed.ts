import type { Circuit, Driver, Stop } from '../types';
import { MAX_PARTY_DEFAULT, PRICING } from './constants';

// ---------------------------------------------------------------------------
// Stops. x,y are 0-100 schematic positions for the stylised route diagram
// (no map tiles are used anywhere in the app).
// ---------------------------------------------------------------------------

// Hindi to be reviewed by a native speaker.
export const SEED_STOPS: Stop[] = [
  { id: 's_kiosk', name: 'Jammu Tawi Yatra Mitra Kendra (pickup)', hasStory: false, x: 8, y: 80 },
  {
    id: 's_bahu',
    name: 'Bahu Fort gate',
    hasStory: true,
    storyEn:
      'According to legend, King Jambu Lochan saw a tiger and a goat drinking from the same pond here, and chose this spot to found Jammu. Above us stands Bahu Fort, overlooking the Tawi river. The Bave Wali Mata temple sits inside it. Tradition holds the fort is very old, and it was renovated under Dogra rule.',
    storyHi:
      'किंवदंती है कि राजा जंबू लोचन ने यहाँ एक बाघ और एक बकरी को एक तालाब से पानी पीते देखा था, और यहीं जम्मू शहर बसाने का फैसला किया। ऊपर तवी नदी के किनारे बाहु किला है। इसके अंदर बावे वाली माता का मंदिर है। परंपरा के अनुसार यह किला बहुत पुराना है, और डोगरा शासन में इसका जीर्णोद्धार हुआ।',
    x: 30,
    y: 60,
  },
  { id: 's_ropeway', name: 'Bahu–Mahamaya Ropeway', hasStory: false, x: 42, y: 48 },
  { id: 's_mahamaya', name: 'Mahamaya Temple', hasStory: false, x: 58, y: 38 },
  { id: 's_riverfront', name: 'Tawi Riverfront promenade', hasStory: false, x: 72, y: 52 },
  {
    id: 's_ghat',
    name: 'Tawi Aarti ghat',
    hasStory: true,
    storyEn:
      'Every evening at 7 PM, the Tawi Aarti is held here at this dedicated ghat on the Tawi Riverfront. It is modelled on the Ganga Aarti of Haridwar and Varanasi — lamps, chants, and the river at dusk. Stay till the end; the last five minutes are the most beautiful.',
    storyHi:
      'हर शाम 7 बजे यहाँ तवी रिवरफ्रंट के इसी घाट पर तवी आरती होती है। यह हरिद्वार और वाराणसी की गंगा आरती की तर्ज पर होती है — दीये, भजन और संध्या समय नदी का नज़ारा। अंत तक ज़रूर रुकें; आखिरी पाँच मिनट सबसे सुंदर होते हैं।',
    x: 88,
    y: 64,
  },
  {
    id: 's_mubarak',
    name: 'Mubarak Mandi',
    hasStory: true,
    storyEn:
      "This is Mubarak Mandi, the historic Dogra royal palace complex in the old city. Walk slowly through the courtyards — every arch and doorway here has watched centuries of the city's life pass by.",
    storyHi:
      'यह मुबारक मंडी है, पुराने शहर में स्थित ऐतिहासिक डोगरा शाही महल परिसर। आँगनों में धीरे-धीरे चलें — यहाँ की हर मेहराब और हर दरवाज़े ने शहर के सदियों के जीवन को देखा है।',
    x: 22,
    y: 30,
  },
  {
    id: 's_raghunath',
    name: 'Raghunath Bazaar and Temple',
    hasStory: true,
    storyEn:
      'The Raghunath Temple was begun by Maharaja Gulab Singh in 1835 and completed by Maharaja Ranbir Singh in 1860. The bazaar around it has served pilgrims for generations — this is where the old city still shops.',
    storyHi:
      'रघुनाथ मंदिर का निर्माण महाराजा गुलाब सिंह ने 1835 में शुरू कराया था और महाराजा रणबीर सिंह ने 1860 में इसे पूरा किया। इसके आस-पास का बाज़ार पीढ़ियों से तीर्थयात्रियों की सेवा करता आया है — पुराना शहर आज भी यहीं खरीदारी करता है।',
    x: 40,
    y: 22,
  },
  {
    id: 's_ranbir',
    name: 'Ranbireshwar Temple',
    hasStory: true,
    storyEn:
      'The Ranbireshwar Temple was built by Maharaja Ranbir Singh in the 1880s. It is known for its crystal Shiva lingams. Step inside and look closely — the crystal catches the light beautifully.',
    storyHi:
      'रणबीरेश्वर मंदिर का निर्माण महाराजा रणबीर सिंह ने 1880 के दशक में कराया था। यह अपने स्फटिक शिवलिंगों के लिए प्रसिद्ध है। अंदर जाकर ध्यान से देखें — स्फटिक में रोशनी बहुत सुंदर चमकती है।',
    x: 60,
    y: 20,
  },
  { id: 's_lanes', name: 'Old-city lanes', hasStory: false, x: 78, y: 28 },
  { id: 's_lightsound', name: 'Light-and-sound show', hasStory: false, x: 80, y: 58 },
  { id: 's_boating', name: "Boating (via JMC's online portal)", hasStory: false, x: 92, y: 48 },
];

// ---------------------------------------------------------------------------
// Circuits. Pricing is read from PRICING (single source of truth).
// ---------------------------------------------------------------------------

export const SEED_CIRCUITS: Circuit[] = [
  {
    id: 'C1',
    name: 'Arrival–Ropeway–Aarti',
    tagline: 'From the station to the ropeway to the evening Aarti',
    stopIds: ['s_kiosk', 's_bahu', 's_ropeway', 's_mahamaya', 's_riverfront', 's_ghat'],
    durationMin: PRICING.C1.durationMin,
    farePerPerson: PRICING.C1.farePerPerson,
    minParty: PRICING.C1.minParty,
    maxParty: MAX_PARTY_DEFAULT,
    slots: ['15:30', '16:00'],
    eveningOnly: false,
    driverPayout: PRICING.C1.driverPayout,
    kpiLabel: 'Ropeway conversion',
  },
  {
    id: 'C2',
    name: 'Old City Story Loop',
    tagline: 'Temples, bazaars and old-city lanes with stories at every stop',
    stopIds: ['s_kiosk', 's_mubarak', 's_raghunath', 's_ranbir', 's_lanes'],
    durationMin: PRICING.C2.durationMin,
    farePerPerson: PRICING.C2.farePerPerson,
    minParty: PRICING.C2.minParty,
    maxParty: MAX_PARTY_DEFAULT,
    slots: ['10:00', '12:00', '14:00'],
    eveningOnly: false,
    driverPayout: PRICING.C2.driverPayout,
    kpiLabel: 'Market spending via verified shops',
  },
  {
    id: 'C6',
    name: 'Tawi Riverfront Evening',
    tagline: 'An evening on the riverfront — promenade, Aarti, lights and boating',
    stopIds: ['s_kiosk', 's_riverfront', 's_ghat', 's_lightsound', 's_boating'],
    durationMin: PRICING.C6.durationMin,
    farePerPerson: PRICING.C6.farePerPerson,
    minParty: PRICING.C6.minParty,
    maxParty: MAX_PARTY_DEFAULT,
    slots: ['16:30', '17:00'],
    eveningOnly: true,
    driverPayout: PRICING.C6.driverPayout,
    kpiLabel: 'Riverfront evening footfall',
  },
];

// ---------------------------------------------------------------------------
// Drivers. All are sample profiles; screens that list drivers must show a
// "Sample profile" note.
// ---------------------------------------------------------------------------

const DRIVERS: Driver[] = [
  { mitraId: 'YM-1001', name: 'Rakesh Sharma', initials: 'RS', verificationStatus: 'badged', languages: ['hi', 'en', 'dogri'], cohort: 'standard', subscriptionActive: true, rating: 4.8, tripsCompleted: 212, online: true },
  { mitraId: 'YM-1002', name: 'Sunita Devi', initials: 'SD', verificationStatus: 'badged', languages: ['hi', 'en', 'dogri'], cohort: 'sakhi', subscriptionActive: true, rating: 4.9, tripsCompleted: 188, online: true },
  { mitraId: 'YM-1003', name: 'Baldev Singh', initials: 'BS', verificationStatus: 'badged', languages: ['hi', 'en', 'pa'], cohort: 'standard', subscriptionActive: true, rating: 4.7, tripsCompleted: 164, online: true },
  { mitraId: 'YM-1004', name: 'Meena Kumari', initials: 'MK', verificationStatus: 'badged', languages: ['hi', 'en'], cohort: 'sakhi', subscriptionActive: true, rating: 4.8, tripsCompleted: 141, online: true },
  { mitraId: 'YM-1005', name: 'Imran Khan', initials: 'IK', verificationStatus: 'badged', languages: ['hi', 'en', 'ur'], cohort: 'standard', subscriptionActive: true, rating: 4.6, tripsCompleted: 97, online: true },
  { mitraId: 'YM-1006', name: 'Pooja Kotwal', initials: 'PK', verificationStatus: 'assessment', languages: ['hi', 'en'], cohort: 'sakhi', subscriptionActive: false, rating: 0, tripsCompleted: 0, online: false },
  { mitraId: 'YM-1007', name: 'Ashok Jamwal', initials: 'AJ', verificationStatus: 'training', languages: ['hi', 'dogri'], cohort: 'standard', subscriptionActive: false, rating: 0, tripsCompleted: 0, online: false },
  { mitraId: 'YM-1008', name: 'Ranjit Kour', initials: 'RK', verificationStatus: 'documents', languages: ['hi', 'dogri'], cohort: 'sakhi', subscriptionActive: false, rating: 0, tripsCompleted: 0, online: false },
];

// Fresh copies so the store can mutate/reset without touching the seed.
export function getSeedDrivers(): Driver[] {
  return DRIVERS.map((d) => ({ ...d, languages: [...d.languages] }));
}

// ---------------------------------------------------------------------------
// PULSE_SEED — sample aggregates consumed later by the Tourism Pulse
// dashboard. Displayed values must be labelled "Sample".
// ---------------------------------------------------------------------------

export const PULSE_SEED = {
  // 14 days, oldest → newest
  dailyMitraRopewayRiders: [12, 15, 19, 22, 27, 31, 38, 44, 47, 55, 61, 66, 72, 78],
  // 30-day C1 funnel
  ropewayFunnelC1: {
    bookings: 420,
    reachedBahuGate: 402,
    boardedRopeway: 301,
    reachedMahamaya: 296,
    reachedAartiGhat: 284,
  },
  originMix: {
    'Punjab': 22,
    'Delhi NCR': 18,
    'Other J&K districts': 15,
    'Maharashtra': 9,
    'Gujarat': 8,
    'Tamil Nadu': 6,
    'West Bengal': 5,
    'Other': 17,
  },
  circuitDemandShare: { C1: 46, C2: 31, C6: 23 },
  // % of bookings
  womenSeniorShare: 31,
  missedOrDeclined: 14,
  co2SavedKg: 1240,
  baseTripsToday: 38,
};
