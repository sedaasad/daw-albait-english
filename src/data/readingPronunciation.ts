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
  {
    id: "first-job",
    level: "B1",
    title: "Omar's First Job Interview",
    titleAr: "أول مقابلة عمل لعمر",
    sentences: [
      { en: "Although Omar had prepared for weeks, he still felt nervous when he arrived at the tall glass building where the interview was going to take place.", ar: "رغم أن عمر استعد لأسابيع، ظل يشعر بالتوتر عندما وصل إلى المبنى الزجاجي الطويل حيث ستُجرى المقابلة." },
      { en: "The receptionist, who greeted him with a warm smile, asked him to wait in a bright room full of plants and comfortable chairs.", ar: "طلبت منه موظفة الاستقبال، التي حيّته بابتسامة دافئة، أن ينتظر في غرفة مضيئة مليئة بالنباتات والكراسي المريحة." },
      { en: "When the manager finally called his name, Omar took a deep breath, reminded himself of his strengths, and walked confidently into the office.", ar: "عندما نادى المدير اسمه أخيرًا، أخذ عمر نفسًا عميقًا وذكّر نفسه بنقاط قوته ودخل المكتب بثقة." },
      { en: "He explained how he had organised a volunteer project at university, which had taught him how to work with people from different backgrounds.", ar: "شرح كيف نظم مشروعًا تطوعيًا في الجامعة، علّمه كيف يعمل مع أشخاص من خلفيات مختلفة." },
      { en: "Two days later, he received an email saying that the company had been impressed by his attitude and wanted him to start the following month.", ar: "بعد يومين، تلقى رسالة تقول إن الشركة أُعجبت بأسلوبه وتريده أن يبدأ في الشهر التالي." },
    ],
    explanation: [
      "Although = رغم أن، تربط فكرتين متعارضتين في جملة طويلة.",
      "who / which / where ضمائر وصل تضيف معلومات وتطيل الجملة: The receptionist, who greeted him...",
      "had prepared / had organised = الماضي التام لحدث سبق حدثًا آخر في الماضي.",
      "لقراءة الجمل الطويلة: ابحث عن الفعل الرئيسي أولًا ثم أضف التفاصيل حولها.",
    ],
    questions: [
      { q: "كيف شعر عمر عند وصوله؟", options: ["Bored", "Nervous", "Angry"], answer: 1, why: "he still felt nervous." },
      { q: "ماذا نظّم في الجامعة؟", options: ["A sports team", "A volunteer project", "A party"], answer: 1, why: "he had organised a volunteer project." },
      { q: "متى تلقى الرد؟", options: ["Two days later", "The next week", "A month later"], answer: 0, why: "Two days later, he received an email." },
    ],
    glossary: { although: "رغم أن", prepared: "استعد", nervous: "متوتر", arrived: "وصل", building: "مبنى", interview: "مقابلة", receptionist: "موظف استقبال", greeted: "حيّا", warm: "دافئ", comfortable: "مريح", manager: "مدير", finally: "أخيرًا", breath: "نَفَس", reminded: "ذكّر", strengths: "نقاط القوة", confidently: "بثقة", explained: "شرح", organised: "نظّم", volunteer: "تطوعي", university: "جامعة", backgrounds: "خلفيات", received: "تلقى", company: "شركة", impressed: "أُعجب", attitude: "أسلوب/موقف", following: "التالي", place: "مكان" },
  },
  {
    id: "city-future",
    level: "B2",
    title: "Cities of the Future",
    titleAr: "مدن المستقبل",
    sentences: [
      { en: "As the world's population continues to grow, urban planners are increasingly searching for ways to make cities cleaner, safer, and more efficient.", ar: "مع استمرار نمو سكان العالم، يبحث مخططو المدن بشكل متزايد عن طرق لجعل المدن أنظف وأكثر أمانًا وكفاءة." },
      { en: "In several countries, buildings are now being designed with solar panels on their roofs and gardens on their walls, which help to reduce both energy costs and air pollution.", ar: "في عدة دول، تُصمم المباني الآن بألواح شمسية على أسطحها وحدائق على جدرانها، مما يساعد على تقليل تكاليف الطاقة وتلوث الهواء." },
      { en: "If public transport became faster and cheaper, many experts believe that fewer people would rely on private cars, and traffic jams would gradually disappear.", ar: "لو أصبحت المواصلات العامة أسرع وأرخص، يعتقد كثير من الخبراء أن عدد من يعتمدون على السيارات الخاصة سيقل، وسيختفي الزحام تدريجيًا." },
      { en: "However, critics argue that such technology is expensive and that governments should first make sure that basic services are available to everyone.", ar: "لكن المنتقدين يرون أن هذه التقنية مكلفة وأن على الحكومات أولًا التأكد من توفر الخدمات الأساسية للجميع." },
    ],
    explanation: [
      "are being designed = المبني للمجهول في المضارع المستمر.",
      "If ... became ..., ... would ... = الشرط الثاني لافتراض في الحاضر.",
      "However و critics argue that تقدم وجهة نظر مقابلة — مهمة في المقالات.",
      "which help to reduce... تعود على الفكرة السابقة كلها.",
    ],
    questions: [
      { q: "ماذا يوضع على الجدران؟", options: ["Solar panels", "Gardens", "Windows"], answer: 1, why: "gardens on their walls." },
      { q: "ما رأي المنتقدين؟", options: ["It's cheap", "It's expensive", "It's useless"], answer: 1, why: "such technology is expensive." },
    ],
    glossary: { population: "سكان", continues: "يستمر", urban: "حضري", planners: "مخططون", increasingly: "بشكل متزايد", efficient: "فعّال", several: "عدة", designed: "مُصمم", solar: "شمسي", panels: "ألواح", roofs: "أسطح", walls: "جدران", reduce: "يقلل", energy: "طاقة", costs: "تكاليف", pollution: "تلوث", public: "عام", transport: "مواصلات", experts: "خبراء", rely: "يعتمد", private: "خاص", traffic: "مرور", jams: "زحام", gradually: "تدريجيًا", disappear: "يختفي", however: "لكن", critics: "منتقدون", argue: "يجادل", technology: "تقنية", expensive: "مكلف", governments: "حكومات", basic: "أساسي", services: "خدمات", available: "متاح" },
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
