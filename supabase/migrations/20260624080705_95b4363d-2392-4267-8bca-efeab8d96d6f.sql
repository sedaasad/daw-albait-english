
-- 1. Schema: archived_at on lessons
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS archived_at timestamptz;

-- 2. Archive legacy lessons (no module attached)
UPDATE public.lessons
SET is_published = false, archived_at = now()
WHERE module_id IS NULL AND archived_at IS NULL;

-- 3. Vocabulary expansion (41 new items) + lesson links
WITH new_vocab(word_en, phonetic, meaning_ar, example_en, example_ar, category, lesson_slug) AS (
  VALUES
  -- CVC words (lesson 6)
  ('cap','/kæp/','قبعة','I wear a cap.','أرتدي قبعة.','cvc','a0-m1-l6'),
  ('bag','/bæɡ/','حقيبة','My bag is red.','حقيبتي حمراء.','cvc','a0-m1-l6'),
  ('mom','/mɒm/','أم','My mom is kind.','أمي طيبة.','cvc','a0-m1-l6'),
  ('dad','/dæd/','أب','My dad is tall.','أبي طويل.','cvc','a0-m1-l6'),
  ('red','/rɛd/','أحمر','The pen is red.','القلم أحمر.','cvc','a0-m1-l6'),
  ('fox','/fɒks/','ثعلب','A fox is fast.','الثعلب سريع.','cvc','a0-m1-l6'),
  ('bus','/bʌs/','حافلة','The bus is here.','الحافلة هنا.','cvc','a0-m1-l6'),
  ('leg','/lɛɡ/','ساق','My leg hurts.','ساقي تؤلمني.','cvc','a0-m1-l6'),
  ('pet','/pɛt/','حيوان أليف','I have a pet.','عندي حيوان أليف.','cvc','a0-m1-l6'),
  ('nap','/næp/','قيلولة','I take a nap.','آخذ قيلولة.','cvc','a0-m1-l6'),
  -- Digraphs (lesson 7)
  ('wish','/wɪʃ/','أمنية','Make a wish.','تمنّ أمنية.','digraph-sh','a0-m1-l7'),
  ('chip','/tʃɪp/','رقاقة','I like chips.','أحب الرقائق.','digraph-ch','a0-m1-l7'),
  ('chin','/tʃɪn/','ذقن','Touch your chin.','المس ذقنك.','digraph-ch','a0-m1-l7'),
  ('that','/ðæt/','ذلك','That is mine.','هذا لي.','digraph-th','a0-m1-l7'),
  ('three','/θriː/','ثلاثة','I have three pens.','عندي ثلاثة أقلام.','digraph-th','a0-m1-l7'),
  ('thumb','/θʌm/','إبهام','Show your thumb.','أظهر إبهامك.','digraph-th','a0-m1-l7'),
  ('photo','/ˈfoʊtoʊ/','صورة','Nice photo!','صورة جميلة!','digraph-ph','a0-m1-l7'),
  -- Silent letters (lesson 8)
  ('knee','/niː/','ركبة','My knee hurts.','ركبتي تؤلمني.','silent-k','a0-m1-l8'),
  ('knife','/naɪf/','سكين','Use a knife.','استخدم السكين.','silent-k','a0-m1-l8'),
  ('wrist','/rɪst/','معصم','My wrist is sore.','معصمي يؤلمني.','silent-w','a0-m1-l8'),
  ('comb','/koʊm/','مشط','I use a comb.','أستخدم مشطًا.','silent-b','a0-m1-l8'),
  ('honest','/ˈɒnɪst/','صادق','Be honest.','كن صادقًا.','silent-h','a0-m1-l8'),
  ('listen','/ˈlɪsən/','يستمع','Listen to me.','استمع إليّ.','silent-t','a0-m1-l8'),
  -- Short vowel examples (lesson 3)
  ('mat','/mæt/','حصيرة','Sit on the mat.','اجلس على الحصيرة.','vowel-æ','a0-m1-l3'),
  ('net','/nɛt/','شبكة','Use a net.','استخدم الشبكة.','vowel-ɛ','a0-m1-l3'),
  ('fit','/fɪt/','مناسب','It fits me.','إنه يناسبني.','vowel-ɪ','a0-m1-l3'),
  ('fun','/fʌn/','مرح','It is fun.','إنه ممتع.','vowel-ʌ','a0-m1-l3'),
  ('pot','/pɒt/','وعاء','A hot pot.','وعاء ساخن.','vowel-ɒ','a0-m1-l3'),
  ('ten','/tɛn/','عشرة','I have ten.','عندي عشرة.','vowel-ɛ','a0-m1-l3'),
  -- p vs b (lesson 4)
  ('pull','/pʊl/','يسحب','Pull the door.','اسحب الباب.','p-vs-b','a0-m1-l4'),
  ('bull','/bʊl/','ثور','A big bull.','ثور كبير.','p-vs-b','a0-m1-l4'),
  ('pack','/pæk/','يحزم','Pack your bag.','احزم حقيبتك.','p-vs-b','a0-m1-l4'),
  ('back','/bæk/','ظهر','Come back.','عُد.','p-vs-b','a0-m1-l4'),
  -- v vs f (lesson 5)
  ('vest','/vɛst/','صدرية','A blue vest.','صدرية زرقاء.','v-vs-f','a0-m1-l5'),
  ('fast','/fæst/','سريع','Run fast.','اركض بسرعة.','v-vs-f','a0-m1-l5'),
  ('leaf','/liːf/','ورقة شجر','A green leaf.','ورقة شجر خضراء.','v-vs-f','a0-m1-l5'),
  ('love','/lʌv/','حب','I love it.','أنا أحبه.','v-vs-f','a0-m1-l5'),
  -- Spelling (lesson 9)
  ('thank','/θæŋk/','شكر','Thank you.','شكرًا لك.','spelling','a0-m1-l9'),
  ('hello','/həˈloʊ/','مرحبًا','Hello! I am Sam.','مرحبًا! أنا سام.','spelling','a0-m1-l9'),
  ('my','/maɪ/','ضمير الملكية لي','My name is Ali.','اسمي علي.','spelling','a0-m1-l9'),
  ('your','/jɔːr/','ضميرك','What is your name?','ما اسمك؟','spelling','a0-m1-l9')
),
inserted_vocab AS (
  INSERT INTO public.vocabulary_items (word_en, phonetic, meaning_ar, example_en, example_ar, cefr_level, category)
  SELECT word_en, phonetic, meaning_ar, example_en, example_ar, 'A0'::cefr_level, category FROM new_vocab
  RETURNING id, word_en
)
INSERT INTO public.lesson_vocabulary (lesson_id, vocabulary_id, order_index)
SELECT l.id, iv.id,
       100 + row_number() OVER (PARTITION BY nv.lesson_slug ORDER BY iv.word_en)
FROM new_vocab nv
JOIN inserted_vocab iv ON iv.word_en = nv.word_en
JOIN public.lessons l ON l.slug = nv.lesson_slug;

-- 4. Listening tasks (1 per lesson, 10 total)
INSERT INTO public.listening_tasks (lesson_id, prompt_ar, audio_text, comprehension_question_ar, options, correct_index, order_index)
SELECT l.id, x.prompt_ar, x.audio_text, x.q_ar, x.options::jsonb, x.correct, 1
FROM public.lessons l
JOIN (VALUES
 ('a0-m1-l1','استمع وحدد الحرف الذي تسمعه.','A. B. C. D. E. F. G.','أي حرف كان الأول؟','["A","B","C","D"]',0),
 ('a0-m1-l2','استمع إلى الحروف.','N. O. P. Q. R. S. T.','أي حرف كان الأخير؟','["S","T","R","Q"]',1),
 ('a0-m1-l3','استمع إلى الكلمة وحدد الحركة.','cat','ما هي الحركة؟','["/æ/","/ɪ/","/ɛ/","/ɒ/"]',0),
 ('a0-m1-l4','استمع: هل سمعت /p/ أم /b/؟','pen','ما الصوت في البداية؟','["/p/","/b/","/t/","/d/"]',0),
 ('a0-m1-l5','استمع: هل سمعت /v/ أم /f/؟','van','ما الصوت في البداية؟','["/v/","/f/","/b/","/p/"]',0),
 ('a0-m1-l6','استمع إلى الكلمة CVC.','sun','ما الكلمة؟','["sun","sit","sat","set"]',0),
 ('a0-m1-l7','استمع إلى الحرفين المركبين.','ship','ما الصوت في البداية؟','["sh","ch","th","ph"]',0),
 ('a0-m1-l8','استمع إلى الكلمة. هل تسمع الحرف الصامت؟','know','ما الحرف الصامت؟','["k","n","o","w"]',0),
 ('a0-m1-l9','استمع إلى الشخص يهجئ اسمه.','My name is S-A-M.','ما الاسم؟','["Sam","Sad","Tom","Pam"]',0),
 ('a0-m1-l10','استمع للمراجعة.','Hello! My name is Lina. L-I-N-A.','ما اسم المتحدث؟','["Lina","Lana","Tina","Mina"]',0)
) x(slug, prompt_ar, audio_text, q_ar, options, correct) ON l.slug = x.slug;

-- 5. Additional quiz questions — target 10 per lesson (current: L1-L9=3, L10=6)
-- Use the existing quiz per lesson.
WITH qz AS (
  SELECT q.id quiz_id, l.id lesson_id, l.slug, l.order_index lo
  FROM public.quizzes q JOIN public.lessons l ON l.id=q.lesson_id
  WHERE l.module_id IS NOT NULL
)
INSERT INTO public.quiz_questions (lesson_id, quiz_id, question_ar, question_en, options, correct_index, explanation_ar, order_index)
SELECT qz.lesson_id, qz.quiz_id, n.question_ar, n.question_en, n.options::jsonb, n.correct, n.expl_ar, n.ord
FROM qz
JOIN LATERAL (
  VALUES
  -- Lesson 1 (A–M) +7 → 10
  ('a0-m1-l1','أي حرف يأتي بعد C؟','Which letter comes after C?','["A","B","D","E"]',2,'الترتيب: A B C D.',10),
  ('a0-m1-l1','اختر الحرف الذي يبدأ بكلمة apple.','Which letter starts "apple"?','["A","E","I","O"]',0,'apple يبدأ بـ A.',11),
  ('a0-m1-l1','أي حرف يأتي قبل G؟','Which letter comes before G?','["E","F","H","I"]',1,'F ثم G.',12),
  ('a0-m1-l1','ما الحرف الصغير لـ B؟','Lowercase of B?','["b","d","p","q"]',0,'B → b.',13),
  ('a0-m1-l1','أي كلمة تبدأ بحرف M؟','Which word starts with M?','["moon","sun","cat","pen"]',0,'moon يبدأ بـ M.',14),
  ('a0-m1-l1','أي حرف بين D و F؟','Between D and F?','["A","B","E","G"]',2,'D E F.',15),
  ('a0-m1-l1','حرف H الكبير يشبه الصغير h؟','Capital and small forms of H look similar?','["نعم","لا","غير معروف","ربما"]',0,'الشكل يختلف قليلًا فقط.',16),
  -- Lesson 2 (N–Z) +7
  ('a0-m1-l2','أي حرف يأتي بعد S؟','After S?','["R","T","U","Q"]',1,'الترتيب: R S T.',10),
  ('a0-m1-l2','أي حرف يبدأ بكلمة zebra؟','Starts "zebra"?','["Z","X","Y","S"]',0,'Z.',11),
  ('a0-m1-l2','الحرف الأخير في الأبجدية؟','Last letter of alphabet?','["X","Y","Z","W"]',2,'Z هو الأخير.',12),
  ('a0-m1-l2','صغير Q هو؟','Lowercase Q?','["g","p","q","b"]',2,'Q → q.',13),
  ('a0-m1-l2','أي حرف بين V و X؟','Between V and X?','["U","W","Y","T"]',1,'V W X.',14),
  ('a0-m1-l2','الحرف الذي يلفظ /j/ كما في "yes"؟','Letter for /j/ as in "yes"?','["Y","J","I","U"]',0,'Y.',15),
  ('a0-m1-l2','أي حرف يبدأ كلمة "queen"؟','Starts "queen"?','["K","Q","C","G"]',1,'Q.',16),
  -- Lesson 3 (Short Vowels) +7
  ('a0-m1-l3','الحركة في كلمة "cat"؟','Vowel in "cat"?','["/æ/","/ɛ/","/ɪ/","/ɒ/"]',0,'/æ/.',10),
  ('a0-m1-l3','الحركة في "pen"؟','Vowel in "pen"?','["/æ/","/ɛ/","/ɪ/","/ʌ/"]',1,'/ɛ/.',11),
  ('a0-m1-l3','الحركة في "sit"؟','Vowel in "sit"?','["/ɪ/","/iː/","/æ/","/ɛ/"]',0,'/ɪ/.',12),
  ('a0-m1-l3','الحركة في "hot"؟','Vowel in "hot"?','["/ɒ/","/ɔː/","/ʌ/","/æ/"]',0,'/ɒ/.',13),
  ('a0-m1-l3','الحركة في "cup"؟','Vowel in "cup"?','["/ʌ/","/uː/","/ʊ/","/ɒ/"]',0,'/ʌ/.',14),
  ('a0-m1-l3','أي كلمة فيها /æ/؟','Word with /æ/?','["mat","pen","sit","hot"]',0,'mat = /mæt/.',15),
  ('a0-m1-l3','أي كلمة فيها /ɪ/؟','Word with /ɪ/?','["fit","fat","fun","pot"]',0,'fit = /fɪt/.',16),
  -- Lesson 4 (p vs b) +7
  ('a0-m1-l4','أي كلمة تبدأ بـ /p/؟','Starts with /p/?','["pen","ben","bin","bun"]',0,'pen.',10),
  ('a0-m1-l4','أي كلمة تبدأ بـ /b/؟','Starts with /b/?','["big","pig","pin","pot"]',0,'big.',11),
  ('a0-m1-l4','الزوج الأدنى الصحيح:','Correct minimal pair?','["pan/ban","pen/ten","pig/dig","bat/cat"]',0,'pan↔ban.',12),
  ('a0-m1-l4','/p/ يحتاج إلى نفخة هواء؟','/p/ needs a puff of air?','["نعم","لا","أحيانًا","غير معروف"]',0,'نعم، اختبار المنديل.',13),
  ('a0-m1-l4','أي كلمة فيها /b/ في النهاية؟','Ends with /b/?','["cab","cap","cat","can"]',0,'cab.',14),
  ('a0-m1-l4','اختر الكلمة بـ /p/:','Pick /p/ word:','["pull","bull","bell","bag"]',0,'pull.',15),
  ('a0-m1-l4','اختر الكلمة بـ /b/:','Pick /b/ word:','["back","pack","peck","pet"]',0,'back.',16),
  -- Lesson 5 (v vs f) +7
  ('a0-m1-l5','أي كلمة تبدأ بـ /v/؟','Starts with /v/?','["van","fan","pan","ban"]',0,'van.',10),
  ('a0-m1-l5','أي كلمة تبدأ بـ /f/؟','Starts with /f/?','["fine","vine","wine","mine"]',0,'fine.',11),
  ('a0-m1-l5','/v/ صوت مهموس أم مجهور؟','/v/ is voiced or voiceless?','["مجهور","مهموس","غير معروف","صامت"]',0,'مجهور (الحلق يهتز).',12),
  ('a0-m1-l5','اختر الزوج الأدنى:','Pick the minimal pair:','["van/fan","van/pan","van/man","van/can"]',0,'van↔fan.',13),
  ('a0-m1-l5','/f/ صوت:','/f/ is:','["مهموس","مجهور","صامت","علة"]',0,'مهموس.',14),
  ('a0-m1-l5','أي كلمة فيها /v/؟','Word with /v/?','["love","leaf","life","laugh"]',0,'love.',15),
  ('a0-m1-l5','أي كلمة فيها /f/؟','Word with /f/?','["leaf","love","very","vine"]',0,'leaf.',16),
  -- Lesson 6 (CVC) +7
  ('a0-m1-l6','كم حرفًا في كلمة CVC؟','How many letters in a CVC word?','["2","3","4","5"]',1,'ثلاثة: ساكن-علة-ساكن.',10),
  ('a0-m1-l6','أي من التالي كلمة CVC؟','Which is a CVC word?','["sun","ship","know","apple"]',0,'sun.',11),
  ('a0-m1-l6','حرف العلة في "bus"؟','Vowel in "bus"?','["a","u","e","o"]',1,'u.',12),
  ('a0-m1-l6','أي كلمة ليست CVC؟','Which is NOT CVC?','["chair","cat","pen","bag"]',0,'chair فيها رسمان متحركان.',13),
  ('a0-m1-l6','رتب: c-a-t →','Spell c-a-t →','["cat","act","tac","cta"]',0,'cat.',14),
  ('a0-m1-l6','أي كلمة CVC تعني "أب"؟','Which CVC means "أب"؟','["dad","mom","pet","pot"]',0,'dad.',15),
  ('a0-m1-l6','الحرف الأوسط في "pen"؟','Middle letter of "pen"?','["p","e","n","a"]',1,'e.',16),
  -- Lesson 7 (Digraphs) +7
  ('a0-m1-l7','الحرفان المركبان في "ship"؟','Digraph in "ship"?','["sh","ch","th","ph"]',0,'sh.',10),
  ('a0-m1-l7','الحرفان في "chair"؟','Digraph in "chair"?','["ch","sh","th","ph"]',0,'ch.',11),
  ('a0-m1-l7','الحرفان في "think"؟','Digraph in "think"?','["th","sh","ch","ph"]',0,'th (مهموس).',12),
  ('a0-m1-l7','الحرفان في "photo"؟','Digraph in "photo"?','["ph","th","sh","ch"]',0,'ph = /f/.',13),
  ('a0-m1-l7','"this" تبدأ بصوت:','"this" starts with:','["ð","θ","s","z"]',0,'ð مجهور.',14),
  ('a0-m1-l7','أي كلمة فيها sh؟','Word with sh?','["wish","wig","win","sit"]',0,'wish.',15),
  ('a0-m1-l7','أي كلمة فيها ch؟','Word with ch?','["chip","ship","skip","sip"]',0,'chip.',16),
  -- Lesson 8 (Silent letters) +7
  ('a0-m1-l8','الحرف الصامت في "know"؟','Silent letter in "know"?','["k","n","o","w"]',0,'k صامت.',10),
  ('a0-m1-l8','الحرف الصامت في "write"؟','Silent in "write"?','["w","r","i","t"]',0,'w صامت.',11),
  ('a0-m1-l8','الحرف الصامت في "climb"؟','Silent in "climb"?','["b","c","l","m"]',0,'b صامت.',12),
  ('a0-m1-l8','الحرف الصامت في "hour"؟','Silent in "hour"?','["h","o","u","r"]',0,'h صامت.',13),
  ('a0-m1-l8','الحرف الصامت في "island"؟','Silent in "island"?','["s","i","l","d"]',0,'s صامت.',14),
  ('a0-m1-l8','الحرف الصامت في "lamb"؟','Silent in "lamb"?','["b","l","a","m"]',0,'b صامت.',15),
  ('a0-m1-l8','الحرف الصامت في "listen"؟','Silent in "listen"?','["t","l","s","n"]',0,'t صامت.',16),
  -- Lesson 9 (Spelling name) +7
  ('a0-m1-l9','كيف تسأل عن الاسم؟','How to ask the name?','["What is your name?","How old are you?","Where are you?","Who is he?"]',0,'What is your name?',10),
  ('a0-m1-l9','رد مهذب للشكر؟','Polite reply to "thank you"?','["You are welcome","Goodbye","Hello","Sorry"]',0,'You are welcome.',11),
  ('a0-m1-l9','هجئ اسم "SAM":','Spell "SAM":','["S-A-M","S-O-M","Z-A-M","S-A-N"]',0,'S-A-M.',12),
  ('a0-m1-l9','اختر التحية الصحيحة:','Correct greeting?','["Hello","Goodbye","Sorry","No"]',0,'Hello.',13),
  ('a0-m1-l9','"My name ___ Ali"','Choose:','["is","are","am","be"]',0,'is.',14),
  ('a0-m1-l9','للسؤال بأدب نضيف؟','Polite word:','["please","never","always","not"]',0,'please.',15),
  ('a0-m1-l9','أي حرف يبدأ اسم "Lina"؟','Starts "Lina"?','["L","I","N","A"]',0,'L.',16),
  -- Lesson 10 (Review) +4 → 10
  ('a0-m1-l10','أي مما يلي زوج أدنى؟','Which is a minimal pair?','["pen/Ben","pen/cat","pen/door","pen/sun"]',0,'pen↔Ben.',10),
  ('a0-m1-l10','الحرف الصامت في "knife"؟','Silent in "knife"?','["k","n","i","f"]',0,'k.',11),
  ('a0-m1-l10','الحرفان المركبان في "three"؟','Digraph in "three"?','["th","sh","ch","ph"]',0,'th مهموس.',12),
  ('a0-m1-l10','اختر كلمة CVC:','Pick CVC:','["fox","fish","chair","apple"]',0,'fox.',13)
) AS n(slug, question_ar, question_en, options, correct, expl_ar, ord) ON n.slug = qz.slug;
