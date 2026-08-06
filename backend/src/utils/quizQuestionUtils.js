export const CHOICE_QUESTION_TYPES = ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "MCQ"];

export function normalizeQuestionType(type) {
  if (type === "MCQ") return "SINGLE_CHOICE";
  return type;
}

function arraysEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort((x, y) => x - y);
  const sortedB = [...b].sort((x, y) => x - y);
  return sortedA.every((value, index) => value === sortedB[index]);
}

export function calculateQuizScorePercent(answers, questions) {
  if (!Array.isArray(questions) || questions.length === 0) return null;
  if (!Array.isArray(answers)) return 0;

  let correctCount = 0;
  for (let i = 0; i < questions.length; i++) {
    if (scoreQuestionAnswer(answers[i], questions[i])) {
      correctCount++;
    }
  }

  return Math.round((correctCount / questions.length) * 100);
}

export function scoreQuestionAnswer(studentAnswer, question) {
  const type = normalizeQuestionType(question.type);

  if (type === "SHORT_ANSWER") {
    return (
      String(studentAnswer ?? "").trim().toLowerCase() ===
      String(question.correctAnswer ?? "").trim().toLowerCase()
    );
  }

  if (type === "TRUE_FALSE") {
    if (typeof question.correctAnswer === "boolean") {
      return studentAnswer === question.correctAnswer;
    }
    const expected = question.correctAnswer === 0 || question.correctAnswer === "true";
    return studentAnswer === expected;
  }

  if (type === "MULTIPLE_CHOICE") {
    const expected = Array.isArray(question.correctAnswer) ? question.correctAnswer : [];
    const given = Array.isArray(studentAnswer) ? studentAnswer : [];
    return arraysEqual(expected, given);
  }

  // SINGLE_CHOICE (and legacy MCQ)
  return studentAnswer === question.correctAnswer;
}

export function validateQuizQuestion(question, index) {
  const label = `Question ${index + 1}`;
  const type = normalizeQuestionType(question.type);

  if (!question.question?.trim()) {
    return `${label} text is required`;
  }

  if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
    if (!Array.isArray(question.options) || question.options.length < 2) {
      return `${label} needs at least 2 options`;
    }

    if (type === "SINGLE_CHOICE") {
      if (
        typeof question.correctAnswer !== "number" ||
        question.correctAnswer < 0 ||
        question.correctAnswer >= question.options.length
      ) {
        return `${label} must have one correct option selected`;
      }
    }

    if (type === "MULTIPLE_CHOICE") {
      if (!Array.isArray(question.correctAnswer) || question.correctAnswer.length === 0) {
        return `${label} must have at least one correct option selected`;
      }
      const invalid = question.correctAnswer.some(
        (idx) => typeof idx !== "number" || idx < 0 || idx >= question.options.length
      );
      if (invalid) {
        return `${label} has invalid correct options`;
      }
    }
  }

  if (type === "TRUE_FALSE" && typeof question.correctAnswer !== "boolean") {
    return `${label} must specify True or False as the correct answer`;
  }

  if (type === "SHORT_ANSWER" && !String(question.correctAnswer ?? "").trim()) {
    return `${label} needs an expected short answer`;
  }

  return null;
}

export function validateQuizQuestions(questions) {
  if (!Array.isArray(questions) || questions.length === 0) {
    return "At least one question is required";
  }

  for (let i = 0; i < questions.length; i += 1) {
    const error = validateQuizQuestion(questions[i], i);
    if (error) return error;
  }

  return null;
}
