"use client";

import { isMultipleChoice, isSingleChoice, toggleMultipleChoiceAnswer } from "@/lib/quizQuestions";

interface StudentChoiceInputProps {
  questionIndex: number;
  question: {
    id: string;
    type: string;
    options?: string[];
  };
  value: unknown;
  onChange: (value: unknown) => void;
}

export function StudentChoiceInput({
  questionIndex,
  question,
  value,
  onChange,
}: StudentChoiceInputProps) {
  if (isSingleChoice(question.type) && question.options) {
    return (
      <div className="space-y-2" role="radiogroup" aria-label={`Question ${questionIndex + 1} options`}>
        {question.options.map((option, optIdx) => (
          <label key={optIdx} className="flex cursor-pointer items-center gap-3">
            <input
              type="radio"
              name={`q-${questionIndex}`}
              value={optIdx}
              checked={value === optIdx}
              onChange={() => onChange(optIdx)}
              aria-label={`Option ${optIdx + 1}: ${option}`}
              className="h-4 w-4"
            />
            <span className="text-sm text-[#2A2A28] dark:text-white">{option}</span>
          </label>
        ))}
      </div>
    );
  }

  if (isMultipleChoice(question.type) && question.options) {
    const selected = Array.isArray(value) ? (value as number[]) : [];
    return (
      <div className="space-y-2" role="group" aria-label={`Question ${questionIndex + 1} options`}>
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-400">
          Select all that apply
        </p>
        {question.options.map((option, optIdx) => (
          <label key={optIdx} className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={selected.includes(optIdx)}
              onChange={() => onChange(toggleMultipleChoiceAnswer(selected, optIdx))}
              aria-label={`Option ${optIdx + 1}: ${option}`}
              className="h-4 w-4"
            />
            <span className="text-sm text-[#2A2A28] dark:text-white">{option}</span>
          </label>
        ))}
      </div>
    );
  }

  if (question.type === "TRUE_FALSE") {
    return (
      <div className="space-y-2" role="radiogroup" aria-label={`Question ${questionIndex + 1} true or false`}>
        {["True", "False"].map((label) => {
          const boolValue = label === "True";
          return (
            <label key={label} className="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name={`q-${questionIndex}`}
                checked={value === boolValue}
                onChange={() => onChange(boolValue)}
                aria-label={label}
                className="h-4 w-4"
              />
              <span className="text-sm text-[#2A2A28] dark:text-white">{label}</span>
            </label>
          );
        })}
      </div>
    );
  }

  if (question.type === "SHORT_ANSWER") {
    return (
      <input
        type="text"
        placeholder="Type your answer..."
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`Answer for question ${questionIndex + 1}`}
        className="w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-[#2A2A28] outline-none transition focus:border-[#2563EB] dark:border-white/10 dark:bg-white/10 dark:text-white"
      />
    );
  }

  return null;
}
