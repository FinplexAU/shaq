import type { QwikIntrinsicElements } from "@builder.io/qwik";
import { component$, useComputed$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";

type ImageAttributes = QwikIntrinsicElements["img"];

export default component$<ImageAttributes>((props) => {
  const loc = useLocation();
  const src = useComputed$(() => {
    if (!props.src) return undefined;

    const url = new URL("/app/img/", loc.url);
    url.searchParams.set("url", props.src);
    return url.toString();
  });
  return <img {...props} src={src.value} />;
});
