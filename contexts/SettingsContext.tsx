
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Currency } from '../types';

interface SettingsContextType {
  language: Language;
  currency: Currency;
  isB2BMode: boolean;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
  toggleB2BMode: () => void;
  formatPrice: (amount: number) => string;
  formatDate: (date: string | number | Date, options?: Intl.DateTimeFormatOptions) => string;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Exchange Rates (Mock)
const RATES: Record<Currency, number> = {
  'INR': 1,
  'USD': 0.012,
  'EUR': 0.011,
  'GBP': 0.0095
};

const LOCALE_MAP: Record<Language, string> = {
  'en': 'en-IN',
  'hi': 'hi-IN',
  'ta': 'ta-IN',
  'bn': 'bn-IN',
  'te': 'te-IN',
  'ur': 'ur-IN'
};

// Translations Dictionary
const TRANSLATIONS: Record<Language, Record<string, string>> = {
  'en': {
    'app_name': 'OneYatra',
    'hero_title': 'One app for every journey.',
    'hero_desc': 'Compare prices across Cabs, Trains, Buses, and Flights instantly. AI-powered estimates for smarter travel in India.',
    'tab_one_way': 'One Way',
    'tab_round_trip': 'Round Trip',
    'tab_multi_city': 'Multi-City',
    'label_from': 'From',
    'label_to': 'To',
    'label_date': 'Departure',
    'label_return': 'Return',
    'label_time': 'Time',
    'label_passengers': 'Passengers',
    'btn_search': 'Find Best Routes',
    'btn_search_round': 'Find Round Trip',
    'btn_search_multi': 'Plan Multi-City Trip',
    'saved_routes': 'Saved Routes',
    'nav_home': 'Home',
    'nav_plan': 'Plan Trip',
    'nav_trips': 'My Trips',
    'nav_profile': 'Profile',
    'nav_impact': 'Eco Impact',
    'nav_rewards': 'Rewards',
    'welcome': 'Welcome',
    'book_now': 'Book Now',
    'select': 'Select',
    'dep': 'Departure',
    'arr': 'Arrival',
    'duration': 'Duration',
    'eco_friendly': 'Eco-Friendly',
    'cheapest': 'Cheapest',
    'fastest': 'Fastest',
    'recommended': 'Recommended',
    'filters': 'Filters',
    'reset': 'Reset',
    'seats': 'Seats',
    'meals': 'Meals',
    'payment': 'Payment',
    'total': 'Total',
    'group_booking': 'Booking for more than 10 people? Group Booking',
    'corp_mode': 'Corporate',
    'personal_mode': 'Personal',
    'switch_to': 'Switch to',
    'logout': 'Logout'
  },
  'hi': {
    'app_name': 'वनयात्रा',
    'hero_title': 'हर सफर के लिए एक ऐप।',
    'hero_desc': 'कैब, ट्रेन, बस और उड़ानों की कीमतों की तुरंत तुलना करें। भारत में स्मार्ट यात्रा के लिए एआई-संचालित अनुमान।',
    'tab_one_way': 'एक तरफा',
    'tab_round_trip': 'राउंड ट्रिप',
    'tab_multi_city': 'मल्टी-सिटी',
    'label_from': 'कहाँ से',
    'label_to': 'कहाँ तक',
    'label_date': 'प्रस्थान',
    'label_return': 'वापसी',
    'label_time': 'समय',
    'label_passengers': 'यात्री',
    'btn_search': 'मार्ग खोजें',
    'btn_search_round': 'राउंड ट्रिप खोजें',
    'btn_search_multi': 'यात्रा की योजना बनाएं',
    'saved_routes': 'सहेजे गए मार्ग',
    'nav_home': 'होम',
    'nav_plan': 'योजना',
    'nav_trips': 'यात्राएं',
    'nav_profile': 'प्रोफ़ाइल',
    'nav_impact': 'इको प्रभाव',
    'nav_rewards': 'इनाम',
    'welcome': 'स्वागत है',
    'book_now': 'बुक करें',
    'select': 'चुनें',
    'dep': 'प्रस्थान',
    'arr': 'आगमन',
    'duration': 'अवधि',
    'eco_friendly': 'इको-फ्रेंडली',
    'cheapest': 'सबसे सस्ता',
    'fastest': 'सबसे तेज़',
    'recommended': 'सुझाया गया',
    'filters': 'फिल्टर',
    'reset': 'रीसेट',
    'seats': 'सीटें',
    'meals': 'भोजन',
    'payment': 'भुगतान',
    'total': 'कुल',
    'group_booking': '10 से अधिक लोगों के लिए बुकिंग? समूह बुकिंग',
    'corp_mode': 'कॉर्पोरेट',
    'personal_mode': 'व्यक्तिगत',
    'switch_to': 'बदलें',
    'logout': 'लॉग आउट'
  },
  'ta': {
    'app_name': 'வான்யாத்ரா',
    'hero_title': 'ஒவ்வொரு பயணத்திற்கும் ஒரு செயலி.',
    'hero_desc': 'வண்டி, ரயில், பேருந்து மற்றும் விமானங்களின் விலைகளை ஒப்பிடவும். ஸ்மார்ட் பயணத்திற்கான AI கணிப்புகள்.',
    'tab_one_way': 'ஒரு வழி',
    'tab_round_trip': 'திருப்ப பயணம்',
    'tab_multi_city': 'பல நகரங்கள்',
    'label_from': 'இருந்து',
    'label_to': 'செல்ல',
    'label_date': 'புறப்படும் தேதி',
    'label_return': 'திரும்பும் தேதி',
    'label_time': 'நேரம்',
    'label_passengers': 'பயணிகள்',
    'btn_search': 'வழிகளைத் தேடு',
    'btn_search_round': 'திருப்பப் பயணம் தேடு',
    'btn_search_multi': 'திட்டமிடு',
    'saved_routes': 'சேமிக்கப்பட்ட வழிகள்',
    'nav_home': 'முகப்பு',
    'nav_plan': 'திட்டம்',
    'nav_trips': 'பயணங்கள்',
    'nav_profile': 'சுயவிவரம்',
    'nav_impact': 'சூழல்',
    'nav_rewards': 'பரிசுகள்',
    'welcome': 'வணக்கம்',
    'book_now': 'பதிவு செய்',
    'select': 'தேர்ந்தெடு',
    'dep': 'புறப்பாடு',
    'arr': 'வருகை',
    'duration': 'கால அளவு',
    'eco_friendly': 'சுற்றுச்சூழல் நட்பு',
    'cheapest': 'மலிவானது',
    'fastest': 'வேகமானது',
    'recommended': 'பரிந்துரை',
    'filters': 'வடிகட்டிகள்',
    'reset': 'மீட்டமை',
    'seats': 'இருக்கைகள்',
    'meals': 'உணவு',
    'payment': 'கட்டணம்',
    'total': 'மொத்தம்',
    'group_booking': '10 பேருக்கு மேல்? குழு பதிவு',
    'corp_mode': 'நிறுவன',
    'personal_mode': 'தனிப்பட்ட',
    'switch_to': 'மாற்று',
    'logout': 'வெளியேறு'
  },
  'bn': {
    'app_name': 'ওয়ানযাত্রা',
    'hero_title': 'প্রতিটি যাত্রার জন্য একটি অ্যাপ।',
    'hero_desc': 'ক্যাব, ট্রেন, বাস এবং ফ্লাইটের দামের তুলনা করুন। স্মার্ট ভ্রমণের জন্য এআই অনুমান।',
    'tab_one_way': 'একমুখী',
    'tab_round_trip': 'রাউন্ড ট্রিপ',
    'tab_multi_city': 'মাল্টি-সিটি',
    'label_from': 'থেকে',
    'label_to': 'গন্তব্য',
    'label_date': 'যাত্রা তারিখ',
    'label_return': 'ফেরার তারিখ',
    'label_time': 'সময়',
    'label_passengers': 'যাত্রী',
    'btn_search': 'রুট খুঁজুন',
    'btn_search_round': 'রাউন্ড ট্রিপ খুঁজুন',
    'btn_search_multi': 'পরিকল্পনা করুন',
    'saved_routes': 'সংরক্ষিত রুট',
    'nav_home': 'হোম',
    'nav_plan': 'পরিকল্পনা',
    'nav_trips': 'ভ্রমণ',
    'nav_profile': 'প্রোফাইল',
    'nav_impact': 'ইকো',
    'nav_rewards': 'পুরস্কার',
    'welcome': 'স্বাগতম',
    'book_now': 'বুক করুন',
    'select': 'নির্বাচন',
    'dep': 'প্রস্থান',
    'arr': 'আগমন',
    'duration': 'সময়কাল',
    'eco_friendly': 'ইকো-ফ্রেন্ডলি',
    'cheapest': 'সবচেয়ে সস্তা',
    'fastest': 'দ্রুততম',
    'recommended': 'সুপারিশকৃত',
    'filters': 'ফিল্টার',
    'reset': 'রিসেট',
    'seats': 'আসন',
    'meals': 'খাবার',
    'payment': 'পেমেন্ট',
    'total': 'মোট',
    'group_booking': '১০ জনের বেশি? গ্রুপ বুকিং',
    'corp_mode': 'কর্পোরেট',
    'personal_mode': 'ব্যক্তিগত',
    'switch_to': 'পরিবর্তন',
    'logout': 'লগ আউট'
  },
  'te': {
    'app_name': 'వన్ యాత్ర',
    'hero_title': 'ప్రతి ప్రయాణానికి ఒక యాప్.',
    'hero_desc': 'క్యాబ్‌లు, రైళ్లు, బస్సులు మరియు విమానాల ధరలను పోల్చండి. స్మార్ట్ ప్రయాణం కోసం AI అంచనాలు.',
    'tab_one_way': 'ఒక వైపు',
    'tab_round_trip': 'రౌండ్ ట్రిప్',
    'tab_multi_city': 'మల్టీ-సిటీ',
    'label_from': 'నుండి',
    'label_to': 'కు',
    'label_date': 'ప్రయాణ తేదీ',
    'label_return': 'తిరుగు ప్రయాణం',
    'label_time': 'సమయం',
    'label_passengers': 'ప్రయాణికులు',
    'btn_search': 'మార్గాలను కనుగొనండి',
    'btn_search_round': 'రౌండ్ ట్రిప్ వెతకండి',
    'btn_search_multi': 'ట్రిప్ ప్లాన్ చేయండి',
    'saved_routes': 'సేవ్ చేసిన మార్గాలు',
    'nav_home': 'హోమ్',
    'nav_plan': 'ప్లాన్',
    'nav_trips': 'ట్రిప్స్',
    'nav_profile': 'ప్రొఫైల్',
    'nav_impact': 'ఎకో',
    'nav_rewards': 'రివార్డ్స్',
    'welcome': 'స్వాగతం',
    'book_now': 'బుక్ చేయండి',
    'select': 'ఎంచుకోండి',
    'dep': 'బయలుదేరు',
    'arr': 'చేరుకొను',
    'duration': 'వ్యవధి',
    'eco_friendly': 'పర్యావరణ అనుకూల',
    'cheapest': 'చౌకైనది',
    'fastest': 'వేగవంతమైనది',
    'recommended': 'సిఫార్సు',
    'filters': 'ఫిల్టర్లు',
    'reset': 'రీసెట్',
    'seats': 'సీట్లు',
    'meals': 'భోజనం',
    'payment': 'చెల్లింపు',
    'total': 'మొత్తం',
    'group_booking': '10 కంటే ఎక్కువ మంది? గ్రూప్ బుకింగ్',
    'corp_mode': 'కార్పొరేట్',
    'personal_mode': 'వ్యక్తిగత',
    'switch_to': 'మార్చండి',
    'logout': 'లాగ్ అవుట్'
  },
  'ur': {
    'app_name': 'ون یاترا',
    'hero_title': 'ہر سفر کے لیے ایک ایپ۔',
    'hero_desc': 'کیب، ٹرین، بس اور فلائٹس کی قیمتوں کا موازنہ کریں۔ سمارٹ ٹریول کے لیے AI کا تخمینہ۔',
    'tab_one_way': 'ایک طرفہ',
    'tab_round_trip': 'راؤنڈ ٹرپ',
    'tab_multi_city': 'ملٹی سٹی',
    'label_from': 'کہاں سے',
    'label_to': 'کہاں تک',
    'label_date': 'روانگی',
    'label_return': 'واپسی',
    'label_time': 'وقت',
    'label_passengers': 'مسافر',
    'btn_search': 'راستے تلاش کریں',
    'btn_search_round': 'راؤنڈ ٹرپ تلاش کریں',
    'btn_search_multi': 'منصوبہ بنائیں',
    'saved_routes': 'محفوظ راستے',
    'nav_home': 'ہوم',
    'nav_plan': 'منصوبہ',
    'nav_trips': 'دورے',
    'nav_profile': 'پروفائل',
    'nav_impact': 'ماحولیاتی',
    'nav_rewards': 'انعامات',
    'welcome': 'خوش آمدید',
    'book_now': 'بک کریں',
    'select': 'منتخب کریں',
    'dep': 'روانگی',
    'arr': 'آمد',
    'duration': 'دورانیہ',
    'eco_friendly': 'ماحول دوست',
    'cheapest': 'سب سے سستا',
    'fastest': 'تیز ترین',
    'recommended': 'تجویز کردہ',
    'filters': 'فلٹرز',
    'reset': 'ری سیٹ',
    'seats': 'نشستیں',
    'meals': 'کھانا',
    'payment': 'ادائیگی',
    'total': 'کل',
    'group_booking': '10 سے زیادہ افراد؟ گروپ بکنگ',
    'corp_mode': 'کارپوریٹ',
    'personal_mode': 'ذاتی',
    'switch_to': 'تبدیل کریں',
    'logout': 'لاگ آؤٹ'
  }
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [currency, setCurrency] = useState<Currency>('INR');
  const [isB2BMode, setIsB2BMode] = useState(false);

  useEffect(() => {
    // 1. Load Settings
    const storedLang = localStorage.getItem('oneyatra_lang');
    const storedCurr = localStorage.getItem('oneyatra_curr');
    const storedB2B = localStorage.getItem('oneyatra_b2b');

    if (storedLang) {
      setLanguage(storedLang as Language);
    } else {
      // Auto-detect browser language
      const browserLang = navigator.language.split('-')[0];
      if (['hi', 'ta', 'bn', 'te', 'ur'].includes(browserLang)) {
        setLanguage(browserLang as Language);
      }
    }

    if (storedCurr) setCurrency(storedCurr as Currency);
    if (storedB2B) setIsB2BMode(storedB2B === 'true');
  }, []);

  // Handle RTL for Urdu
  useEffect(() => {
    if (language === 'ur') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ur';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = language;
    }
  }, [language]);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('oneyatra_lang', lang);
  };

  const handleSetCurrency = (curr: Currency) => {
    setCurrency(curr);
    localStorage.setItem('oneyatra_curr', curr);
  };

  const toggleB2BMode = () => {
    const newVal = !isB2BMode;
    setIsB2BMode(newVal);
    localStorage.setItem('oneyatra_b2b', String(newVal));
  };

  const formatPrice = (amountInInr: number): string => {
    const rate = RATES[currency];
    const converted = amountInInr * rate;
    return new Intl.NumberFormat(LOCALE_MAP[language], {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: currency === 'INR' ? 0 : 2
    }).format(converted);
  };

  const formatDate = (date: string | number | Date, options?: Intl.DateTimeFormatOptions): string => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);
    
    return new Intl.DateTimeFormat(LOCALE_MAP[language], options || {
      day: 'numeric',
      month: 'short',
      weekday: 'short'
    }).format(d);
  };

  const t = (key: string): string => {
    return TRANSLATIONS[language][key] || TRANSLATIONS['en'][key] || key;
  };

  return (
    <SettingsContext.Provider value={{
      language,
      currency,
      isB2BMode,
      setLanguage: handleSetLanguage,
      setCurrency: handleSetCurrency,
      toggleB2BMode,
      formatPrice,
      formatDate,
      t,
      dir: language === 'ur' ? 'rtl' : 'ltr'
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within SettingsProvider");
  return context;
};
