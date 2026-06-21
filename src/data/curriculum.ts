// Daw Albait English curriculum (from final design spec)
// All modules, lessons, sections, quizzes, verbs and quick-vocab live here.

export type SectionType = "rule" | "formula" | "dialogue" | "vocab";
export type Level = "beginner" | "intermediate" | "advanced";

export interface Example { en: string; ar: string }

export interface RuleData {
  letter: string;
  arabic: string;
  rule: string;
  examples: Example[];
  special?: string;
}

export interface FormulaData {
  formula: string;
  formulaEn: string;
  tags?: string[];
  positive?: Example[];
  negative?: Example[];
  question?: Example[];
  note?: string;
}

export interface DialogueData {
  exchanges: { sp: number; en: string; ar: string }[];
}

export interface VocabData {
  words: { en: string; ar: string }[];
}

export type Section =
  | { type: "rule"; titleAr: string; data: RuleData }
  | { type: "formula"; titleAr: string; data: FormulaData }
  | { type: "dialogue"; titleAr: string; data: DialogueData }
  | { type: "vocab"; titleAr: string; data: VocabData };

export interface QuizItem {
  q: string;
  opts: string[];
  c: number;
  exp: string;
}

export interface Lesson {
  id: string;
  titleAr: string;
  titleEn: string;
  mins: number;
  sections: Section[];
  quiz: QuizItem[];
}

export interface Module {
  id: string;
  titleAr: string;
  titleEn: string;
  icon: string;
  bg: string; // tailwind gradient classes (from-... to-...)
  level: Level;
  total: number;
  locked: boolean;
  lessons: Lesson[];
}

export const LEVEL_LABEL: Record<Level | "all", string> = {
  all: "الكل",
  beginner: "🌱 مبتدئ",
  intermediate: "⭐ متوسط",
  advanced: "🏆 متقدم",
};

export const VERBS = [
  { v1: "begin", v2: "began", v3: "begun", ar: "يبدأ" },
  { v1: "break", v2: "broke", v3: "broken", ar: "يكسر" },
  { v1: "bring", v2: "brought", v3: "brought", ar: "يحضر" },
  { v1: "build", v2: "built", v3: "built", ar: "يبني" },
  { v1: "buy", v2: "bought", v3: "bought", ar: "يشتري" },
  { v1: "catch", v2: "caught", v3: "caught", ar: "يمسك" },
  { v1: "choose", v2: "chose", v3: "chosen", ar: "يختار" },
  { v1: "come", v2: "came", v3: "come", ar: "يأتي" },
  { v1: "do", v2: "did", v3: "done", ar: "يفعل" },
  { v1: "drink", v2: "drank", v3: "drunk", ar: "يشرب" },
  { v1: "drive", v2: "drove", v3: "driven", ar: "يقود" },
  { v1: "eat", v2: "ate", v3: "eaten", ar: "يأكل" },
  { v1: "fall", v2: "fell", v3: "fallen", ar: "يسقط" },
  { v1: "feel", v2: "felt", v3: "felt", ar: "يشعر" },
  { v1: "find", v2: "found", v3: "found", ar: "يجد" },
  { v1: "fly", v2: "flew", v3: "flown", ar: "يطير" },
  { v1: "get", v2: "got", v3: "gotten", ar: "يحصل" },
  { v1: "give", v2: "gave", v3: "given", ar: "يعطي" },
  { v1: "go", v2: "went", v3: "gone", ar: "يذهب" },
  { v1: "grow", v2: "grew", v3: "grown", ar: "ينمو" },
  { v1: "have", v2: "had", v3: "had", ar: "يملك" },
  { v1: "hear", v2: "heard", v3: "heard", ar: "يسمع" },
  { v1: "know", v2: "knew", v3: "known", ar: "يعرف" },
  { v1: "leave", v2: "left", v3: "left", ar: "يغادر" },
  { v1: "make", v2: "made", v3: "made", ar: "يصنع" },
  { v1: "meet", v2: "met", v3: "met", ar: "يقابل" },
  { v1: "run", v2: "ran", v3: "run", ar: "يجري" },
  { v1: "say", v2: "said", v3: "said", ar: "يقول" },
  { v1: "see", v2: "saw", v3: "seen", ar: "يرى" },
  { v1: "speak", v2: "spoke", v3: "spoken", ar: "يتكلم" },
  { v1: "take", v2: "took", v3: "taken", ar: "يأخذ" },
  { v1: "teach", v2: "taught", v3: "taught", ar: "يعلم" },
  { v1: "think", v2: "thought", v3: "thought", ar: "يفكر" },
  { v1: "write", v2: "wrote", v3: "written", ar: "يكتب" },
];

export const QUICK_VOCAB = [
  { en: "Strategy", ar: "استراتيجية", emoji: "🎯" },
  { en: "Ambition", ar: "طموح", emoji: "🚀" },
  { en: "Knowledge", ar: "معرفة", emoji: "📚" },
  { en: "Practice", ar: "ممارسة", emoji: "💪" },
  { en: "Success", ar: "نجاح", emoji: "🏆" },
  { en: "Patience", ar: "صبر", emoji: "⏳" },
];

export const MODULES: Module[] = [
  {
    id: "phonetics",
    titleAr: "علم الأصوات",
    titleEn: "Phonetics",
    icon: "🔤",
    bg: "from-blue-600 to-blue-900",
    level: "beginner",
    total: 6,
    locked: false,
    lessons: [
      {
        id: "vowels",
        titleAr: "الحروف المتحركة",
        titleEn: "Vowels: A·E·I·O·U",
        mins: 20,
        sections: [
          {
            type: "rule",
            titleAr: "حرف A – الألف",
            data: {
              letter: "A",
              arabic: "أ",
              rule: "ينطق مثل حرف الألف في العربية. حركته هي الفتحة.",
              examples: [
                { en: "Strategy", ar: "استراتيجية" },
                { en: "Star", ar: "نجمة" },
                { en: "Back", ar: "خلف/ظهر" },
                { en: "Bad", ar: "سيء" },
                { en: "Band", ar: "فرقة" },
              ],
              special: "⚠️ إذا جاء بعد حرف A ← L ينطق مثل O\nمثال: Almost · Always · Already",
            },
          },
          {
            type: "rule",
            titleAr: "حرف E – ياء خفيفة",
            data: {
              letter: "E",
              arabic: "ـيـ خفيفة",
              rule: "ينطق في وسط الكلمة ياء خفيفة. حركته الإمالة السريعة.",
              examples: [
                { en: "Get", ar: "ينال" },
                { en: "Kept", ar: "محفوظ" },
                { en: "Desk", ar: "درج" },
                { en: "Member", ar: "عضو" },
                { en: "Spell", ar: "يتهجى" },
              ],
            },
          },
          {
            type: "rule",
            titleAr: "حرف I – ياء مكسورة",
            data: {
              letter: "I",
              arabic: "ـيـ مكسورة",
              rule: "ينطق ياء مكسورة بدون مد. حركته الكسرة.",
              examples: [
                { en: "City", ar: "مدينة" },
                { en: "Simple", ar: "بسيط" },
                { en: "Skill", ar: "مهارة" },
                { en: "Trip", ar: "رحلة" },
                { en: "Civil", ar: "مدني" },
              ],
            },
          },
          {
            type: "rule",
            titleAr: "حرف O – واو",
            data: {
              letter: "O",
              arabic: "و، غير مشدد",
              rule: "ينطق مثل الواو غير المشدد. حركته الضمة.",
              examples: [
                { en: "Job", ar: "وظيفة" },
                { en: "Sport", ar: "رياضة" },
                { en: "Normal", ar: "طبيعي" },
                { en: "Store", ar: "مخزن" },
                { en: "Cost", ar: "تكلفة" },
              ],
            },
          },
          {
            type: "rule",
            titleAr: "حرف U – همزتان",
            data: {
              letter: "U",
              arabic: "همزتان مفخمتان",
              rule: "ينطق همزتين مفخمتين – كأنه ألف مفتوح مكتوم.",
              examples: [
                { en: "But", ar: "لكن" },
                { en: "Study", ar: "يدرس" },
                { en: "Justice", ar: "عدل" },
                { en: "Funny", ar: "مضحك" },
                { en: "Humble", ar: "متواضع" },
              ],
            },
          },
        ],
        quiz: [
          { q: "كيف ينطق حرف A في كلمة 'Back'؟", opts: ["إي مد", "ألف", "ي", "و"], c: 1, exp: "حرف A = ألف مفتوح مثل الألف العربي" },
          { q: "ما معنى كلمة 'Strategy'؟", opts: ["قوة", "سرعة", "استراتيجية", "مهارة"], c: 2, exp: "Strategy = استراتيجية" },
          { q: "كيف ينطق حرف E في وسط الكلمة؟", opts: ["ألف مد", "واو", "ياء خفيفة سريعة", "همزة"], c: 2, exp: "حرف E في وسط الكلمة = ياء خفيفة سريعة" },
          { q: "ما معنى Humble؟", opts: ["مستعجل", "متواضع", "ممتاز", "متقدم"], c: 1, exp: "Humble = متواضع — مثال على حرف U" },
        ],
      },
      {
        id: "consonants",
        titleAr: "الحروف الساكنة",
        titleEn: "Consonants: B·C·D",
        mins: 25,
        sections: [
          {
            type: "rule",
            titleAr: "حرف B – الباء",
            data: {
              letter: "B",
              arabic: "ب",
              rule: "ينطق مثل الباء العربية تماماً.",
              examples: [
                { en: "Bat", ar: "خفاش" },
                { en: "Book", ar: "كتاب" },
                { en: "Better", ar: "أحسن" },
                { en: "Battle", ar: "معركة" },
              ],
              special: "⚠️ حرف B إذا جاء قبل M ← لا تنطق B\nLamb (حمل) · Bomb (قنبلة) · Comb (مشط)",
            },
          },
          {
            type: "rule",
            titleAr: "حرف C – الكاف/السين",
            data: {
              letter: "C",
              arabic: "ك / س",
              rule: "ينطق (ك) عادةً. إذا جاء بعده E أو I أو Y ← ينطق (س).",
              examples: [
                { en: "Car", ar: "سيارة" },
                { en: "Can", ar: "يستطيع" },
                { en: "Center", ar: "مركز" },
                { en: "City", ar: "مدينة" },
              ],
            },
          },
        ],
        quiz: [
          { q: "ما معنى Bomb؟", opts: ["مشط", "حمل الخروف", "قنبلة", "خفاش"], c: 2, exp: "Bomb = قنبلة. B الأخيرة لا تنطق لوجود M قبلها" },
          { q: "كيف ينطق C في كلمة 'City'؟", opts: ["ج", "س", "ش", "ك"], c: 1, exp: "C + I → تُنطق سين (س)" },
        ],
      },
    ],
  },
  {
    id: "grammar",
    titleAr: "القواعد الأساسية",
    titleEn: "Basic Grammar",
    icon: "📝",
    bg: "from-emerald-600 to-emerald-900",
    level: "beginner",
    total: 5,
    locked: false,
    lessons: [
      {
        id: "present-simple",
        titleAr: "المضارع البسيط",
        titleEn: "Present Simple Tense",
        mins: 30,
        sections: [
          {
            type: "formula",
            titleAr: "معادلة المضارع البسيط",
            data: {
              formula: "الفاعل + فعل + المفعول + ظرف الزمان",
              formulaEn: "Subject + Verb + Object + Time adverb",
              tags: ["usually عادة", "always دائماً", "never أبداً", "sometimes أحياناً", "every day كل يوم"],
              positive: [
                { ar: "أنا أبدأ يومي الساعة 6 صباحاً عادة", en: "I begin my day at 6 o'clock usually." },
                { ar: "نحن نحطم الأرقام القياسية دائماً", en: "We break the records always." },
                { ar: "علي يشرب الماء البارد بعد الصيام", en: "Ali drinks cold water after the fasting." },
              ],
              negative: [
                { ar: "أنا لا أبدأ يومي الساعة 6", en: "I don't begin my day at 6." },
                { ar: "علي لا يشرب الماء البارد", en: "Ali doesn't drink cold water." },
              ],
              question: [
                { ar: "هل تعرف من اخترع الكهرباء؟", en: "Do you know who invented the electricity?" },
                { ar: "هل علي يرى الأمور ببساطة عادة؟", en: "Does Ali see the things simply usually?" },
              ],
              note: "📌 مع He/She/It أضف S للفعل في الإثبات\n📌 مع He/She/It استخدم doesn't في النفي",
            },
          },
        ],
        quiz: [
          { q: "أكمل: Ali ___ cold water every day.", opts: ["drink", "drinks", "drinking", "drank"], c: 1, exp: "للفعل نضيف s مع الضمير المفرد الغائب" },
          { q: "الصيغة الصحيحة: أنا لا أذهب", opts: ["I not go", "I don't go", "I doesn't go", "I am not go"], c: 1, exp: "مع I نستخدم don't" },
          { q: "كيف نصنع السؤال في المضارع البسيط؟", opts: ["Add ? only", "Do/Does + Subject + Verb", "Subject + Verb?", "Did + Verb"], c: 1, exp: "Do/Does + الفاعل + الفعل المجرد" },
        ],
      },
    ],
  },
  {
    id: "irregular",
    titleAr: "الأفعال الشاذة",
    titleEn: "Irregular Verbs (337)",
    icon: "🔀",
    bg: "from-purple-600 to-purple-900",
    level: "beginner",
    total: 4,
    locked: false,
    lessons: [],
  },
  {
    id: "dialogues",
    titleAr: "الحوارات اليومية",
    titleEn: "Daily Dialogues",
    icon: "💬",
    bg: "from-orange-500 to-orange-800",
    level: "beginner",
    total: 6,
    locked: false,
    lessons: [
      {
        id: "hotel",
        titleAr: "في الفندق",
        titleEn: "At the Hotel",
        mins: 20,
        sections: [
          {
            type: "dialogue",
            titleAr: "تسجيل الوصول — Check In",
            data: {
              exchanges: [
                { sp: 0, en: "Good afternoon. Welcome to the hotel. How can I help you?", ar: "مساء الخير. أهلاً بك. كيف أساعدك؟" },
                { sp: 1, en: "I have a reservation under the name Ahmed.", ar: "لدي حجز باسم أحمد." },
                { sp: 0, en: "Let me check... Yes, a single room for two nights.", ar: "دعني أتحقق... غرفة مفردة لليلتين." },
                { sp: 1, en: "Can I get the Wi-Fi password, please?", ar: "هل يمكنني الحصول على كلمة مرور الواي فاي؟" },
                { sp: 0, en: "Of course. It's on your key card. Breakfast is included.", ar: "بالطبع. على بطاقة مفتاحك. الإفطار مشمول." },
              ],
            },
          },
          {
            type: "vocab",
            titleAr: "مفردات الفندق",
            data: {
              words: [
                { en: "Reservation", ar: "حجز" },
                { en: "Check-in", ar: "تسجيل الوصول" },
                { en: "Check-out", ar: "تسجيل المغادرة" },
                { en: "Single room", ar: "غرفة مفردة" },
                { en: "Key card", ar: "بطاقة المفتاح" },
                { en: "Room service", ar: "خدمة الغرف" },
              ],
            },
          },
        ],
        quiz: [
          { q: "ما معنى 'Reservation'؟", opts: ["استقبال", "حجز", "تسجيل", "مغادرة"], c: 1, exp: "Reservation = حجز" },
          { q: "ما معنى 'Check-out'؟", opts: ["تسجيل الوصول", "الدفع", "تسجيل المغادرة", "الغرفة"], c: 2, exp: "Check-out = تسجيل المغادرة" },
        ],
      },
      {
        id: "hospital",
        titleAr: "في المستشفى",
        titleEn: "At the Hospital",
        mins: 20,
        sections: [
          {
            type: "dialogue",
            titleAr: "عند الطبيب",
            data: {
              exchanges: [
                { sp: 1, en: "I'm not feeling well. I'd like to see a doctor.", ar: "لا أشعر بتحسن. أريد رؤية الطبيب." },
                { sp: 0, en: "Do you have an appointment?", ar: "هل لديك موعد؟" },
                { sp: 1, en: "No, it's an emergency.", ar: "لا، إنها حالة طارئة." },
                { sp: 0, en: "Please fill out this form and have a seat.", ar: "من فضلك املأ هذا النموذج واجلس." },
                { sp: 2, en: "Hello. What seems to be the problem?", ar: "مرحباً. ما المشكلة؟" },
                { sp: 1, en: "I've had a high fever and sore throat since yesterday.", ar: "لدي حمى شديدة والتهاب في الحلق منذ أمس." },
                { sp: 2, en: "It looks like a throat infection. I'll prescribe antibiotics.", ar: "يبدو أنها عدوى في الحلق. سأصف مضاداً حيوياً." },
              ],
            },
          },
        ],
        quiz: [
          { q: "كيف تقول 'أريد رؤية الطبيب'؟", opts: ["I want doctor", "I'd like to see a doctor", "I need see doctor", "Doctor please"], c: 1, exp: "I'd like to see a doctor = أريد رؤية الطبيب" },
        ],
      },
    ],
  },
  { id: "medical", titleAr: "الإنجليزية الطبية", titleEn: "Medical English", icon: "🏥", bg: "from-red-600 to-red-900", level: "intermediate", total: 12, locked: true, lessons: [] },
  { id: "scientific", titleAr: "الإنجليزية العلمية", titleEn: "Scientific English", icon: "🔬", bg: "from-indigo-600 to-indigo-900", level: "advanced", total: 22, locked: true, lessons: [] },
  { id: "business", titleAr: "إنجليزية الأعمال", titleEn: "Business English", icon: "💼", bg: "from-amber-600 to-amber-900", level: "advanced", total: 8, locked: true, lessons: [] },
];

export const TOTAL_LESSONS = MODULES.reduce((acc, m) => acc + m.lessons.length, 0);
