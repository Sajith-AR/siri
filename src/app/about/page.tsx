export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About SIRI Healthcare</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Mission</h2>
          <p className="text-gray-600 mb-6">
            SIRI Healthcare is an AI-powered healthcare platform designed to provide accessible, 
            intelligent, and comprehensive medical assistance to everyone, everywhere.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">AI-Powered Features</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">🩺 Symptom Analysis</h3>
              <p className="text-gray-600">Advanced AI-powered symptom evaluation and risk assessment</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">🤖 AI Assistant</h3>
              <p className="text-gray-600">24/7 conversational health support and guidance</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">👁️ Image Analysis</h3>
              <p className="text-gray-600">Medical image interpretation and skin condition analysis</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">💊 Medication Support</h3>
              <p className="text-gray-600">Drug interaction checking and medication guidance</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Technology</h2>
          <p className="text-gray-600 mb-4">
            Powered by Google Gemini AI, our platform provides state-of-the-art medical analysis 
            with enterprise-grade security and reliability.
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <p className="text-blue-800">
              <strong>Important:</strong> SIRI Healthcare provides AI-powered health information 
              for educational purposes only. Always consult with qualified healthcare professionals 
              for medical advice, diagnosis, and treatment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}