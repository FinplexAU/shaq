import type { Signal } from "@builder.io/qwik";
import { component$, useComputed$ } from "@builder.io/qwik";
import type { Data } from "~/routes/app";

type TabConfig = {
  label: string;
  filter: string;
  rows: Data[];
};
interface TabsProps {
  tabs: TabConfig[];
  selectedTab: Signal<string | null>;
}

const dieselHeightScalar = 0.4;

export const DieselTabs = component$((props: TabsProps) => {
  const mappedRows = useComputed$(() => {
    return props.tabs.map((x) => ({
      filter: x.filter,
      label: x.label,
      rows: x.rows,
      totalCost: x.rows.reduce((a, b) => a + b.cost, 0),
      totalVolume: x.rows.reduce((a, b) => a + b.volume, 0),
    }));
  });

  const maxVolume = useComputed$(() => {
    return mappedRows.value.reduce((acc, tab) => {
      return Math.max(acc, tab.totalVolume);
    }, 0);
  });

  return (
    <div class="w-full border-b border-t  py-2 text-center text-sm font-medium ">
      <ul class="-mb-px flex w-full flex-wrap justify-between divide-x">
        {mappedRows.value.map((tab) => (
          <li
            class={["relative flex-1 px-2"]}
            key={tab.filter}
            aria-current={
              props.selectedTab.value === tab.filter ? "page" : undefined
            }
            style={{
              "--oil-height": `${Math.max(
                0,
                ((maxVolume.value - (maxVolume.value - tab.totalVolume)) /
                  maxVolume.value) *
                  100 *
                  dieselHeightScalar,
              )}%`,
            }}
          >
            <button
              class={[
                "relative inline-block h-full w-full flex-1 p-4 text-black before:absolute  before:bottom-0 before:left-0 before:-z-10 before:h-[var(--oil-height)] before:w-full before:bg-stone-200 before:content-['']",
                {
                  "active inline-block bg-stone-700 p-4 !text-white before:bg-stone-600 ":
                    props.selectedTab.value === tab.filter,
                },
              ]}
              onClick$={() => {
                props.selectedTab.value = tab.filter;
              }}
              key={tab.label}
            >
              <p class="pb-2 font-bold">{tab.label}</p>
              <p>{tab.totalVolume.toLocaleString()} MT</p>
              <p>
                {tab.totalCost.toLocaleString([], {
                  style: "currency",
                  currency: "USD",
                  currencyDisplay: "narrowSymbol",
                })}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
});
