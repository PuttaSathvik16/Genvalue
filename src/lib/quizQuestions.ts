export type QuizQuestionType =
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "SHORT_ANSWER"
  | "MCQ";

export interface BaseQuizQuestion {
  id: string;
  type: QuizQuestionType;
  question: string;
  options: string[];
  correctAnswer: number | number[] | boolean | string;
  points: number;
}

export function normalizeQuestionType(type: string): Exclude<QuizQuestionType, "MCQ"> | "SINGLE_CHOICE" {
  if (type === "MCQ") return "SINGLE_CHOICE";
  if (type === "MULTIPLE_CHOICE") return "MULTIPLE_CHOICE";
  if (type === "TRUE_FALSE") return "TRUE_FALSE";
  if (type === "SHORT_ANSWER") return "SHORT_ANSWER";
  return "SINGLE_CHOICE";
}

export function isSingleChoice(type: string): boolean {
  const normalized = normalizeQuestionType(type);
  return normalized === "SINGLE_CHOICE";
}

export function isMultipleChoice(type: string): boolean {
  return normalizeQuestionType(type) === "MULTIPLE_CHOICE";
}

export function isChoiceQuestion(type: string): boolean {
  return isSingleChoice(type) || isMultipleChoice(type);
}

export function normalizeQuestion(raw: Record<string, unknown>, idx: number): BaseQuizQuestion {
  const type = normalizeQuestionType(String(raw.type ?? "SINGLE_CHOICE"));
  let options: string[] = Array.isArray(raw.options) ? (raw.options as string[]) : [];
  let correctAnswer: BaseQuizQuestion["correctAnswer"];

  if (type === "TRUE_FALSE") {
    options = ["True", "False"];
    if (typeof raw.correctAnswer === "boolean") {
      correctAnswer = raw.correctAnswer;
    } else if (typeof raw.correctAnswer === "number") {
      correctAnswer = raw.correctAnswer === 0;
    } else {
      correctAnswer = String(raw.correctAnswer ?? "true").toLowerCase() === "true";
    }
  } else if (type === "SHORT_ANSWER") {
    options = [];
    correctAnswer = String(raw.correctAnswer ?? "");
  } else if (type === "MULTIPLE_CHOICE") {
    if (options.length < 2) {
      options = ["Option A", "Option B", "Option C", "Option D"];
    }
    correctAnswer = Array.isArray(raw.correctAnswer)
      ? (raw.correctAnswer as number[]).filter((n) => typeof n === "number")
      : typeof raw.correctAnswer === "number"
        ? [raw.correctAnswer]
        : [];
  } else {
    if (options.length < 2) {
      options = ["Option A", "Option B", "Option C", "Option D"];
    }
    correctAnswer = typeof raw.correctAnswer === "number" ? raw.correctAnswer : 0;
  }

  return {
    id: String(raw.id ?? `q-${idx}-${Date.now()}`),
    type: type === "SINGLE_CHOICE" ? "SINGLE_CHOICE" : type,
    question: String(raw.question ?? ""),
    options,
    correctAnswer,
    points: typeof raw.points === "number" ? raw.points : 1,
  };
}

export function newQuizQuestion(type: QuizQuestionType = "SINGLE_CHOICE"): BaseQuizQuestion {
  if (type === "MULTIPLE_CHOICE") {
    return {
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: "MULTIPLE_CHOICE",
      question: "",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: [],
      points: 1,
    };
  }
  if (type === "TRUE_FALSE") {
    return {
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: "TRUE_FALSE",
      question: "",
      options: ["True", "False"],
      correctAnswer: true,
      points: 1,
    };
  }
  if (type === "SHORT_ANSWER") {
    return {
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: "SHORT_ANSWER",
      question: "",
      options: [],
      correctAnswer: "",
      points: 1,
    };
  }
  return {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: "SINGLE_CHOICE",
    question: "",
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: 0,
    points: 1,
  };
}

export function questionTypeLabel(type: string): string {
  const normalized = normalizeQuestionType(type);
  if (normalized === "SINGLE_CHOICE") return "Single Choice";
  if (normalized === "MULTIPLE_CHOICE") return "Multiple Choice";
  if (normalized === "TRUE_FALSE") return "True / False";
  return "Short Answer";
}

export function toggleMultipleChoiceAnswer(
  current: number[],
  optionIndex: number
): number[] {
  if (current.includes(optionIndex)) {
    return current.filter((i) => i !== optionIndex);
  }
  return [...current, optionIndex].sort((a, b) => a - b);
}

export function validateQuizQuestion(question: BaseQuizQuestion, index: number): string | null {
  const label = `Question ${index + 1}`;
  const type = normalizeQuestionType(question.type);

  if (!question.question.trim()) return `${label} text is required`;

  if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
    if (question.options.length < 2) return `${label} needs at least 2 options`;

    if (type === "SINGLE_CHOICE") {
      if (
        typeof question.correctAnswer !== "number" ||
        question.correctAnswer < 0 ||
        question.correctAnswer >= question.options.length
      ) {
        return `${label} must have one correct option selected (radio)`;
      }
    }

    if (type === "MULTIPLE_CHOICE") {
      if (!Array.isArray(question.correctAnswer) || question.correctAnswer.length === 0) {
        return `${label} must have at least one correct option checked`;
      }
    }
  }

  if (type === "TRUE_FALSE" && typeof question.correctAnswer !== "boolean") {
    return `${label} must have True or False selected`;
  }

  if (type === "SHORT_ANSWER" && !String(question.correctAnswer).trim()) {
    return `${label} needs an expected answer`;
  }

  return null;
}

export function validateQuizQuestionsList(questions: BaseQuizQuestion[]): string | null {
  if (questions.length === 0) return "Add at least one question";
  for (let i = 0; i < questions.length; i += 1) {
    const error = validateQuizQuestion(questions[i], i);
    if (error) return error;
  }
  return null;
}
