export interface ProgramDetail {
  slug: string;
  category: string;
  badge: string;
  badgeColor: string;
  title: string;
  tagline: string;
  price: string;
  priceNote: string;
  overview: string;
  whoIsThisFor: string[];
  features: string[];
  deliverables: { title: string; desc: string }[];
  faqs: { question: string; answer: string }[];
  waMessage: string;
  accentColor: string;
}

export const COACHING_PROGRAMS: Record<string, ProgramDetail> = {
  "plans": {
    slug: "plans",
    category: "Monthly Membership",
    badge: "Most Flexible • Monthly Tiers",
    badgeColor: "bg-gym-primary/20 text-gym-primary border-gym-primary/40",
    title: "4 Tier Monthly Online Coaching Plans",
    tagline: "Structured online coaching customized to your experience level and goals.",
    price: "₹699 – ₹1,999",
    priceNote: "per month • cancel anytime",
    overview: "Whether you're taking your very first step in the gym or preparing for an elite transformation, our 4 tiered monthly plans (Starter ₹699, Basic ₹999, Transformation ₹1,499, Premium ₹1,999) provide progressive workout programming and customized nutrition backed by certified coaches.",
    whoIsThisFor: [
      "Beginners wanting guided form and basic diet without expensive personal training.",
      "Intermediates seeking structured progressive overload and calorie breakdown.",
      "Dedicated lifters aiming for drastic body recomposition within 12 weeks.",
      "Athletes wanting high-touch 1-on-1 daily accountability and weekly video check-ins."
    ],
    features: [
      "Personalized workout split (Home or Gym adaptable)",
      "Macro-calculated daily diet & meal structure",
      "Exercise video form library & guidance",
      "Weekly check-ins and measurement adjustments",
      "Direct WhatsApp chat support with Coach Akash & Tanvi",
      "Certified supplement timing and safety guide"
    ],
    deliverables: [
      { title: "Weekly Check-Ins", desc: "Detailed analysis of body weight logs, progress pictures, and habit consistency." },
      { title: "Personalized Diets", desc: "Sustainable macro targets calculated for your specific BMR, TDEE, and food preferences." },
      { title: "Video Lift Reviews", desc: "Upload your lifting videos for biomechanical review and form adjustments." },
      { title: "Direct WhatsApp Line", desc: "Ask doubts directly to Coaches Akash & Tanvi anytime." }
    ],
    faqs: [
      {
        question: "What is the difference between Starter (₹699) and Transformation (₹1,499)?",
        answer: "The Starter plan focuses on essential workout routines and fundamental diet guidelines for beginners. The Transformation plan includes comprehensive macro tracking, body recomposition strategies, supplement timing, and weekly measurement audits."
      },
      {
        question: "Can I do this if I only workout at home?",
        answer: "Yes! All workout splits are customized according to your equipment—whether you have a full gym setup, basic dumbbells, or just bodyweight resistance bands."
      },
      {
        question: "How do I communicate with the coaches?",
        answer: "You get direct WhatsApp access to Coaches Akash & Tanvi. For Premium 1-to-1 clients, weekly video or audio call check-ins are also included."
      }
    ],
    waMessage: "Hi Akash & Tanvi, I want to explore and enroll in your Monthly Coaching Plans.",
    accentColor: "from-gym-primary to-gym-red"
  },
  "powerlifting": {
    slug: "powerlifting",
    category: "Strength & Competition",
    badge: "Olympic-Grade IPF Standards",
    badgeColor: "bg-red-500/20 text-red-400 border-red-500/40",
    title: "Powerlifting Competition & Strength Coaching",
    tagline: "Build a massive Squat, Bench Press, and Deadlift total under certified federation guidance.",
    price: "₹999 – ₹2,999",
    priceNote: "per month • customized competition prep available",
    overview: "Designed for competitive powerlifters and strength enthusiasts wanting to smash personal records. Coached under official IPF rules, covering periodized peaking cycles, referee command standards, and weight-class management.",
    whoIsThisFor: [
      "Athletes preparing for district, state, or national powerlifting meets.",
      "Lifters stuck at plateaus on the Big 3 (Squat, Bench, Deadlift).",
      "Beginners wanting to learn correct platform form and avoid injury.",
      "Competitors needing weight-class cutting and meet-day attempt selection."
    ],
    features: [
      "Customized Squat, Bench Press & Deadlift periodization",
      "RPE / Percentage-based progressive overload programming",
      "Video lift breakdown: bar path, depth, pause & lockout command criteria",
      "Deload cycle timing & fatigue management",
      "Weight-class water & calorie cutting strategy",
      "Competition day warmup timeline & attempt selection strategy"
    ],
    deliverables: [
      { title: "SBD Form Analysis", desc: "Frame-by-frame breakdown of your squats, benches, and pulls to fix sticking points." },
      { title: "Peaking Protocol", desc: "Tapering programs designed to peak your nervous system on meet day." },
      { title: "Attempt Selection", desc: "Strategic 1st, 2nd, and 3rd attempt guidance to secure your highest platform Total." },
      { title: "Injury Prevention", desc: "Joint stacking, hip mobility, and bracing protocols under heavy platform loads." }
    ],
    faqs: [
      {
        question: "Do I need to be an advanced lifter to join?",
        answer: "No! We coach lifters of all levels—from complete novices wanting to learn safe lifting technique to seasoned competitors chasing national qualifying totals."
      },
      {
        question: "Does this follow IPF rules?",
        answer: "Yes, our programming is built strictly around IPF technical rulebook standards including depth criteria, pauses, and approved equipment specifications."
      }
    ],
    waMessage: "Hi Akash & Tanvi, I want to enroll in Powerlifting Coaching & strength programming.",
    accentColor: "from-red-600 to-gym-primary"
  },
  "bodybuilding": {
    slug: "bodybuilding",
    category: "Physique & Hypertrophy",
    badge: "Aesthetics & Muscle Sculpting",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/40",
    title: "Physique & Bodybuilding Coaching",
    tagline: "Maximize muscle hypertrophy, shape aesthetic proportions, and achieve stage-ready conditioning.",
    price: "₹999 – ₹2,999",
    priceNote: "per month • tailored hypertrophy splits",
    overview: "Scientific muscle hypertrophy coaching focusing on progressive tension, optimal exercise selection, nutrient partitioning, and symmetry sculpting. Built for bodybuilders, classic physique athletes, and fitness models.",
    whoIsThisFor: [
      "Anyone wanting to build lean muscle mass with balanced aesthetic symmetry.",
      "Intermediate lifters looking to sculpt lagging body parts (delts, lats, arms, quads).",
      "Competitors preparing for men's physique, classic, or bikini bodybuilding shows.",
      "Individuals wanting to transform from 'skinny-fat' to a chiseled muscular physique."
    ],
    features: [
      "High-stimulus, low-fatigue hypertrophy workout splits",
      "Optimal exercise selection matched to your body mechanics",
      "Progressive overload logbook tracking (reps, weight, sets)",
      "Targeted macro and nutrient timing for muscle protein synthesis",
      "Weak-point specialization micro-cycles",
      "Posing and stage presentation guidance for competitors"
    ],
    deliverables: [
      { title: "Custom Hypertrophy Split", desc: "Push/Pull/Legs, Upper/Lower, or Arnold split designed for your recovery capacity." },
      { title: "Macro Partitioning", desc: "Optimal protein, carbohydrate, and fat timing around your training windows." },
      { title: "Physique Progress Reviews", desc: "Bi-weekly front/side/back photo audits to monitor symmetry and conditioning." },
      { title: "Peak Week Prep", desc: "Sodium, water, and carb manipulation protocol for competition readiness." }
    ],
    faqs: [
      {
        question: "Will I get too bulky?",
        answer: "Muscle gain is completely controlled by calorie balance and volume. We calibrate your program specifically to your aesthetic preference, whether athletic and lean or maximum size."
      },
      {
        question: "Do you recommend supplements?",
        answer: "As Certified Supplement Specialists, we only advise evidence-based essentials like Whey Protein, Creatine Monohydrate, and essential vitamins—no overpriced or harmful substances."
      }
    ],
    waMessage: "Hi Akash & Tanvi, I am interested in Physique & Bodybuilding Coaching.",
    accentColor: "from-amber-500 to-gym-primary"
  },
  "fat-loss": {
    slug: "fat-loss",
    category: "Transformation",
    badge: "100% Sustainable Deficit",
    badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/40",
    title: "Fat Loss & Body Recomposition",
    tagline: "Burn stubborn body fat while preserving lean muscle mass—no starvation diets.",
    price: "₹699 – ₹1,499",
    priceNote: "per month • flexible nutrition approach",
    overview: "Our Fat Loss program rejects crash diets and severe restrictions. We calculate a precise, sustainable caloric deficit tailored to your lifestyle, combined with muscle-preserving strength workouts and manageable daily activity.",
    whoIsThisFor: [
      "Individuals struggling with stubborn belly or lower-body fat.",
      "Desk workers wanting to lose weight without feeling starved or lethargic.",
      "People who have suffered from yo-yo dieting in the past.",
      "Post-pregnancy or busy professionals wanting flexible home or gym workouts."
    ],
    features: [
      "Customized sustainable calorie deficit calculations (BMR/TDEE)",
      "High-protein flexible meal options (Veg & Non-Veg plans)",
      "Resistance training splits to ensure muscle preservation",
      "Step count & low-impact cardio protocols (NEAT boosting)",
      "Weekly weight scale & circumference measurement audits",
      "Social eating & party dining strategies"
    ],
    deliverables: [
      { title: "Non-Starvation Diet", desc: "Enjoy your favorite foods in calculated moderation while steadily dropping fat." },
      { title: "Weekly Body Audits", desc: "Track measurements across waist, hips, and chest alongside the scale." },
      { title: "Metabolic Protection", desc: "Strategic diet breaks and refeed days to prevent metabolic slowdown." },
      { title: "Daily Habit Support", desc: "Hydration, sleep, and step-count accountability via direct WhatsApp." }
    ],
    faqs: [
      {
        question: "Do I have to stop eating Indian meals or rotis/rice?",
        answer: "Not at all! We build your plan around familiar, home-cooked Indian meals including dal, paneer, roti, rice, chicken, or eggs, adjusting quantities to fit your macros."
      },
      {
        question: "How much weight can I expect to lose?",
        answer: "A safe and sustainable rate is 0.5kg to 1kg per week, which ensures that what you lose is pure body fat rather than muscle or water."
      }
    ],
    waMessage: "Hi Akash & Tanvi, I want to enroll in the Fat Loss & Transformation Coaching program.",
    accentColor: "from-rose-500 to-gym-primary"
  },
  "muscle-gain": {
    slug: "muscle-gain",
    category: "Hypertrophy & Bulking",
    badge: "Clean Calorie Surplus",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    title: "Clean Muscle Gain & Weight Gain",
    tagline: "Put on quality lean muscle without accumulating unwanted belly fat.",
    price: "₹699 – ₹1,499",
    priceNote: "per month • clean nutrition",
    overview: "For hardgainers and lifters struggling to pack on size. We structure clean caloric surpluses packed with calorie-dense, easily digestible foods paired with heavy compound lifting.",
    whoIsThisFor: [
      "Hardgainers who struggle to gain weight despite eating often.",
      "Individuals wanting to transform a skinny physique into an athletic muscular build.",
      "Lifters wanting a structured lean bulk without high body fat gain.",
      "Athletes needing increased bodyweight and power for contact sports."
    ],
    features: [
      "Calculated lean caloric surplus (250–400 kcal above maintenance)",
      "Nutrient-dense, easy-digestion meal combinations for high appetite",
      "Compound lifting focus for full-body density and strength",
      "Progressive overload logbook system",
      "Digestive enzyme and gut health strategies",
      "Weekly scale weight and strength metric tracking"
    ],
    deliverables: [
      { title: "High-Calorie Diet Plan", desc: "Smoothie recipes, healthy fats, and clean carb sources that don't leave you bloated." },
      { title: "Strength Overload Log", desc: "Track weight and reps systematically to guarantee progressive muscle stimulation." },
      { title: "Recovery Optimization", desc: "Sleep hygiene and rest day scheduling to maximize muscle protein synthesis." },
      { title: "WhatsApp Coach Access", desc: "Troubleshoot low appetite or training stagnation anytime with Akash & Tanvi." }
    ],
    faqs: [
      {
        question: "I have a very fast metabolism and cannot gain weight. Will this work?",
        answer: "Yes! Most hardgainers simply overestimate their caloric intake. We provide easy-to-consume liquid meals and energy-dense foods that hit your surplus comfortably."
      },
      {
        question: "Will I get a belly during this gain phase?",
        answer: "No. By using a controlled clean surplus (rather than 'dirty bulking') and heavy resistance training, the majority of weight gained is pure lean tissue."
      }
    ],
    waMessage: "Hi Akash & Tanvi, I want to start my Clean Muscle Gain & Weight Gain Coaching.",
    accentColor: "from-emerald-500 to-teal-500"
  },
  "clinical": {
    slug: "clinical",
    category: "Clinical Lifestyle & Wellness",
    badge: "PCOS • Thyroid • Diabetes",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/40",
    title: "PCOS, Thyroid & Diabetes Lifestyle Nutrition",
    tagline: "Empowering metabolic balance, hormonal harmony, and sustainable energy through specialized fitness and nutrition.",
    price: "₹999 – ₹1,999",
    priceNote: "per month • specialized support alongside medical counsel",
    overview: "Chronic hormonal and metabolic challenges require a sensitive, evidence-informed approach. Head Coach Tanvi and Coach Akash customize anti-inflammatory nutrition and targeted resistance training designed to improve insulin sensitivity and support thyroid health alongside your doctor's care.",
    whoIsThisFor: [
      "Women dealing with PCOD / PCOS symptoms, irregular cycles, or stubborn hormonal weight.",
      "Individuals with Hypothyroidism suffering from slow metabolism, fatigue, and water retention.",
      "People with pre-diabetes or Type-2 Diabetes seeking low-GI nutrition to manage insulin.",
      "Anyone wanting a holistic, stress-reducing fitness and lifestyle routine."
    ],
    features: [
      "Anti-inflammatory, hormone-supportive meal planning",
      "Low Glycemic Index (GI) carb structuring for insulin sensitivity",
      "Hormone-friendly resistance training (avoiding excessive cortisol spike)",
      "Menstrual cycle-synced workout intensity adjustments",
      "Micronutrient planning (Zinc, Magnesium, Vitamin D3, Omega-3)",
      "Full disclaimer: Guidance provided alongside your physician's care"
    ],
    deliverables: [
      { title: "Hormone-Supportive Nutrition", desc: "Whole-food meals rich in healthy fats, fiber, and lean protein to balance blood sugar." },
      { title: "Cycle-Synced Training", desc: "Adjusting training loads across follicular, ovulatory, and luteal phases." },
      { title: "Stress & Sleep Protocol", desc: "Techniques to reduce cortisol elevation that hinders hormonal recovery." },
      { title: "Direct Tanvi & Akash WhatsApp", desc: "Empathetic, dedicated coaching support from certified specialists." }
    ],
    faqs: [
      {
        question: "Is this a medical cure or treatment?",
        answer: "No. We provide fitness, nutritional, and lifestyle support to complement your physician's guidance. We make zero medical cure claims and always encourage ongoing doctor consultation."
      },
      {
        question: "Will heavy lifting make PCOS worse?",
        answer: "On the contrary! Progressive resistance training is scientifically proven to improve insulin receptor sensitivity in muscle tissue, which is fundamental to managing PCOS symptoms."
      }
    ],
    waMessage: "Hi Tanvi & Akash, I would like to consult regarding PCOS / Thyroid / Diabetes lifestyle nutrition support.",
    accentColor: "from-purple-500 to-pink-500"
  }
};
