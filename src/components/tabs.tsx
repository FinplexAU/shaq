import {
  component$,
  useComputed$,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import { isServer } from "@builder.io/qwik/build";

type TabConfig = {
  label: string;
  filter: string;
  metricTons: number;
  cost: number;
};
interface TabsProps {
  tabs: TabConfig[];
}

export const DieselTabs = component$((props: TabsProps) => {
  const loc = useLocation();
  const initialTab = loc.url.searchParams.get("filter");

  const selectedTab = useSignal(initialTab);

  useTask$(({ track }) => {
    const tab = track(selectedTab);

    if (isServer) return;

    const url = new URL(window.location.href);

    if (tab) url.searchParams.set("filter", tab);
    else url.searchParams.delete("filter");

    window.history.replaceState({ path: url.toString() }, "", url.toString());
  });

  const maxTonnage = useComputed$(() => {
    return props.tabs.reduce((acc, tab) => {
      return Math.max(acc, tab.metricTons);
    }, 0);
  });

  return (
    <div class="w-full border-b border-t border-gray-200 py-2 text-center text-sm font-medium ">
      <ul class="-mb-px flex w-full flex-wrap justify-between divide-x">
        {props.tabs.map((tab) => (
          <button
            class={["relative flex-1 px-2"]}
            key={tab.filter}
            aria-current={selectedTab.value === tab.filter ? "page" : undefined}
            onClick$={() => {
              if (selectedTab.value === tab.filter) selectedTab.value = null;
              else selectedTab.value = tab.filter;
            }}
            style={{
              "--oil-height": `${Math.max(
                0,
                ((tab.metricTons - 0.3 * maxTonnage.value) /
                  (tab.metricTons -
                    0.3 * maxTonnage.value +
                    maxTonnage.value)) *
                  100,
              )}%`,
            }}
          >
            <li
              class={[
                "relative inline-block w-full flex-1 p-4 text-black before:absolute  before:bottom-0 before:left-0 before:-z-10 before:h-[var(--oil-height)] before:w-full before:bg-stone-200 before:content-['']",
                {
                  "active inline-block bg-stone-700 p-4 !text-white before:bg-stone-600 ":
                    selectedTab.value === tab.filter,
                },
              ]}
              key={tab.label}
            >
              <p class="pb-2 font-bold">{tab.label}</p>
              <p>{tab.metricTons.toLocaleString()} MT</p>
              <p>
                {tab.cost.toLocaleString([], {
                  style: "currency",
                  currency: "USD",
                  currencyDisplay: "narrowSymbol",
                })}
              </p>
            </li>
          </button>
        ))}
      </ul>
    </div>
  );
});
