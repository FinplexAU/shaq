import {
  Slot,
  component$,
  createContextId,
  useContext,
  useContextProvider,
  useSignal,
  useStore,
  useTask$,
} from "@builder.io/qwik";

interface TableProps {
  headings: string[];
}

export type TableContext = {
  openRow: number | null;
  count: number;
  columnCount: number;
};
export const TableContext = createContextId<TableContext>("components/table");

export const Table = component$((props: TableProps) => {
  const ctx = useStore<TableContext>({
    openRow: null,
    count: 0,
    columnCount: props.headings.length,
  });

  // Qwik has some issue where it just fails if the context is in the table component, despite that seeming like it should work.
  // This is because qwik for some reason thinks it can remove the context provider as it doesn't detect it being used.
  // The workaround for this is to consume the context immediately to avoid its removal.
  // https://github.com/BuilderIO/qwik/issues/5411
  useContextProvider(TableContext, ctx);
  useContext(TableContext);
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
          <Slot />
        </tbody>
      </table>
    </div>
  );
});

export const TableRow = component$<{ row: string[] }>((props) => {
  const ctx = useContext(TableContext);

  useTask$(() => {
    ctx.count++;
  });
  const id = useSignal(ctx.count);

  return (
    <>
      <tr
        onClick$={() => {
          if (id.value == ctx.openRow) {
            ctx.openRow = null;
          } else {
            ctx.openRow = id.value;
          }
        }}
        class="cursor-pointer border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
      >
        {props.row.map((cell, j) => (
          <td key={j} class="px-6 py-4 capitalize">
            {cell}
          </td>
        ))}
      </tr>
      <tr
        class={[
          "border-b bg-white dark:border-gray-700 dark:bg-gray-800 ",
          {
            hidden: ctx.openRow !== id.value,
          },
        ]}
      >
        <td colSpan={ctx.columnCount} class="px-6 py-4 ">
          <Slot />
        </td>
      </tr>
    </>
  );
});
