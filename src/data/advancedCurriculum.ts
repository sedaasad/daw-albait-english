import type { Module, Lesson, Section, QuizItem, Example } from "./curriculum";

// Teacher-review needed: this content was written by the assistant, not taken from the source book.

const ex = (en: string, ar: string): Example => ({ en, ar });
const vocab = (titleAr: string, words: [string, string][]): Section => ({
  type: "vocab", titleAr, data: { words: words.map(([en, ar]) => ({ en, ar })) },
});
const dialogue = (titleAr: string, lines: [0 | 1 | 2, string, string, string?, string?][]): Section => ({
  type: "dialogue", titleAr,
  data: { exchanges: lines.map(([sp, en, ar, ken, kar]) => ({ sp, en, ar, ...(ken ? { keyword: { en: ken, ar: kar! } } : {}) })) },
} as Section);
const formula = (titleAr: string, f: string, fEn: string, positive: Example[], negative?: Example[], question?: Example[], note?: string): Section => ({
  type: "formula", titleAr, data: { formula: f, formulaEn: fEn, positive, negative, question, note },
});
const q = (question: string, opts: string[], c: number, exp: string): QuizItem => ({ q: question, opts, c, exp });
const lesson = (id: string, titleAr: string, titleEn: string, mins: number, sections: Section[], quiz: QuizItem[]): Lesson =>
  ({ id, titleAr, titleEn, mins, sections, quiz });
const mod = (m: Omit<Module, "total" | "locked">): Module => ({ ...m, total: m.lessons.length, locked: false });

export const EXTRA_MODULES: Module[] = [
  mod({
    id: "b1", titleAr: "المستوى المتوسط B1", titleEn: "Intermediate B1", icon: "🌱", bg: "from-teal-500 to-teal-800", level: "intermediate",
    lessons: [
      lesson("b1-present-perfect", "المضارع التام", "Present Perfect", 25, [
        formula("التركيب", "الفاعل + have/has + التصريف الثالث", "Subject + have/has + past participle",
          [ex("I have visited Egypt twice.", "زرت مصر مرتين."), ex("She has finished her homework.", "أنهت واجبها.")],
          [ex("We haven't seen that film yet.", "لم نشاهد ذلك الفيلم بعد.")],
          [ex("Have you ever eaten sushi?", "هل سبق أن أكلت السوشي؟")],
          "نستخدمه لتجربة في الحياة أو حدث له أثر الآن.\nكلمات مفتاحية: ever, never, already, yet, since, for."),
        dialogue("حوار: تجارب السفر", [
          [0, "Have you ever travelled abroad?", "هل سبق أن سافرت للخارج؟", "abroad", "للخارج"],
          [1, "Yes, I've been to Turkey and Malaysia.", "نعم، ذهبت إلى تركيا وماليزيا.", "I've been", "ذهبت / زرت"],
          [0, "How long have you lived in this city?", "منذ متى تعيش في هذه المدينة؟", "how long", "منذ متى"],
          [1, "I've lived here for five years.", "أعيش هنا منذ خمس سنوات.", "for", "لمدة"],
        ]),
        vocab("مفردات", [["experience", "تجربة"], ["already", "بالفعل"], ["yet", "بعد"], ["since", "منذ"], ["abroad", "بالخارج"], ["recently", "مؤخرًا"]]),
      ], [
        q("اختر الصحيح:", ["She have finished.", "She has finished.", "She finished has.", "She has finish."], 1, "مع she نستخدم has + التصريف الثالث."),
        q("I've lived here ___ 2019.", ["for", "since", "ago", "yet"], 1, "since مع نقطة زمنية محددة."),
        q("ما معنى 'Have you ever...?'", ["هل سوف...؟", "هل سبق أن...؟", "هل تريد...؟", "هل يجب...؟"], 1, "ever = في أي وقت مضى."),
      ]),
      lesson("b1-opinions", "التعبير عن الرأي", "Giving Opinions", 20, [
        formula("عبارات الرأي", "In my opinion / I think / I believe + جملة", "Opinion phrase + clause",
          [ex("In my opinion, online learning is very useful.", "في رأيي، التعلم عبر الإنترنت مفيد جدًا."), ex("I believe that reading improves vocabulary.", "أعتقد أن القراءة تحسّن المفردات.")],
          [ex("I don't think it's a good idea.", "لا أعتقد أنها فكرة جيدة.")],
          [ex("What do you think about it?", "ما رأيك في ذلك؟")]),
        dialogue("حوار: نقاش", [
          [0, "What do you think about working from home?", "ما رأيك في العمل من المنزل؟", "what do you think", "ما رأيك"],
          [1, "I think it saves time, but it can feel lonely.", "أعتقد أنه يوفر الوقت، لكنه قد يشعرك بالوحدة.", "saves time", "يوفر الوقت"],
          [0, "I agree with you. I miss my colleagues.", "أتفق معك. أفتقد زملائي.", "agree", "أتفق"],
          [1, "On the other hand, there is no traffic!", "من ناحية أخرى، لا يوجد زحام!", "on the other hand", "من ناحية أخرى"],
        ]),
        vocab("مفردات", [["agree", "يوافق"], ["disagree", "يعارض"], ["advantage", "ميزة"], ["disadvantage", "عيب"], ["however", "ومع ذلك"], ["opinion", "رأي"]]),
      ], [
        q("كيف تقول 'لا أعتقد ذلك'؟", ["I not think so.", "I don't think so.", "I think not so.", "No think."], 1, "النفي: I don't think so."),
        q("'On the other hand' تعني:", ["في النهاية", "من ناحية أخرى", "على اليد", "بالإضافة"], 1, "تُستخدم لعرض وجهة مقابلة."),
      ]),
    ],
  }),
  mod({
    id: "b2", titleAr: "فوق المتوسط B2", titleEn: "Upper-Intermediate B2", icon: "🌿", bg: "from-emerald-600 to-emerald-900", level: "intermediate",
    lessons: [
      lesson("b2-conditionals", "الجمل الشرطية الثانية والثالثة", "Second & Third Conditionals", 25, [
        formula("الشرط الثاني (افتراض حاضر)", "If + ماضٍ بسيط ، would + فعل", "If + past simple, would + verb",
          [ex("If I had more time, I would learn Spanish.", "لو كان لدي وقت أكثر، لتعلمت الإسبانية.")], undefined,
          [ex("What would you do if you won the lottery?", "ماذا كنت ستفعل لو ربحت اليانصيب؟")]),
        formula("الشرط الثالث (ندم على الماضي)", "If + had + تصريف ثالث ، would have + تصريف ثالث", "If + past perfect, would have + p.p.",
          [ex("If I had studied harder, I would have passed the exam.", "لو درست بجد أكثر، لنجحت في الامتحان.")],
          [ex("If she hadn't missed the bus, she wouldn't have been late.", "لو لم يفتها الباص، لما تأخرت.")]),
        dialogue("حوار: لو...", [
          [0, "If you could live anywhere, where would you live?", "لو استطعت العيش في أي مكان، أين ستعيش؟", "could", "استطعت"],
          [1, "I would live near the sea, somewhere quiet.", "سأعيش قرب البحر، في مكان هادئ.", "would", "سـ (افتراض)"],
          [0, "If I had known that, I would have visited you.", "لو كنت أعرف ذلك، لزرتك.", "had known", "كنت أعرف"],
          [1, "Next time, I'll tell you in advance.", "المرة القادمة سأخبرك مسبقًا.", "in advance", "مسبقًا"],
        ]),
        vocab("مفردات", [["regret", "يندم"], ["imagine", "يتخيل"], ["consequence", "نتيجة"], ["otherwise", "وإلا"], ["unless", "ما لم"], ["in advance", "مسبقًا"]]),
      ], [
        q("If I ___ rich, I would travel.", ["am", "was/were", "will be", "have been"], 1, "الشرط الثاني: If + ماضٍ بسيط."),
        q("الشرط الثالث يتحدث عن:", ["المستقبل", "عادة", "ماضٍ لم يحدث", "حقيقة علمية"], 2, "يعبر عن ندم أو افتراض في الماضي."),
      ]),
      lesson("b2-passive", "المبني للمجهول", "The Passive Voice", 20, [
        formula("التركيب", "المفعول + be + التصريف الثالث (+ by الفاعل)", "Object + be + past participle",
          [ex("The bridge was built in 1990.", "بُني الجسر عام 1990."), ex("English is spoken all over the world.", "تُتحدث الإنجليزية في كل العالم.")],
          [ex("The letter hasn't been sent yet.", "لم تُرسل الرسالة بعد.")],
          [ex("When was this book written?", "متى كُتب هذا الكتاب؟")],
          "نستخدمه عندما يكون الفعل أهم من الفاعل، وهو شائع في الأخبار والكتابة الرسمية."),
        vocab("مفردات", [["build", "يبني"], ["invent", "يخترع"], ["publish", "ينشر"], ["design", "يصمم"], ["produce", "ينتج"], ["discover", "يكتشف"]]),
      ], [
        q("حوّل: They make cars here.", ["Cars made here.", "Cars are made here.", "Cars are make here.", "Cars making here."], 1, "be + التصريف الثالث."),
        q("The telephone ___ by Bell.", ["invented", "was invented", "is invent", "has invent"], 1, "حدث ماضٍ: was invented."),
      ]),
    ],
  }),
  mod({
    id: "c1", titleAr: "المستوى المتقدم C1", titleEn: "Advanced C1", icon: "🌳", bg: "from-sky-600 to-sky-900", level: "advanced",
    lessons: [
      lesson("c1-inversion", "التقديم للتأكيد", "Inversion for Emphasis", 25, [
        formula("التركيب", "ظرف نفي + فعل مساعد + الفاعل + الفعل", "Negative adverbial + auxiliary + subject + verb",
          [ex("Never have I seen such a beautiful view.", "لم أرَ قط منظرًا بهذا الجمال."), ex("Not only did she win, but she also broke the record.", "لم تفز فقط، بل حطمت الرقم القياسي أيضًا."), ex("Rarely do we get such an opportunity.", "نادرًا ما نحصل على فرصة كهذه.")],
          undefined, undefined, "أسلوب رسمي يستخدم في الخطابات والكتابة الأكاديمية."),
        dialogue("حوار: مقابلة رسمية", [
          [0, "Could you describe your greatest achievement?", "هل يمكنك وصف أعظم إنجازاتك؟", "achievement", "إنجاز"],
          [1, "Not only did I lead the project, but I also delivered it ahead of schedule.", "لم أقد المشروع فحسب، بل سلّمته قبل الموعد.", "ahead of schedule", "قبل الموعد"],
          [0, "Impressive. How did you handle pressure?", "مثير للإعجاب. كيف تعاملت مع الضغط؟", "handle", "تتعامل"],
          [1, "Seldom do I panic; I prioritise and delegate.", "نادرًا ما أرتبك؛ أرتّب الأولويات وأفوّض.", "delegate", "يفوّض"],
        ]),
        vocab("مفردات", [["seldom", "نادرًا"], ["achievement", "إنجاز"], ["delegate", "يفوّض"], ["prioritise", "يرتب الأولويات"], ["remarkable", "لافت"], ["nevertheless", "مع ذلك"]]),
      ], [
        q("اختر الصحيح:", ["Never I have seen...", "Never have I seen...", "Never seen I have...", "I never have seen..."], 1, "بعد Never يأتي الفعل المساعد ثم الفاعل."),
        q("'Seldom' تعني:", ["دائمًا", "غالبًا", "نادرًا", "أبدًا"], 2, "Seldom = نادرًا."),
      ]),
      lesson("c1-hedging", "التحفظ في الكتابة الأكاديمية", "Hedging Language", 20, [
        formula("عبارات التحفظ", "may / might / appear to / it is likely that", "Hedging devices",
          [ex("The results suggest that the method may be effective.", "تشير النتائج إلى أن الطريقة قد تكون فعالة."), ex("It is likely that prices will rise.", "من المرجح أن ترتفع الأسعار.")],
          undefined, undefined, "التحفظ يجعل الادعاءات دقيقة ويتجنب التعميم."),
        vocab("مفردات", [["suggest", "يشير إلى"], ["tend to", "يميل إلى"], ["arguably", "يمكن القول"], ["evidence", "دليل"], ["likely", "مرجح"], ["somewhat", "إلى حد ما"]]),
      ], [
        q("أي جملة متحفظة؟", ["This proves everything.", "This may indicate a link.", "This is always true.", "Everyone knows this."], 1, "may indicate تعبير متحفظ."),
      ]),
    ],
  }),
  mod({
    id: "c2", titleAr: "الإتقان C2", titleEn: "Proficiency C2", icon: "🏔️", bg: "from-slate-600 to-slate-900", level: "advanced",
    lessons: [
      lesson("c2-idioms", "التعابير الاصطلاحية", "Idiomatic Expressions", 25, [
        formula("تعابير شائعة", "التعبير + معناه المجازي", "Idiom + figurative meaning",
          [ex("Let's not beat around the bush.", "دعنا لا نلفّ وندور."), ex("The decision is up in the air.", "القرار لم يُحسم بعد."), ex("She hit the nail on the head.", "أصابت كبد الحقيقة.")],
          undefined, undefined, "لا تُترجم التعابير حرفيًا؛ احفظها كوحدة كاملة."),
        dialogue("حوار: اجتماع", [
          [0, "Let's cut to the chase: is the deal on or off?", "لندخل في صلب الموضوع: هل الصفقة قائمة أم لا؟", "cut to the chase", "ادخل في الموضوع"],
          [1, "Frankly, it's still up in the air.", "بصراحة، لم يُحسم بعد.", "up in the air", "غير محسوم"],
          [0, "We can't afford to drag our feet any longer.", "لا يمكننا التباطؤ أكثر.", "drag our feet", "نتباطأ"],
          [1, "Agreed. I'll get the ball rolling tomorrow.", "موافق. سأبدأ الأمر غدًا.", "get the ball rolling", "يبدأ"],
        ]),
        vocab("تعابير", [["a blessing in disguise", "ربّ ضارة نافعة"], ["once in a blue moon", "نادرًا جدًا"], ["the last straw", "القشة الأخيرة"], ["break the ice", "يكسر الجليد"], ["on the fence", "متردد"], ["spill the beans", "يفشي السر"]]),
      ], [
        q("'Once in a blue moon' تعني:", ["كل ليلة", "نادرًا جدًا", "في الصيف", "بسرعة"], 1, "تعبير عن الندرة الشديدة."),
        q("'Break the ice' تعني:", ["يكسر شيئًا", "يبدأ حديثًا ويزيل التوتر", "يبرد", "يغضب"], 1, "تقال لبدء التعارف."),
      ]),
      lesson("c2-nuance", "دقة المعنى والأسلوب", "Nuance & Register", 20, [
        formula("الرسمي مقابل العامي", "اختر الكلمة حسب السياق", "Formal vs informal register",
          [ex("We regret to inform you... (formal)", "نأسف لإبلاغكم... (رسمي)"), ex("Sorry to say... (informal)", "آسف أقول... (عامي)"), ex("Commence / Start", "يباشر / يبدأ")]),
        vocab("كلمات متقاربة", [["frugal", "مقتصد (إيجابي)"], ["stingy", "بخيل (سلبي)"], ["assertive", "حازم"], ["aggressive", "عدواني"], ["curious", "فضولي (إيجابي)"], ["nosy", "متطفل"]]),
      ], [
        q("أي كلمة إيجابية؟", ["stingy", "nosy", "frugal", "aggressive"], 2, "frugal مقتصد بمعنى إيجابي."),
      ]),
    ],
  }),
  mod({
    id: "medical", titleAr: "الإنجليزية الطبية", titleEn: "Medical English", icon: "🏥", bg: "from-red-600 to-red-900", level: "intermediate",
    lessons: [
      lesson("med-body", "أجزاء الجسم والأعراض", "Body Parts & Symptoms", 20, [
        vocab("أجزاء الجسم", [["head", "رأس"], ["chest", "صدر"], ["stomach", "معدة"], ["throat", "حلق"], ["back", "ظهر"], ["joint", "مفصل"], ["heart", "قلب"], ["lungs", "رئتان"]]),
        vocab("الأعراض", [["fever", "حمّى"], ["cough", "سعال"], ["headache", "صداع"], ["nausea", "غثيان"], ["dizziness", "دوخة"], ["rash", "طفح جلدي"]]),
        formula("وصف الألم", "I have a + عرض / My + جزء + hurts", "Describing symptoms",
          [ex("I have a sore throat.", "عندي التهاب في الحلق."), ex("My back hurts.", "ظهري يؤلمني."), ex("I feel dizzy.", "أشعر بدوخة.")]),
      ], [
        q("ما معنى 'nausea'؟", ["صداع", "غثيان", "سعال", "حمّى"], 1, "nausea = غثيان."),
        q("كيف تقول 'ظهري يؤلمني'؟", ["My back hurts.", "I hurt back.", "Back is pain me.", "My back hurt me."], 0, "My back hurts."),
      ]),
      lesson("med-history", "أخذ التاريخ المرضي", "Taking a Patient History", 25, [
        dialogue("الطبيب والمريض", [
          [0, "Good morning. What brings you in today?", "صباح الخير. ما سبب زيارتك اليوم؟", "what brings you in", "سبب الزيارة"],
          [1, "I've had chest pain for two days.", "عندي ألم في الصدر منذ يومين.", "chest pain", "ألم الصدر"],
          [0, "Can you describe the pain? Is it sharp or dull?", "هل يمكنك وصف الألم؟ هل هو حاد أم خفيف؟", "sharp", "حاد"],
          [1, "It's sharp, and it gets worse when I breathe in.", "إنه حاد، ويزداد عند الشهيق.", "breathe in", "يستنشق"],
          [0, "Do you have any allergies or take any medication?", "هل لديك حساسية أو تتناول أدوية؟", "allergies", "حساسية"],
          [1, "I'm allergic to penicillin.", "عندي حساسية من البنسلين.", "allergic", "لدي حساسية"],
          [0, "Thank you. I'm going to listen to your chest now.", "شكرًا. سأستمع إلى صدرك الآن.", "listen to your chest", "الفحص بالسماعة"],
        ]),
        vocab("مفردات", [["symptom", "عَرَض"], ["diagnosis", "تشخيص"], ["medication", "دواء"], ["allergy", "حساسية"], ["chronic", "مزمن"], ["acute", "حاد"]]),
      ], [
        q("'What brings you in today?' يسألها:", ["الصيدلي", "الطبيب لمعرفة سبب الزيارة", "المريض", "الممرضة للفاتورة"], 1, "سؤال افتتاحي في العيادة."),
        q("'Chronic' تعني:", ["حاد", "مزمن", "بسيط", "مؤقت"], 1, "chronic = مزمن."),
      ]),
      lesson("med-pharmacy", "في الصيدلية والوصفة", "Pharmacy & Prescriptions", 20, [
        dialogue("في الصيدلية", [
          [0, "Hello, I have a prescription from my doctor.", "مرحبًا، معي وصفة من طبيبي.", "prescription", "وصفة طبية"],
          [1, "Take one tablet twice a day after meals.", "تناول قرصًا مرتين يوميًا بعد الأكل.", "twice a day", "مرتين يوميًا"],
          [0, "Are there any side effects?", "هل هناك آثار جانبية؟", "side effects", "آثار جانبية"],
          [1, "It may cause drowsiness, so avoid driving.", "قد يسبب النعاس، فتجنب القيادة.", "drowsiness", "نعاس"],
        ]),
        vocab("مفردات", [["tablet", "قرص"], ["dose", "جرعة"], ["syrup", "شراب"], ["injection", "حقنة"], ["ointment", "مرهم"], ["side effect", "أثر جانبي"]]),
      ], [
        q("'Twice a day' تعني:", ["مرة يوميًا", "مرتين يوميًا", "كل يومين", "ثلاث مرات"], 1, "twice = مرتين."),
      ]),
      lesson("med-emergency", "الطوارئ", "In the Emergency Room", 20, [
        dialogue("في الطوارئ", [
          [0, "Help! My father collapsed and he's not breathing well.", "النجدة! أبي سقط ولا يتنفس جيدًا.", "collapsed", "انهار/سقط"],
          [1, "Stay calm. Is he conscious?", "اهدأ. هل هو واعٍ؟", "conscious", "واعٍ"],
          [0, "He opens his eyes, but he's confused.", "يفتح عينيه لكنه مشوش.", "confused", "مشوش"],
          [1, "We'll check his blood pressure and oxygen level immediately.", "سنقيس ضغطه ونسبة الأكسجين فورًا.", "blood pressure", "ضغط الدم"],
        ]),
        vocab("مفردات", [["emergency", "طوارئ"], ["ambulance", "إسعاف"], ["unconscious", "فاقد الوعي"], ["bleeding", "نزيف"], ["fracture", "كسر"], ["stretcher", "نقّالة"]]),
      ], [
        q("'Fracture' تعني:", ["حرق", "كسر", "جرح", "نزيف"], 1, "fracture = كسر في العظم."),
        q("'Is he conscious?' تعني:", ["هل هو جائع؟", "هل هو واعٍ؟", "هل هو نائم؟", "هل هو بخير؟"], 1, "conscious = واعٍ."),
      ]),
    ],
  }),
  mod({
    id: "scientific", titleAr: "الإنجليزية العلمية", titleEn: "Scientific English", icon: "🔬", bg: "from-indigo-600 to-indigo-900", level: "advanced",
    lessons: [
      lesson("sci-method", "المنهج العلمي", "The Scientific Method", 20, [
        vocab("مفردات", [["hypothesis", "فرضية"], ["experiment", "تجربة"], ["variable", "متغير"], ["data", "بيانات"], ["conclusion", "استنتاج"], ["observation", "ملاحظة"]]),
        formula("وصف التجربة", "المبني للمجهول في التقارير", "Passive voice in reports",
          [ex("The samples were heated to 100°C.", "سُخّنت العينات إلى 100 درجة."), ex("The data was analysed using software.", "حُللت البيانات باستخدام برنامج.")]),
      ], [q("'Hypothesis' تعني:", ["نتيجة", "فرضية", "تجربة", "بيانات"], 1, "hypothesis = فرضية.")]),
      lesson("sci-graphs", "وصف الرسوم البيانية", "Describing Graphs", 20, [
        formula("الاتجاهات", "increase / decrease / remain stable + ظرف", "Trend verbs",
          [ex("Sales increased sharply in 2020.", "ارتفعت المبيعات بحدة في 2020."), ex("The temperature remained stable.", "بقيت الحرارة ثابتة."), ex("The rate decreased gradually.", "انخفض المعدل تدريجيًا.")]),
        vocab("مفردات", [["sharply", "بحدة"], ["gradually", "تدريجيًا"], ["peak", "ذروة"], ["fluctuate", "يتذبذب"], ["trend", "اتجاه"], ["axis", "محور"]]),
      ], [q("'Gradually' تعني:", ["فجأة", "تدريجيًا", "بحدة", "أبدًا"], 1, "gradually = تدريجيًا.")]),
    ],
  }),
  mod({
    id: "business", titleAr: "إنجليزية الأعمال", titleEn: "Business English", icon: "💼", bg: "from-amber-600 to-amber-900", level: "advanced",
    lessons: [
      lesson("bus-emails", "البريد الإلكتروني الرسمي", "Formal Emails", 20, [
        formula("هيكل الرسالة", "تحية + غرض + تفاصيل + ختام", "Greeting, purpose, details, closing",
          [ex("Dear Mr. Ahmed,", "السيد أحمد المحترم،"), ex("I am writing to confirm our meeting on Monday.", "أكتب لتأكيد اجتماعنا يوم الاثنين."), ex("I look forward to hearing from you.", "أتطلع لسماع ردك."), ex("Kind regards,", "مع خالص التحية،")]),
        vocab("مفردات", [["attach", "يرفق"], ["confirm", "يؤكد"], ["deadline", "موعد نهائي"], ["schedule", "جدول"], ["inquiry", "استفسار"], ["invoice", "فاتورة"]]),
      ], [q("كيف تختم رسالة رسمية؟", ["Bye!", "Kind regards,", "See ya", "Love,"], 1, "Kind regards ختام رسمي.")]),
      lesson("bus-meetings", "الاجتماعات والتفاوض", "Meetings & Negotiation", 25, [
        dialogue("تفاوض", [
          [0, "We'd like to discuss the price of the contract.", "نود مناقشة سعر العقد.", "contract", "عقد"],
          [1, "We can offer a ten percent discount for a two-year deal.", "يمكننا تقديم خصم عشرة بالمئة لعقد مدته سنتان.", "discount", "خصم"],
          [0, "That sounds reasonable. What about delivery times?", "يبدو معقولًا. ماذا عن مواعيد التسليم؟", "delivery", "تسليم"],
          [1, "We guarantee delivery within fourteen days.", "نضمن التسليم خلال أربعة عشر يومًا.", "guarantee", "نضمن"],
        ]),
        vocab("مفردات", [["agenda", "جدول الأعمال"], ["proposal", "عرض/مقترح"], ["compromise", "حل وسط"], ["profit", "ربح"], ["budget", "ميزانية"], ["stakeholder", "صاحب مصلحة"]]),
      ], [q("'Compromise' تعني:", ["ربح", "حل وسط", "عقد", "خسارة"], 1, "compromise = حل وسط.")]),
    ],
  }),
];
