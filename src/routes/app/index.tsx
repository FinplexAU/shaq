import {
  component$,
  useComputed$,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
import {
  server$,
  useLocation,
  routeLoader$,
  routeAction$,
  zod$,
  z,
} from "@builder.io/qwik-city";
import { Table, TableRow } from "~/components/table";
import { Timeline, TimelineItem } from "~/components/timeline";
import { DieselTabs } from "~/components/tabs";
import moment from "moment-timezone";
import { isServer } from "@builder.io/qwik/build";
import { getSharedMap } from "../plugin";
import { graphql, graphqlLoader, graphqlRequest } from "~/utils/graphql";
import { dateString } from "~/utils/dates";
import { Error } from "~/components/error";
import Status from "~/components/status";
import type { DocumentModalInfo } from "./document-modal";
import DocumentModal from "./document-modal";

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
  trader: string;
  financier: string;
  currency: string;
  cost: number;
  volume: number;
  settlementDate?: string;
  statuses: {
    status: DieselStatus;
    date: string;
    documents: {
      id: string;
      approvedByTrader: string | number | Date | null;
      approvedByFinancier: string | number | Date | null;
    }[];
  }[];
};

export type DataDocument = {
  url: string;
  title?: string | null;
  uploader: string;
  visibility: string;
  id: string;
  approvedByTrader: Date | null;
  approvedByFinancier: Date | null;
};

export type Data = {
  id: string;
  trader: string;
  financier: string;
  currency: string;
  cost: number;
  volume: number;
  settlementDate?: Date;
  statuses: {
    status: DieselStatus;
    date: Date;
    documents: DataDocument[];
  }[];
};

function filterFalsy<T>(x: (T | undefined | null)[]) {
  return x.filter((y) => y) as T[];
}
const gqlQuery = graphql(`
  query Index {
    user {
      nickname
      givenName
      name
    }
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
    return { success: false as const, message: "Failed to get accounts" };
  }

  const accounts = fans.entities.flatMap((x) => x.accounts);

  if (accounts.length === 0) {
    return { success: true as const, data: [] };
  }

  const accountShipmentsKeys = accounts.map((x) => `shipments:${x.fan}`);
  const redisShipmentKeys: (string[] | null)[] =
    await redis.mget(accountShipmentsKeys);
  const shipmentKeys = filterFalsy(redisShipmentKeys)
    .flat()
    .flatMap((x) => `shipment:${x}`);

  if (shipmentKeys.length === 0) {
    return { success: true as const, data: [] };
  }
  const dbData = (await redis.mget(shipmentKeys)).filter((x) => x) as DbData[];
  const nerveCentre = getSharedMap(ev.sharedMap, "nerveCentre");

  console.log(JSON.stringify(dbData, null, 2));
  const documents = filterFalsy(
    await Promise.all(
      dbData
        .flatMap((x) => x.statuses.flatMap((y) => y.documents))
        .map((document) =>
          nerveCentre
            .GET("/admin/document", {
              params: { query: { documentId: document.id } },
            })
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
            status.documents.map((document) => ({
              ...formattedDocuments.find((x) => x.id === document.id)!,
              approvedByTrader: document.approvedByTrader
                ? new Date(document.approvedByTrader)
                : null,
              approvedByFinancier: document.approvedByFinancier
                ? new Date(document.approvedByFinancier)
                : null,
            })),
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

  return { success: true, data } as const;
});

export const useSetApproved = routeAction$(
  async (form, ev) => {
    const redis = getSharedMap(ev.sharedMap, "redis");
    const dataKey = `shipment:${form.shipmentId}`;
    const data = (await redis.get(dataKey)) as DbData | null;

    if (!data) {
      return ev.fail(404, { message: "Not found" });
    }

    const fansReq = await graphqlRequest(
      ev,
      graphql(`
        query IndexSetApproved {
          accounts {
            fan
          }
        }
      `),
      {},
    );

    if (!fansReq.success) {
      return ev.fail(500, { message: "Internal Server Error" });
    }
    const fans = fansReq.data.accounts.map((x) => x.fan);

    const isTrader = fans.includes(data.trader);
    const isFinancier = fans.includes(data.financier);

    if (!isTrader && !isFinancier) {
      return ev.fail(404, { message: "Not found" });
    }

    for (const status of data.statuses) {
      if (status.status !== form.status) {
        continue;
      }

      for (const document of status.documents) {
        if (document.id !== form.documentId) {
          continue;
        }

        const approvedDate = new Date();

        document.approvedByTrader ||= isTrader ? approvedDate : null;
        document.approvedByFinancier ||= isFinancier ? approvedDate : null;
      }

      console.log(dataKey, data);
      await redis.set(dataKey, data);
    }
  },
  zod$({
    shipmentId: z.string().uuid(),
    status: z.string(),
    documentId: z.string().uuid(),
  }),
);

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
  outputRow.push(latest?.date ?? "No Data");
  return outputRow;
};

export default component$(() => {
  const gql = useGqlIndex();
  const data = useData();

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

  if (!data.value.success || !gql.value.success) {
    return <Error />;
  }

  return (
    <div class="flex-1">
      <div class="mb-4 border-l-4 border-stone-800 px-2">
        <span>{greeting},</span>
        <h1 class="border-l-stone-300 text-4xl font-semibold">
          {gql.value.user?.nickname ||
            gql.value.user?.givenName ||
            gql.value.user?.name}
        </h1>
      </div>
      {entities.value.length !== 0 && accounts.value.length !== 0 ? (
        <HomeDisplay
          data={data.value.data}
          fans={accounts.value.map((x) => x.fan)}
        />
      ) : (
        <RequireOnboarding hasEntities={!!entities.value.length} />
      )}
    </div>
  );
});

const docStatusColor = (doc: DataDocument): "red" | "green" | "amber" => {
  if (doc.approvedByFinancier && doc.approvedByTrader) {
    return "green";
  }
  if (doc.approvedByFinancier || doc.approvedByTrader) {
    return "amber";
  }
  return "red";
};

export const HomeDisplay = component$<{ data: Data[]; fans: string[] }>(
  (props) => {
    const loc = useLocation();

    const selectedDocument = useSignal<DocumentModalInfo>();

    const tabs = useComputed$(() => {
      const output = {
        "3-months": [] as Data[],
        "next-month": [] as Data[],
        "this-month": [] as Data[],
        "in-transit": [] as Data[],
        landed: [] as Data[],
        "settled-this-month": [] as Data[],
        "settled-year-to-date": [] as Data[],
      };

      const threeMonths = new Date();
      threeMonths.setUTCMonth(threeMonths.getUTCMonth() + 3);
      const nextMonth = new Date();
      nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
      const currentDate = new Date();

      for (const row of props.data) {
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
          if (row.statuses.some((update) => update.status === "settled")) {
            if (
              date.getUTCFullYear() === currentDate.getUTCFullYear() &&
              date.getTime() < currentDate.getTime()
            ) {
              output["settled-year-to-date"].push(row);
            }
            if (
              date.getUTCFullYear() === currentDate.getUTCFullYear() &&
              date.getUTCMonth() === currentDate.getUTCMonth()
            ) {
              output["settled-this-month"].push(row);
            }
            continue;
          }
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
      if (selectedTab.value === null) return props.data;
      else {
        return (
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          tabs.value[selectedTab.value as keyof typeof tabs.value] ?? props.data
        );
      }
    });

    const headings = [
      "Settlement Date",
      "Volume (MT)",
      "Price",
      "Cost",
      "Status",
      "Last Updated",
    ];

    return (
      <>
        <DocumentModal document={selectedDocument} fans={props.fans} />
        <DieselTabs
          selectedTab={selectedTab}
          tabs={[
            {
              label: "This month",
              filter: "this-month",
              rows: tabs.value["this-month"],
            },
            {
              label: "Next month",
              filter: "next-month",
              rows: tabs.value["next-month"],
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
              label: "Settled This Month",
              filter: "settled-this-month",
              rows: tabs.value["settled-this-month"],
            },
            {
              label: "Settled this Year",
              filter: "settled-year-to-date",
              rows: tabs.value["settled-year-to-date"],
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
                            <Status color={docStatusColor(doc)} class="mr-1" />
                            <button
                              onClick$={async () => {
                                console.log(doc);
                                selectedDocument.value = {
                                  trader: row.trader,
                                  financier: row.financier,
                                  shipmentId: row.id,
                                  status: step.status,
                                  document: doc,
                                };
                              }}
                              class="hover:underline"
                            >
                              {doc.title}
                            </button>
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
  },
);

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
