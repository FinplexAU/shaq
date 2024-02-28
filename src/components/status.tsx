import type { QwikIntrinsicElements } from "@builder.io/qwik";
import { component$, useComputed$ } from "@builder.io/qwik";
import colors from "tailwindcss/colors";

type DivAttributes = QwikIntrinsicElements["div"];

const propsNoClass = (props: DivAttributes) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { class: _, ...rest } = props;
  return rest;
};

export default component$<DivAttributes & { color: keyof typeof colors }>(
  (props) => {
    const color = useComputed$(() => {
      const twColor = colors[props.color];
      if (typeof twColor === "string") {
        return twColor;
      }
      return twColor["500"];
    });

    return (
      <div
        class={[props.class, "inline-block h-3 w-3 rounded-full"]}
        {...propsNoClass(props)}
        style={{ backgroundColor: color.value }}
      ></div>
    );
  },
);
