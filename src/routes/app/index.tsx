import { component$, useComputed$ } from "@builder.io/qwik";
import { server$, type DocumentHead } from "@builder.io/qwik-city";
import { Table } from "~/components/table";
import { Timeline } from "~/components/timeline";
import data from "../../../public/data.json";
import { DieselTabs } from "~/components/tabs";
import { useUser } from "./layout";
import moment from "moment-timezone";
import { isServer } from "@builder.io/qwik/build";

const getServerHours = server$(function () {
  const timezone = this.request.headers.get("cf-timezone");
  if (!timezone) return new Date().getHours();
  else return moment().tz(timezone).hours();
});

export default component$(() => {
  const user = useUser();
  const rows = useComputed$(() => {
    const output = [];
    for (const row of data) {
      const outputRow = [];
      const latest = row.statusUpdates.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

      outputRow.push(latest[0].date);
      outputRow.push(row.volume.toString());
      outputRow.push(
        (row.cost / row.volume).toLocaleString([], {
          style: "currency",
          currency: "USD",
          currencyDisplay: "narrowSymbol",
        }),
      );
      outputRow.push(
        row.cost.toLocaleString([], {
          style: "currency",
          currency: "USD",
          currencyDisplay: "narrowSymbol",
        }),
      );
      outputRow.push(latest[0].status);
      output.push(outputRow);
    }
    return output;
  });

  const tabs = useComputed$(() => {
    const output = {
      "3-months": {
        metricTons: 0,
        cost: 0,
      },
      "next-month": {
        metricTons: 0,
        cost: 0,
      },
      "this-month": {
        metricTons: 0,
        cost: 0,
      },
      "in-transit": {
        metricTons: 0,
        cost: 0,
      },
      landed: {
        metricTons: 0,
        cost: 0,
      },
      settled: {
        metricTons: 0,
        cost: 0,
      },
      "year-to-date": {
        metricTons: 0,
        cost: 0,
      },
    };

    for (const row of data) {
      if (row.statusUpdates.some((update) => update.status === "Settled")) {
        output["settled"].metricTons += row.volume;
        output["settled"].cost += row.cost;
        continue;
      }
      if (row.statusUpdates.some((update) => update.status === "Landed")) {
        output["landed"].metricTons += row.volume;
        output["landed"].cost += row.cost;
        continue;
      }
      if (row.statusUpdates.length === 1) {
        continue;
        // const date = new Date(row.statusUpdates[0].date);
      }
      output["in-transit"].metricTons += row.volume;
      output["in-transit"].cost += row.cost;
    }
    return output;
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  const greeting = useComputed$(async () => {
    let curHr;

    if (isServer) curHr = await getServerHours();
    else curHr = new Date().getHours();

    if (curHr < 12) {
      return "Good Morning";
    } else if (curHr < 18) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  });

  return (
    <div class="flex-1 py-8">
      <div class="mb-4 border-l-4 border-stone-800 px-2">
        <span>{greeting},</span>
        <h1 class="border-l-stone-300 text-4xl font-semibold">
          {user.value.nickname || user.value.given_name || user.value.name}
        </h1>
      </div>
      <DieselTabs
        tabs={[
          {
            label: "In 3 months",
            href: "?filter=3-months",
            cost: tabs.value["3-months"].cost,
            metricTons: tabs.value["3-months"].metricTons,
          },
          {
            label: "Next month",
            href: "?filter=next-month",
            cost: tabs.value["next-month"].cost,
            metricTons: tabs.value["next-month"].metricTons,
          },
          {
            label: "This month",
            href: "?filter=this-month",
            cost: tabs.value["this-month"].cost,
            metricTons: tabs.value["this-month"].metricTons,
          },
          {
            label: "In Transit",
            href: "?filter=in-transit",
            cost: tabs.value["in-transit"].cost,
            metricTons: tabs.value["in-transit"].metricTons,
          },
          {
            label: "Landed",
            href: "?filter=landed",
            cost: tabs.value["landed"].cost,
            metricTons: tabs.value["landed"].metricTons,
          },
          {
            label: "Settled",
            href: "?filter=settled",
            cost: tabs.value["settled"].cost,
            metricTons: tabs.value["settled"].metricTons,
          },
          {
            label: "Year To Date",
            href: "?filter=year-to-date",
            cost: tabs.value["settled"].cost,
            metricTons: tabs.value["settled"].metricTons,
          },
        ]}
      ></DieselTabs>
      <Table
        headings={["Date", "Volume (MT)", "Price", "Cost", "Status"]}
        rows={rows.value}
      >
        {data.map((row, i) => (
          <Timeline
            key={i}
            q:slot={`row-${i}`}
            steps={row.statusUpdates.map((update) => ({
              date: new Date(update.date),
              title: update.status,
            }))}
          >
            {row.statusUpdates.map((update, i) => (
              <ul key={update.status} q:slot={`step-${i}`}>
                {update.documents.map((doc) => (
                  <li class="cursor-pointer hover:underline" key={doc}>
                    {doc}
                  </li>
                ))}
              </ul>
            ))}
          </Timeline>
        ))}
      </Table>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Shaq",
  meta: [
    {
      name: "description",
      content: "Shaq site description",
    },
  ],
};
