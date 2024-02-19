import { component$, useComputed$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Tabs } from "~/components/tabs";
import { Table } from "~/components/table";
import { Timeline } from "~/components/timeline";
import data from "../../public/data.json";

export default component$(() => {
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
  return (
    <>
      <Tabs
        tabs={[
          {
            label: "In 3 months",
            href: "?filter=3-months",
          },
          {
            label: "Next month",
            href: "?filter=next-month",
          },
          {
            label: "This month",
            href: "?filter=this-month",
          },
          {
            label: "In Transit",
            href: "?filter=in-transit",
          },
          {
            label: "Landed",
            href: "?filter=landed",
          },
          {
            label: "Settled",
            href: "?filter=settled",
          },
          {
            label: "Year To Date",
            href: "?filter=year-to-date",
          },
        ]}
      ></Tabs>
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
              description: "View Documents",
            }))}
          ></Timeline>
        ))}
      </Table>
    </>
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
