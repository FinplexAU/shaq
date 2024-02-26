import { component$, useComputed$ } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";

type TabConfig = {
  label: string;
  filter: string;
  totalCost: number;
  totalVolume: number;
};
interface TabsProps {
  tabs: TabConfig[];
  selectedTab: string | null;
}

const dieselHeightScalar = 0.4;

const getNavUrl = (url: URL, currentFilter: string | null, filter: string) => {
  const searchParams = new URLSearchParams(url.searchParams);
  if (filter === currentFilter) {
    searchParams.delete("filter");
  } else {
    searchParams.set("filter", filter);
  }

  const query = searchParams.toString();
  if (query) {
    return "?" + query;
  } else {
    return "./";
  }
};

export const DieselTabs = component$((props: TabsProps) => {
  const loc = useLocation();

  const maxVolume = useComputed$(() => {
    return props.tabs.reduce((acc, tab) => {
      return Math.max(acc, tab.totalVolume);
    }, 0);
  });

  return (
    <div class="w-full border-b border-t  py-2 text-center text-sm font-medium ">
      <ul class="-mb-px flex w-full flex-wrap justify-between divide-x">
        {props.tabs.map((tab) => (
          <Link
            href={getNavUrl(loc.url, props.selectedTab, tab.filter)}
            key={tab.filter}
            aria-current={props.selectedTab === tab.filter ? "page" : undefined}
            style={{
              "--oil-height": `${Math.max(
                0,
                ((maxVolume.value - (maxVolume.value - tab.totalVolume)) /
                  maxVolume.value) *
                  100 *
                  dieselHeightScalar,
              )}%`,
            }}
            class={["relative flex-1 px-2"]}
          >
            <li
              class={[
                "relative inline-block h-full w-full flex-1 p-4 text-black before:absolute  before:bottom-0 before:left-0 before:-z-10 before:h-[var(--oil-height)] before:w-full before:bg-stone-200 before:content-['']",
                {
                  "active inline-block bg-stone-700 p-4 !text-white before:bg-stone-600 ":
                    props.selectedTab === tab.filter,
                },
              ]}
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
            </li>
          </Link>
        ))}
      </ul>
    </div>
  );
});
