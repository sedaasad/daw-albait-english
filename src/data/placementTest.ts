// CEFR Placement Test V1 — 30 questions across 3 sections.
// Each question has a CEFR weight: A1=1, A2=2, B1=3, B2=4, C1=5, C2=6.
// Score = sum of weights of correct answers / max possible * 100.

export type Section = "grammar" | "vocabulary" | "reading";
export type CEFR = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface PlacementQuestion {
  id: string;
  section: Section;
  level: CEFR;
  prompt: string;       // English question
  context?: string;     // optional reading passage
  choices: string[];
  answer: number;       // index
  explanation_ar?: string;
}

export const SECTION_LABEL_AR: Record<Section, string> = {
  grammar: "القواعد",
  vocabulary: "المفردات",
  reading: "القراءة والاستيعاب",
};

export const LEVEL_WEIGHT: Record<CEFR, number> = {
  A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6,
};

// ---------- GRAMMAR (10) ----------
const grammar: PlacementQuestion[] = [
  { id: "g1", section: "grammar", level: "A1",
    prompt: "She ___ a teacher.",
    choices: ["am", "is", "are", "be"], answer: 1 },
  { id: "g2", section: "grammar", level: "A1",
    prompt: "I ___ coffee every morning.",
    choices: ["drinks", "drinking", "drink", "drank"], answer: 2 },
  { id: "g3", section: "grammar", level: "A2",
    prompt: "They ___ to the cinema yesterday.",
    choices: ["go", "goes", "went", "gone"], answer: 2 },
  { id: "g4", section: "grammar", level: "A2",
    prompt: "There ___ some milk in the fridge.",
    choices: ["is", "are", "have", "has"], answer: 0 },
  { id: "g5", section: "grammar", level: "B1",
    prompt: "If it rains tomorrow, we ___ at home.",
    choices: ["stay", "will stay", "stayed", "would stay"], answer: 1 },
  { id: "g6", section: "grammar", level: "B1",
    prompt: "I have lived here ___ five years.",
    choices: ["since", "from", "for", "during"], answer: 2 },
  { id: "g7", section: "grammar", level: "B2",
    prompt: "By the time we arrived, the film ___.",
    choices: ["already started", "had already started", "has already started", "was already starting"], answer: 1 },
  { id: "g8", section: "grammar", level: "B2",
    prompt: "She suggested ___ a taxi.",
    choices: ["to take", "take", "taking", "taken"], answer: 2 },
  { id: "g9", section: "grammar", level: "C1",
    prompt: "Hardly ___ when the phone rang.",
    choices: ["I had sat down", "had I sat down", "I sat down", "did I sit down"], answer: 1 },
  { id: "g10", section: "grammar", level: "C2",
    prompt: "___ his repeated warnings, they pressed ahead with the plan.",
    choices: ["Despite of", "In spite", "Notwithstanding", "Although"], answer: 2 },
];

// ---------- VOCABULARY (10) ----------
const vocabulary: PlacementQuestion[] = [
  { id: "v1", section: "vocabulary", level: "A1",
    prompt: "The opposite of 'big' is ___.",
    choices: ["tall", "small", "long", "wide"], answer: 1 },
  { id: "v2", section: "vocabulary", level: "A1",
    prompt: "You read a ___ in a library.",
    choices: ["book", "car", "shoe", "spoon"], answer: 0 },
  { id: "v3", section: "vocabulary", level: "A2",
    prompt: "I'm ___. Can I have some water?",
    choices: ["hungry", "tired", "thirsty", "angry"], answer: 2 },
  { id: "v4", section: "vocabulary", level: "A2",
    prompt: "She works in a hospital. She is a ___.",
    choices: ["nurse", "farmer", "pilot", "chef"], answer: 0 },
  { id: "v5", section: "vocabulary", level: "B1",
    prompt: "The meeting was ___ until next week.",
    choices: ["postponed", "imposed", "supposed", "opposed"], answer: 0 },
  { id: "v6", section: "vocabulary", level: "B1",
    prompt: "He has a great ___ of humour.",
    choices: ["feel", "sense", "way", "kind"], answer: 1 },
  { id: "v7", section: "vocabulary", level: "B2",
    prompt: "Her argument was very ___; nobody could disagree.",
    choices: ["fragile", "compelling", "obscure", "trivial"], answer: 1 },
  { id: "v8", section: "vocabulary", level: "B2",
    prompt: "The new policy will ___ significant changes.",
    choices: ["bring about", "bring up", "bring out", "bring down"], answer: 0 },
  { id: "v9", section: "vocabulary", level: "C1",
    prompt: "His remarks were ___ — they hinted at far more than they said.",
    choices: ["blatant", "innocuous", "innuendoes", "innocuous"], answer: 2 },
  { id: "v10", section: "vocabulary", level: "C2",
    prompt: "The professor's lecture was ___ — full of obscure references.",
    choices: ["lucid", "abstruse", "succinct", "mundane"], answer: 1 },
];

// ---------- READING (10) — short passages with comprehension Qs ----------
const reading: PlacementQuestion[] = [
  { id: "r1", section: "reading", level: "A1",
    context: "Tom is from London. He is 10 years old. He likes football.",
    prompt: "How old is Tom?",
    choices: ["8", "9", "10", "11"], answer: 2 },
  { id: "r2", section: "reading", level: "A1",
    context: "My sister has a cat. The cat is black and white.",
    prompt: "What colour is the cat?",
    choices: ["Black", "White", "Black and white", "Grey"], answer: 2 },
  { id: "r3", section: "reading", level: "A2",
    context: "Lisa usually goes to work by bus, but today she is driving her car because the buses are on strike.",
    prompt: "Why is Lisa driving today?",
    choices: ["She bought a new car", "The buses are not running", "It is raining", "She is late"], answer: 1 },
  { id: "r4", section: "reading", level: "A2",
    context: "The museum opens at 9 a.m. and closes at 5 p.m. It is closed on Mondays.",
    prompt: "When is the museum closed?",
    choices: ["Sundays", "Mondays", "Every evening", "Weekends"], answer: 1 },
  { id: "r5", section: "reading", level: "B1",
    context: "Although Mark had prepared well for the interview, he felt nervous as soon as he entered the room.",
    prompt: "How did Mark feel during the interview?",
    choices: ["Confident", "Bored", "Nervous", "Angry"], answer: 2 },
  { id: "r6", section: "reading", level: "B1",
    context: "Renewable energy sources, such as solar and wind, are becoming cheaper every year, encouraging more countries to invest in them.",
    prompt: "What is making countries invest more in renewables?",
    choices: ["Government laws", "Falling costs", "Public protests", "Oil shortages"], answer: 1 },
  { id: "r7", section: "reading", level: "B2",
    context: "Despite initial scepticism from critics, the novel went on to win three major literary prizes within a year of its publication.",
    prompt: "What can we infer about the novel?",
    choices: ["Critics loved it immediately", "It failed commercially", "It was eventually well-received", "It was never published"], answer: 2 },
  { id: "r8", section: "reading", level: "B2",
    context: "The committee's decision, while controversial, was ultimately upheld after a lengthy appeal process.",
    prompt: "What happened to the committee's decision?",
    choices: ["It was overturned", "It was confirmed", "It was withdrawn", "It was postponed"], answer: 1 },
  { id: "r9", section: "reading", level: "C1",
    context: "The author's prose, though ostensibly straightforward, conceals layers of allegory that reward careful re-reading.",
    prompt: "What does the author imply about the prose?",
    choices: ["It is genuinely simple", "It is deceptively complex", "It is poorly written", "It is overly ornate"], answer: 1 },
  { id: "r10", section: "reading", level: "C2",
    context: "Far from being a panacea, the proposed reform risks exacerbating the very inequities its proponents claim to redress.",
    prompt: "The writer's attitude toward the reform is best described as:",
    choices: ["Enthusiastic", "Neutral", "Sceptical", "Indifferent"], answer: 2 },
  ];

export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [...grammar, ...vocabulary, ...reading];

export function estimateCEFR(score: number): CEFR {
  if (score >= 90) return "C2";
  if (score >= 75) return "C1";
  if (score >= 60) return "B2";
  if (score >= 45) return "B1";
  if (score >= 30) return "A2";
  return "A1";
}

export interface SectionResult {
  section: Section;
  earned: number;
  max: number;
  percentage: number;
}

export interface PlacementResult {
  score: number;            // 0-100 weighted overall
  cefr: CEFR;
  perSection: SectionResult[];
  strengths: Section[];     // >= 70%
  weaknesses: Section[];    // < 50%
}

export function gradePlacement(answers: Record<string, number>): PlacementResult {
  const sections: Section[] = ["grammar", "vocabulary", "reading"];
  const perSection: SectionResult[] = sections.map((s) => {
    const qs = PLACEMENT_QUESTIONS.filter((q) => q.section === s);
    const max = qs.reduce((acc, q) => acc + LEVEL_WEIGHT[q.level], 0);
    const earned = qs.reduce(
      (acc, q) => acc + (answers[q.id] === q.answer ? LEVEL_WEIGHT[q.level] : 0),
      0,
    );
    return { section: s, earned, max, percentage: Math.round((earned / max) * 100) };
  });

  const totalEarned = perSection.reduce((a, s) => a + s.earned, 0);
  const totalMax = perSection.reduce((a, s) => a + s.max, 0);
  const score = Math.round((totalEarned / totalMax) * 100);

  const strengths = perSection.filter((s) => s.percentage >= 70).map((s) => s.section);
  const weaknesses = perSection.filter((s) => s.percentage < 50).map((s) => s.section);

  return { score, cefr: estimateCEFR(score), perSection, strengths, weaknesses };
}
