export interface StorySentence { en: string; ar: string }
export interface StoryQuestion { q: string; options: string[]; answer: number; why: string }
export interface Story {
  id: string;
  level: string;
  title: string;
  titleAr: string;
  sentences: StorySentence[];
  explanation: string[]; // Arabic notes on grammar/vocabulary
  questions: StoryQuestion[];
  glossary?: Record<string, string>;
}

export const STORIES: Story[] = [
  {
    id: "sara-morning",
    level: "A0",
    title: "Sara's Morning",
    titleAr: "صباح سارة",
    sentences: [
      { en: "Sara wakes up at seven o'clock.", ar: "تستيقظ سارة في الساعة السابعة." },
      { en: "She drinks a cup of tea.", ar: "تشرب كوبًا من الشاي." },
      { en: "She eats bread and eggs.", ar: "تأكل الخبز والبيض." },
      { en: "Then she takes the bus to school.", ar: "ثم تأخذ الحافلة إلى المدرسة." },
      { en: "Sara is happy because she likes school.", ar: "سارة سعيدة لأنها تحب المدرسة." },
    ],
    explanation: [
      "نستخدم المضارع البسيط للعادات اليومية: wakes, drinks, eats.",
      "مع she / he نضيف s للفعل: she drinks — وليس she drink.",
      "at seven o'clock = في الساعة السابعة (نستخدم at مع الوقت).",
      "because = لأن، تربط السبب بالنتيجة.",
    ],
    questions: [
      { q: "متى تستيقظ سارة؟", options: ["At six", "At seven", "At eight"], answer: 1, why: "النص يقول: at seven o'clock." },
      { q: "ماذا تشرب سارة؟", options: ["Milk", "Coffee", "Tea"], answer: 2, why: "She drinks a cup of tea." },
      { q: "كيف تذهب إلى المدرسة؟", options: ["By bus", "By car", "On foot"], answer: 0, why: "She takes the bus to school." },
    ],
  },
  {
    id: "market",
    level: "A1",
    title: "At the Market",
    titleAr: "في السوق",
    sentences: [
      { en: "Ahmed goes to the market every Friday.", ar: "يذهب أحمد إلى السوق كل يوم جمعة." },
      { en: "He buys apples, bananas, and tomatoes.", ar: "يشتري التفاح والموز والطماطم." },
      { en: "The apples are red and sweet.", ar: "التفاح أحمر وحلو." },
      { en: "He asks, \"How much are these bananas?\"", ar: "يسأل: «بكم هذا الموز؟»" },
      { en: "The seller says, \"Five riyals, please.\"", ar: "يقول البائع: «خمسة ريالات من فضلك.»" },
      { en: "Ahmed pays and says, \"Thank you!\"", ar: "يدفع أحمد ويقول: «شكرًا!»" },
    ],
    explanation: [
      "every Friday = كل جمعة، تدل على عادة متكررة.",
      "How much are...? نستخدمها للسؤال عن السعر للأشياء المعدودة بالجمع.",
      "these = هؤلاء/هذه للجمع القريب، و this للمفرد.",
      "الصفة في الإنجليزية تأتي بعد فعل be: The apples are red.",
    ],
    questions: [
      { q: "متى يذهب أحمد إلى السوق؟", options: ["Every Monday", "Every Friday", "Every day"], answer: 1, why: "every Friday." },
      { q: "ما لون التفاح؟", options: ["Green", "Yellow", "Red"], answer: 2, why: "The apples are red and sweet." },
      { q: "كم سعر الموز؟", options: ["Five riyals", "Ten riyals", "Two riyals"], answer: 0, why: "Five riyals, please." },
    ],
  },
  {
    id: "lost-cat",
    level: "A2",
    title: "The Lost Cat",
    titleAr: "القطة الضائعة",
    sentences: [
      { en: "Last week, Mona lost her cat, Luna.", ar: "الأسبوع الماضي، أضاعت منى قطتها لونا." },
      { en: "She looked everywhere in the house.", ar: "بحثت في كل مكان في المنزل." },
      { en: "Then she put posters on the street.", ar: "ثم وضعت ملصقات في الشارع." },
      { en: "Two days later, a neighbor called her.", ar: "بعد يومين، اتصل بها جار." },
      { en: "Luna was sleeping in his garden!", ar: "كانت لونا نائمة في حديقته!" },
      { en: "Mona was very relieved and thanked him.", ar: "شعرت منى بارتياح كبير وشكرته." },
    ],
    explanation: [
      "الماضي البسيط للأحداث المنتهية: lost, looked, called, thanked.",
      "looked و called أفعال منتظمة (نضيف ed)، أما lost و put فشاذة.",
      "was sleeping = الماضي المستمر لحدث كان جاريًا في وقت معين.",
      "Two days later = بعد يومين، تُستخدم لترتيب الأحداث في القصة.",
    ],
    questions: [
      { q: "ما اسم القطة؟", options: ["Mona", "Luna", "Lily"], answer: 1, why: "her cat, Luna." },
      { q: "من اتصل بمنى؟", options: ["Her friend", "Her mother", "A neighbor"], answer: 2, why: "a neighbor called her." },
      { q: "أين وُجدت القطة؟", options: ["In his garden", "In the street", "In the school"], answer: 0, why: "Luna was sleeping in his garden." },
    ],
  },
];

export interface PronunciationLesson {
  id: string;
  title: string;
  sound: string;
  explanation: string[];
  pairs: [string, string][]; // minimal pairs
  practice: string[]; // phrases to say aloud
}

export const PRONUNCIATION_LESSONS: PronunciationLesson[] = [
  {
    id: "p-b",
    title: "صوت P مقابل B",
    sound: "/p/ – /b/",
    explanation: [
      "لا يوجد صوت P في العربية، لذا يخلط كثيرون بينه وبين B.",
      "P: أغلق الشفتين ثم أطلق دفعة هواء قوية دون اهتزاز الحنجرة (ضع يدك أمام فمك لتشعر بالهواء).",
      "B: نفس حركة الشفتين لكن مع اهتزاز الحنجرة، مثل حرف الباء.",
    ],
    pairs: [["pen", "Ben"], ["pig", "big"], ["park", "bark"], ["pat", "bat"]],
    practice: ["Please pass the paper", "Paul parks his blue bike"],
  },
  {
    id: "f-v",
    title: "صوت F مقابل V",
    sound: "/f/ – /v/",
    explanation: [
      "V غير موجود في العربية الفصحى، وكثيرًا ما يُنطق F.",
      "F: ضع الأسنان العليا على الشفة السفلى وأخرج الهواء دون صوت (مثل الفاء).",
      "V: نفس الوضعية لكن مع اهتزاز الحنجرة — يجب أن تشعر بالاهتزاز في شفتك.",
    ],
    pairs: [["fan", "van"], ["fine", "vine"], ["few", "view"], ["safe", "save"]],
    practice: ["Very good view", "Five vans arrived in February"],
  },
  {
    id: "th",
    title: "صوتا TH",
    sound: "/θ/ – /ð/",
    explanation: [
      "TH له نطقان: /θ/ مثل الثاء في think، و /ð/ مثل الذال في this.",
      "ضع طرف اللسان بين الأسنان بلطف وأخرج الهواء.",
      "تجنب نطقه S أو Z أو T: think وليس sink أو tink.",
    ],
    pairs: [["think", "sink"], ["three", "tree"], ["they", "day"], ["thank", "tank"]],
    practice: ["Thank you for the three things", "This is their brother"],
  },
  {
    id: "short-long-i",
    title: "الصائت القصير والطويل i",
    sound: "/ɪ/ – /iː/",
    explanation: [
      "/ɪ/ قصير ومرتخٍ كما في ship، و /iː/ طويل ومشدود كما في sheep.",
      "الفرق في الطول وشد الشفتين يغيّر المعنى تمامًا.",
      "تمرّن بإطالة /iː/ مع ابتسامة خفيفة.",
    ],
    pairs: [["ship", "sheep"], ["sit", "seat"], ["live", "leave"], ["fill", "feel"]],
    practice: ["Please sit in this seat", "I live here but I leave at six"],
  },
];
