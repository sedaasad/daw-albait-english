// Level A0 — Module 1: Alphabet & Sounds
// Mirrors the seeded DB content (modules / lessons / lesson_sections / vocabulary_items / quizzes)
// so the existing static LessonDetail reader can render it without a refactor.

import type { Module } from "./curriculum";

const letter = (letter: string, arabic: string, rule: string, examples: { en: string; ar: string }[], special?: string) => ({
  type: "rule" as const,
  titleAr: `حرف ${letter}`,
  data: { letter, arabic, rule, examples, special },
});

const vocab = (titleAr: string, words: { en: string; ar: string }[]) => ({
  type: "vocab" as const,
  titleAr,
  data: { words },
});

export const A0_MODULE_1: Module = {
  id: "a0-m1-alphabet-sounds",
  titleAr: "A0 · الحروف والأصوات",
  titleEn: "A0 · Alphabet & Sounds",
  icon: "🔤",
  bg: "from-blue-600 to-blue-900",
  level: "beginner",
  total: 10,
  locked: false,
  lessons: [
    {
      id: "a0-m1-l1",
      titleAr: "حروف A–M",
      titleEn: "Letters A–M",
      mins: 40,
      sections: [
        vocab("الحروف A–M مع كلمات مثال", [
          { en: "A — Apple", ar: "أ — تفّاحة" },
          { en: "B — Ball", ar: "ب — كرة" },
          { en: "C — Cat", ar: "س/ك — قطّة" },
          { en: "D — Dog", ar: "د — كلب" },
          { en: "E — Egg", ar: "إي — بيضة" },
          { en: "F — Fish", ar: "ف — سمكة" },
          { en: "G — Girl", ar: "ج — بنت" },
          { en: "H — Hat", ar: "هـ — قبّعة" },
          { en: "I — Ice", ar: "آي — ثلج" },
          { en: "J — Jam", ar: "ج (مشدّدة) — مربّى" },
          { en: "K — Kite", ar: "ك — طيّارة ورقيّة" },
          { en: "L — Lion", ar: "ل — أسد" },
          { en: "M — Moon", ar: "م — قمر" },
        ]),
      ],
      quiz: [
        { q: "ما هو الحرف الأول من كلمة Apple؟", opts: ["B", "A", "E", "P"], c: 1, exp: "Apple تبدأ بالحرف A." },
        { q: "ما الكلمة التي تبدأ بحرف D؟", opts: ["Cat", "Egg", "Dog", "Fish"], c: 2, exp: "Dog تبدأ بـ D." },
        { q: "اختر الكلمة التي تطابق 'قمر'", opts: ["Lion", "Moon", "Hat", "Ice"], c: 1, exp: "Moon = قمر." },
      ],
    },
    {
      id: "a0-m1-l2",
      titleAr: "حروف N–Z",
      titleEn: "Letters N–Z",
      mins: 40,
      sections: [
        vocab("الحروف N–Z مع كلمات مثال", [
          { en: "N — Nose", ar: "ن — أنف" },
          { en: "O — Orange", ar: "أو — برتقالة" },
          { en: "P — Pen", ar: "پ — قلم" },
          { en: "Q — Queen", ar: "كيو — ملكة" },
          { en: "R — Rose", ar: "ر — وردة" },
          { en: "S — Sun", ar: "س — شمس" },
          { en: "T — Tea", ar: "ت — شاي" },
          { en: "U — Umbrella", ar: "أ — مظلّة" },
          { en: "V — Van", ar: "ڤ — شاحنة صغيرة" },
          { en: "W — Water", ar: "و — ماء" },
          { en: "X — Box", ar: "كس — صندوق" },
          { en: "Y — Yes", ar: "ي — نعم" },
          { en: "Z — Zebra", ar: "ز — حمار وحشي" },
        ]),
      ],
      quiz: [
        { q: "ما الكلمة التي تبدأ بـ V؟", opts: ["Fan", "Van", "Pen", "Ten"], c: 1, exp: "Van تبدأ بـ V." },
        { q: "ما معنى Queen؟", opts: ["ملك", "ملكة", "أميرة", "معلمة"], c: 1, exp: "Queen = ملكة." },
        { q: "اختر آخر حرف في الأبجدية", opts: ["Y", "X", "Z", "W"], c: 2, exp: "Z هو آخر حرف." },
      ],
    },
    {
      id: "a0-m1-l3",
      titleAr: "الحروف المتحركة القصيرة",
      titleEn: "Short Vowels",
      mins: 45,
      sections: [
        letter("A", "/æ/", "افتح فمك بشكل عريض كأنك تبتسم.", [
          { en: "cat", ar: "قطّة" }, { en: "bat", ar: "مضرب" }, { en: "map", ar: "خريطة" },
        ]),
        letter("E", "/ɛ/", "صوت مفتوح قصير كالكسرة المفتوحة.", [
          { en: "bed", ar: "سرير" }, { en: "pen", ar: "قلم" },
        ]),
        letter("I", "/ɪ/", "ياء قصيرة جداً.", [
          { en: "big", ar: "كبير" }, { en: "sit", ar: "يجلس" },
        ]),
        letter("O", "/ɒ/", "ضمّة مفتوحة.", [
          { en: "hot", ar: "حار" }, { en: "top", ar: "أعلى" },
        ]),
        letter("U", "/ʌ/", "ألف مكتومة.", [
          { en: "cup", ar: "كوب" }, { en: "run", ar: "يجري" },
        ]),
      ],
      quiz: [
        { q: "ما الحرف المتحرك في كلمة cat؟", opts: ["c", "a", "t", "لا يوجد"], c: 1, exp: "حرف a هو المتحرك." },
        { q: "أيّها يحتوي على /ɪ/؟", opts: ["bed", "big", "hot", "cup"], c: 1, exp: "big = /bɪɡ/." },
        { q: "ما معنى hot؟", opts: ["بارد", "حار", "كبير", "صغير"], c: 1, exp: "hot = حار." },
      ],
    },
    {
      id: "a0-m1-l4",
      titleAr: "الفرق بين P و B",
      titleEn: "/p/ vs /b/",
      mins: 45,
      sections: [
        letter("P", "/p/", "صوت غير موجود في العربية — اختبار المحارم: ورقة أمام فمك يجب أن تتحرك.", [
          { en: "pen", ar: "قلم" }, { en: "pig", ar: "خنزير" }, { en: "pan", ar: "مقلاة" }, { en: "pin", ar: "دبّوس" },
        ], "⚠️ P بدون اهتزاز الحنجرة، B باهتزازها."),
        vocab("أزواج صوتية P / B", [
          { en: "pen / Ben", ar: "قلم / اسم" },
          { en: "pig / big", ar: "خنزير / كبير" },
          { en: "pan / ban", ar: "مقلاة / منع" },
          { en: "pin / bin", ar: "دبّوس / سلّة" },
        ]),
      ],
      quiz: [
        { q: "اختر الكلمة التي تبدأ بـ /p/", opts: ["Ben", "Pen", "Den", "Ten"], c: 1, exp: "Pen تبدأ بـ /p/." },
        { q: "ما الفرق بين P و B؟", opts: ["لا فرق", "P هواء فقط، B بصوت", "B هواء فقط", "P حرف عربي"], c: 1, exp: "P بدون اهتزاز، B باهتزاز." },
        { q: "اختر زوج صحيح", opts: ["cat/dog", "pig/big", "pen/sun", "hat/box"], c: 1, exp: "pig/big تختلف في P/B." },
      ],
    },
    {
      id: "a0-m1-l5",
      titleAr: "الفرق بين V و F",
      titleEn: "/v/ vs /f/",
      mins: 45,
      sections: [
        letter("V", "/v/", "ضع أسنانك العلوية على شفتك السفلية وأخرج صوتاً مهتزاً.", [
          { en: "van", ar: "شاحنة صغيرة" }, { en: "vine", ar: "كرمة" }, { en: "very", ar: "جداً" },
        ], "⚠️ ضع يدك على حنجرتك — V يهتز، F لا يهتز."),
        vocab("أزواج صوتية V / F", [
          { en: "van / fan", ar: "شاحنة / مروحة" },
          { en: "vine / fine", ar: "كرمة / بخير" },
          { en: "vase / face", ar: "مزهرية / وجه" },
        ]),
      ],
      quiz: [
        { q: "اختر الكلمة التي تبدأ بـ /v/", opts: ["Fan", "Van", "Ten", "Pen"], c: 1, exp: "Van تبدأ بـ /v/." },
        { q: "ما اختبار التمييز بين V و F؟", opts: ["الشفاه", "الحنجرة", "الأسنان فقط", "الأنف"], c: 1, exp: "V يهتز في الحنجرة، F لا." },
        { q: "أيّ زوج صحيح؟", opts: ["van/man", "vine/fine", "fan/man", "very/many"], c: 1, exp: "vine/fine تختلف في V/F." },
      ],
    },
    {
      id: "a0-m1-l6",
      titleAr: "كلمات CVC",
      titleEn: "CVC Words",
      mins: 50,
      sections: [
        vocab("كلمات ساكن-متحرك-ساكن", [
          { en: "cat", ar: "قطّة" }, { en: "pen", ar: "قلم" }, { en: "sun", ar: "شمس" },
          { en: "map", ar: "خريطة" }, { en: "run", ar: "يجري" }, { en: "sit", ar: "يجلس" },
          { en: "top", ar: "أعلى" }, { en: "hat", ar: "قبّعة" }, { en: "bed", ar: "سرير" },
          { en: "hot", ar: "حار" }, { en: "cup", ar: "كوب" }, { en: "dog", ar: "كلب" },
        ]),
      ],
      quiz: [
        { q: "ما نوع كلمة cat؟", opts: ["VCV", "CVC", "CCV", "VVV"], c: 1, exp: "cat = ساكن-متحرك-ساكن." },
        { q: "اختر كلمة CVC", opts: ["ship", "sun", "chair", "apple"], c: 1, exp: "sun = s-u-n." },
        { q: "ما معنى run؟", opts: ["يجلس", "يجري", "ينام", "يأكل"], c: 1, exp: "run = يجري." },
      ],
    },
    {
      id: "a0-m1-l7",
      titleAr: "الحروف المركّبة sh · ch · th",
      titleEn: "Digraphs",
      mins: 50,
      sections: [
        letter("sh", "/ʃ/", "صوت 'ش' كما في العربية.", [
          { en: "ship", ar: "سفينة" }, { en: "shop", ar: "متجر" }, { en: "fish", ar: "سمكة" },
        ]),
        letter("ch", "/tʃ/", "صوت 'تش' كما في تشيلي.", [
          { en: "chair", ar: "كرسي" }, { en: "cheese", ar: "جبن" },
        ]),
        letter("th", "/θ/ أو /ð/", "ضع لسانك بين أسنانك وانفخ.", [
          { en: "think", ar: "يفكّر" }, { en: "this", ar: "هذا" },
        ], "⚠️ أصعب صوت للناطقين بالعربية — تدرّب أمام المرآة."),
        letter("ph", "/f/", "تنطق مثل F.", [
          { en: "phone", ar: "هاتف" },
        ]),
      ],
      quiz: [
        { q: "كيف ينطق sh؟", opts: ["/s/", "/ʃ/", "/tʃ/", "/θ/"], c: 1, exp: "sh = /ʃ/." },
        { q: "ما الكلمة التي تبدأ بـ ch؟", opts: ["ship", "cheese", "this", "phone"], c: 1, exp: "cheese = /tʃiːz/." },
        { q: "كيف ننطق th في think؟", opts: ["/t/", "/θ/", "/s/", "/z/"], c: 1, exp: "think = /θɪŋk/." },
      ],
    },
    {
      id: "a0-m1-l8",
      titleAr: "الحروف الصامتة",
      titleEn: "Silent Letters",
      mins: 40,
      sections: [
        vocab("حروف تُكتب ولا تُنطق", [
          { en: "know (k صامتة)", ar: "يعرف" },
          { en: "write (w صامتة)", ar: "يكتب" },
          { en: "climb (b صامتة)", ar: "يتسلّق" },
          { en: "lamb (b صامتة)", ar: "حمل" },
          { en: "hour (h صامتة)", ar: "ساعة" },
          { en: "island (s صامتة)", ar: "جزيرة" },
        ]),
      ],
      quiz: [
        { q: "أيّ حرف صامت في know؟", opts: ["n", "k", "o", "w"], c: 1, exp: "k صامتة في kn-." },
        { q: "أيّ حرف صامت في climb؟", opts: ["c", "l", "b", "i"], c: 2, exp: "b صامتة في -mb." },
        { q: "ما الكلمة التي فيها حرف صامت؟", opts: ["cat", "write", "sun", "pen"], c: 1, exp: "write — w صامتة." },
      ],
    },
    {
      id: "a0-m1-l9",
      titleAr: "تهجئة اسمك",
      titleEn: "Spelling Your Name",
      mins: 35,
      sections: [
        vocab("جمل تهجئة الاسم", [
          { en: "My name is Ahmed.", ar: "اسمي أحمد." },
          { en: "How do you spell it?", ar: "كيف تتهجّاها؟" },
          { en: "A — H — M — E — D", ar: "حرفاً حرفاً" },
          { en: "Spell it, please.", ar: "تهجّاها من فضلك." },
          { en: "Letter", ar: "حرف" },
          { en: "Name", ar: "اسم" },
        ]),
      ],
      quiz: [
        { q: "كيف تسأل عن تهجئة اسم؟", opts: ["What is your name?", "How do you spell it?", "Who are you?", "Where are you?"], c: 1, exp: "'How do you spell it?' = كيف تتهجاها؟" },
        { q: "ما معنى 'letter'؟", opts: ["كلمة", "حرف", "جملة", "رقم"], c: 1, exp: "letter = حرف." },
        { q: "اختر الإجابة المهذبة لطلب تهجئة", opts: ["Spell it!", "Spell it, please.", "Tell me", "Write fast"], c: 1, exp: "إضافة please يجعل الطلب مهذباً." },
      ],
    },
    {
      id: "a0-m1-l10",
      titleAr: "مراجعة واختبار الوحدة",
      titleEn: "Module Review & Quiz",
      mins: 60,
      sections: [
        vocab("مفردات للمراجعة", [
          { en: "pen", ar: "قلم" }, { en: "van", ar: "شاحنة" },
          { en: "ship", ar: "سفينة" }, { en: "write", ar: "يكتب" },
          { en: "sun", ar: "شمس" }, { en: "cat", ar: "قطّة" },
        ]),
      ],
      quiz: [
        { q: "حرف P في pen ينطق...", opts: ["مع اهتزاز", "بدون اهتزاز", "ساكن", "حرف عربي"], c: 1, exp: "P بلا اهتزاز." },
        { q: "sh ينطق...", opts: ["/s/", "/ʃ/", "/tʃ/", "/θ/"], c: 1, exp: "sh = /ʃ/." },
        { q: "أيّ كلمة CVC؟", opts: ["ship", "sun", "chair", "apple"], c: 1, exp: "sun = CVC." },
        { q: "الحرف الصامت في write؟", opts: ["w", "r", "i", "t"], c: 0, exp: "w صامتة." },
        { q: "كيف تتهجى اسمك بالإنجليزية؟", opts: ["حرف بحرف", "كلمة كاملة", "بالعربي", "بالأرقام"], c: 0, exp: "حرف بحرف." },
        { q: "V يختلف عن F في...", opts: ["الشكل", "اهتزاز الحنجرة", "المعنى", "لا شيء"], c: 1, exp: "V يهتز." },
      ],
    },
  ],
};
