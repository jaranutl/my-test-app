"use client";

import { Check } from "lucide-react";

export type StepProgressProps = {
  steps: string[];
  currentIndex: number;
  onStepClick?: (index: number) => void;
};

export const StepProgress = ({ steps, currentIndex, onStepClick }: StepProgressProps) => {
  return (
    <div className="grid" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
      {steps.map((title, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        const Wrapper = onStepClick ? "button" : "div";

        return (
          <Wrapper
            key={title}
            type={onStepClick ? "button" : undefined}
            onClick={onStepClick ? () => onStepClick(index) : undefined}
            className="relative flex flex-col items-center gap-2 text-xs"
          >
            <span
              className={`z-10 grid size-8 place-items-center rounded-full border-2 ${
                isDone
                  ? "border-[#dd5f83] bg-[#dd5f83] text-white"
                  : isCurrent
                    ? "border-[#dd5f83] bg-white text-[#dd5f83]"
                    : "border-stone-200 bg-[#faf9f7] text-stone-300"
              }`}
            >
              {isDone ? <Check size={15} /> : index + 1}
            </span>
            <span className={isCurrent ? "font-semibold text-stone-800" : "text-stone-400"}>
              {title}
            </span>
            {index < steps.length - 1 && (
              <span
                className={`absolute left-1/2 top-4 h-0.5 w-full ${
                  isDone ? "bg-[#dd5f83]" : "bg-stone-200"
                }`}
              />
            )}
          </Wrapper>
        );
      })}
    </div>
  );
};
