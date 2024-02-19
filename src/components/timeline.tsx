import { Slot, component$, useComputed$ } from "@builder.io/qwik";

type TimelineStep = {
  date: Date;
  title: string;
  description?: string;
};

interface TimelineProps {
  steps: TimelineStep[];
}

export const Timeline = component$((props: TimelineProps) => {
  const steps = useComputed$(() => {
    return props.steps.sort((a, b) => b.date.getTime() - a.date.getTime());
  });
  return (
    <ol class="relative border-s border-gray-200 dark:border-gray-700">
      {steps.value.map((step, i) => (
        <li class="mb-10 ms-4" key={i}>
          <div class="absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-gray-200 dark:border-gray-900 dark:bg-gray-700"></div>
          <time class="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
            {step.date.toLocaleDateString([], {
              dateStyle: "short",
            })}
          </time>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {step.title}
          </h3>
          <p class="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">
            {step.description}
          </p>
          <Slot name={`step-${i}`}></Slot>
        </li>
      ))}
    </ol>
  );
});
