import { Slot, component$ } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";

type TabConfig = {
  label: string;
  href: string;
};
interface TabsProps {
  tabs: TabConfig[];
}

export const Tabs = component$((props: TabsProps) => {
  const loc = useLocation();
  console.log(loc.url.search);
  return (
    <div class="grid w-full place-items-center border-b border-gray-200 text-center text-sm font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400">
      <ul class="-mb-px flex max-w-screen-lg flex-wrap justify-between">
        {props.tabs.map((tab) => (
          <li class="me-2" key={tab.label}>
            <Link
              href={tab.href}
              class={{
                "inline-block rounded-t-lg border-b-2 border-transparent p-4 hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300":
                  true,
                "active inline-block rounded-t-lg border-b-2 border-blue-600 p-4 text-blue-600 dark:border-blue-500 dark:text-blue-500":
                  loc.url.search === tab.href,
              }}
              aria-current={loc.url.search === tab.href ? "page" : undefined}
            >
              {tab.label}
            </Link>
            <Slot name={tab.href}></Slot>
          </li>
        ))}
      </ul>
    </div>
  );
});
