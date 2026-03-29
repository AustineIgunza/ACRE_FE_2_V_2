import { CombatEncounter } from "@/types/combat";

/**
 * Mock quiz data for different topics
 */
const MOCK_QUIZZES: Record<string, CombatEncounter[]> = {
  "default": [
    {
      id: 1,
      scenario: "What is the fundamental principle behind this concept?",
      options: {
        A: "It is a theoretical framework with no practical application",
        B: "It represents a core principle that underlies the concept",
        C: "It is an outdated method no longer used in practice",
        D: "It is only applicable in specific industries",
      },
      correct_option: "B",
      win_feedback: "Correct! Understanding the core principles is essential.",
      loss_feedback: "Not quite. The correct answer focuses on fundamental principles.",
    },
    {
      id: 2,
      scenario: "How would you apply this concept in a real-world scenario?",
      options: {
        A: "By ignoring practical constraints",
        B: "By adapting the principles to fit the specific context and constraints",
        C: "By always following the textbook definition exactly",
        D: "By assuming all situations are identical",
      },
      correct_option: "B",
      win_feedback: "Excellent! Real-world application requires contextual adaptation.",
      loss_feedback: "Not correct. Practical application requires flexibility and context.",
    },
    {
      id: 3,
      scenario: "What is a common misconception about this topic?",
      options: {
        A: "That it is infinitely scalable without limitations",
        B: "That it has no limitations or constraints",
        C: "That it is too simple to be useful",
        D: "That it requires constant modification",
      },
      correct_option: "B",
      win_feedback: "Right! Understanding limitations is crucial for proper application.",
      loss_feedback: "Think about the realistic boundaries and constraints of this concept.",
    },
    {
      id: 4,
      scenario: "Which of the following best demonstrates mastery of this concept?",
      options: {
        A: "Memorizing the definition word-for-word",
        B: "Being able to explain it in your own words and apply it to new situations",
        C: "Only knowing the history of the concept",
        D: "Knowing technical jargon without understanding meaning",
      },
      correct_option: "B",
      win_feedback: "Perfect! True mastery means understanding and application.",
      loss_feedback: "Mastery requires deep understanding and the ability to apply knowledge.",
    },
    {
      id: 5,
      scenario: "What is the relationship between this concept and related ideas?",
      options: {
        A: "They are completely unrelated",
        B: "They overlap and support each other in a system",
        C: "Only one of them is actually important",
        D: "They contradict each other",
      },
      correct_option: "B",
      win_feedback: "Correct! Understanding connections between concepts deepens learning.",
      loss_feedback: "Consider how this concept relates to and supports related ideas.",
    },
  ],
};

/**
 * Get mock quiz encounters for a topic
 */
export function getMockQuizEncounters(topic: string = "default"): CombatEncounter[] {
  return MOCK_QUIZZES[topic] || MOCK_QUIZZES["default"];
}

/**
 * Get a single mock encounter by ID (for testing)
 */
export function getMockEncounter(id: number): CombatEncounter | null {
  for (const encounters of Object.values(MOCK_QUIZZES)) {
    const found = encounters.find(e => e.id === id);
    if (found) return found;
  }
  return null;
}
