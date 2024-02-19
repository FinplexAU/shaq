import { Fragment, Slot, component$, useSignal } from "@builder.io/qwik";

interface TableProps {
  headings: string[];
  rows: string[][];
}

export const Table = component$((props: TableProps) => {
  const openRow = useSignal<number | null>(null);
  return (
    <div class="relative overflow-x-auto">
      <table class="w-full text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
        <thead class="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            {props.headings.map((heading, i) => (
              <th key={i} scope="col" class="px-6 py-3">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row, i) => (
            <Fragment key={i}>
              <tr
                onClick$={() => {
                  console.log(openRow.value, i);
                  if (openRow.value === i) {
                    openRow.value = null;
                  } else {
                    openRow.value = i;
                  }
                }}
                class="cursor-pointer border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
              >
                {row.map((cell, j) => (
                  <td key={j} class="px-6 py-4">
                    {cell}
                  </td>
                ))}
              </tr>
              <tr
                class={[
                  "border-b bg-white dark:border-gray-700 dark:bg-gray-800 ",
                  {
                    hidden: openRow.value !== i,
                  },
                ]}
              >
                <td colSpan={props.headings.length} class="px-6 py-4 ">
                  <Slot name={`row-${i}`}></Slot>
                </td>
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
});
