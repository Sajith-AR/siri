"use client";

import { useState } from "react";
import Link from "next/link";

type HealthTopic = {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  icon: string;
  readTime: string;
  tags: string[];
};

export default function HealthLibraryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const healthTopics: HealthTopic[] = [
    {
      id: "heart-health",
      title: "Understanding Heart Health",
      category: "Cardiovascular",
      description: "Learn about maintaining a healthy heart through lifestyle choices and early detection.",
      content: "Your heart is your body's engine, pumping blood and nutrients throughout your system. Maintaining heart health involves regular exercise, a balanced diet rich in omega-3 fatty acids, managing stress, and avoiding smoking. Key warning signs include chest pain, shortness of breath, and irregular heartbeat.",
      icon: "❤️",
      readTime: "5 min read",
      tags: ["prevention", "lifestyle", "exercise"]
    },
    {
      id: "mental-wellness",
      title: "Mental Health & Wellness",
      category: "Mental Health",
      description: "Strategies for maintaining good mental health and recognizing when to seek help.",
      content: "Mental health is just as important as physical health. Practice mindfulness, maintain social connections, get adequate sleep, and don't hesitate to seek professional help when needed. Signs to watch for include persistent sadness, anxiety, changes in sleep patterns, or loss of interest in activities.",
      icon: "🧠",
      readTime: "7 min read",
      tags: ["wellness", "stress", "mindfulness"]
    },
    {
      id: "nutrition-basics",
      title: "Nutrition Fundamentals",
      category: "Nutrition",
      description: "Essential nutrition knowledge for a healthier lifestyle and better energy levels.",
      content: "A balanced diet includes fruits, vegetables, whole grains, lean proteins, and healthy fats. Stay hydrated, limit processed foods, and pay attention to portion sizes. Consider your individual needs based on age, activity level, and health conditions.",
      icon: "🥗",
      readTime: "6 min read",
      tags: ["diet", "energy", "wellness"]
    },
    {
      id: "sleep-health",
      title: "The Science of Sleep",
      category: "Sleep",
      description: "Understanding sleep cycles and how to improve your sleep quality for better health.",
      content: "Quality sleep is essential for physical and mental health. Adults need 7-9 hours of sleep per night. Create a consistent sleep schedule, limit screen time before bed, keep your bedroom cool and dark, and avoid caffeine late in the day.",
      icon: "😴",
      readTime: "4 min read",
      tags: ["rest", "recovery", "health"]
    },
    {
      id: "exercise-benefits",
      title: "Exercise for Every Body",
      category: "Fitness",
      description: "How regular physical activity benefits your overall health and longevity.",
      content: "Regular exercise strengthens your heart, improves mood, boosts energy, and helps maintain a healthy weight. Aim for at least 150 minutes of moderate aerobic activity per week, plus strength training exercises twice a week.",
      icon: "🏃‍♀️",
      readTime: "5 min read",
      tags: ["fitness", "strength", "cardio"]
    },
    {
      id: "preventive-care",
      title: "Preventive Healthcare",
      category: "Prevention",
      description: "The importance of regular check-ups and screenings for early detection.",
      content: "Prevention is better than cure. Regular health screenings can detect problems early when they're most treatable. Stay up to date with vaccinations, dental care, eye exams, and age-appropriate screenings like mammograms and colonoscopies.",
      icon: "🩺",
      readTime: "6 min read",
      tags: ["screening", "prevention", "checkups"]
    }
  ];

  const categories = ['all', ...Array.from(new Set(healthTopics.map(topic => topic.category)))];
  
  const filteredTopics = healthTopics.filter(topic => {
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 px-6 py-3 text-sm font-semibold text-blue-800 border border-blue-200">
            <span className="animate-pulse">📚</span>
            Evidence-Based Health Information
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            Health Knowledge Library
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Discover reliable health information with <span className="text-blue-600 font-semibold">expert insights</span>, 
            <span className="text-indigo-600 font-semibold"> practical tips</span>, and 
            <span className="text-purple-600 font-semibold"> actionable guidance</span> for better health.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex flex-wrap gap-3">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-2xl font-semibold transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
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
              className="px-6 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none text-lg"
            />
          </div>
        </div>

        {/* Health Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTopics.map((topic) => (
            <div key={topic.id} className="bg-white rounded-3xl border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
              
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b-2 border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl group-hover:scale-110 transition-transform duration-300">{topic.icon}</div>
                  <span className="px-3 py-1 rounded-xl text-sm font-bold bg-blue-100 text-blue-700">
                    {topic.category}
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{topic.title}</h3>
                <p className="text-gray-600 leading-relaxed">{topic.description}</p>
                
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-gray-500">{topic.readTime}</span>
                  <div className="flex gap-2">
                    {topic.tags.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content Preview */}
              <div className="p-6">
                <p className="text-gray-700 leading-relaxed mb-6 line-clamp-4">{topic.content}</p>
                
                <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105">
                  Read Full Article →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Health Tips Section */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl border-2 border-emerald-200 p-10 shadow-xl">
          <div className="text-center space-y-6">
            <h2 className="text-4xl font-bold text-emerald-700">💡 Daily Health Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-3">
                <div className="text-3xl">💧</div>
                <h3 className="text-lg font-bold text-emerald-700">Stay Hydrated</h3>
                <p className="text-emerald-600 text-sm">Drink 8 glasses of water daily for optimal health</p>
              </div>
              <div className="space-y-3">
                <div className="text-3xl">🚶‍♀️</div>
                <h3 className="text-lg font-bold text-emerald-700">Move More</h3>
                <p className="text-emerald-600 text-sm">Take a 10-minute walk after each meal</p>
              </div>
              <div className="space-y-3">
                <div className="text-3xl">🧘‍♂️</div>
                <h3 className="text-lg font-bold text-emerald-700">Practice Mindfulness</h3>
                <p className="text-emerald-600 text-sm">5 minutes of deep breathing daily</p>
              </div>
              <div className="space-y-3">
                <div className="text-3xl">🥬</div>
                <h3 className="text-lg font-bold text-emerald-700">Eat Colorfully</h3>
                <p className="text-emerald-600 text-sm">Include 5 different colored fruits/vegetables</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'Cardiovascular': '❤️',
    'Mental Health': '🧠',
    'Nutrition': '🥗',
    'Sleep': '😴',
    'Fitness': '🏃‍♀️',
    'Prevention': '🩺'
  };
  return icons[category] || '📖';
}