export interface MedicalReference {
  id: string;
  title: string;
  description: string;
  category: 'condition' | 'symptom' | 'treatment' | 'prevention' | 'emergency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  icd10Code?: string;
  sources: string[];
  lastUpdated: string;
  relatedConditions: string[];
  symptoms: string[];
  treatments: string[];
  whenToSeekCare: string[];
  redFlags: string[];
}

const medicalDatabase: Map<string, MedicalReference> = new Map([
  ['common_cold', {
    id: 'common_cold',
    title: 'Common Cold',
    description: 'A viral infection of the upper respiratory tract, typically mild and self-limiting.',
    category: 'condition',
    severity: 'low',
    icd10Code: 'J00',
    sources: ['CDC', 'Mayo Clinic', 'WHO'],
    lastUpdated: '2024-01-15',
    relatedConditions: ['flu', 'sinusitis', 'bronchitis'],
    symptoms: ['runny nose', 'sneezing', 'cough', 'sore throat', 'mild fever'],
    treatments: ['rest', 'fluids', 'over-the-counter pain relievers', 'throat lozenges'],
    whenToSeekCare: [
      'Symptoms persist longer than 10 days',
      'Fever above 101.3°F (38.5°C)',
      'Severe headache or sinus pain',
      'Difficulty breathing'
    ],
    redFlags: ['High fever', 'Severe difficulty breathing', 'Chest pain']
  }],
  
  ['chest_pain', {
    id: 'chest_pain',
    title: 'Chest Pain',
    description: 'Discomfort or pain in the chest area that can range from mild to severe and may indicate various conditions.',
    category: 'symptom',
    severity: 'high',
    icd10Code: 'R06.02',
    sources: ['American Heart Association', 'Mayo Clinic', 'Emergency Medicine Guidelines'],
    lastUpdated: '2024-01-15',
    relatedConditions: ['heart attack', 'angina', 'pulmonary embolism', 'pneumonia'],
    symptoms: ['pressure', 'squeezing', 'burning', 'sharp pain', 'radiating pain'],
    treatments: ['immediate medical evaluation', 'aspirin if advised', 'nitroglycerin if prescribed'],
    whenToSeekCare: [
      'Any new or unexplained chest pain',
      'Pain with shortness of breath',
      'Pain radiating to arm, jaw, or back',
      'Associated with nausea or sweating'
    ],
    redFlags: [
      'Severe crushing chest pain',
      'Pain with shortness of breath',
      'Pain with loss of consciousness',
      'Pain with severe sweating'
    ]
  }],
  
  ['fever', {
    id: 'fever',
    title: 'Fever',
    description: 'Elevated body temperature, typically indicating the body\'s response to infection or illness.',
    category: 'symptom',
    severity: 'medium',
    icd10Code: 'R50.9',
    sources: ['CDC', 'Pediatric Guidelines', 'Internal Medicine References'],
    lastUpdated: '2024-01-15',
    relatedConditions: ['viral infection', 'bacterial infection', 'flu', 'pneumonia'],
    symptoms: ['elevated temperature', 'chills', 'sweating', 'headache', 'muscle aches'],
    treatments: ['rest', 'fluids', 'acetaminophen or ibuprofen', 'cool compresses'],
    whenToSeekCare: [
      'Temperature above 103°F (39.4°C)',
      'Fever lasting more than 3 days',
      'Severe symptoms accompanying fever',
      'Signs of dehydration'
    ],
    redFlags: [
      'Temperature above 104°F (40°C)',
      'Difficulty breathing',
      'Severe headache with stiff neck',
      'Confusion or altered mental state'
    ]
  }],
  
  ['headache', {
    id: 'headache',
    title: 'Headache',
    description: 'Pain in the head or neck region that can vary in intensity, location, and duration.',
    category: 'symptom',
    severity: 'medium',
    icd10Code: 'G44.1',
    sources: ['International Headache Society', 'Neurology Guidelines', 'Mayo Clinic'],
    lastUpdated: '2024-01-15',
    relatedConditions: ['tension headache', 'migraine', 'cluster headache', 'sinus headache'],
    symptoms: ['head pain', 'pressure', 'throbbing', 'sensitivity to light', 'nausea'],
    treatments: ['rest', 'hydration', 'over-the-counter pain relievers', 'cold or warm compress'],
    whenToSeekCare: [
      'Sudden severe headache',
      'Headache with fever and stiff neck',
      'Headache with vision changes',
      'Persistent or worsening headaches'
    ],
    redFlags: [
      'Sudden "thunderclap" headache',
      'Headache with high fever',
      'Headache with confusion',
      'Headache after head injury'
    ]
  }],
  
  ['heart_attack', {
    id: 'heart_attack',
    title: 'Heart Attack (Myocardial Infarction)',
    description: 'A serious medical emergency where blood flow to part of the heart muscle is blocked.',
    category: 'condition',
    severity: 'critical',
    icd10Code: 'I21.9',
    sources: ['American Heart Association', 'Emergency Cardiology Guidelines', 'AHA/ACC Guidelines'],
    lastUpdated: '2024-01-15',
    relatedConditions: ['angina', 'coronary artery disease', 'cardiac arrest'],
    symptoms: ['chest pain', 'shortness of breath', 'nausea', 'sweating', 'arm pain'],
    treatments: ['call 911 immediately', 'aspirin if not allergic', 'emergency medical care'],
    whenToSeekCare: [
      'ANY suspicion of heart attack',
      'Chest pain with shortness of breath',
      'Chest pain radiating to arm or jaw'
    ],
    redFlags: [
      'Severe chest pain',
      'Difficulty breathing',
      'Loss of consciousness',
      'Severe sweating with chest pain'
    ]
  }],
  
  ['stroke', {
    id: 'stroke',
    title: 'Stroke',
    description: 'A medical emergency where blood supply to part of the brain is interrupted or reduced.',
    category: 'condition',
    severity: 'critical',
    icd10Code: 'I64',
    sources: ['American Stroke Association', 'Neurology Emergency Guidelines', 'WHO'],
    lastUpdated: '2024-01-15',
    relatedConditions: ['transient ischemic attack', 'brain hemorrhage', 'cerebral infarction'],
    symptoms: ['face drooping', 'arm weakness', 'speech difficulty', 'sudden confusion'],
    treatments: ['call 911 immediately', 'note time of symptom onset', 'emergency medical care'],
    whenToSeekCare: [
      'ANY signs of stroke (FAST test)',
      'Sudden severe headache',
      'Sudden vision loss',
      'Sudden difficulty speaking'
    ],
    redFlags: [
      'Face drooping',
      'Arm weakness',
      'Speech slurred',
      'Time to call 911'
    ]
  }],
  
  ['diabetes', {
    id: 'diabetes',
    title: 'Diabetes Mellitus',
    description: 'A group of metabolic disorders characterized by high blood sugar levels.',
    category: 'condition',
    severity: 'medium',
    icd10Code: 'E11.9',
    sources: ['American Diabetes Association', 'CDC', 'Endocrinology Guidelines'],
    lastUpdated: '2024-01-15',
    relatedConditions: ['diabetic ketoacidosis', 'hypoglycemia', 'diabetic neuropathy'],
    symptoms: ['increased thirst', 'frequent urination', 'fatigue', 'blurred vision'],
    treatments: ['blood sugar monitoring', 'medication compliance', 'diet management', 'exercise'],
    whenToSeekCare: [
      'Blood sugar consistently above 250 mg/dL',
      'Signs of diabetic ketoacidosis',
      'Severe hypoglycemia',
      'New or worsening symptoms'
    ],
    redFlags: [
      'Blood sugar above 400 mg/dL',
      'Vomiting with high blood sugar',
      'Difficulty breathing',
      'Loss of consciousness'
    ]
  }],
  
  ['hypertension', {
    id: 'hypertension',
    title: 'High Blood Pressure (Hypertension)',
    description: 'A condition where blood pressure in the arteries is persistently elevated.',
    category: 'condition',
    severity: 'medium',
    icd10Code: 'I10',
    sources: ['American Heart Association', 'JNC Guidelines', 'WHO'],
    lastUpdated: '2024-01-15',
    relatedConditions: ['heart disease', 'stroke', 'kidney disease', 'hypertensive crisis'],
    symptoms: ['often no symptoms', 'headache', 'dizziness', 'nosebleeds'],
    treatments: ['lifestyle modifications', 'regular monitoring', 'medications', 'diet changes'],
    whenToSeekCare: [
      'Blood pressure consistently above 140/90',
      'Severe headache with high BP',
      'Chest pain with high BP',
      'Difficulty breathing'
    ],
    redFlags: [
      'Blood pressure above 180/120',
      'Severe headache',
      'Chest pain',
      'Difficulty breathing'
    ]
  }]
]);

export function getReferences(conditions: string[]): MedicalReference[] {
  const references: MedicalReference[] = [];
  
  conditions.forEach(condition => {
    const normalizedCondition = normalizeConditionName(condition);
    const reference = medicalDatabase.get(normalizedCondition);
    
    if (reference) {
      references.push(reference);
    } else {
      // Try to find partial matches
      const partialMatch = findPartialMatch(condition);
      if (partialMatch) {
        references.push(partialMatch);
      }
    }
  });
  
  return references;
}

export function getReference(conditionId: string): MedicalReference | null {
  return medicalDatabase.get(conditionId) || null;
}

export function searchReferences(query: string): MedicalReference[] {
  const lowerQuery = query.toLowerCase();
  const results: MedicalReference[] = [];
  
  for (const [id, reference] of medicalDatabase) {
    if (
      reference.title.toLowerCase().includes(lowerQuery) ||
      reference.description.toLowerCase().includes(lowerQuery) ||
      reference.symptoms.some(symptom => symptom.toLowerCase().includes(lowerQuery)) ||
      reference.relatedConditions.some(condition => condition.toLowerCase().includes(lowerQuery))
    ) {
      results.push(reference);
    }
  }
  
  return results.sort((a, b) => {
    // Sort by severity (critical first) then by relevance
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

export function getReferencesByCategory(category: MedicalReference['category']): MedicalReference[] {
  const results: MedicalReference[] = [];
  
  for (const [id, reference] of medicalDatabase) {
    if (reference.category === category) {
      results.push(reference);
    }
  }
  
  return results;
}

export function getReferencesBySeverity(severity: MedicalReference['severity']): MedicalReference[] {
  const results: MedicalReference[] = [];
  
  for (const [id, reference] of medicalDatabase) {
    if (reference.severity === severity) {
      results.push(reference);
    }
  }
  
  return results;
}

function normalizeConditionName(condition: string): string {
  const normalized = condition.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .trim();
  
  // Handle common variations
  const variations: { [key: string]: string } = {
    'cold': 'common_cold',
    'flu': 'influenza',
    'heart_attack': 'heart_attack',
    'myocardial_infarction': 'heart_attack',
    'mi': 'heart_attack',
    'stroke': 'stroke',
    'cva': 'stroke',
    'cerebrovascular_accident': 'stroke',
    'high_blood_pressure': 'hypertension',
    'diabetes': 'diabetes',
    'diabetes_mellitus': 'diabetes'
  };
  
  return variations[normalized] || normalized;
}

function findPartialMatch(condition: string): MedicalReference | null {
  const lowerCondition = condition.toLowerCase();
  
  for (const [id, reference] of medicalDatabase) {
    if (
      reference.title.toLowerCase().includes(lowerCondition) ||
      lowerCondition.includes(reference.title.toLowerCase()) ||
      reference.relatedConditions.some(related => 
        related.toLowerCase().includes(lowerCondition) ||
        lowerCondition.includes(related.toLowerCase())
      )
    ) {
      return reference;
    }
  }
  
  return null;
}

// Emergency condition detection
export function detectEmergencyConditions(symptoms: string[]): {
  hasEmergency: boolean;
  emergencyConditions: MedicalReference[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
} {
  const lowerSymptoms = symptoms.map(s => s.toLowerCase());
  const emergencyConditions: MedicalReference[] = [];
  let maxSeverity: MedicalReference['severity'] = 'low';
  
  for (const [id, reference] of medicalDatabase) {
    if (reference.severity === 'critical' || reference.severity === 'high') {
      const hasMatchingSymptoms = reference.symptoms.some(symptom =>
        lowerSymptoms.some(userSymptom => 
          userSymptom.includes(symptom.toLowerCase()) ||
          symptom.toLowerCase().includes(userSymptom)
        )
      );
      
      if (hasMatchingSymptoms) {
        emergencyConditions.push(reference);
        if (reference.severity === 'critical') {
          maxSeverity = 'critical';
        } else if (reference.severity === 'high' && maxSeverity !== 'critical') {
          maxSeverity = 'high';
        }
      }
    }
  }
  
  return {
    hasEmergency: emergencyConditions.length > 0,
    emergencyConditions,
    urgencyLevel: maxSeverity
  };
}

// Get treatment recommendations
export function getTreatmentRecommendations(conditionId: string): {
  immediate: string[];
  shortTerm: string[];
  longTerm: string[];
  lifestyle: string[];
} {
  const reference = medicalDatabase.get(conditionId);
  
  if (!reference) {
    return {
      immediate: ['Consult healthcare provider'],
      shortTerm: ['Monitor symptoms'],
      longTerm: ['Follow up with healthcare provider'],
      lifestyle: ['Maintain healthy lifestyle']
    };
  }
  
  // This would be expanded with more detailed treatment protocols
  return {
    immediate: reference.treatments.slice(0, 2),
    shortTerm: reference.treatments.slice(2, 4),
    longTerm: ['Regular follow-up care', 'Preventive measures'],
    lifestyle: ['Healthy diet', 'Regular exercise', 'Adequate sleep']
  };
}

// Add new reference (for dynamic updates)
export function addReference(reference: MedicalReference): void {
  medicalDatabase.set(reference.id, reference);
}

// Update existing reference
export function updateReference(id: string, updates: Partial<MedicalReference>): boolean {
  const existing = medicalDatabase.get(id);
  if (!existing) return false;
  
  const updated = { ...existing, ...updates, lastUpdated: new Date().toISOString() };
  medicalDatabase.set(id, updated);
  return true;
}

// Get all references (for admin purposes)
export function getAllReferences(): MedicalReference[] {
  return Array.from(medicalDatabase.values());
}

// Get reference statistics
export function getReferenceStats(): {
  total: number;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  lastUpdated: string;
} {
  const references = Array.from(medicalDatabase.values());
  
  const byCategory: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  
  references.forEach(ref => {
    byCategory[ref.category] = (byCategory[ref.category] || 0) + 1;
    bySeverity[ref.severity] = (bySeverity[ref.severity] || 0) + 1;
  });
  
  const lastUpdated = references
    .map(ref => ref.lastUpdated)
    .sort()
    .reverse()[0] || new Date().toISOString();
  
  return {
    total: references.length,
    byCategory,
    bySeverity,
    lastUpdated
  };
}