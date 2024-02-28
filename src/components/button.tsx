import { type QwikIntrinsicElements, Slot, component$ } from "@builder.io/qwik";
import type { ClassNameValue } from "tailwind-merge";
import { twMerge } from "tailwind-merge";

export const Button = component$(
  ({
    class: propClass,
    ...props
  }: QwikIntrinsicElements["button"] & { class?: ClassNameValue }) => {
    return (
      <button
        class={twMerge([
          "rounded-md bg-gradient-to-t from-stone-400 to-stone-500/80 px-4 py-2 font-semibold text-white transition-colors duration-200 ease-in-out hover:from-stone-500 hover:to-stone-600/80 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-opacity-50 active:from-stone-600 active:to-stone-700/80 active:ring-2 active:ring-stone-700 active:ring-opacity-50 disabled:cursor-not-allowed disabled:from-stone-300 disabled:to-stone-400/80 disabled:opacity-80 disabled:ring-2 disabled:ring-stone-400 disabled:ring-opacity-50",
          propClass,
        ])}
        {...props}
      >
        <Slot></Slot>
      </button>
    );
  },
);
