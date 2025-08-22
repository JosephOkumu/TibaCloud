// AI Service for Healthcare Platform
// This service provides intelligent responses for health-related queries and platform navigation

export interface HealthCondition {
  symptoms: string[];
  recommendedSpecialist: string;
  urgencyLevel: "low" | "medium" | "high" | "emergency";
  description: string;
  additionalInfo?: string;
}

export interface PlatformFeature {
  keywords: string[];
  title: string;
  description: string;
  steps: string[];
  relatedFeatures?: string[];
}

class AIService {
  private healthConditions: HealthCondition[] = [
    {
      symptoms: [
        "chest pain",
        "heart attack",
        "heart palpitations",
        "irregular heartbeat",
        "cardiac",
        "heart",
      ],
      recommendedSpecialist: "Cardiology",
      urgencyLevel: "high",
      description: "Heart and cardiovascular system specialist",
      additionalInfo:
        "⚠️ If experiencing severe chest pain, seek emergency care immediately!",
    },
    {
      symptoms: [
        "stomach",
        "digestive",
        "nausea",
        "vomiting",
        "diarrhea",
        "constipation",
        "gastro",
        "abdominal pain",
      ],
      recommendedSpecialist: "Gastroenterology",
      urgencyLevel: "medium",
      description: "Digestive system specialist",
    },
    {
      symptoms: [
        "bone",
        "joint",
        "fracture",
        "back pain",
        "knee pain",
        "arthritis",
        "sports injury",
        "muscle pain",
      ],
      recommendedSpecialist: "Orthopedics",
      urgencyLevel: "medium",
      description: "Bone, joint, and musculoskeletal specialist",
    },
    {
      symptoms: [
        "child",
        "pediatric",
        "baby",
        "infant",
        "vaccination",
        "growth",
        "kids",
      ],
      recommendedSpecialist: "Pediatrics",
      urgencyLevel: "medium",
      description: "Children's health specialist",
    },
    {
      symptoms: ["cancer", "tumor", "oncology", "chemotherapy", "radiation"],
      recommendedSpecialist: "Oncology",
      urgencyLevel: "high",
      description: "Cancer treatment specialist",
    },
    {
      symptoms: [
        "mental health",
        "depression",
        "anxiety",
        "stress",
        "psychological",
        "mood",
        "counseling",
      ],
      recommendedSpecialist: "Counselling",
      urgencyLevel: "medium",
      description: "Mental health and psychological disorders specialist",
    },
    {
      symptoms: [
        "nutrition",
        "diet",
        "weight loss",
        "eating disorder",
        "obesity",
        "malnutrition",
      ],
      recommendedSpecialist: "Nutrition & Dietetics",
      urgencyLevel: "low",
      description: "Nutrition and dietary specialist",
    },
    {
      symptoms: [
        "internal medicine",
        "diabetes",
        "hypertension",
        "chronic disease",
        "adult medicine",
      ],
      recommendedSpecialist: "Internal Medicine",
      urgencyLevel: "medium",
      description: "Internal medicine specialist for adult health",
    },
    {
      symptoms: [
        "fever",
        "cold",
        "flu",
        "general illness",
        "checkup",
        "routine",
        "primary care",
      ],
      recommendedSpecialist: "General Practitioner",
      urgencyLevel: "low",
      description: "Primary care physician for general health concerns",
    },
    {
      symptoms: ["ear", "hearing", "throat", "nose", "sinus", "tonsils", "ent"],
      recommendedSpecialist: "Otolaryngology",
      urgencyLevel: "medium",
      description: "Ear, Nose, and Throat specialist",
    },
    {
      symptoms: ["diabetes", "thyroid", "hormone", "endocrine", "metabolism"],
      recommendedSpecialist: "Endocrinology",
      urgencyLevel: "medium",
      description: "Hormone and metabolic disorders specialist",
    },
    {
      symptoms: [
        "kidney",
        "urinary",
        "bladder",
        "urology",
        "prostate",
        "reproductive",
      ],
      recommendedSpecialist: "Urology",
      urgencyLevel: "medium",
      description: "Urinary system and male reproductive system specialist",
    },
    {
      symptoms: [
        "pregnancy",
        "gynecology",
        "women health",
        "menstrual",
        "reproductive health",
        "obstetrics",
      ],
      recommendedSpecialist: "Obstetrics & Gynecology",
      urgencyLevel: "medium",
      description: "Women's reproductive health specialist",
    },
    {
      symptoms: [
        "speech",
        "speech therapy",
        "communication disorder",
        "language delay",
        "stuttering",
        "voice problems",
      ],
      recommendedSpecialist: "Speech Therapy",
      urgencyLevel: "low",
      description: "Speech and communication disorders specialist",
    },
    {
      symptoms: [
        "family medicine",
        "primary care",
        "preventive care",
        "health maintenance",
        "routine check",
      ],
      recommendedSpecialist: "Family Medicine",
      urgencyLevel: "low",
      description: "Comprehensive primary care for all ages",
    },
  ];

  private platformFeatures: PlatformFeature[] = [
    {
      keywords: [
        "book appointment",
        "schedule",
        "doctor appointment",
        "consultation",
      ],
      title: "Book Doctor Appointment",
      description: "Schedule a consultation with qualified doctors",
      steps: [
        "Go to your Patient Dashboard",
        'Click on "Doctor Consultation"',
        "Browse available doctors by specialty",
        "Select your preferred doctor",
        "Choose available date and time",
        "Fill in consultation details",
        "Confirm and pay for appointment",
      ],
      relatedFeatures: [
        "video consultation",
        "in-person visit",
        "specialist referral",
      ],
    },
    {
      keywords: ["nursing service", "home nursing", "home care", "nurse"],
      title: "Home Nursing Services",
      description: "Professional nursing care in the comfort of your home",
      steps: [
        'Navigate to "Home Nursing" section',
        "Browse qualified nursing providers",
        "View services, ratings, and prices",
        "Select required nursing services",
        "Choose appointment date and time",
        "Provide home address details",
        "Confirm booking and payment",
      ],
      relatedFeatures: [
        "elderly care",
        "post-surgery care",
        "medication management",
      ],
    },
    {
      keywords: [
        "lab test",
        "laboratory",
        "blood test",
        "medical test",
        "diagnostic",
      ],
      title: "Laboratory Tests",
      description: "Comprehensive diagnostic and laboratory services",
      steps: [
        'Go to "Lab Tests" section',
        "Browse test categories or search specific tests",
        "Select required tests",
        "Choose home collection or lab visit",
        "Schedule convenient time slot",
        "Complete payment",
        "Receive results online",
      ],
      relatedFeatures: [
        "home sample collection",
        "health packages",
        "result tracking",
      ],
    },
    {
      keywords: ["medicine", "pharmacy", "prescription", "drug", "medication"],
      title: "Online Pharmacy",
      description: "Order medicines with home delivery",
      steps: [
        'Visit "Pharmacy" section',
        "Upload prescription or search medicines",
        "Add medicines to cart",
        "Review order and dosage",
        "Choose delivery or pickup option",
        "Complete secure payment",
        "Track your order delivery",
      ],
      relatedFeatures: [
        "prescription upload",
        "medicine reminders",
        "generic alternatives",
      ],
    },
    {
      keywords: ["payment", "billing", "insurance", "cost", "price"],
      title: "Payment & Billing",
      description: "Secure payment options and transparent pricing",
      steps: [
        "View service pricing before booking",
        "Choose from multiple payment methods",
        "Apply insurance if applicable",
        "Review bill breakdown",
        "Complete secure payment",
        "Download receipt and invoice",
      ],
      relatedFeatures: ["insurance claims", "payment history", "refund policy"],
    },
    {
      keywords: [
        "profile",
        "account",
        "personal information",
        "medical history",
      ],
      title: "Manage Profile",
      description: "Update your personal and medical information",
      steps: [
        "Go to Profile Settings",
        "Update personal details",
        "Add medical history",
        "Upload documents if needed",
        "Set communication preferences",
        "Save changes",
      ],
      relatedFeatures: [
        "medical records",
        "emergency contacts",
        "privacy settings",
      ],
    },
  ];

  /**
   * Get doctor recommendation based on symptoms
   */
  getDoctorRecommendation(symptoms: string): string {
    const input = symptoms.toLowerCase();

    // Check for emergency keywords
    const emergencyKeywords = [
      "emergency",
      "urgent",
      "severe",
      "sudden",
      "intense",
      "can't breathe",
      "unconscious",
    ];
    if (emergencyKeywords.some((keyword) => input.includes(keyword))) {
      return this.getEmergencyResponse();
    }

    // Find matching health condition
    const matchedCondition = this.healthConditions.find((condition) =>
      condition.symptoms.some((symptom) => input.includes(symptom)),
    );

    if (matchedCondition) {
      return this.formatDoctorRecommendation(matchedCondition);
    }

    return this.getGenericHealthResponse();
  }

  /**
   * Get platform navigation help
   */
  getPlatformHelp(query: string): string {
    const input = query.toLowerCase();

    const matchedFeature = this.platformFeatures.find((feature) =>
      feature.keywords.some((keyword) => input.includes(keyword)),
    );

    if (matchedFeature) {
      return this.formatPlatformHelp(matchedFeature);
    }

    return this.getGenericPlatformResponse();
  }

  /**
   * Generate intelligent response based on user input
   */
  generateResponse(userInput: string): string {
    const input = userInput.toLowerCase();

    // Extract context if provided
    let context = "";
    let actualQuery = input;
    if (input.includes("user asks:")) {
      const parts = input.split("user asks:");
      context = parts[0].trim();
      actualQuery = parts[1].trim();
    }

    // Immediate greeting responses - check first to avoid asking again
    if (
      actualQuery.includes("hello") ||
      actualQuery.includes("hi") ||
      actualQuery.includes("hey") ||
      actualQuery.includes("good morning") ||
      actualQuery.includes("good afternoon") ||
      actualQuery.includes("good evening")
    ) {
      return this.getGreetingResponse();
    }

    // Thank you responses
    if (actualQuery.includes("thank") || actualQuery.includes("thanks")) {
      return this.getThankYouResponse();
    }

    // Emergency responses - highest priority
    if (
      actualQuery.includes("emergency") ||
      actualQuery.includes("urgent") ||
      actualQuery.includes("911") ||
      actualQuery.includes("need help now")
    ) {
      return this.getEmergencyResponse();
    }

    // Emergency number queries
    if (
      actualQuery.includes("emergency number") ||
      actualQuery.includes("ambulance number") ||
      actualQuery.includes("what number") ||
      actualQuery.includes("which number") ||
      actualQuery.includes("emergency contact") ||
      actualQuery.includes("call in emergency") ||
      actualQuery.includes("999") ||
      actualQuery.includes("emergency services")
    ) {
      return this.getEmergencyNumberResponse();
    }

    // Enhanced quick action responses - exact match for button text
    if (actualQuery === "i have fever and headache") {
      return `🌡️ **General Practitioner (Family Doctor)**\n\nFor fever and headaches, I recommend seeing a General Practitioner first. These symptoms could indicate:\n\n• Common viral infections (flu, cold)\n• Bacterial infections\n• Stress or tension headaches\n• Dehydration\n\n**Immediate care:**\n• Rest and stay hydrated\n• Monitor your temperature\n• Take over-the-counter pain relievers if needed\n\n📅 **Book appointment:**\n• Go to "Doctor Consultation"\n• Filter by "General Practice"\n• Choose available time slot\n\n⚠️ If fever exceeds 103°F (39.4°C) or symptoms worsen, seek immediate medical attention!`;
    }

    if (actualQuery === "chest pain and breathing issues") {
      return `❤️ **URGENT - Cardiologist or Emergency Care**\n\n⚠️ **This requires immediate attention!**\n\nChest pain with breathing issues could indicate:\n• Heart problems (requires Cardiologist)\n• Lung issues (requires Pulmonologist)\n• Emergency conditions\n\n**Immediate action:**\n• If severe or sudden: Call 911 immediately\n• If mild but persistent: See a Cardiologist today\n• Don't wait - chest pain needs prompt evaluation\n\n📅 **Book urgent appointment:**\n• Go to "Doctor Consultation"\n• Filter by "Cardiology" or "Emergency"\n• Select same-day or urgent slots\n\n🚨 When in doubt, always choose emergency care for chest pain!`;
    }

    if (actualQuery === "stomach pain and nausea") {
      return `🏥 **Gastroenterologist or General Practitioner**\n\nStomach pain with nausea suggests digestive issues. This could be:\n\n• Food poisoning or gastroenteritis\n• Acid reflux or GERD\n• Irritable bowel syndrome (IBS)\n• Gastric ulcers\n\n**Immediate care:**\n• Stay hydrated with small sips of water\n• Avoid solid foods temporarily\n• Try clear liquids (broth, electrolyte solutions)\n\n**See a doctor if:**\n• Symptoms persist over 24 hours\n• Severe abdominal pain\n• Blood in vomit or stool\n• High fever\n\n📅 **Book appointment:**\n• Start with "General Practice" for initial assessment\n• May refer to "Gastroenterology" if needed`;
    }

    if (actualQuery === "back pain after exercise") {
      return `🦴 **Orthopedic Specialist or Sports Medicine**\n\nBack pain after exercise is common and could indicate:\n\n• Muscle strain or sprain\n• Poor form during exercise\n• Overexertion or sudden movement\n• Possible disc issues (if severe)\n\n**Immediate care:**\n• Rest and avoid aggravating activities\n• Apply ice for first 24-48 hours\n• Gentle stretching if tolerable\n• Over-the-counter anti-inflammatory medication\n\n**Red flags - seek immediate care:**\n• Severe pain radiating to legs\n• Numbness or tingling\n• Loss of bladder/bowel control\n\n📅 **Book appointment:**\n• "Orthopedic Specialist" for bone/joint issues\n• "Sports Medicine" for exercise-related injuries\n• "Physical Therapy" for rehabilitation`;
    }

    if (actualQuery === "skin rash and itching") {
      return `🧴 **Dermatologist**\n\nSkin rash with itching needs dermatological evaluation. This could be:\n\n• Allergic reactions (contact dermatitis)\n• Eczema or atopic dermatitis\n• Fungal infections\n• Psoriasis\n• Drug reactions\n\n**Immediate care:**\n• Avoid scratching to prevent infection\n• Use cool, damp cloths for relief\n• Gentle, fragrance-free moisturizers\n• Avoid known irritants\n\n**Seek urgent care if:**\n• Rash spreads rapidly\n• Difficulty breathing (allergic reaction)\n• Signs of infection (pus, red streaks)\n• Fever with rash\n\n📅 **Book appointment:**\n• Go to "Doctor Consultation"\n• Filter by "Dermatology"\n• Consider same-day appointment if spreading`;
    }

    if (actualQuery === "how do i book an appointment?") {
      return `📅 **How to Book an Appointment**\n\n**Step-by-step process:**\n\n1. **Choose your service:**\n   • Doctor Consultation\n   • Home Nursing Services\n   • Laboratory Tests\n   • Pharmacy Services\n\n2. **Select your provider:**\n   • Browse available doctors/services\n   • Check ratings and reviews\n   • View specialties and qualifications\n\n3. **Pick date and time:**\n   • See real-time availability\n   • Choose convenient time slot\n   • Select in-person or virtual consultation\n\n4. **Complete booking:**\n   • Fill in patient details\n   • Choose payment method\n   • Confirm appointment\n\n💡 **Pro tip:** Book in advance for better availability!`;
    }

    if (actualQuery === "how to find nursing services?") {
      return `🏠 **How to Find Nursing Services**\n\n**Home Nursing Services available:**\n\n**Medical Care:**\n• Wound care and dressing\n• Medication administration\n• Vital signs monitoring\n• Post-operative care\n\n**Personal Care:**\n• Bathing and hygiene assistance\n• Mobility support\n• Companionship\n• Meal preparation\n\n**How to book:**\n1. Go to "Home Nursing Services"\n2. Select type of care needed\n3. Choose qualified nurse\n4. Schedule home visit\n5. Complete booking\n\n📞 **24/7 availability** for urgent nursing needs!`;
    }

    if (actualQuery === "emergency - need help now") {
      return this.getEmergencyResponse();
    }

    // Partial matches for symptoms (still recognize variations)
    if (actualQuery.includes("fever") && actualQuery.includes("headache")) {
      return `🌡️ **General Practitioner (Family Doctor)**\n\nFor fever and headaches, I recommend seeing a General Practitioner first. These symptoms could indicate:\n\n• Common viral infections (flu, cold)\n• Bacterial infections\n• Stress or tension headaches\n• Dehydration\n\n**Immediate care:**\n• Rest and stay hydrated\n• Monitor your temperature\n• Take over-the-counter pain relievers if needed\n\n📅 **Book appointment:**\n• Go to "Doctor Consultation"\n• Filter by "General Practice"\n• Choose available time slot\n\n⚠️ If fever exceeds 103°F (39.4°C) or symptoms worsen, seek immediate medical attention!`;
    }

    if (
      actualQuery.includes("chest pain") &&
      actualQuery.includes("breathing")
    ) {
      return `❤️ **URGENT - Cardiologist or Emergency Care**\n\n⚠️ **This requires immediate attention!**\n\nChest pain with breathing issues could indicate:\n• Heart problems (requires Cardiologist)\n• Lung issues (requires Pulmonologist)\n• Emergency conditions\n\n**Immediate action:**\n• If severe or sudden: Call 911 immediately\n• If mild but persistent: See a Cardiologist today\n• Don't wait - chest pain needs prompt evaluation\n\n📅 **Book urgent appointment:**\n• Go to "Doctor Consultation"\n• Filter by "Cardiology" or "Emergency"\n• Select same-day or urgent slots\n\n🚨 When in doubt, always choose emergency care for chest pain!`;
    }

    if (
      actualQuery.includes("stomach pain") &&
      actualQuery.includes("nausea")
    ) {
      return `🏥 **Gastroenterologist or General Practitioner**\n\nStomach pain with nausea suggests digestive issues. This could be:\n\n• Food poisoning or gastroenteritis\n• Acid reflux or GERD\n• Irritable bowel syndrome (IBS)\n• Gastric ulcers\n\n**Immediate care:**\n• Stay hydrated with small sips of water\n• Avoid solid foods temporarily\n• Try clear liquids (broth, electrolyte solutions)\n\n**See a doctor if:**\n• Symptoms persist over 24 hours\n• Severe abdominal pain\n• Blood in vomit or stool\n• High fever\n\n📅 **Book appointment:**\n• Start with "General Practice" for initial assessment\n• May refer to "Gastroenterology" if needed`;
    }

    if (actualQuery.includes("back pain") && actualQuery.includes("exercise")) {
      return `🦴 **Orthopedic Specialist or Sports Medicine**\n\nBack pain after exercise is common and could indicate:\n\n• Muscle strain or sprain\n• Poor form during exercise\n• Overexertion or sudden movement\n• Possible disc issues (if severe)\n\n**Immediate care:**\n• Rest and avoid aggravating activities\n• Apply ice for first 24-48 hours\n• Gentle stretching if tolerable\n• Over-the-counter anti-inflammatory medication\n\n**Red flags - seek immediate care:**\n• Severe pain radiating to legs\n• Numbness or tingling\n• Loss of bladder/bowel control\n\n📅 **Book appointment:**\n• "Orthopedic Specialist" for bone/joint issues\n• "Sports Medicine" for exercise-related injuries\n• "Physical Therapy" for rehabilitation`;
    }

    if (actualQuery.includes("skin rash") && actualQuery.includes("itching")) {
      return `🧴 **Dermatologist**\n\nSkin rash with itching needs dermatological evaluation. This could be:\n\n• Allergic reactions (contact dermatitis)\n• Eczema or atopic dermatitis\n• Fungal infections\n• Psoriasis\n• Drug reactions\n\n**Immediate care:**\n• Avoid scratching to prevent infection\n• Use cool, damp cloths for relief\n• Gentle, fragrance-free moisturizers\n• Avoid known irritants\n\n**Seek urgent care if:**\n• Rash spreads rapidly\n• Difficulty breathing (allergic reaction)\n• Signs of infection (pus, red streaks)\n• Fever with rash\n\n📅 **Book appointment:**\n• Go to "Doctor Consultation"\n• Filter by "Dermatology"\n• Consider same-day appointment if spreading`;
    }

    // Add context-aware responses
    if (context.includes("nursing services") && actualQuery.includes("help")) {
      return this.getNursingContextHelp();
    }
    if (
      context.includes("doctor consultation") &&
      actualQuery.includes("help")
    ) {
      return this.getDoctorContextHelp();
    }
    if (
      context.includes("laboratory services") &&
      actualQuery.includes("help")
    ) {
      return this.getLabContextHelp();
    }
    if (context.includes("pharmacy") && actualQuery.includes("help")) {
      return this.getPharmacyContextHelp();
    }
    if (context.includes("patient dashboard") && actualQuery.includes("help")) {
      return this.getDashboardContextHelp();
    }

    // Enhanced single word recognition for health symptoms
    const singleWordHealthResponses: { [key: string]: string } = {
      heart: `❤️ **Heart Health Concerns**\n\nFor heart-related issues, I recommend:\n\n**Cardiologist** - Heart specialist for:\n• Chest pain or discomfort\n• Irregular heartbeat\n• High blood pressure\n• Heart palpitations\n• Shortness of breath\n\n**When to seek immediate care:**\n• Chest pain with breathing difficulty\n• Severe chest pressure\n• Pain radiating to arm, jaw, or back\n\n📅 **Book appointment:**\n• Go to "Doctor Consultation"\n• Filter by "Cardiology"\n• Choose your preferred time slot\n\n🚨 **Emergency:** Call 911 for severe chest pain!`,
      pain: `🩺 **Pain Assessment**\n\nI can help you find the right specialist for your pain:\n\n**Common pain specialists:**\n• **General Practitioner** - For general pain assessment\n• **Orthopedic** - For bone, joint, muscle pain\n• **Neurologist** - For nerve-related pain\n• **Rheumatologist** - For arthritis, joint inflammation\n\n**Tell me more specifically:**\n• Where is the pain? (head, back, chest, etc.)\n• How long have you had it?\n• What triggers it?\n\n📅 **Quick booking:** Use our "Doctor Consultation" service`,
      headache: `🧠 **Headache Help**\n\nFor headaches, I recommend:\n\n**Neurologist** - For:\n• Frequent or severe headaches\n• Migraines\n• Chronic headaches\n• Headaches with vision changes\n\n**General Practitioner** - For:\n• Occasional headaches\n• Tension headaches\n• Headaches with fever\n\n**Immediate care tips:**\n• Rest in a quiet, dark room\n• Stay hydrated\n• Apply cold/warm compress\n\n📅 **Book appointment** if headaches are frequent or severe`,
      stomach: `🏥 **Stomach Issues**\n\nFor stomach problems, consult:\n\n**Gastroenterologist** - For:\n• Chronic stomach pain\n• Digestive issues\n• Acid reflux\n• Ulcers\n\n**General Practitioner** - For:\n• Acute stomach pain\n• Nausea and vomiting\n• Food poisoning symptoms\n\n**Immediate care:**\n• Stay hydrated\n• Avoid solid foods temporarily\n• Rest\n\n📅 **Book consultation** for persistent symptoms`,
      back: `🦴 **Back Pain Relief**\n\nFor back pain, see:\n\n**Orthopedic Specialist** - For:\n• Chronic back pain\n• Spine issues\n• Disc problems\n• Joint pain\n\n**Physical Therapist** - For:\n• Muscle strain\n• Rehabilitation\n• Exercise-related injuries\n\n**Immediate care:**\n• Rest and avoid heavy lifting\n• Apply ice or heat\n• Gentle stretching\n\n📅 **Book appointment** for proper diagnosis`,
      fever: `🌡️ **Fever Management**\n\nFor fever, consult:\n\n**General Practitioner** - For:\n• Fever with other symptoms\n• Persistent fever\n• High fever (over 101°F)\n\n**Immediate care:**\n• Stay hydrated\n• Rest\n• Monitor temperature\n• Take fever reducers if needed\n\n**Seek immediate care if:**\n• Fever over 103°F (39.4°C)\n• Difficulty breathing\n• Severe headache\n• Persistent vomiting\n\n📅 **Book urgent appointment** if fever persists`,
      cough: `😷 **Cough Treatment**\n\nFor cough issues, see:\n\n**General Practitioner** - For:\n• Persistent cough\n• Cough with fever\n• Dry or productive cough\n\n**Pulmonologist** - For:\n• Chronic cough\n• Breathing difficulties\n• Lung-related issues\n\n**Immediate care:**\n• Stay hydrated\n• Use humidifier\n• Avoid irritants\n• Rest\n\n📅 **Book appointment** for cough lasting over 2 weeks`,
      breathing: `🫁 **Breathing Issues**\n\n⚠️ **Important:** Breathing problems can be serious!\n\n**Pulmonologist** - For:\n• Chronic breathing issues\n• Asthma\n• Lung problems\n\n**Cardiologist** - For:\n• Breathing issues with chest pain\n• Heart-related breathing problems\n\n**Emergency Care** - If:\n• Severe shortness of breath\n• Cannot speak in full sentences\n• Bluish lips or face\n\n🚨 **Seek immediate care** for severe breathing difficulty!`,
      skin: `🧴 **Skin Care**\n\nFor skin issues, consult:\n\n**Dermatologist** - For:\n• Skin rashes\n• Acne\n• Moles or growths\n• Skin infections\n• Allergic reactions\n\n**General Practitioner** - For:\n• Minor skin issues\n• Cuts and wounds\n• Basic skin care\n\n**Immediate care:**\n• Keep affected area clean\n• Avoid scratching\n• Use gentle, fragrance-free products\n\n📅 **Book dermatology appointment** for persistent skin issues`,
      sleep: `😴 **Sleep Issues**\n\nFor sleep problems, see:\n\n**Sleep Specialist** - For:\n• Sleep apnea\n• Chronic insomnia\n• Sleep disorders\n\n**General Practitioner** - For:\n• Occasional sleep issues\n• Sleep hygiene advice\n• Stress-related sleep problems\n\n**Sleep tips:**\n• Maintain regular sleep schedule\n• Create comfortable sleep environment\n• Avoid screens before bed\n• Limit caffeine\n\n📅 **Book consultation** for persistent sleep issues`,
    };

    // Enhanced single word recognition for platform/service queries
    const singleWordPlatformResponses: { [key: string]: string } = {
      book: `📅 **How to Book Services**\n\nI can help you book:\n\n**Available Services:**\n• **Doctor Consultation** - Video or in-person\n• **Home Nursing** - Professional care at home\n• **Laboratory Tests** - Sample collection or lab visits\n• **Pharmacy Services** - Medicine delivery\n\n**Quick booking steps:**\n1. Choose your service type\n2. Select provider/doctor\n3. Pick date and time\n4. Complete payment\n5. Receive confirmation\n\n**What would you like to book?**`,
      appointment: `📅 **Appointment Booking**\n\nLet me help you schedule an appointment:\n\n**Available Appointments:**\n• **Doctor Consultations** - All specialties\n• **Home Nursing** - Professional care\n• **Lab Tests** - Sample collection\n• **Specialist Consultations** - Expert care\n\n**Booking Process:**\n1. Go to "Doctor Consultation"\n2. Filter by specialty or location\n3. Choose available time slot\n4. Fill patient details\n5. Confirm booking\n\n**Need help with a specific type of appointment?**`,
      doctor: `👩‍⚕️ **Doctor Consultation**\n\nFind the right doctor for your needs:\n\n**Available Specialties:**\n• **General Practitioner** - Primary care\n• **Cardiologist** - Heart specialist\n• **Dermatologist** - Skin specialist\n• **Orthopedic** - Bone & joint specialist\n• **Neurologist** - Brain & nerve specialist\n• **Gastroenterologist** - Digestive specialist\n\n**Consultation Types:**\n• Video consultations\n• In-person visits\n• Emergency consultations\n\n**Ready to book a consultation?**`,
      nursing: `🏠 **Home Nursing Services**\n\nProfessional care at your home:\n\n**Available Services:**\n• **Medical Care** - Wound care, medication\n• **Personal Care** - Bathing, mobility support\n• **Elderly Care** - Specialized senior care\n• **Post-Surgery Care** - Recovery support\n• **Chronic Care** - Long-term assistance\n\n**How to book:**\n1. Go to "Home Nursing Services"\n2. Select type of care needed\n3. Choose qualified nurse\n4. Schedule home visit\n5. Confirm booking\n\n**Available 24/7 for urgent needs!**`,
      lab: `🔬 **Laboratory Services**\n\nComplete diagnostic testing:\n\n**Available Tests:**\n• **Blood Tests** - Complete blood count, lipid profile\n• **Urine Tests** - Routine and microscopic\n• **Imaging** - X-rays, ultrasounds\n• **Health Packages** - Comprehensive checkups\n• **Specialized Tests** - As prescribed\n\n**Service Options:**\n• **Home Collection** - Sample pickup\n• **Lab Visits** - Visit our facilities\n• **Reports** - Online and printed\n\n**Book your lab tests today!**`,
      pharmacy: `💊 **Pharmacy Services**\n\nMedicine delivery and more:\n\n**Available Services:**\n• **Prescription Medicines** - Upload prescription\n• **OTC Medications** - Over-the-counter drugs\n• **Health Products** - Supplements, devices\n• **Medicine Reminders** - Never miss a dose\n• **Home Delivery** - Fast and reliable\n\n**How to order:**\n1. Upload prescription or browse catalog\n2. Add items to cart\n3. Enter delivery address\n4. Choose payment method\n5. Track your order\n\n**Order your medicines now!**`,
      help: `🤝 **How Can I Help You?**\n\nI'm here to assist with:\n\n**Health Guidance:**\n• Find the right doctor for symptoms\n• Understand medical conditions\n• Emergency guidance\n• Health tips and advice\n\n**Platform Services:**\n• Book appointments\n• Navigate services\n• Account management\n• Technical support\n\n**Quick Actions:**\n• Tell me your symptoms\n• Ask "How do I book an appointment?"\n• Say "I need a doctor"\n• Ask about specific services\n\n**What specifically can I help you with?**`,
      payment: `💳 **Payment & Billing**\n\nPayment information and support:\n\n**Accepted Payment Methods:**\n• **Credit/Debit Cards** - Visa, Mastercard\n• **Digital Wallets** - PayPal, Apple Pay\n• **Bank Transfer** - Direct bank payment\n• **Insurance** - Health insurance coverage\n\n**Billing Support:**\n• View payment history\n• Download receipts\n• Payment plan options\n• Insurance claim assistance\n\n**Payment Issues:**\n• Contact our billing support\n• Dispute resolution\n• Refund requests\n\n**Need help with a specific payment issue?**`,
      account: `👤 **Account Management**\n\nManage your healthcare account:\n\n**Account Features:**\n• **Personal Profile** - Update information\n• **Medical History** - View past consultations\n• **Appointments** - Manage bookings\n• **Prescriptions** - Digital prescription history\n• **Payment Methods** - Saved cards and billing\n\n**Account Actions:**\n• Update profile information\n• Change password\n• Privacy settings\n• Notification preferences\n\n**Account Issues:**\n• Login problems\n• Password reset\n• Account verification\n\n**Go to your dashboard to manage your account!**`,
    };

    // Check for single word health queries first
    if (singleWordHealthResponses[actualQuery]) {
      return singleWordHealthResponses[actualQuery];
    }

    // Check for single word platform queries
    if (singleWordPlatformResponses[actualQuery]) {
      return singleWordPlatformResponses[actualQuery];
    }

    // Enhanced word recognition for health symptoms
    const healthKeywords = [
      "pain",
      "hurt",
      "feel",
      "symptom",
      "sick",
      "doctor",
      "specialist",
      "medical",
      "health",
      "ache",
      "sore",
      "trouble",
      "problem",
      "illness",
      "disease",
      "condition",
      "dizzy",
      "nausea",
      "vomit",
      "fever",
      "headache",
      "cough",
      "cold",
      "flu",
      "tired",
      "fatigue",
      "swollen",
      "rash",
      "bleeding",
      "bruise",
      "injury",
      "infection",
      "allergy",
      "heart",
      "stomach",
      "back",
      "breathing",
      "skin",
      "sleep",
    ];
    const isHealthQuery = healthKeywords.some((keyword) =>
      actualQuery.includes(keyword),
    );

    // Enhanced platform navigation keywords
    const platformKeywords = [
      "how to",
      "book",
      "schedule",
      "find",
      "use",
      "navigate",
      "help",
      "where",
      "appointment",
      "service",
      "nursing",
      "pharmacy",
      "lab",
      "test",
      "payment",
      "account",
      "login",
      "register",
      "dashboard",
      "profile",
    ];
    const isPlatformQuery = platformKeywords.some((keyword) =>
      actualQuery.includes(keyword),
    );

    if (isHealthQuery) {
      return this.getDoctorRecommendation(actualQuery);
    }

    if (isPlatformQuery) {
      return this.getPlatformHelp(actualQuery);
    }

    return this.getGenericResponse();
  }

  private formatDoctorRecommendation(condition: HealthCondition): string {
    const urgencyEmoji = {
      low: "💚",
      medium: "💛",
      high: "🧡",
      emergency: "🚨",
    };

    let response = `${condition.description}\n\n`;

    if (
      condition.urgencyLevel === "emergency" ||
      condition.urgencyLevel === "high"
    ) {
      response += `⚠️ Important: This seems to require prompt medical attention. `;
    }

    response += `I recommend consulting with a **${condition.recommendedSpecialist}** who specializes in these types of conditions.\n\n`;

    if (condition.additionalInfo) {
      response += condition.additionalInfo + "\n\n";
    }

    response += `📅 You can book an appointment through our platform:\n`;
    response += `• Go to "Doctor Consultation"\n`;
    response += `• Filter by specialty: ${condition.recommendedSpecialist}\n`;
    response += `• Choose your preferred doctor and time slot`;

    return response;
  }

  private formatPlatformHelp(feature: PlatformFeature): string {
    let response = `📋 **${feature.title}**\n\n${feature.description}\n\n`;
    response += `**How to ${feature.title.toLowerCase()}:**\n`;

    feature.steps.forEach((step, index) => {
      response += `${index + 1}. ${step}\n`;
    });

    if (feature.relatedFeatures && feature.relatedFeatures.length > 0) {
      response += `\n**Related services:** ${feature.relatedFeatures.join(", ")}`;
    }

    return response;
  }

  private getEmergencyResponse(): string {
    return `🚨 **EMERGENCY ALERT**\n\nIf this is a medical emergency, please:\n\n• **Call 999 for ambulance services immediately**\n• Go to the nearest emergency room\n• Contact emergency medical services\n\n⚠️ Do not wait for online consultations in emergency situations!\n\nFor urgent but non-emergency care, you can:\n• Book a same-day appointment\n• Contact our 24/7 support line\n• Visit an urgent care provider`;
  }

  private getEmergencyNumberResponse(): string {
    return `🚨 **Emergency Contact Numbers**\n\n**In case of medical emergency:**\n• **Ambulance: 999**\n• **Police: 999**\n• **Fire: 999**\n\n**How to use:**\n• Dial 999 from any phone\n• Tell them you need an ambulance\n• Provide your location clearly\n• Stay on the line until help arrives\n\n**When to call 999:**\n• Severe chest pain\n• Difficulty breathing\n• Severe bleeding\n• Unconsciousness\n• Suspected stroke or heart attack\n• Severe allergic reactions\n\n⚠️ **Remember:** 999 is for life-threatening emergencies only!`;
  }

  private getGreetingResponse(): string {
    const greetings = [
      "👋 **Hello! I'm Alex, your AI health assistant.**\n\nI can help you with:\n\n🩺 **Health Guidance:**\n• Find the right specialist for your symptoms\n• Get personalized doctor recommendations\n• Understand urgency levels of health concerns\n\n💻 **Platform Navigation:**\n• Book appointments and services\n• Navigate our healthcare platform\n• Answer questions about our services\n\n**What can I help you with today?**",
      "Hi there! **I'm Alex, here to help you with health questions and platform navigation.**\n\n**Quick actions:**\n• Tell me your symptoms for doctor recommendations\n• Ask how to book appointments\n• Get help navigating our services\n\n**What would you like to know?**",
      "Hello! **I'm Alex, and I can help you find the right doctor, book appointments, or answer questions about our services.**\n\n**I'm equipped with:**\n• Medical knowledge base\n• Platform navigation assistance\n• Emergency guidance\n\n**How may I assist you?**",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  private getThankYouResponse(): string {
    const responses = [
      "You're very welcome! **I'm always here to help with your healthcare needs.** 😊\n\nFeel free to ask me anything else!",
      "**Happy to help!** Feel free to ask me anything else about your health or our platform.\n\n**Remember:** I'm available 24/7 for your healthcare questions!",
      "You're welcome! **Take care of your health,** and don't hesitate to reach out if you need more assistance. 💚\n\n**I'm here whenever you need me!**",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getGenericHealthResponse(): string {
    return `🩺 **Health Consultation Needed**\n\nBased on your symptoms, I recommend consulting with a healthcare professional for proper evaluation.\n\n**General recommendations:**\n• **General Practitioner** - for initial assessment\n• **Specialist** - if referred by your GP\n\n📅 **Book an appointment:**\n• Browse our qualified doctors\n• Choose based on specialty and availability\n• Schedule at your convenience\n\n⚠️ If symptoms are severe or worsening, seek immediate medical attention.`;
  }

  private getGenericPlatformResponse(): string {
    return `🤝 **I'm here to help!**\n\nI can assist you with:\n\n🏥 **Healthcare Services:**\n• Finding the right doctor for your symptoms\n• Booking appointments and consultations\n• Home nursing services\n• Laboratory tests\n• Pharmacy services\n\n💻 **Platform Navigation:**\n• How to use our services\n• Account management\n• Payment and billing\n• Technical support\n\n**What would you like to know more about?**`;
  }

  private getGenericResponse(): string {
    return `🤔 **I'd love to help you!** Could you please tell me more about:\n\n• **Health concerns** - Any symptoms you're experiencing?\n• **Platform help** - What service are you trying to use?\n• **General questions** - About our healthcare platform?\n\n**You can also try the quick action buttons below for common questions!**`;
  }

  /**
   * Context-specific help responses
   */
  private getNursingContextHelp(): string {
    return `🏠 **Home Nursing Services Help**\n\nI see you're on the nursing services page! I can help you with:\n\n**Current Page Actions:**\n• How to select a nursing provider\n• Understanding service pricing\n• Booking nursing appointments\n• Comparing provider qualifications\n\n**Available Services:**\n• General home nursing care\n• Specialized medical care\n• Elderly care assistance\n• Post-surgery recovery support\n\n**Need help with something specific on this page?**`;
  }

  private getDoctorContextHelp(): string {
    return `👩‍⚕️ **Doctor Consultation Help**\n\nI see you're looking for doctor consultations! I can help you with:\n\n**Current Page Actions:**\n• How to find the right specialist\n• Booking consultation appointments\n• Understanding consultation types\n• Comparing doctor profiles\n\n**Consultation Options:**\n• Video consultations\n• In-person visits\n• Specialist referrals\n• Emergency consultations\n\n**What would you like help with?**`;
  }

  private getLabContextHelp(): string {
    return `🔬 **Laboratory Services Help**\n\nI see you're on the lab services page! I can help you with:\n\n**Current Page Actions:**\n• Selecting the right tests\n• Booking sample collection\n• Understanding test procedures\n• Interpreting test requirements\n\n**Available Options:**\n• Home sample collection\n• Lab visit appointments\n• Health check packages\n• Specialized diagnostic tests\n\n**How can I assist you with lab services?**`;
  }

  private getPharmacyContextHelp(): string {
    return `💊 **Pharmacy Services Help**\n\nI see you're on the pharmacy page! I can help you with:\n\n**Current Page Actions:**\n• Uploading prescriptions\n• Finding medications\n• Understanding delivery options\n• Comparing medicine prices\n\n**Available Services:**\n• Prescription medicines\n• Over-the-counter drugs\n• Home delivery\n• Medicine reminders\n\n**What pharmacy assistance do you need?**`;
  }

  private getDashboardContextHelp(): string {
    return `📊 **Patient Dashboard Help**\n\nWelcome to your dashboard! I can help you navigate:\n\n**Dashboard Features:**\n• View upcoming appointments\n• Access medical records\n• Book new services\n• Track order status\n• Manage your profile\n\n**Quick Actions:**\n• Book doctor consultation\n• Schedule home nursing\n• Order lab tests\n• Browse pharmacy\n\n**Where would you like to go next?**`;
  }

  /**
   * Get contextual suggestions based on user input
   */
  getSuggestions(input: string): string[] {
    const suggestions: string[] = [];
    const inputLower = input.toLowerCase();

    // Health-related suggestions
    if (inputLower.includes("pain") || inputLower.includes("hurt")) {
      suggestions.push("I have fever and headache");
      suggestions.push("Chest pain and breathing issues");
      suggestions.push("Back pain after exercise");
    }

    if (inputLower.includes("fever") || inputLower.includes("headache")) {
      suggestions.push("How do I book an appointment?");
      suggestions.push("Emergency - need help now");
      suggestions.push("Stomach pain and nausea");
    }

    if (inputLower.includes("skin") || inputLower.includes("rash")) {
      suggestions.push("Skin rash and itching");
      suggestions.push("How do I book an appointment?");
      suggestions.push("How to find nursing services?");
    }

    // Platform suggestions
    if (inputLower.includes("book") || inputLower.includes("appointment")) {
      suggestions.push("How do I book an appointment?");
      suggestions.push("How to find nursing services?");
      suggestions.push("How to schedule lab tests?");
    }

    // General health suggestions
    if (inputLower.includes("help") || inputLower.includes("need")) {
      suggestions.push("I have fever and headache");
      suggestions.push("How do I book an appointment?");
      suggestions.push("Emergency - need help now");
    }

    // Emergency suggestions
    if (inputLower.includes("emergency") || inputLower.includes("urgent")) {
      suggestions.push("Emergency - need help now");
      suggestions.push("Chest pain and breathing issues");
      suggestions.push("How do I book an appointment?");
    }

    // Default suggestions if no specific match
    if (suggestions.length === 0) {
      suggestions.push("I have fever and headache");
      suggestions.push("How do I book an appointment?");
      suggestions.push("How to find nursing services?");
    }

    return suggestions;
  }
}

export const aiService = new AIService();
export default aiService;
