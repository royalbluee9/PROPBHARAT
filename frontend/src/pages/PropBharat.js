import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import EMICalculator from "../components/EMICalculator";
import MapView from "../components/MapView";
import axios from "axios";
import { MapPin, Grid, Map, Calculator, LogOut, User, ChevronDown, Heart, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/* ─── TRANSLATIONS ─── */
const T = {
  en: { name: "English", script: "En", hero_title: "Find Your Dream Home Across India", hero_sub: "Post leads. Discover properties. Connect directly.", buy: "Buy", sell: "Sell", rent: "Rent", search_ph: "Search city, locality or project…", search_btn: "Search", post_btn: "+ Post Lead", popular_cities: "Popular Cities", all_india: "All India", prop_type: "Property Type", all_types: "All Types", apartment: "Apartment", villa: "Villa/House", plot: "Plot/Land", office: "Office Space", shop: "Shop/Commercial", penthouse: "Penthouse", any: "Any", verified: "Verified", featured: "Featured", ready: "Ready to Move", uc: "Under Construction", new_launch: "New Launch", contact: "Contact Owner", whatsapp: "WhatsApp", view_more: "View Details", per_mo: "/mo", sqft: "sq.ft", beds: "Beds", baths: "Baths", negotiable: "Negotiable", posted: "Posted", days_ago: "days ago", today: "Today", yesterday: "Yesterday", post_title: "Post a Property Lead", post_sub: "Reach lakhs of buyers, sellers & renters across India", full_name: "Full Name *", phone: "Mobile Number *", city_label: "City *", locality_label: "Locality / Area", prop_type_label: "Property Type", looking_to: "I want to *", area_sqft: "Area (sq.ft)", price_label: "Price / Rent (₹)", bedrooms: "Bedrooms", furnishing: "Furnishing", unfurnished: "Unfurnished", semi: "Semi-Furnished", full: "Fully Furnished", desc_label: "Description (optional)", submit: "Submit Lead", success_title: "Lead Posted Successfully!", success_msg: "Our agents will contact you within 24 hours.", close: "Close", amenities: "Amenities", gym: "Gym", pool: "Pool", parking: "Parking", security: "Security", lift: "Lift", garden: "Garden", club: "Club House", power: "Power Backup", stats_props: "Properties", stats_cities: "Cities", stats_users: "Happy Users", trust: "India's Most Trusted Property Platform", clear: "Clear Filters", no_results: "No properties found. Try adjusting your filters.", crore: "Cr", lakh: "L", owner: "Owner", agent: "Agent", contact_modal_title: "Get Owner Details", contact_msg: "Login to reveal owner details — it's free!", call_now: "Call Now", copyright: "© 2025 PropBharat. For India, By India.", lang_label: "Language", login: "Login", logout: "Logout", my_listings: "My Listings", admin: "Admin", emi_calc: "EMI Calculator", map_view: "Map View", grid_view: "Grid View", register: "Register" },
  hi: { name: "हिंदी", script: "हि", hero_title: "भारत में अपना सपनों का घर खोजें", hero_sub: "लीड पोस्ट करें। प्रॉपर्टी खोजें। सीधे जुड़ें।", buy: "खरीदें", sell: "बेचें", rent: "किराया", search_ph: "शहर, इलाका या प्रोजेक्ट खोजें…", search_btn: "खोजें", post_btn: "+ लीड पोस्ट करें", popular_cities: "लोकप्रिय शहर", all_india: "सम्पूर्ण भारत", prop_type: "प्रॉपर्टी प्रकार", all_types: "सभी प्रकार", apartment: "अपार्टमेंट", villa: "विला/मकान", plot: "प्लॉट/ज़मीन", office: "ऑफ़िस", shop: "दुकान", penthouse: "पेंटहाउस", any: "कोई भी", verified: "सत्यापित", featured: "विशेष", ready: "तैयार", uc: "निर्माणाधीन", new_launch: "नई लॉन्च", contact: "मालिक से संपर्क", whatsapp: "व्हाट्सऐप", view_more: "विवरण देखें", per_mo: "/माह", sqft: "वर्ग फीट", beds: "बेड", baths: "बाथ", negotiable: "बातचीत योग्य", posted: "पोस्ट", days_ago: "दिन पहले", today: "आज", yesterday: "कल", post_title: "प्रॉपर्टी लीड पोस्ट करें", post_sub: "लाखों खरीदारों तक पहुँचें", full_name: "पूरा नाम *", phone: "मोबाइल नंबर *", city_label: "शहर *", locality_label: "इलाका", prop_type_label: "प्रॉपर्टी प्रकार", looking_to: "मैं चाहता/चाहती हूँ *", area_sqft: "क्षेत्रफल", price_label: "कीमत (₹)", bedrooms: "बेडरूम", furnishing: "फर्निशिंग", unfurnished: "अनफर्निश्ड", semi: "सेमी-फर्निश्ड", full: "फुली फर्निश्ड", desc_label: "विवरण", submit: "लीड सबमिट करें", success_title: "लीड सफलतापूर्वक पोस्ट हुई!", success_msg: "हमारे एजेंट 24 घंटे में संपर्क करेंगे।", close: "बंद करें", amenities: "सुविधाएं", gym: "जिम", pool: "पूल", parking: "पार्किंग", security: "सुरक्षा", lift: "लिफ्ट", garden: "बगीचा", club: "क्लब", power: "पावर बैकअप", stats_props: "प्रॉपर्टी", stats_cities: "शहर", stats_users: "खुश ग्राहक", trust: "भारत का सबसे विश्वसनीय प्लेटफ़ॉर्म", clear: "फ़िल्टर हटाएं", no_results: "कोई प्रॉपर्टी नहीं मिली।", crore: "करोड़", lakh: "लाख", owner: "मालिक", agent: "एजेंट", contact_modal_title: "मालिक का विवरण पाएं", contact_msg: "नंबर देखने के लिए लॉगिन करें!", call_now: "अभी कॉल करें", copyright: "© 2025 PropBharat. भारत के लिए।", lang_label: "भाषा", login: "लॉगिन", logout: "लॉगआउट", my_listings: "मेरी लिस्टिंग", admin: "एडमिन", emi_calc: "ईएमआई कैलकुलेटर", map_view: "मानचित्र", grid_view: "ग्रिड", register: "रजिस्टर" },
  gu: { name: "ગુજરાતી", script: "ગુ", hero_title: "ભારતમાં તમારું સ્વપ્ન ઘર શોધો", hero_sub: "લીડ પોસ્ટ કરો. પ્રોપર્ટી શોધો. સીધા જોડાઓ.", buy: "ખરીદો", sell: "વેચો", rent: "ભાડું", search_ph: "શહેર, વિસ્તાર અથવા પ્રોજેક્ટ શોધો…", search_btn: "શોધો", post_btn: "+ લીડ પોસ્ટ", popular_cities: "લોકપ્રિય શહેરો", all_india: "સમગ્ર ભારત", prop_type: "પ્રોપર્ટી પ્રકાર", all_types: "બધા", apartment: "એપાર્ટમેન્ટ", villa: "વિલા/ઘર", plot: "પ્લોટ", office: "ઓફિસ", shop: "દુકાન", penthouse: "પેન્ટહાઉસ", any: "કોઈ પણ", verified: "ચકાસાયેલ", featured: "ફીચર્ડ", ready: "તૈયાર", uc: "બાંધકામ હેઠળ", new_launch: "નવી", contact: "માલિકનો સંપર્ક", whatsapp: "વ્હૉટ્સઍપ", view_more: "વિગત", per_mo: "/મહિનો", sqft: "ચો.ફૂ.", beds: "બેડ", baths: "બાથ", negotiable: "વાટાઘાટ", posted: "પોસ્ટ", days_ago: "દિવસ પહેલા", today: "આજે", yesterday: "ગઈ કાલે", post_title: "પ્રોપર્ટી લીડ પોસ્ટ", post_sub: "લાખો ખરીદારો સુધી પહોંચો", full_name: "પૂરું નામ *", phone: "મોબાઇલ *", city_label: "શહેર *", locality_label: "વિસ્તાર", prop_type_label: "પ્રોપર્ટી", looking_to: "હું ઇચ્છું છું *", area_sqft: "ક્ષેત્ર", price_label: "કિંમત (₹)", bedrooms: "બેડ", furnishing: "ફર્નિચર", unfurnished: "ફર્નિચર વિના", semi: "અર્ધ", full: "સંપૂર્ણ", desc_label: "વિવરણ", submit: "સબમિટ", success_title: "સફળ!", success_msg: "24 કલાકમાં સંપર્ક.", close: "બંધ", amenities: "સુવિધા", gym: "જિમ", pool: "પૂલ", parking: "પાર્કિંગ", security: "સુરક્ષા", lift: "લિફ્ટ", garden: "બગીચો", club: "ક્લબ", power: "પાવર", stats_props: "પ્રોપર્ટી", stats_cities: "શહેર", stats_users: "ગ્રાહક", trust: "ભારતનું સૌથી વિશ્વસનીય", clear: "ફિલ્ટર સાફ", no_results: "કોઈ પ્રોપર્ટી મળી નથી.", crore: "કરોડ", lakh: "લાખ", owner: "માલિક", agent: "એજન્ટ", contact_modal_title: "માલિકની વિગત", contact_msg: "લૉગઇન કરો!", call_now: "ફોન કરો", copyright: "© 2025 PropBharat", lang_label: "ભાષા", login: "લૉગઇન", logout: "લૉગઆઉટ", my_listings: "મારી", admin: "એડમિન", emi_calc: "ઈએમઆઈ", map_view: "નકશો", grid_view: "ગ્રિડ", register: "નોંધણી" },
  mr: { name: "मराठी", script: "म", hero_title: "भारतात तुमचे स्वप्नातील घर शोधा", hero_sub: "लीड पोस्ट करा. प्रॉपर्टी शोधा. थेट जोडा.", buy: "खरेदी", sell: "विक्री", rent: "भाडे", search_ph: "शहर, परिसर किंवा प्रकल्प शोधा…", search_btn: "शोधा", post_btn: "+ लीड पोस्ट", popular_cities: "लोकप्रिय शहरे", all_india: "संपूर्ण भारत", prop_type: "प्रॉपर्टी प्रकार", all_types: "सर्व", apartment: "अपार्टमेंट", villa: "व्हिला", plot: "प्लॉट", office: "ऑफिस", shop: "दुकान", penthouse: "पेंटहाउस", any: "कोणतेही", verified: "सत्यापित", featured: "वैशिष्ट्यीकृत", ready: "सज्ज", uc: "बांधकाम", new_launch: "नवीन", contact: "मालकाशी संपर्क", whatsapp: "व्हॉट्सॲप", view_more: "तपशील", per_mo: "/महिना", sqft: "चौ.फूट", beds: "बेड", baths: "बाथ", negotiable: "वाटाघाटी", posted: "पोस्ट", days_ago: "दिवसांपूर्वी", today: "आज", yesterday: "काल", post_title: "लीड पोस्ट करा", post_sub: "लाखो खरेदीदारांपर्यंत पोहोचा", full_name: "पूर्ण नाव *", phone: "मोबाईल *", city_label: "शहर *", locality_label: "परिसर", prop_type_label: "प्रॉपर्टी", looking_to: "मला *", area_sqft: "क्षेत्रफळ", price_label: "किंमत (₹)", bedrooms: "बेड", furnishing: "फर्निशिंग", unfurnished: "विनाफर्निचर", semi: "अर्ध", full: "पूर्ण", desc_label: "वर्णन", submit: "सबमिट", success_title: "यशस्वी!", success_msg: "24 तासात संपर्क.", close: "बंद", amenities: "सुविधा", gym: "जिम", pool: "पूल", parking: "पार्किंग", security: "सुरक्षा", lift: "लिफ्ट", garden: "बाग", club: "क्लब", power: "पॉवर", stats_props: "प्रॉपर्टी", stats_cities: "शहरे", stats_users: "ग्राहक", trust: "भारतातील सर्वात विश्वासार्ह", clear: "फिल्टर साफ", no_results: "प्रॉपर्टी आढळली नाही.", crore: "कोटी", lakh: "लाख", owner: "मालक", agent: "एजंट", contact_modal_title: "मालकाचे तपशील", contact_msg: "लॉगिन करा!", call_now: "कॉल करा", copyright: "© 2025 PropBharat", lang_label: "भाषा", login: "लॉगिन", logout: "लॉगआउट", my_listings: "माझे", admin: "एडमिन", emi_calc: "ईएमआय", map_view: "नकाशा", grid_view: "ग्रिड", register: "नोंदणी" },
  ta: { name: "தமிழ்", script: "த", hero_title: "இந்தியாவில் உங்கள் கனவு இல்லம் கண்டுபிடியுங்கள்", hero_sub: "லீட் போஸ்ட் செய்யுங்கள். சொத்துகளைக் கண்டுபிடியுங்கள்.", buy: "வாங்கு", sell: "விற்கு", rent: "வாடகை", search_ph: "நகரம், பகுதி தேடுங்கள்…", search_btn: "தேடு", post_btn: "+ லீட் போஸ்ட்", popular_cities: "பிரபலமான நகரங்கள்", all_india: "அனைத்து இந்தியா", prop_type: "சொத்து வகை", all_types: "அனைத்தும்", apartment: "அபார்ட்மென்ட்", villa: "வில்லா", plot: "மனை", office: "அலுவலகம்", shop: "கடை", penthouse: "பென்ட்ஹவுஸ்", any: "எதுவும்", verified: "சரிபார்க்கப்பட்டது", featured: "சிறப்பு", ready: "தயார்", uc: "கட்டுமானம்", new_launch: "புதிய", contact: "உரிமையாளரை தொடர்", whatsapp: "வாட்ஸ்அப்", view_more: "விவரங்கள்", per_mo: "/மாதம்", sqft: "சதுர அடி", beds: "படுக்கை", baths: "குளியலறை", negotiable: "பேரம்", posted: "போஸ்ட்", days_ago: "நாட்களுக்கு முன்", today: "இன்று", yesterday: "நேற்று", post_title: "லீட் போஸ்ட் செய்யுங்கள்", post_sub: "லட்சக்கணக்கானோரை அடையுங்கள்", full_name: "முழு பெயர் *", phone: "மொபைல் *", city_label: "நகரம் *", locality_label: "பகுதி", prop_type_label: "சொத்து", looking_to: "நான் விரும்புகிறேன் *", area_sqft: "பரப்பளவு", price_label: "விலை (₹)", bedrooms: "படுக்கையறை", furnishing: "மரச்சாமான்", unfurnished: "இல்லாத", semi: "பகுதி", full: "முழு", desc_label: "விவரம்", submit: "சமர்ப்பி", success_title: "வெற்றி!", success_msg: "24 மணி நேரத்தில் தொடர்புகொள்வார்கள்.", close: "மூடு", amenities: "வசதிகள்", gym: "உடற்பயிற்சி", pool: "நீச்சல்", parking: "நிறுத்துமிடம்", security: "பாதுகாப்பு", lift: "மின்தூக்கி", garden: "தோட்டம்", club: "கிளப்", power: "மின்", stats_props: "சொத்துகள்", stats_cities: "நகரங்கள்", stats_users: "பயனர்கள்", trust: "இந்தியாவின் நம்பகமான தளம்", clear: "வடிகட்டி அழி", no_results: "சொத்துகள் கிடைக்கவில்லை.", crore: "கோடி", lakh: "லட்சம்", owner: "உரிமையாளர்", agent: "முகவர்", contact_modal_title: "விவரங்கள் பெறுங்கள்", contact_msg: "உள்நுழையுங்கள்!", call_now: "அழையுங்கள்", copyright: "© 2025 PropBharat", lang_label: "மொழி", login: "உள்நுழை", logout: "வெளியேறு", my_listings: "என்னுடையது", admin: "நிர்வாகி", emi_calc: "EMI", map_view: "வரைபடம்", grid_view: "கட்டம்", register: "பதிவு" },
  te: { name: "తెలుగు", script: "తె", hero_title: "భారతదేశంలో మీ కలల ఇంటిని కనుగొనండి", hero_sub: "లీడ్ పోస్ట్ చేయండి. ప్రాపర్టీలు కనుగొనండి.", buy: "కొనండి", sell: "అమ్మండి", rent: "అద్దె", search_ph: "నగరం, ప్రాంతం వెతకండి…", search_btn: "వెతకండి", post_btn: "+ లీడ్ పోస్ట్", popular_cities: "ప్రసిద్ధ నగరాలు", all_india: "మొత్తం భారతదేశం", prop_type: "ప్రాపర్టీ రకం", all_types: "అన్నీ", apartment: "అపార్ట్మెంట్", villa: "విల్లా", plot: "ప్లాట్", office: "ఆఫీస్", shop: "దుకాణం", penthouse: "పెంట్‌హౌస్", any: "ఏదైనా", verified: "ధృవీకరించబడింది", featured: "ఫీచర్డ్", ready: "సిద్ధం", uc: "నిర్మాణంలో", new_launch: "కొత్తది", contact: "యజమానిని సంప్రదించండి", whatsapp: "వాట్సాప్", view_more: "వివరాలు", per_mo: "/నెల", sqft: "చ.అ.", beds: "బెడ్", baths: "బాత్", negotiable: "చర్చించదగినది", posted: "పోస్ట్", days_ago: "రోజుల క్రితం", today: "ఈరోజు", yesterday: "నిన్న", post_title: "లీడ్ పోస్ట్ చేయండి", post_sub: "లక్షలాది మందిని చేరండి", full_name: "పూర్తి పేరు *", phone: "మొబైల్ *", city_label: "నగరం *", locality_label: "ప్రాంతం", prop_type_label: "ప్రాపర్టీ", looking_to: "నేను కోరుకుంటున్నాను *", area_sqft: "విస్తీర్ణం", price_label: "ధర (₹)", bedrooms: "బెడ్‌రూమ్లు", furnishing: "ఫర్నిషింగ్", unfurnished: "ఫర్నీచర్ లేదు", semi: "సెమీ", full: "పూర్తి", desc_label: "వివరణ", submit: "సమర్పించండి", success_title: "విజయం!", success_msg: "24 గంటల్లో సంప్రదిస్తారు।", close: "మూసివేయండి", amenities: "సౌకర్యాలు", gym: "జిమ్", pool: "పూల్", parking: "పార్కింగ్", security: "భద్రత", lift: "లిఫ్ట్", garden: "గార్డెన్", club: "క్లబ్", power: "పవర్", stats_props: "ప్రాపర్టీలు", stats_cities: "నగరాలు", stats_users: "వినియోగదారులు", trust: "అత్యంత విశ్వసనీయ వేదిక", clear: "ఫిల్టర్లు తొలగించు", no_results: "ప్రాపర్టీలు కనుగొనబడలేదు।", crore: "కోటి", lakh: "లక్ష", owner: "యజమాని", agent: "ఏజెంట్", contact_modal_title: "వివరాలు పొందండి", contact_msg: "లాగిన్ చేయండి!", call_now: "కాల్ చేయండి", copyright: "© 2025 PropBharat", lang_label: "భాష", login: "లాగిన్", logout: "లాగౌట్", my_listings: "నా లిస్టింగ్లు", admin: "అడ్మిన్", emi_calc: "ఈఎమ్ఐ", map_view: "మ్యాప్", grid_view: "గ్రిడ్", register: "నమోదు" },
  bn: { name: "বাংলা", script: "বা", hero_title: "ভারতে আপনার স্বপ্নের বাড়ি খুঁজুন", hero_sub: "লিড পোস্ট করুন। সম্পত্তি আবিষ্কার করুন।", buy: "কিনুন", sell: "বিক্রি করুন", rent: "ভাড়া", search_ph: "শহর, এলাকা খুঁজুন…", search_btn: "খুঁজুন", post_btn: "+ লিড পোস্ট", popular_cities: "জনপ্রিয় শহর", all_india: "সমগ্র ভারত", prop_type: "সম্পত্তির ধরন", all_types: "সব", apartment: "অ্যাপার্টমেন্ট", villa: "ভিলা", plot: "প্লট", office: "অফিস", shop: "দোকান", penthouse: "পেন্টহাউস", any: "যেকোনো", verified: "যাচাইকৃত", featured: "বিশেষ", ready: "প্রস্তুত", uc: "নির্মাণাধীন", new_launch: "নতুন", contact: "মালিকের সাথে", whatsapp: "হোয়াটসঅ্যাপ", view_more: "বিস্তারিত", per_mo: "/মাস", sqft: "বর্গফুট", beds: "বেড", baths: "বাথ", negotiable: "আলোচনাযোগ্য", posted: "পোস্ট", days_ago: "দিন আগে", today: "আজ", yesterday: "গতকাল", post_title: "লিড পোস্ট করুন", post_sub: "লক্ষ লক্ষ মানুষের কাছে পৌঁছান", full_name: "পুরো নাম *", phone: "মোবাইল *", city_label: "শহর *", locality_label: "এলাকা", prop_type_label: "সম্পত্তি", looking_to: "আমি চাই *", area_sqft: "আয়তন", price_label: "মূল্য (₹)", bedrooms: "বেডরুম", furnishing: "আসবাব", unfurnished: "আসবাব ছাড়া", semi: "আধা", full: "সম্পূর্ণ", desc_label: "বিবরণ", submit: "জমা দিন", success_title: "সফল!", success_msg: "২৪ ঘণ্টায় যোগাযোগ।", close: "বন্ধ", amenities: "সুবিধা", gym: "জিম", pool: "পুল", parking: "পার্কিং", security: "নিরাপত্তা", lift: "লিফট", garden: "বাগান", club: "ক্লাব", power: "পাওয়ার", stats_props: "সম্পত্তি", stats_cities: "শহর", stats_users: "ব্যবহারকারী", trust: "সবচেয়ে বিশ্বস্ত প্ল্যাটফর্ম", clear: "ফিল্টার মুছুন", no_results: "কোনো সম্পত্তি পাওয়া যায়নি।", crore: "কোটি", lakh: "লক্ষ", owner: "মালিক", agent: "এজেন্ট", contact_modal_title: "মালিকের বিবরণ", contact_msg: "লগিন করুন!", call_now: "কল করুন", copyright: "© 2025 PropBharat", lang_label: "ভাষা", login: "লগিন", logout: "লগআউট", my_listings: "আমার", admin: "অ্যাডমিন", emi_calc: "ইএমআই", map_view: "মানচিত্র", grid_view: "গ্রিড", register: "নিবন্ধন" },
};

const CITIES = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Pune", "Jaipur", "Surat", "Lucknow", "Nagpur", "Indore", "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Coimbatore", "Kochi", "Chandigarh", "Noida", "Gurugram", "Thane", "Navi Mumbai", "Nashik", "Mysuru", "Rajkot", "Jodhpur", "Udaipur", "Varanasi"];

const AMENITY_META = { gym: { icon: "🏋️", key: "gym" }, pool: { icon: "🏊", key: "pool" }, parking: { icon: "🚗", key: "parking" }, security: { icon: "🛡️", key: "security" }, lift: { icon: "🛗", key: "lift" }, garden: { icon: "🌿", key: "garden" }, club: { icon: "🎱", key: "club" }, power: { icon: "⚡", key: "power" } };

const fmt = (price, rent, t) => {
  const v = price ?? rent;
  if (!v) return "Price on Request";
  let str;
  if (v >= 10000000) str = `₹${(v / 10000000).toFixed(2)} ${t.crore}`;
  else if (v >= 100000) str = `₹${(v / 100000).toFixed(1)} ${t.lakh}`;
  else str = `₹${v.toLocaleString("en-IN")}`;
  return rent ? str + t.per_mo : str;
};

const postedLabel = (d, t) => { if (d === 0) return t.today; if (d === 1) return t.yesterday; return `${d} ${t.days_ago}`; };

export default function PropBharat() {
  const navigate = useNavigate();
  const { user, logout, setShowAuthModal, requireAuth, getHeaders } = useAuth();
  const [lang, setLang] = useState("en");
  const [tab, setTab] = useState("buy");
  const [search, setSearch] = useState("");
  const [cityF, setCityF] = useState("");
  const [typeF, setTypeF] = useState("");
  const [bhkF, setBhkF] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 12;
  const [showPost, setShowPost] = useState(false);
  const [contactProp, setContactProp] = useState(null);
  const [langOpen, setLangOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem("pb_favorites") || "[]"));
  const [form, setForm] = useState({ name: "", phone: "", city: "", locality: "", propType: "apartment", leadType: "buy", area: "", price: "", beds: "", furnishing: "unfurnished", desc: "" });
  const [formOk, setFormOk] = useState(false);
  const [formErr, setFormErr] = useState("");
  const [mounted, setMounted] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEMI, setShowEMI] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const langRef = useRef();
  const userMenuRef = useRef();
  const t = T[lang];

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const h = e => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (tab !== "sell") params.cat = tab;
      if (cityF) params.city = cityF;
      if (typeF) params.type = typeF;
      if (search) params.search = search;
      if (bhkF) params.bhk = parseInt(bhkF);
      if (minPrice) params.min_price = parseInt(minPrice.replace(/,/g, ""));
      if (maxPrice) params.max_price = parseInt(maxPrice.replace(/,/g, ""));
      const res = await axios.get(`${API}/properties`, { params });
      setProperties(res.data.properties || []);
      setTotal(res.data.total || 0);
    } catch {
      setProperties([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [tab, cityF, typeF, search, bhkF, minPrice, maxPrice, page]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [tab, cityF, typeF, search, bhkF, minPrice, maxPrice]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const submit = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.city) { setFormErr("Please fill required fields."); return; }
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ""))) { setFormErr("Enter a valid 10-digit Indian mobile number."); return; }
    setFormErr("");
    try {
      await axios.post(`${API}/leads`, { name: form.name, phone: form.phone, city: form.city, locality: form.locality, prop_type: form.propType, lead_type: form.leadType, area: form.area, price: form.price, beds: form.beds, furnishing: form.furnishing, desc: form.desc }, { headers: getHeaders() });
      setFormOk(true);
      setTimeout(() => { setShowPost(false); setFormOk(false); setForm({ name: "", phone: "", city: "", locality: "", propType: "apartment", leadType: "buy", area: "", price: "", beds: "", furnishing: "unfurnished", desc: "" }); }, 4000);
    } catch { setFormErr("Failed to submit. Please try again."); }
  };

  const handleContact = (prop) => {
    if (!user) { setContactProp(prop); setShowAuthModal(true); return; }
    setContactProp(prop);
  };

  const toggleFav = (propId) => {
    const newFavs = favorites.includes(propId)
      ? favorites.filter(f => f !== propId)
      : [...favorites, propId];
    setFavorites(newFavs);
    localStorage.setItem("pb_favorites", JSON.stringify(newFavs));
    if (user) {
      const headers = getHeaders();
      if (favorites.includes(propId)) {
        axios.delete(`${API}/favorites/${propId}`, { headers }).catch(err => console.error("[Favorites] Remove failed:", err?.message));
      } else {
        axios.post(`${API}/favorites`, { prop_id: propId }, { headers }).catch(err => console.error("[Favorites] Add failed:", err?.message));
      }
    }
  };

  const clearAllFilters = () => { setTypeF(""); setCityF(""); setSearch(""); setBhkF(""); setMinPrice(""); setMaxPrice(""); };

  const TAB_ACCENT = { buy: "#C84B31", rent: "#1B4F72", sell: "#1D6A43" };
  const accent = TAB_ACCENT[tab];

  return (
    <div style={{ fontFamily: "'Noto Sans',sans-serif", background: "#F5F0E8", minHeight: "100vh", color: "#1C1C1C" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;600;700&family=Yeseva+One&family=Noto+Serif:wght@700;900&family=Noto+Sans+Devanagari:wght@400;600;700&family=Noto+Sans+Gujarati:wght@400;600&family=Noto+Sans+Tamil:wght@400;600&family=Noto+Sans+Telugu:wght@400;600&family=Noto+Sans+Bengali:wght@400;600&display=swap" rel="stylesheet" />

      {/* NAVBAR */}
      <nav style={{ background: "#FFFDF8", borderBottom: "1px solid #EDE5D5", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 16px rgba(0,0,0,.06)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 20px", height: 64, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{ width: 38, height: 38, background: "linear-gradient(135deg,#C84B31,#8B1A08)", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏘️</div>
            <div>
              <div style={{ fontFamily: "'Yeseva One',serif", fontSize: 19, color: "#1C1C1C", letterSpacing: ".5px" }}>PropBharat</div>
              <div style={{ fontSize: 9, color: "#C84B31", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>India's Own</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 4, marginLeft: 8 }} className="pb-hide-mob">
            {["buy", "rent", "sell"].map(tb => (
              <button key={tb} className="pb-btn" onClick={() => setTab(tb)} data-testid={`tab-${tb}`}
                style={{ padding: "7px 16px", fontSize: 13, background: tab === tb ? "#1C1C1C" : "transparent", color: tab === tb ? "#fff" : "#555", borderRadius: 8 }}>
                {t[tb]}
              </button>
            ))}
          </div>
          <div style={{ flex: 1 }} />

          {/* EMI Button */}
          <button className="pb-btn" onClick={() => setShowEMI(true)} data-testid="emi-btn"
            style={{ background: "transparent", border: "1.5px solid #DDD5C5", color: "#555", padding: "7px 14px", fontSize: 13, borderRadius: 9, gap: 6, display: "flex", alignItems: "center" }} title={t.emi_calc}>
            <Calculator size={15} />
            <span className="pb-hide-mob">{t.emi_calc}</span>
          </button>

          <button className="pb-btn pb-btn-accent" onClick={() => setShowPost(true)} data-testid="post-lead-btn"
            style={{ background: "linear-gradient(135deg,#C84B31,#8B1A08)", padding: "9px 18px", fontSize: 13, borderRadius: 10, flexShrink: 0 }}>
            {t.post_btn}
          </button>

          {/* Auth */}
          {user ? (
            <div style={{ position: "relative" }} ref={userMenuRef}>
              <button className="pb-btn" onClick={() => setUserMenuOpen(v => !v)} data-testid="user-menu-btn"
                style={{ background: "#F5F0E8", border: "1.5px solid #DDD5C5", padding: "7px 12px", borderRadius: 9, gap: 8, display: "flex", alignItems: "center", fontSize: 13 }}>
                {user.picture ? <img src={user.picture} style={{ width: 24, height: 24, borderRadius: "50%" }} alt="" /> : <User size={16} />}
                <span className="pb-hide-mob" style={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</span>
                <ChevronDown size={14} />
              </button>
              {userMenuOpen && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: "#FFFDF8", border: "1.5px solid #EDE5D5", borderRadius: 14, padding: 6, minWidth: 180, zIndex: 300, boxShadow: "0 12px 32px rgba(0,0,0,.14)" }}>
                  <div style={{ padding: "10px 12px", borderBottom: "1px solid #EDE5D5", marginBottom: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1C1C1C" }}>{user.name}</div>
                    <div style={{ fontSize: 11, color: "#888" }}>{user.email}</div>
                    {user.phone && <div style={{ fontSize: 11, color: "#1D6A43", fontWeight: 600 }}>+91 {user.phone}</div>}
                    <div style={{ fontSize: 10, background: user.role === "admin" ? "#C84B31" : user.role === "agent" ? "#1B4F72" : "#1D6A43", color: "#fff", borderRadius: 4, padding: "2px 6px", display: "inline-block", marginTop: 4, fontWeight: 700, letterSpacing: .5, textTransform: "uppercase" }}>{user.role}</div>
                  </div>
                  {(user.role === "agent" || user.role === "admin") && (
                    <button onClick={() => { navigate(user.role === "admin" ? "/admin" : "/agent"); setUserMenuOpen(false); }}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#333", width: "100%", border: "none", background: "transparent", fontFamily: "inherit" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#F5F0E8"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"} data-testid="dashboard-link">
                      <User size={14} /> {user.role === "admin" ? t.admin : t.my_listings}
                    </button>
                  )}
                  <button onClick={() => { logout(); setUserMenuOpen(false); }}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#C84B31", width: "100%", border: "none", background: "transparent", fontFamily: "inherit" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#FFF0EC"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"} data-testid="logout-btn">
                    <LogOut size={14} /> {t.logout}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="pb-btn" onClick={() => setShowAuthModal(true)} data-testid="login-btn"
              style={{ background: "#F5F0E8", border: "1.5px solid #DDD5C5", color: "#333", padding: "8px 16px", fontSize: 13, borderRadius: 9, fontWeight: 600 }}>
              {t.login}
            </button>
          )}

          {/* Lang */}
          <div style={{ position: "relative", flexShrink: 0 }} ref={langRef}>
            <button className="pb-btn" style={{ background: "transparent", border: "1.5px solid #DDD5C5", color: "#555", padding: "8px 12px", gap: 6, fontSize: 13, borderRadius: 9, display: "flex", alignItems: "center" }} onClick={() => setLangOpen(v => !v)} data-testid="lang-btn">
              <span style={{ fontSize: 16 }}>🇮🇳</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: accent }}>{t.script}</span>
              <span style={{ fontSize: 10, opacity: .6 }}>▾</span>
            </button>
            {langOpen && (
              <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: "#FFFDF8", border: "1.5px solid #EDE5D5", borderRadius: 14, padding: 6, minWidth: 170, zIndex: 300, boxShadow: "0 12px 32px rgba(0,0,0,.14)" }}>
                {Object.entries(T).map(([k, v]) => (
                  <div key={k} onClick={() => { setLang(k); setLangOpen(false); }}
                    style={{ padding: "9px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: lang === k ? 700 : 500, color: lang === k ? "#C84B31" : "#333", display: "flex", alignItems: "center", gap: 8 }}
                    onMouseEnter={e => e.currentTarget.style.background = "#F5F0E8"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"} data-testid={`lang-${k}`}>
                    <span style={{ fontSize: 16 }}>{k === "en" ? "🇬🇧" : "🇮🇳"}</span><span>{v.name}</span>
                    {lang === k && <span style={{ marginLeft: "auto", fontSize: 12 }}>✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: "linear-gradient(160deg,#1C0A00 0%,#3D1A07 40%,#1B3A4B 100%)", padding: "56px 20px 48px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: .06, backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)", backgroundSize: "24px 24px" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 15% 50%,rgba(200,75,49,.3) 0%,transparent 65%)" }} />
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1, textAlign: "center" }}>
          <div className={mounted ? "pb-anim-in" : ""} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(200,75,49,.18)", border: "1px solid rgba(200,75,49,.4)", borderRadius: 24, padding: "5px 18px", fontSize: 12, color: "#FFB89A", fontWeight: 600, letterSpacing: 1, marginBottom: 20 }}>
            🇮🇳 {t.trust}
          </div>
          <h1 className={mounted ? "pb-anim-in" : ""} style={{ fontFamily: "'Yeseva One',serif", fontSize: "clamp(28px,5.5vw,52px)", color: "#FFF8F0", lineHeight: 1.18, marginBottom: 14, animationDelay: ".06s" }}>{t.hero_title}</h1>
          <p className={mounted ? "pb-anim-in" : ""} style={{ color: "rgba(255,248,240,.6)", fontSize: "clamp(14px,2vw,17px)", marginBottom: 36, animationDelay: ".12s" }}>{t.hero_sub}</p>
          <div className={mounted ? "pb-anim-in" : ""} style={{ display: "inline-flex", background: "rgba(255,255,255,.08)", borderRadius: 14, padding: 4, marginBottom: 20, border: "1px solid rgba(255,255,255,.12)", animationDelay: ".16s" }}>
            {["buy", "rent", "sell"].map(tb => (
              <button key={tb} onClick={() => setTab(tb)} className="pb-btn" data-testid={`hero-tab-${tb}`}
                style={{ padding: "11px 28px", fontSize: 15, borderRadius: 10, background: tab === tb ? TAB_ACCENT[tb] : "transparent", color: tab === tb ? "#fff" : "rgba(255,255,255,.55)", letterSpacing: .3 }}>
                {t[tb]}
              </button>
            ))}
          </div>
          <div className={mounted ? "pb-anim-in" : ""} style={{ display: "flex", gap: 10, maxWidth: 660, margin: "0 auto", animationDelay: ".2s" }}>
            <input className="pb-input" placeholder={t.search_ph} value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, fontSize: 15, padding: "14px 18px", borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.2)", background: "#FFFDF8" }} data-testid="search-input" />
            <button className="pb-btn pb-btn-accent" style={{ background: "linear-gradient(135deg,#C84B31,#8B1A08)", padding: "14px 28px", fontSize: 15, borderRadius: 12, flexShrink: 0, boxShadow: "0 4px 16px rgba(200,75,49,.5)" }} data-testid="search-btn">
              {t.search_btn}
            </button>
          </div>
          <div className={mounted ? "pb-anim-in" : ""} style={{ display: "flex", justifyContent: "center", gap: 40, marginTop: 40, animationDelay: ".28s" }}>
            {[["75K+", t.stats_props], ["220+", t.stats_cities], ["12L+", t.stats_users]].map(([n, l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Yeseva One',serif", fontSize: 26, color: "#FFB89A", lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: 12, color: "rgba(255,248,240,.5)", marginTop: 3, letterSpacing: .5 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CITY STRIP */}
      <div style={{ background: "#FFFDF8", borderBottom: "1px solid #EDE5D5", padding: "14px 20px", overflowX: "auto" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#999", letterSpacing: .8, whiteSpace: "nowrap", marginRight: 4 }}>
            <MapPin size={12} style={{ display: "inline" }} /> {t.popular_cities}:
          </span>
          <button className={`pb-chip ${cityF === "" ? "pb-chip-active" : "pb-chip-outline"}`} onClick={() => setCityF("")} data-testid="city-all">{t.all_india}</button>
          {CITIES.slice(0, 15).map(c => (
            <button key={c} className={`pb-chip ${cityF === c ? "pb-chip-active" : "pb-chip-outline"}`} onClick={() => setCityF(cityF === c ? "" : c)} data-testid={`city-${c}`}>{c}</button>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "28px 20px" }}>
        {/* Filter Row */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#888", letterSpacing: .5 }}>{t.prop_type}:</span>
          {[["", "all_types"], ["apartment", "apartment"], ["villa", "villa"], ["plot", "plot"], ["office", "office"], ["shop", "shop"], ["penthouse", "penthouse"]].map(([v, k]) => (
            <button key={v} className={`pb-chip ${typeF === v ? "pb-chip-active" : "pb-chip-outline"}`} onClick={() => setTypeF(v)} data-testid={`type-${v || "all"}`}>{t[k]}</button>
          ))}
          {(typeF || cityF || search || bhkF || minPrice || maxPrice) && (
            <button className="pb-chip" onClick={clearAllFilters}
              style={{ background: "#FFF0EC", border: "1.5px solid #F5B8A8", color: "#C84B31" }}>✕ {t.clear}</button>
          )}
          {/* Advanced filters toggle + Map/Grid toggle */}
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button className="pb-btn" onClick={() => setShowAdvanced(v => !v)} data-testid="advanced-filter-btn"
              style={{ background: showAdvanced ? "#1C1C1C" : "transparent", color: showAdvanced ? "#fff" : "#555", border: "1.5px solid #DDD5C5", padding: "7px 14px", fontSize: 13, borderRadius: 9, display: "flex", alignItems: "center", gap: 6 }}>
              <SlidersHorizontal size={14} /> <span className="pb-hide-mob">Filters</span>
            </button>
            <button className="pb-btn" onClick={() => setShowMap(false)} data-testid="grid-view-btn"
              style={{ background: !showMap ? "#1C1C1C" : "transparent", color: !showMap ? "#fff" : "#555", border: "1.5px solid #DDD5C5", padding: "7px 14px", fontSize: 13, borderRadius: 9, display: "flex", alignItems: "center", gap: 6 }}>
              <Grid size={14} /> <span className="pb-hide-mob">{t.grid_view}</span>
            </button>
            <button className="pb-btn" onClick={() => setShowMap(true)} data-testid="map-view-btn"
              style={{ background: showMap ? "#1C1C1C" : "transparent", color: showMap ? "#fff" : "#555", border: "1.5px solid #DDD5C5", padding: "7px 14px", fontSize: 13, borderRadius: 9, display: "flex", alignItems: "center", gap: 6 }}>
              <Map size={14} /> <span className="pb-hide-mob">{t.map_view}</span>
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvanced && (
          <div style={{ background: "#FFFDF8", border: "1px solid #EDE5D5", borderRadius: 16, padding: "16px 20px", marginBottom: 16, display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }} data-testid="advanced-filters">
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: .8, display: "block", marginBottom: 6 }}>BHK</label>
              <div style={{ display: "flex", gap: 6 }}>
                {["", "1", "2", "3", "4", "5"].map(v => (
                  <button key={v} onClick={() => setBhkF(v)} data-testid={`bhk-filter-${v || "any"}`}
                    style={{ padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${bhkF === v ? accent : "#DDD5C5"}`, background: bhkF === v ? accent : "#FEFCF7", color: bhkF === v ? "#fff" : "#555", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}>
                    {v || "Any"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: .8, display: "block", marginBottom: 6 }}>MIN PRICE (₹)</label>
              <input className="pb-input" placeholder="e.g. 2000000" value={minPrice} onChange={e => setMinPrice(e.target.value)} type="number"
                style={{ width: 140, fontSize: 13, padding: "8px 12px" }} data-testid="min-price-input" />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: .8, display: "block", marginBottom: 6 }}>MAX PRICE (₹)</label>
              <input className="pb-input" placeholder="e.g. 10000000" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} type="number"
                style={{ width: 140, fontSize: 13, padding: "8px 12px" }} data-testid="max-price-input" />
            </div>
            <button className="pb-btn" onClick={clearAllFilters}
              style={{ background: "#FFF0EC", border: "1.5px solid #F5B8A8", color: "#C84B31", padding: "9px 16px", fontSize: 13, borderRadius: 9 }}>
              ✕ Reset All
            </button>
          </div>
        )}

        <div style={{ fontSize: 13, color: "#999", marginBottom: 20, fontWeight: 500 }}>
          <span style={{ color: "#1C1C1C", fontWeight: 700, fontSize: 16 }}>{loading ? "…" : total}</span> properties
          {cityF && <span style={{ color: accent, fontWeight: 700 }}> in {cityF}</span>}
          {typeF && <span style={{ color: "#888" }}> · {t[typeF]}</span>}
          {bhkF && <span style={{ color: "#888" }}> · {bhkF} BHK</span>}
          {total > LIMIT && <span style={{ color: "#888" }}> · Page {page} of {Math.ceil(total / LIMIT)}</span>}
        </div>

        {/* Map View */}
        {showMap && (
          <div style={{ marginBottom: 28 }}>
            <MapView properties={properties} />
          </div>
        )}

        {/* Grid View */}
        {!showMap && (
          loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 22 }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ background: "#FFFDF8", borderRadius: 18, height: 340, border: "1px solid #EDE5D5" }} className="pb-shimmer" />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div style={{ textAlign: "center", padding: "72px 20px", background: "#FFFDF8", borderRadius: 20, border: "1px solid #EDE5D5" }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#888" }}>{t.no_results}</div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 22 }}>
              {properties.map((p, i) => (
                <PropertyCard key={p.prop_id || i} p={p} t={t} accent={accent} i={i}
                  onContact={() => handleContact(p)}
                  onDetail={() => navigate(`/property/${p.prop_id}`)}
                  isFav={favorites.includes(p.prop_id)}
                  onToggleFav={() => toggleFav(p.prop_id)} />
              ))}
            </div>
          )
        )}

        {/* Pagination */}
        {!showMap && total > LIMIT && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 32, marginBottom: 8 }} data-testid="pagination">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, border: "1.5px solid #DDD5C5", background: page === 1 ? "#F5F0E8" : "#FFFDF8", cursor: page === 1 ? "not-allowed" : "pointer", fontSize: 13, color: page === 1 ? "#BBB" : "#555", fontFamily: "inherit" }} data-testid="prev-page-btn">
              <ChevronLeft size={15} /> Prev
            </button>
            {Array.from({ length: Math.min(5, Math.ceil(total / LIMIT)) }, (_, i) => {
              const totalPages = Math.ceil(total / LIMIT);
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button key={pageNum} onClick={() => setPage(pageNum)}
                  style={{ width: 38, height: 38, borderRadius: 9, border: `1.5px solid ${page === pageNum ? accent : "#DDD5C5"}`, background: page === pageNum ? accent : "#FFFDF8", color: page === pageNum ? "#fff" : "#555", cursor: "pointer", fontSize: 13, fontWeight: page === pageNum ? 700 : 500, fontFamily: "inherit" }} data-testid={`page-btn-${pageNum}`}>
                  {pageNum}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(Math.ceil(total / LIMIT), p + 1))} disabled={page >= Math.ceil(total / LIMIT)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, border: "1.5px solid #DDD5C5", background: page >= Math.ceil(total / LIMIT) ? "#F5F0E8" : "#FFFDF8", cursor: page >= Math.ceil(total / LIMIT) ? "not-allowed" : "pointer", fontSize: 13, color: page >= Math.ceil(total / LIMIT) ? "#BBB" : "#555", fontFamily: "inherit" }} data-testid="next-page-btn">
              Next <ChevronRight size={15} />
            </button>
          </div>
        )}

        {/* CTA Banner */}
        <div style={{ marginTop: 60, background: "linear-gradient(135deg,#1C0A00,#3D1A07 50%,#1B3A4B)", borderRadius: 24, padding: "44px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, opacity: .05, backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)", backgroundSize: "24px 24px" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontFamily: "'Yeseva One',serif", fontSize: "clamp(20px,3vw,30px)", color: "#FFF8F0", marginBottom: 8 }}>{t.post_title}</div>
            <div style={{ color: "rgba(255,248,240,.6)", fontSize: 15 }}>{t.post_sub}</div>
          </div>
          <button className="pb-btn pb-btn-accent" onClick={() => setShowPost(true)} data-testid="cta-post-btn"
            style={{ background: "linear-gradient(135deg,#C84B31,#8B1A08)", padding: "15px 36px", fontSize: 16, borderRadius: 12, position: "relative", zIndex: 1, boxShadow: "0 6px 24px rgba(200,75,49,.5)" }}>
            {t.post_btn}
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: "#141010", color: "rgba(255,248,240,.4)", padding: "36px 20px 28px", marginTop: 60, textAlign: "center" }}>
        <div style={{ fontFamily: "'Yeseva One',serif", fontSize: 22, color: "#FFF8F0", marginBottom: 6 }}>🏘️ PropBharat</div>
        <div style={{ fontSize: 13, marginBottom: 16 }}>{t.trust}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", fontSize: 12, marginBottom: 16 }}>
          {Object.entries(T).map(([k, v]) => (
            <span key={k} style={{ cursor: "pointer", color: lang === k ? "#FFB89A" : "", transition: "color .15s" }} onClick={() => setLang(k)}>{v.name}</span>
          ))}
        </div>
        <div style={{ fontSize: 12, opacity: .5 }}>{t.copyright}</div>
      </footer>

      {/* POST LEAD MODAL */}
      {showPost && <PostModal t={t} form={form} setForm={setForm} formOk={formOk} formErr={formErr} accent={accent} submit={submit} close={() => setShowPost(false)} />}

      {/* CONTACT MODAL */}
      {contactProp && user && <ContactModal t={t} p={contactProp} close={() => setContactProp(null)} />}

      {/* EMI CALCULATOR */}
      {showEMI && <EMICalculator onClose={() => setShowEMI(false)} />}
    </div>
  );
}

/* PROPERTY CARD */
function PropertyCard({ p, t, accent, i, onContact, onDetail, isFav, onToggleFav }) {
  const BG = { buy: "linear-gradient(135deg,#FFF0E8,#FDEBD8)", rent: "linear-gradient(135deg,#E8F0FF,#D8E8FD)", sell: "linear-gradient(135deg,#E8FFF0,#D8FDE8)" };
  const bg = p.cat === "buy" ? BG.buy : p.cat === "rent" ? BG.rent : BG.sell;
  const hasImg = p.images && p.images.length > 0;
  return (
    <div className="pb-card pb-anim-in" style={{ animationDelay: `${i * .04}s`, cursor: "pointer" }}
      onClick={onDetail} data-testid={`property-card-${p.prop_id || i}`}>
      <div style={{ height: 168, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80, position: "relative", overflow: "hidden" }}>
        {hasImg
          ? <img src={p.images[0]} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : (p.img || "🏠")}
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 5, flexWrap: "wrap" }}>
          {p.featured && <span className="pb-tag" style={{ background: "#C84B31", color: "#fff" }}>⭐ {t.featured}</span>}
          {p.new && <span className="pb-tag" style={{ background: "#1B4F72", color: "#fff" }}>✨ NEW</span>}
          {p.verified && <span className="pb-tag" style={{ background: "rgba(27,106,67,.9)", color: "#fff" }}>✓ {t.verified}</span>}
        </div>
        <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 6 }}>
          <span className="pb-tag" style={{ background: p.cat === "buy" ? "#C84B31" : p.cat === "rent" ? "#1B4F72" : "#1D6A43", color: "#fff" }}>{t[p.cat]}</span>
          {/* Heart / Fav */}
          <button onClick={e => { e.stopPropagation(); onToggleFav(); }}
            style={{ width: 30, height: 30, borderRadius: "50%", background: isFav ? "#C84B31" : "rgba(255,255,255,.85)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            data-testid={`fav-btn-${p.prop_id}`}>
            <Heart size={15} fill={isFav ? "#fff" : "none"} color={isFav ? "#fff" : "#C84B31"} />
          </button>
        </div>
        <div style={{ position: "absolute", bottom: 12, right: 12 }}>
          <span className="pb-tag" style={{ background: p.status === "ready" ? "rgba(27,106,67,.85)" : "rgba(140,90,0,.85)", color: "#fff" }}>
            {p.status === "ready" ? t.ready : t.uc}
          </span>
        </div>
      </div>
      <div style={{ padding: "16px 18px 18px" }}>
        <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.35, marginBottom: 5, color: "#1C1C1C" }}>{p.title}</div>
        <div style={{ fontSize: 13, color: "#999", marginBottom: 12 }}>📍 {p.locality}, {p.city}</div>
        <div style={{ display: "flex", gap: 14, fontSize: 13, color: "#666", marginBottom: 12, flexWrap: "wrap" }}>
          {p.bhk && <span>🛏 <strong style={{ color: "#333" }}>{p.bhk}</strong> {t.beds}</span>}
          {p.bath && <span>🚿 <strong style={{ color: "#333" }}>{p.bath}</strong> {t.baths}</span>}
          <span>📐 <strong style={{ color: "#333" }}>{(p.area || 0).toLocaleString("en-IN")}</strong> {t.sqft}</span>
        </div>
        {p.amenities && p.amenities.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {p.amenities.slice(0, 5).map(a => (
              <span key={a} style={{ background: "#F5F0E8", borderRadius: 20, padding: "3px 10px", fontSize: 11, color: "#666" }}>
                {AMENITY_META[a]?.icon} {t[a]}
              </span>
            ))}
            {p.amenities.length > 5 && <span style={{ background: "#F5F0E8", borderRadius: 20, padding: "3px 10px", fontSize: 11, color: "#999" }}>+{p.amenities.length - 5}</span>}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid #EDE5D5" }}>
          <div>
            <div style={{ fontSize: 21, fontWeight: 800, color: accent, lineHeight: 1, fontFamily: "'Noto Serif',serif" }}>{fmt(p.price, p.rent, t)}</div>
            <div style={{ fontSize: 11, color: "#BBB", marginTop: 2 }}>{t.negotiable}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="pb-btn" onClick={e => { e.stopPropagation(); onDetail(); }}
              style={{ background: "#F5F0E8", border: "1.5px solid #DDD5C5", color: "#555", padding: "8px 14px", fontSize: 12, borderRadius: 9 }} data-testid={`view-details-btn-${p.prop_id}`}>
              {t.view_more}
            </button>
            <button className="pb-btn pb-btn-accent" onClick={e => { e.stopPropagation(); onContact(); }}
              style={{ background: `linear-gradient(135deg,${accent},${accent}CC)`, padding: "9px 16px", fontSize: 13, boxShadow: `0 3px 12px ${accent}55` }} data-testid={`contact-btn-${p.prop_id || i}`}>
              {t.contact}
            </button>
          </div>
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: "#CCC", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>👤 {p.owner} · <span style={{ fontWeight: 600, color: p.role === "owner" ? "#1D6A43" : "#1B4F72" }}>{p.role === "owner" ? t.owner : t.agent}</span></span>
          <span>{t.posted}: {postedLabel(p.posted || 0, t)}</span>
        </div>
      </div>
    </div>
  );
}

/* POST LEAD MODAL */
function PostModal({ t, form, setForm, formOk, formErr, accent, submit, close }) {
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="pb-modal-bg" onClick={close}>
      <div className="pb-modal" style={{ maxWidth: 560, width: "100%", maxHeight: "92vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#C84B31,#8B1A08)", padding: "26px 28px 22px", position: "relative" }}>
          <button onClick={close} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,.2)", border: "none", color: "#fff", borderRadius: 8, padding: "5px 11px", cursor: "pointer", fontSize: 18 }} data-testid="post-modal-close">✕</button>
          <div style={{ fontFamily: "'Yeseva One',serif", fontSize: 22, color: "#FFF8F0", marginBottom: 4 }}>📋 {t.post_title}</div>
          <div style={{ color: "rgba(255,248,240,.7)", fontSize: 13 }}>{t.post_sub}</div>
        </div>
        <div style={{ padding: "24px 28px 28px" }}>
          {formOk ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
              <div style={{ fontFamily: "'Yeseva One',serif", fontSize: 22, color: "#1D6A43", marginBottom: 8 }}>{t.success_title}</div>
              <div style={{ fontSize: 15, color: "#888" }}>{t.success_msg}</div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#888", letterSpacing: .8, display: "block", marginBottom: 8 }}>{t.looking_to.toUpperCase()}</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[["buy", t.buy, "#C84B31"], ["sell", t.sell, "#1D6A43"], ["rent", t.rent, "#1B4F72"]].map(([v, lbl, c]) => (
                    <button key={v} onClick={() => upd("leadType", v)} data-testid={`lead-type-${v}`}
                      style={{ flex: 1, padding: "10px 8px", borderRadius: 9, border: `2px solid ${form.leadType === v ? c : "#DDD5C5"}`, background: form.leadType === v ? c : "#FEFCF7", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: form.leadType === v ? "#fff" : "#555", transition: "all .15s" }}>
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#888", letterSpacing: .8, display: "block", marginBottom: 6 }}>{t.full_name.toUpperCase()}</label>
                  <input className="pb-input" placeholder="Rahul Sharma" value={form.name} onChange={e => upd("name", e.target.value)} data-testid="lead-name" />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#888", letterSpacing: .8, display: "block", marginBottom: 6 }}>{t.phone.toUpperCase()}</label>
                  <input className="pb-input" placeholder="98765 43210" value={form.phone} onChange={e => upd("phone", e.target.value)} type="tel" maxLength={10} data-testid="lead-phone" />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#888", letterSpacing: .8, display: "block", marginBottom: 6 }}>{t.city_label.toUpperCase()}</label>
                  <select className="pb-input pb-select" value={form.city} onChange={e => upd("city", e.target.value)} data-testid="lead-city">
                    <option value="">-- Select City --</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#888", letterSpacing: .8, display: "block", marginBottom: 6 }}>{t.locality_label.toUpperCase()}</label>
                  <input className="pb-input" placeholder="e.g. Koramangala" value={form.locality} onChange={e => upd("locality", e.target.value)} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#888", letterSpacing: .8, display: "block", marginBottom: 6 }}>{t.area_sqft.toUpperCase()}</label>
                  <input className="pb-input" placeholder="1200" type="number" value={form.area} onChange={e => upd("area", e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#888", letterSpacing: .8, display: "block", marginBottom: 6 }}>{t.bedrooms.toUpperCase()}</label>
                  <select className="pb-input pb-select" value={form.beds} onChange={e => upd("beds", e.target.value)}>
                    <option value="">{t.any}</option>
                    {["1", "2", "3", "4", "5", "5+"].map(v => <option key={v} value={v}>{v} BHK</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#888", letterSpacing: .8, display: "block", marginBottom: 6 }}>{t.price_label.toUpperCase()}</label>
                  <input className="pb-input" placeholder="50,00,000" value={form.price} onChange={e => upd("price", e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#888", letterSpacing: .8, display: "block", marginBottom: 6 }}>{t.desc_label.toUpperCase()}</label>
                <textarea className="pb-input" rows={3} placeholder="Describe the property…" value={form.desc} onChange={e => upd("desc", e.target.value)} style={{ resize: "vertical" }} />
              </div>
              {formErr && <div style={{ background: "#FFF0EC", border: "1px solid #F5B8A8", borderRadius: 9, padding: "10px 14px", fontSize: 13, color: "#C84B31" }} data-testid="lead-error">⚠️ {formErr}</div>}
              <button className="pb-btn pb-btn-accent" onClick={submit} style={{ background: "linear-gradient(135deg,#C84B31,#8B1A08)", padding: "15px", fontSize: 16, borderRadius: 12, width: "100%", boxShadow: "0 6px 20px rgba(200,75,49,.4)" }} data-testid="lead-submit-btn">
                🚀 {t.submit}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* CONTACT MODAL */
function ContactModal({ t, p, close }) {
  return (
    <div className="pb-modal-bg" onClick={close}>
      <div className="pb-modal" style={{ maxWidth: 400, width: "100%" }} onClick={e => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#1B4F72,#0A2640)", padding: "24px 24px 20px" }}>
          <button onClick={close} style={{ float: "right", background: "rgba(255,255,255,.15)", border: "none", color: "#fff", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 16 }} data-testid="contact-modal-close">✕</button>
          <div style={{ fontFamily: "'Yeseva One',serif", fontSize: 20, color: "#FFF8F0", marginBottom: 4 }}>📞 {t.contact_modal_title}</div>
          <div style={{ color: "rgba(255,248,240,.6)", fontSize: 13 }}>{p.title} · {p.locality}, {p.city}</div>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ background: "#F5F0E8", borderRadius: 14, padding: "18px 20px", marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "#999", marginBottom: 4, fontWeight: 700, letterSpacing: .8 }}>CONTACT PERSON</div>
            <div style={{ fontSize: 19, fontWeight: 700, color: "#1C1C1C", marginBottom: 2 }}>👤 {p.owner}</div>
            <div style={{ fontSize: 13, color: p.role === "owner" ? "#1D6A43" : "#1B4F72", fontWeight: 600 }}>{p.role === "owner" ? t.owner : t.agent}</div>
            <div style={{ marginTop: 12, fontSize: 16, fontWeight: 700, color: "#C84B31", display: "flex", alignItems: "center", gap: 8 }}>
              📱 <span style={{ letterSpacing: 1 }}>+91 {p.owner_phone || "98XXX XXXXX"}</span>
            </div>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            <a href={`https://wa.me/91${p.owner_phone}?text=Hi, I'm interested in your property: ${p.title}`} target="_blank" rel="noreferrer"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "linear-gradient(135deg,#25D366,#128C7E)", color: "#fff", padding: "13px", fontSize: 15, borderRadius: 11, textDecoration: "none", fontWeight: 600 }} data-testid="whatsapp-btn">
              💬 {t.whatsapp}
            </a>
            <a href={`tel:+91${p.owner_phone}`}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "linear-gradient(135deg,#C84B31,#8B1A08)", color: "#fff", padding: "13px", fontSize: 15, borderRadius: 11, textDecoration: "none", fontWeight: 600 }} data-testid="call-btn">
              📞 {t.call_now}
            </a>
            <button className="pb-btn" onClick={close} style={{ background: "transparent", border: "1.5px solid #DDD5C5", color: "#555", padding: "11px", fontSize: 14, borderRadius: 11, width: "100%" }} data-testid="contact-close-btn">{t.close}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
