import { MediaGalleryItem, RestaurantSettings } from '../types';

export const initialGalleryItems: MediaGalleryItem[] = [
  {
    id: 'gal-chef-plating',
    title: {
      ar: 'الشيف التنفيذي يضع اللمسات الذهبية الأخيرة',
      en: 'Executive Chef Plating with Gold Leaf and Microgreens',
    },
    category: 'chef',
    image: '/src/assets/images/chef_plating_action_1791702079885.jpg',
    caption: {
      ar: 'دقة جراحية في تزيين شرائح اللحم المعتقة بأعشاب المايكرو ورقائق الذهب 24 قيراط.',
      en: 'Microscopic culinary precision as our master chef garnishes dry-aged steak with rare herbs.',
    },
  },
  {
    id: 'gal-crystal-salon',
    title: {
      ar: 'قاعة الكريستال الإمبراطورية (VIP)',
      en: 'The Imperial Crystal Dining Salon',
    },
    category: 'ambiance',
    image: '/src/assets/images/dining_crystal_hall_1791697197687.jpg',
    caption: {
      ar: 'ثريا كريستالية تشيكية عملاقة وإضاءة شموع دافئة فوق مائدة اللك الأسود المذهبة.',
      en: 'Cascading Bohemian crystal chandelier casting golden warmth over black lacquer VIP tables.',
    },
  },
  {
    id: 'gal-truffle-pasta',
    title: {
      ar: 'باستا التاليوليني الطازجة مع كمأة ألبا البيضاء',
      en: 'Hand-Rolled Tagliolini with White Alba Truffle',
    },
    category: 'dishes',
    image: '/src/assets/images/dish_truffle_pasta_1791702066315.jpg',
    caption: {
      ar: 'عجينة بصفار 40 بيضة مبرومة يدوياً تعلوها رقائق كمأة ألبا البيضاء الطازجة.',
      en: '40-yolk golden handmade ribbons topped with mountain butter and fresh white truffles.',
    },
  },
  {
    id: 'gal-wagyu-artistry',
    title: {
      ar: 'شريحة واغيو A5 معتقة 45 يوماً',
      en: '45-Day Himalayan Dry-Aged A5 Wagyu',
    },
    category: 'dishes',
    image: '/src/assets/images/dish_wagyu_steak_1791697177267.jpg',
    caption: {
      ar: 'تعتيق بطيء داخل حجرة ملح الهيمالايا وتحمير على فحم البينشوتان الأبيض الياباني.',
      en: 'Slow dry-aging in pure pink salt chambers followed by binchotan charcoal searing.',
    },
  },
  {
    id: 'gal-lobster-caviar',
    title: {
      ar: 'كركند بريتاني مع كافيار أوسيترا الملكي',
      en: 'Brittany Blue Lobster & Imperial Caviar',
    },
    category: 'craft',
    image: '/src/assets/images/dish_caviar_seafood_1791697187291.jpg',
    caption: {
      ar: 'تناغم مذهل بين حلاوة الكركند النقي وملوحة كافيار بحر قزوين الأصيل.',
      en: 'A harmonic balance of blue lobster sweetness, saffron emulsion, and sturgeon caviar pearls.',
    },
  },
  {
    id: 'gal-dining-hall',
    title: {
      ar: 'الصالون الإمبراطوري الكبير — أجواء المساء',
      en: 'The Grand Dining Salon — Evening Mood',
    },
    category: 'ambiance',
    image: '/src/assets/images/hero_luxe_dining_1791697165592.jpg',
    caption: {
      ar: 'رخام أسود إيطالي ودفء خافت مع موسيقى بيانو حية تنبض بالرقي والخصوصية.',
      en: 'Polished black Italian marble, flickering table flames, and live classical piano acoustics.',
    },
  },
];

export const initialRestaurantSettings: RestaurantSettings = {
  name: {
    ar: 'NOIR ROYALE',
    en: 'NOIR ROYALE',
  },
  tagline: {
    ar: 'فنّ الطعام الاستثنائي',
    en: 'THE ART OF EXCEPTIONAL DINING',
  },
  headlineSub: {
    ar: 'الفخامة التي تُذاق',
    en: 'THE LUXURY YOU CAN TASTE',
  },
  description: {
    ar: 'اكتشف عالمًا من النكهات العالمية، حيث يلتقي فن الطهي بأرقى تفاصيل الضيافة.',
    en: 'Discover an echelon of international flavors, where culinary artistry unites with the finest nuances of hospitality.',
  },
  phone: '+971 4 821 9000',
  email: 'concierge@noirroyale.com',
  addresses: {
    dubai: 'DIFC Gate Precinct 4, Level 5, Dubai, UAE',
    london: '14 Mayfair Boulevard, London W1J 8AQ, UK',
    paris: '28 Place Vendôme, 75001 Paris, France',
    tokyo: 'Ginza 6 Luxury Quarter, Chuo-ku, Tokyo 104-0061, Japan',
  },
  hours: {
    weekdays: '18:00 – 01:00 (Dinner Service)',
    weekends: '17:30 – 02:00 (Dinner & Late Salon)',
    closed: 'Monday: Reserved for Cellar Curation',
  },
  dressCode: {
    ar: 'أنيق ورسمي فاخر (Smart Elegant). نرجو تجنب الملابس الرياضية أو الشورتات.',
    en: 'Smart Elegant & Formal. Athletic apparel, beachwear, and shorts are strictly prohibited.',
  },
  deliveryFee: 25,
  serviceChargePercent: 15,
};
