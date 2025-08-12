"use client";

import { useState, useEffect } from "react";
import { useSettings } from "@/context/SettingsContext";
import { OfflineHealthStorage } from "@/lib/offlineStorage";

type HealthContent = {
  id: string;
  title: string;
  category: string;
  content: string;
  language: string;
  images?: string[];
  audioUrl?: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  tags: string[];
  lastUpdated: string;
};

export default function RuralHealthEducationPage() {
  const { t, language } = useSettings();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [healthContent, setHealthContent] = useState<HealthContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHealthContent();
  }, [language]);

  const loadHealthContent = async () => {
    setLoading(true);
    
    // Sample rural health education content
    const ruralHealthContent: HealthContent[] = [
      {
        id: "diarrhea-prevention",
        title: language === 'hi' ? "दस्त की रोकथाम" : language === 'ta' ? "வயிற்றுப்போக்கு தடுப்பு" : "Diarrhea Prevention",
        category: "Prevention",
        content: language === 'hi' ? 
          "दस्त से बचने के लिए: 1. हमेशा साफ पानी पिएं 2. खाना खाने से पहले हाथ धोएं 3. खाना अच्छी तरह पकाकर खाएं 4. फल और सब्जियों को अच्छी तरह धोएं 5. शौचालय का उपयोग करने के बाद हाथ धोएं" :
          language === 'ta' ?
          "வயிற்றுப்போக்கைத் தடுக்க: 1. எப்போதும் சுத்தமான தண்ணீர் குடிக்கவும் 2. உணவு உண்ணும் முன் கைகளைக் கழுவவும் 3. உணவை நன்றாக சமைத்து உண்ணவும் 4. பழங்கள் மற்றும் காய்கறிகளை நன்றாகக் கழுவவும் 5. கழிப்பறையைப் பயன்படுத்திய பின் கைகளைக் கழுவவும்" :
          "To prevent diarrhea: 1. Always drink clean water 2. Wash hands before eating 3. Cook food thoroughly 4. Wash fruits and vegetables properly 5. Wash hands after using toilet",
        language: language,
        difficulty: 'basic',
        tags: ['diarrhea', 'prevention', 'hygiene', 'water'],
        lastUpdated: "2024-12-09"
      },
      {
        id: "fever-management",
        title: language === 'hi' ? "बुखार का इलाज" : language === 'ta' ? "காய்ச்சல் மேலாண்மை" : "Fever Management",
        category: "First Aid",
        content: language === 'hi' ?
          "बुखार के दौरान: 1. बहुत सारा पानी पिएं 2. आराम करें 3. हल्के कपड़े पहनें 4. माथे पर ठंडी पट्टी रखें 5. अगर बुखार 102°F से ज्यादा हो तो डॉक्टर को दिखाएं" :
          language === 'ta' ?
          "காய்ச்சலின் போது: 1. நிறைய தண்ணீர் குடிக்கவும் 2. ஓய்வு எடுக்கவும் 3. இலகுவான ஆடைகள் அணியவும் 4. நெற்றியில் குளிர்ந்த துணி வைக்கவும் 5. காய்ச்சல் 102°F க்கு மேல் இருந்தால் மருத்துவரை அணுகவும்" :
          "During fever: 1. Drink plenty of water 2. Take rest 3. Wear light clothes 4. Apply cold compress on forehead 5. See doctor if fever is above 102°F",
        language: language,
        difficulty: 'basic',
        tags: ['fever', 'first-aid', 'home-care'],
        lastUpdated: "2024-12-09"
      },
      {
        id: "child-nutrition",
        title: language === 'hi' ? "बच्चों का पोषण" : language === 'ta' ? "குழந்தைகளின் ஊட்டச்சத்து" : "Child Nutrition",
        category: "Child Health",
        content: language === 'hi' ?
          "बच्चों के लिए संतुलित आहार: 1. 6 महीने तक केवल माँ का दूध 2. 6 महीने बाद ऊपरी आहार शुरू करें 3. दाल, चावल, सब्जी दें 4. फल और दूध जरूर दें 5. साफ-सफाई का ध्यान रखें" :
          language === 'ta' ?
          "குழந்தைகளுக்கான சமச்சீர் உணவு: 1. 6 மாதங்கள் வரை தாய்ப்பால் மட்டும் 2. 6 மாதங்களுக்குப் பிறகு கூடுதல் உணவு தொடங்கவும் 3. பருப்பு, அரிசி, காய்கறிகள் கொடுக்கவும் 4. பழங்கள் மற்றும் பால் அவசியம் 5. சுத்தத்தை கவனிக்கவும்" :
          "Balanced diet for children: 1. Only breast milk for 6 months 2. Start complementary food after 6 months 3. Give dal, rice, vegetables 4. Include fruits and milk 5. Maintain cleanliness",
        language: language,
        difficulty: 'basic',
        tags: ['nutrition', 'children', 'breastfeeding', 'diet'],
        lastUpdated: "2024-12-09"
      },
      {
        id: "diabetes-management",
        title: language === 'hi' ? "मधुमेह का प्रबंधन" : language === 'ta' ? "நீரிழிவு மேலாண்மை" : "Diabetes Management",
        category: "Common Diseases",
        content: language === 'hi' ?
          "मधुमेह को नियंत्रित करने के लिए: 1. नियमित व्यायाम करें 2. मीठा कम खाएं 3. समय पर दवा लें 4. नियमित जांच कराएं 5. तनाव कम करें 6. धूम्रपान न करें" :
          language === 'ta' ?
          "நீரிழிவை கட்டுப்படுத்த: 1. தொடர்ந்து உடற்பயிற்சி செய்யவும் 2. இனிப்பு குறைவாக சாப்பிடவும் 3. சரியான நேரத்தில் மருந்து எடுக்கவும் 4. தொடர்ந்து பரிசோதனை செய்யவும் 5. மன அழுத்தத்தை குறைக்கவும் 6. புகைபிடிக்காதீர்கள்" :
          "To control diabetes: 1. Exercise regularly 2. Eat less sugar 3. Take medicine on time 4. Regular check-ups 5. Reduce stress 6. Don't smoke",
        language: language,
        difficulty: 'intermediate',
        tags: ['diabetes', 'chronic-disease', 'lifestyle', 'medication'],
        lastUpdated: "2024-12-09"
      },
      {
        id: "pregnancy-care",
        title: language === 'hi' ? "गर्भावस्था की देखभाल" : language === 'ta' ? "கர்ப்பகால பராமரிப்பு" : "Pregnancy Care",
        category: "Women Health",
        content: language === 'hi' ?
          "गर्भावस्था में सावधानियां: 1. नियमित जांच कराएं 2. आयरन की गोली लें 3. पौष्टिक आहार लें 4. धूम्रपान और शराब से बचें 5. आराम करें 6. टीकाकरण कराएं" :
          language === 'ta' ?
          "கர்ப்பகாலத்தில் கவனிக்க வேண்டியவை: 1. தொடர்ந்து பரிசோதனை செய்யவும் 2. இரும்புச்சத்து மாத்திரை எடுக்கவும் 3. சத்தான உணவு சாப்பிடவும் 4. புகைபிடித்தல் மற்றும் மதுவைத் தவிர்க்கவும் 5. ஓய்வு எடுக்கவும் 6. தடுப்பூசி போடவும்" :
          "Pregnancy precautions: 1. Regular check-ups 2. Take iron tablets 3. Eat nutritious food 4. Avoid smoking and alcohol 5. Take rest 6. Get vaccinated",
        language: language,
        difficulty: 'intermediate',
        tags: ['pregnancy', 'women-health', 'prenatal-care', 'nutrition'],
        lastUpdated: "2024-12-09"
      },
      {
        id: "hypertension-control",
        title: language === 'hi' ? "उच्च रक्तचाप नियंत्रण" : language === 'ta' ? "உயர் இரத்த அழுத்த கட்டுப்பாடு" : "Hypertension Control",
        category: "Common Diseases",
        content: language === 'hi' ?
          "उच्च रक्तचाप को नियंत्रित करने के लिए: 1. नमक कम खाएं 2. नियमित व्यायाम करें 3. वजन कम करें 4. धूम्रपान छोड़ें 5. तनाव कम करें 6. दवा नियमित लें" :
          language === 'ta' ?
          "உயர் இரத்த அழுத்தத்தை கட்டுப்படுத்த: 1. உப்பு குறைவாக சாப்பிடவும் 2. தொடர்ந்து உடற்பயிற்சி செய்யவும் 3. எடையை குறைக்கவும் 4. புகைபிடிப்பதை நிறுத்தவும் 5. மன அழுத்தத்தை குறைக்கவும் 6. மருந்தை தொடர்ந்து எடுக்கவும்" :
          "To control high blood pressure: 1. Eat less salt 2. Exercise regularly 3. Reduce weight 4. Stop smoking 5. Reduce stress 6. Take medicine regularly",
        language: language,
        difficulty: 'intermediate',
        tags: ['hypertension', 'blood-pressure', 'lifestyle', 'diet'],
        lastUpdated: "2024-12-09"
      }
    ];

    setHealthContent(ruralHealthContent);
    
    // Store content offline for future access
    const storage = OfflineHealthStorage.getInstance();
    for (const content of ruralHealthContent) {
      await storage.storeHealthEducation(content);
    }
    
    setLoading(false);
  };

  const categories = ['all', ...Array.from(new Set(healthContent.map(content => content.category)))];
  
  const filteredContent = healthContent.filter(content => {
    const matchesCategory = selectedCategory === 'all' || content.category === selectedCategory;
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Prevention': return '🛡️';
      case 'First Aid': return '🩹';
      case 'Child Health': return '👶';
      case 'Women Health': return '👩';
      case 'Common Diseases': return '🏥';
      case 'Nutrition': return '🥗';
      case 'Elderly Health': return '👴';
      default: return '📖';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'basic': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <div className="text-2xl font-bold text-green-700">Loading Health Education...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-3xl border-2 border-green-200 p-8 shadow-xl">
          <div className="text-center space-y-4">
            <div className="text-6xl">📚</div>
            <h1 className="text-4xl font-bold text-green-700">
              {t('healthEducation') || 'Rural Health Education'}
            </h1>
            <p className="text-xl text-green-600 max-w-3xl mx-auto">
              Essential health information for rural communities. Available offline and in local languages.
            </p>
            
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Works Offline</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Local Languages</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span>Easy to Understand</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-3xl border-2 border-gray-200 p-6 shadow-xl">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex flex-wrap gap-3">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-2xl font-semibold transition-all ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
                  }`}
                >
                  {category === 'all' ? '🌟 All Topics' : `${getCategoryIcon(category)} ${category}`}
                </button>
              ))}
            </div>
            
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search health topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-6 py-3 rounded-2xl border-2 border-gray-200 focus:border-green-400 focus:outline-none text-lg"
              />
            </div>
          </div>
        </div>

        {/* Health Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredContent.map((content) => (
            <div key={content.id} className="bg-white rounded-3xl border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
              
              {/* Header */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b-2 border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{getCategoryIcon(content.category)}</div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-xl text-sm font-bold bg-green-100 text-green-700">
                      {content.category}
                    </span>
                    <span className={`px-3 py-1 rounded-xl text-sm font-bold ${getDifficultyColor(content.difficulty)}`}>
                      {content.difficulty}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{content.title}</h3>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Updated: {new Date(content.lastUpdated).toLocaleDateString()}</span>
                  <div className="flex gap-2">
                    {content.tags.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="text-gray-700 leading-relaxed mb-6 text-lg">
                  {content.content}
                </div>
                
                <div className="flex gap-3">
                  <button className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-2xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all">
                    📖 Read More
                  </button>
                  <button className="px-4 py-3 border-2 border-green-300 rounded-2xl hover:bg-green-50 transition-colors">
                    🔊 Audio
                  </button>
                  <button className="px-4 py-3 border-2 border-green-300 rounded-2xl hover:bg-green-50 transition-colors">
                    📤 Share
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Emergency Health Tips */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-3xl border-2 border-red-200 p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-red-700 mb-6 text-center">🚨 Emergency Health Tips</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-red-200">
              <div className="text-3xl mb-3">🤒</div>
              <h3 className="font-bold text-red-700 mb-2">High Fever</h3>
              <p className="text-red-600 text-sm">If fever is above 103°F, seek immediate medical help. Use cold compress and give plenty of fluids.</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-red-200">
              <div className="text-3xl mb-3">🩸</div>
              <h3 className="font-bold text-red-700 mb-2">Heavy Bleeding</h3>
              <p className="text-red-600 text-sm">Apply direct pressure with clean cloth. Elevate the injured area above heart level if possible.</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-red-200">
              <div className="text-3xl mb-3">😵</div>
              <h3 className="font-bold text-red-700 mb-2">Unconsciousness</h3>
              <p className="text-red-600 text-sm">Check breathing. Place in recovery position. Call emergency services immediately.</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-red-200">
              <div className="text-3xl mb-3">🐍</div>
              <h3 className="font-bold text-red-700 mb-2">Snake Bite</h3>
              <p className="text-red-600 text-sm">Keep calm, immobilize the limb, remove jewelry, and get to hospital immediately. Don't cut or suck the wound.</p>
            </div>
          </div>
        </div>

        {/* Offline Notice */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-3xl border-2 border-blue-200 p-8 shadow-xl">
          <div className="text-center space-y-4">
            <div className="text-4xl">📱</div>
            <h2 className="text-2xl font-bold text-blue-700">Available Offline</h2>
            <p className="text-blue-600 max-w-2xl mx-auto">
              All health education content is automatically saved on your device and works without internet connection. 
              Perfect for rural areas with limited connectivity.
            </p>
            <div className="flex justify-center gap-4">
              <div className="bg-white px-6 py-3 rounded-2xl border border-blue-200">
                <div className="font-bold text-blue-700">📚 {healthContent.length} Articles</div>
                <div className="text-blue-600 text-sm">Stored Offline</div>
              </div>
              <div className="bg-white px-6 py-3 rounded-2xl border border-blue-200">
                <div className="font-bold text-blue-700">🌍 7 Languages</div>
                <div className="text-blue-600 text-sm">Local Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}