import { component$, useComputed$ } from "@builder.io/qwik";
import {
  type DocumentHead,
  useLocation,
  routeLoader$,
} from "@builder.io/qwik-city";
import { Table, TableRow } from "~/components/table";
import { Timeline, TimelineItem } from "~/components/timeline";
import { DieselTabs } from "~/components/tabs";
import { useUser } from "./layout";
import moment from "moment-timezone";
import { getSharedMap } from "../plugin";
import { graphql, graphqlLoader } from "~/utils/graphql";
import { dateString } from "~/utils/dates";
import { HiArrowDownTraySolid, HiEyeSolid } from "@qwikest/icons/heroicons";
import type { Data, DbData } from "~/utils/shaq-info";
import { dataToOutput, dbDataToData, formatStatus } from "~/utils/shaq-info";
import { filterFalsy } from "~/utils/filter-falsy";

export const head: DocumentHead = {
  title: "Welcome to Shaq",
  meta: [
    {
      name: "description",
      content: "Shaq site description",
    },
  ],
};

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
    return dataToOutput(ev, []);
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

  const formattedDocuments = documents.map((document) => ({
    ...document.document,
    url: document.url,
  }));

  const data = dbDataToData(dbData, formattedDocuments);

  return dataToOutput(ev, data);
});

export const useCurrentHour = routeLoader$((ev) => {
  const timezone = ev.request.headers.get("cf-timezone");
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
  const curHr = useCurrentHour();

  const entities = useComputed$(() => gql.value.entities ?? []);
  const accounts = useComputed$(() =>
    entities.value.flatMap((x) => x.accounts),
  );

  const greeting = useComputed$(async () => {
    if (curHr.value < 12) {
      return "Good Morning";
    } else if (curHr.value < 18) {
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

  const headings = ["Date", "Volume (MT)", "Price", "Cost", "Status"];

  return (
    <>
      <DieselTabs
        selectedTab={data.value.selectedTab}
        tabs={[
          {
            label: "Next month",
            filter: "next-month",
            ...data.value.totals["next-month"],
          },
          {
            label: "This month",
            filter: "this-month",
            ...data.value.totals["this-month"],
          },
          {
            label: "In the next 3 months",
            filter: "3-months",
            ...data.value.totals["3-months"],
          },
          {
            label: "In Transit",
            filter: "in-transit",
            ...data.value.totals["in-transit"],
          },
          {
            label: "Landed",
            filter: "landed",
            ...data.value.totals["landed"],
          },
          {
            label: "Settled",
            filter: "settled",
            ...data.value.totals["settled"],
          },
          {
            label: "Year To Date",
            filter: "year-to-date",
            ...data.value.totals["year-to-date"],
          },
        ]}
      ></DieselTabs>
      <Table headings={headings}>
        {data.value.rows.map((row) => (
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
                            <HiArrowDownTraySolid class="inline align-icon" />
                          </a>
                          <a class="ml-1" href={doc.url} target="_blank">
                            <HiEyeSolid class="inline align-icon" />
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
