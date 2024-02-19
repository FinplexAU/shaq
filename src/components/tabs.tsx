import { component$, useComputed$ } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";

type TabConfig = {
  label: string;
  href: string;
  metricTons: number;
  cost: number;
};
interface TabsProps {
  tabs: TabConfig[];
}

export const Tabs = component$((props: TabsProps) => {
  const loc = useLocation();

  const maxTonnage = useComputed$(() => {
    return props.tabs.reduce((acc, tab) => {
      return Math.max(acc, tab.metricTons);
    }, 0);
  });

  return (
    <div class="w-full  border-b border-gray-200 text-center text-sm font-medium ">
      <ul class="-mb-px flex w-full flex-wrap justify-between">
        {props.tabs.map((tab) => (
          <Link
            class={[
              "relative me-2 flex-1 before:absolute before:bottom-0 before:left-0 before:h-[var(--oil-height)] before:w-full before:bg-stone-200 before:content-['']",
              {
                "border-b-2 border-stone-600 bg-stone-700 before:bg-stone-600":
                  loc.url.search === tab.href,
              },
            ]}
            key={tab.href}
            href={tab.href}
            aria-current={loc.url.search === tab.href ? "page" : undefined}
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
                "relative z-20 me-2 inline-block w-full flex-1 rounded-t-lg p-4 text-black ",
                {
                  "active inline-block rounded-t-lg p-4 !text-white  ":
                    loc.url.search === tab.href,
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
          </Link>
        ))}
      </ul>
    </div>
  );
});
