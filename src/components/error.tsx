import { component$ } from "@builder.io/qwik";
import { Button } from "./button";

export const Error = component$((props: { error?: unknown }) => {
  return (
    <div class="grid w-full flex-1 place-items-center">
      <div class="flex flex-col items-center gap-2">
        <h1 class="text-9xl font-black">Error!</h1>
        <p class="mb-8 ml-1 font-semibold">Oops, Something Went Wrong</p>
        <Button
          onClick$={() => {
            window.location.reload();
          }}
        >
          Try Again
        </Button>
      </div>
      <pre>{JSON.stringify(props.error, null, 2)}</pre>
    </div>
  );
});
