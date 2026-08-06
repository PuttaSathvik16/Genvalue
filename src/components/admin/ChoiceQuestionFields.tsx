"use client";

import { FaCircleCheck, FaPlus, FaTrash } from "react-icons/fa6";
import {
  isMultipleChoice,
  isSingleChoice,
  normalizeQuestionType,
  questionTypeLabel,
  toggleMultipleChoiceAnswer,
  type BaseQuizQuestion,
  type QuizQuestionType,
} from "@/lib/quizQuestions";

const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-[#2563EB] dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-[#60A5FA]";

const labelClass =
  "mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-[#6B6558] dark:text-slate-400";

interface ChoiceQuestionFieldsProps {
  question: BaseQuizQuestion;
  index: number;
  onUpdate: (patch: Partial<BaseQuizQuestion>) => void;
  onTypeChange: (type: QuizQuestionType) => void;
}

export function ChoiceQuestionFields({
  question,
  index,
  onUpdate,
  onTypeChange,
}: ChoiceQuestionFieldsProps) {
  const normalizedType = normalizeQuestionType(question.type);

  const updateOption = (optIdx: number, value: string) => {
    const options = [...question.options];
    options[optIdx] = value;
    onUpdate({ options });
  };

  const addOption = () => {
    onUpdate({
      options: [...question.options, `Option ${String.fromCharCode(65 + question.options.length)}`],
    });
  };

  const removeOption = (optIdx: number) => {
    if (question.options.length <= 2) return;
    const options = question.options.filter((_, i) => i !== optIdx);

    if (isMultipleChoice(question.type)) {
      const current = Array.isArray(question.correctAnswer) ? question.correctAnswer : [];
      onUpdate({
        options,
        correctAnswer: current
          .filter((i) => i !== optIdx)
          .map((i) => (i > optIdx ? i - 1 : i)),
      });
      return;
    }

    let correctAnswer = question.correctAnswer;
    if (typeof correctAnswer === "number") {
      if (correctAnswer === optIdx) correctAnswer = 0;
      else if (correctAnswer > optIdx) correctAnswer -= 1;
    }
    onUpdate({ options, correctAnswer });
  };

  const handleTypeSelect = (type: QuizQuestionType) => {
    onTypeChange(type);
  };

  return (
    <>
      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Question type</label>
          <select
            value={normalizedType}
            onChange={(e) => handleTypeSelect(e.target.value as QuizQuestionType)}
            aria-label={`Question ${index + 1} type`}
            className={inputClass}
          >
            <option value="SINGLE_CHOICE">Single choice (radio)</option>
            <option value="MULTIPLE_CHOICE">Multiple choice (checkboxes)</option>
            <option value="TRUE_FALSE">True / False</option>
            <option value="SHORT_ANSWER">Short answer</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Points</label>
          <input
            type="number"
            min={1}
            value={question.points}
            onChange={(e) => onUpdate({ points: parseInt(e.target.value, 10) || 1 })}
            aria-label={`Question ${index + 1} points`}
            className={inputClass}
          />
        </div>
      </div>

      {isSingleChoice(question.type) && (
        <div>
          <p className={labelClass}>Options - select one correct answer (students see radio buttons)</p>
          <div className="space-y-2">
            {question.options.map((option, optIdx) => (
              <div key={optIdx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`single-correct-${question.id}`}
                  checked={question.correctAnswer === optIdx}
                  onChange={() => onUpdate({ correctAnswer: optIdx })}
                  aria-label={`Single choice correct option ${optIdx + 1}`}
                  className="h-4 w-4 shrink-0"
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(optIdx, e.target.value)}
                  aria-label={`Question ${index + 1} option ${optIdx + 1}`}
                  className={`${inputClass} flex-1`}
                />
                {question.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(optIdx)}
                    aria-label={`Remove option ${optIdx + 1}`}
                    className="rounded p-1.5 text-red-600 hover:bg-red-500/10 dark:text-red-400"
                  >
                    <FaTrash className="h-3 w-3" />
                  </button>
                )}
                {question.correctAnswer === optIdx && (
                  <FaCircleCheck className="h-3.5 w-3.5 shrink-0 text-[#10B981]" aria-hidden />
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addOption}
            aria-label={`Add option to question ${index + 1}`}
            className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#2563EB] dark:text-[#60A5FA]"
          >
            <FaPlus className="h-3 w-3" /> Add option
          </button>
        </div>
      )}

      {isMultipleChoice(question.type) && (
        <div>
          <p className={labelClass}>
            Options - check all correct answers (students see checkboxes)
          </p>
          <div className="space-y-2">
            {question.options.map((option, optIdx) => {
              const selected = Array.isArray(question.correctAnswer)
                ? question.correctAnswer.includes(optIdx)
                : false;
              return (
                <div key={optIdx} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => {
                      const current = Array.isArray(question.correctAnswer) ? question.correctAnswer : [];
                      onUpdate({
                        correctAnswer: toggleMultipleChoiceAnswer(current, optIdx),
                      });
                    }}
                    aria-label={`Multiple choice correct option ${optIdx + 1}`}
                    className="h-4 w-4 shrink-0"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(optIdx, e.target.value)}
                    aria-label={`Question ${index + 1} option ${optIdx + 1}`}
                    className={`${inputClass} flex-1`}
                  />
                  {question.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(optIdx)}
                      aria-label={`Remove option ${optIdx + 1}`}
                      className="rounded p-1.5 text-red-600 hover:bg-red-500/10 dark:text-red-400"
                    >
                      <FaTrash className="h-3 w-3" />
                    </button>
                  )}
                  {selected && (
                    <FaCircleCheck className="h-3.5 w-3.5 shrink-0 text-[#10B981]" aria-hidden />
                  )}
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={addOption}
            aria-label={`Add option to question ${index + 1}`}
            className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#2563EB] dark:text-[#60A5FA]"
          >
            <FaPlus className="h-3 w-3" /> Add option
          </button>
        </div>
      )}

      {normalizedType === "TRUE_FALSE" && (
        <div>
          <p className={labelClass}>Correct answer (students see radio buttons)</p>
          <div className="flex gap-4">
            {(["true", "false"] as const).map((value) => {
              const isTrue = value === "true";
              const checked = question.correctAnswer === isTrue;
              return (
                <label key={value} className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="radio"
                    name={`tf-${question.id}`}
                    checked={checked}
                    onChange={() => onUpdate({ correctAnswer: isTrue })}
                    aria-label={`Correct answer ${isTrue ? "True" : "False"}`}
                    className="h-4 w-4"
                  />
                  {isTrue ? "True" : "False"}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {normalizedType === "SHORT_ANSWER" && (
        <div>
          <label className={labelClass}>Expected answer (case-insensitive match)</label>
          <input
            type="text"
            value={String(question.correctAnswer ?? "")}
            onChange={(e) => onUpdate({ correctAnswer: e.target.value })}
            placeholder="e.g. Retrieval-Augmented Generation"
            aria-label={`Expected answer for question ${index + 1}`}
            className={inputClass}
          />
        </div>
      )}

      <p className="mt-2 text-[10px] text-[#6B6558] dark:text-slate-500">
        Type: {questionTypeLabel(question.type)}
      </p>
    </>
  );
}
