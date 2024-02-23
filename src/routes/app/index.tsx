import {
  component$,
  useComputed$,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
import {
  server$,
  type DocumentHead,
  useLocation,
  routeLoader$,
} from "@builder.io/qwik-city";
import { Table, TableRow } from "~/components/table";
import { Timeline, TimelineItem } from "~/components/timeline";
import { DieselTabs } from "~/components/tabs";
import { useUser } from "./layout";
import moment from "moment-timezone";
import { isServer } from "@builder.io/qwik/build";
import { getSharedMap } from "../plugin";
import { graphql, graphqlLoader } from "~/utils/graphql";
import { dateString } from "~/utils/dates";
import { HiArrowDownTraySolid, HiEyeSolid } from "@qwikest/icons/heroicons";

export const head: DocumentHead = {
  title: "Welcome to Shaq",
  meta: [
    {
      name: "description",
      content: "Shaq site description",
    },
  ],
};

type DieselStatus = "trans-in" | "settled" | "loaded" | "landed" | "shipped";
export const formatStatus: Record<DieselStatus, string> = {
  "trans-in": "Transfer In",
  landed: "Landed",
  loaded: "Loaded",
  shipped: "Shipped",
  settled: "Settled",
};

type DbData = {
  id: string;
  from: string | null;
  to: string | null;
  currency: string;
  cost: number;
  volume: number;
  settlementDate?: string;
  statuses: { status: DieselStatus; date: string; documents: string[] }[];
};

export type Data = {
  id: string;
  from: string | null;
  to: string | null;
  currency: string;
  cost: number;
  volume: number;
  settlementDate?: Date;
  statuses: {
    status: DieselStatus;
    date: Date;
    documents: {
      url: string;
      title?: string | null;
      uploader: string;
      visibility: string;
      id: string;
    }[];
  }[];
};

function filterFalsy<T>(x: (T | undefined | null)[]) {
  return x.filter((y) => y) as T[];
}
const gqlQuery = graphql(`
  query Index {
    entities {
      accounts {
        fan
      }
    }
  }
`);

export const useGqlIndex = routeLoader$(graphqlLoader(gqlQuery, {}));

export const useData = routeLoader$(async (ev) => {
  const redis = getSharedMap(ev.sharedMap, "redis");

  const fans = await ev.resolveValue(useGqlIndex);

  if (!fans.success) {
    throw ev.error(500, "Failed to get accounts");
  }

  const accounts = fans.entities.flatMap((x) => x.accounts);

  if (accounts.length === 0) {
    return [];
  }

  const accountShipmentsKeys = accounts.map((x) => `shipments:${x.fan}`);
  const redisShipmentKeys: (string[] | null)[] =
    await redis.mget(accountShipmentsKeys);
  const shipmentKeys = filterFalsy(redisShipmentKeys)
    .flat()
    .flatMap((x) => `shipment:${x}`);

  const dbData = (await redis.mget(shipmentKeys)).filter((x) => x) as DbData[];
  const nerveCentre = getSharedMap(ev.sharedMap, "nerveCentre");

  const documents = filterFalsy(
    await Promise.all(
      dbData
        .flatMap((x) => x.statuses.flatMap((y) => y.documents))
        .map((documentId) =>
          nerveCentre
            .GET("/admin/document", { params: { query: { documentId } } })
            .then((x) => x.data),
        ),
    ),
  );
  const formattedDocuments = (documents as typeof documents).map(
    (document) => ({
      ...document.document,
      url: document.url,
    }),
  );

  // Map the nested document within each data object.
  const data: Data[] = dbData
    .map((dataEntry) => ({
      ...dataEntry,
      settlementDate: dataEntry.settlementDate
        ? new Date(dataEntry.settlementDate)
        : undefined,
      statuses: dataEntry.statuses
        .map((status) => ({
          ...status,
          date: new Date(status.date),
          documents: filterFalsy(
            status.documents.map((document) =>
              formattedDocuments.find((x) => x.id === document),
            ),
          ),
        }))
        .sort((a, b) => b.date.getTime() - a.date.getTime()),
    }))
    .sort((a, b) => {
      const aDate = a.settlementDate ?? a.statuses.at(0)?.date;
      const bDate = b.settlementDate ?? b.statuses.at(0)?.date;
      if (aDate && bDate) {
        return bDate.getTime() - aDate.getTime();
      }
      if (bDate) {
        return 1;
      }
      if (aDate) {
        return -1;
      }
      return 0;
    });

  return data;
});

const getServerHours = server$(function () {
  const timezone = this.request.headers.get("cf-timezone");
  if (!timezone) return new Date().getHours();
  else return moment().tz(timezone).hours();
});

const toRow = (row: Data) => {
  const outputRow = [];
  const latest = row.statuses.at(0);

  const settlementDate = row.settlementDate;
  outputRow.push(dateString(settlementDate ?? latest?.date) || "No Data");

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
  outputRow.push(latest ? formatStatus[latest.status] : "No Data");
  return outputRow;
};

export default component$(() => {
  const user = useUser();
  const gql = useGqlIndex();

  const entities = useComputed$(() => gql.value.entities ?? []);
  const accounts = useComputed$(() =>
    entities.value.flatMap((x) => x.accounts),
  );

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
    <div class="flex-1">
      <div class="mb-4 border-l-4 border-stone-800 px-2">
        <span>{greeting},</span>
        <h1 class="border-l-stone-300 text-4xl font-semibold">
          {user.value.nickname || user.value.given_name || user.value.name}
        </h1>
      </div>
      {entities.value.length !== 0 && accounts.value.length !== 0 ? (
        <HomeDisplay />
      ) : (
        <RequireOnboarding hasEntities={!!entities.value.length} />
      )}
    </div>
  );
});

const getFileDownloadUrl = (loc: URL, fileUrl: string) => {
  const url = new URL("/prx", loc);
  url.searchParams.set("url", fileUrl);
  return url.toString();
};

export const HomeDisplay = component$(() => {
  const loc = useLocation();

  const data = useData();

  const tabs = useComputed$(() => {
    const output = {
      "3-months": [] as Data[],
      "next-month": [] as Data[],
      "this-month": [] as Data[],
      "in-transit": [] as Data[],
      landed: [] as Data[],
      settled: [] as Data[],
      "year-to-date": [] as Data[],
    };

    const threeMonths = new Date();
    threeMonths.setUTCMonth(threeMonths.getUTCMonth() + 3);
    const nextMonth = new Date();
    nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
    const currentDate = new Date();

    for (const row of data.value) {
      if (row.settlementDate) {
        const date = row.settlementDate;
        if (
          date.getTime() < threeMonths.getTime() &&
          date.getTime() > currentDate.getTime()
        ) {
          output["3-months"].push(row);
        }
        if (
          date.getUTCFullYear() === currentDate.getUTCFullYear() &&
          date.getUTCMonth() === currentDate.getUTCMonth()
        ) {
          output["this-month"].push(row);
        }
        if (
          date.getUTCFullYear() === nextMonth.getUTCFullYear() &&
          date.getUTCMonth() === nextMonth.getUTCMonth()
        ) {
          output["next-month"].push(row);
        }
        if (
          date.getUTCFullYear() === currentDate.getUTCFullYear() &&
          date.getTime() < currentDate.getTime()
        ) {
          output["year-to-date"].push(row);
        }
      }
      if (row.statuses.some((update) => update.status === "settled")) {
        output.settled.push(row);
        continue;
      }
      if (row.statuses.some((update) => update.status === "landed")) {
        output.landed.push(row);
        continue;
      }
      if (row.statuses.length <= 1) {
        continue;
      }
      output["in-transit"].push(row);
    }
    return output;
  });

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
  const visibleRows = useComputed$(() => {
    if (selectedTab.value === null) return data.value;
    else return tabs.value[selectedTab.value as keyof typeof tabs.value];
  });

  const headings = ["Date", "Volume (MT)", "Price", "Cost", "Status"];

  return (
    <>
      <DieselTabs
        selectedTab={selectedTab}
        tabs={[
          {
            label: "Next month",
            filter: "next-month",
            rows: tabs.value["next-month"],
          },
          {
            label: "This month",
            filter: "this-month",
            rows: tabs.value["this-month"],
          },
          {
            label: "In the next 3 months",
            filter: "3-months",
            rows: tabs.value["3-months"],
          },
          {
            label: "In Transit",
            filter: "in-transit",
            rows: tabs.value["in-transit"],
          },
          {
            label: "Landed",
            filter: "landed",
            rows: tabs.value["landed"],
          },
          {
            label: "Settled",
            filter: "settled",
            rows: tabs.value["settled"],
          },
          {
            label: "Year To Date",
            filter: "year-to-date",
            rows: tabs.value["year-to-date"],
          },
        ]}
      ></DieselTabs>
      <Table headings={headings}>
        {visibleRows.value.map((row) => (
          <TableRow row={toRow(row)} key={row.id}>
            <Timeline>
              {row.statuses.length === 0 && (
                <TimelineItem
                  step={{ date: new Date(), title: "No Data" }}
                ></TimelineItem>
              )}
              {row.statuses
                .map((step) => ({
                  ...step,
                  title: formatStatus[step.status],
                }))
                .map((step) => (
                  <TimelineItem key={step.status} step={step}>
                    <ul key={step.status}>
                      {step.documents.map((doc) => (
                        <li key={doc.id}>
                          <a
                            href={doc.url}
                            class="hover:underline"
                            target="_blank"
                          >
                            {doc.title}
                          </a>
                          <a
                            href={getFileDownloadUrl(loc.url, doc.url)}
                            class="ml-2"
                            download={doc.title?.replaceAll(" ", "-")}
                            target="_blank"
                          >
                            <HiArrowDownTraySolid class="align-icon inline" />
                          </a>
                          <a class="ml-1" href={doc.url} target="_blank">
                            <HiEyeSolid class="align-icon inline" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </TimelineItem>
                ))}
            </Timeline>
          </TableRow>
        ))}
      </Table>
    </>
  );
});

export const RequireOnboarding = component$<{
  hasEntities: boolean;
}>((props) => {
  return (
    <div class="text-lg">
      {props.hasEntities && <p>You do not have any accounts set up.</p>}
      <p>
        Please contact us at{" "}
        <a href="mailto:nerve@finplex.com.au" class="font-semibold underline">
          nerve@finplex.com.au
        </a>{" "}
        to begin the onboarding process.
      </p>
    </div>
  );
});
