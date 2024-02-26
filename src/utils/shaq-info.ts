import type { RequestEventLoader } from "@builder.io/qwik-city";
import { filterFalsy } from "./filter-falsy";

export type DieselStatus =
  | "trans-in"
  | "settled"
  | "loaded"
  | "landed"
  | "shipped";

export const formatStatus: Record<DieselStatus, string> = {
  "trans-in": "Transfer In",
  landed: "Landed",
  loaded: "Loaded",
  shipped: "Shipped",
  settled: "Settled",
};

export type DbData = {
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

export type Document = {
  url: string;
  id: string;
  title?: string | null | undefined;
  uploader: string;
  visibility: any;
};

export const dbDataToData = (
  dbData: DbData[],
  documents: Document[],
): Data[] => {
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
              documents.find((x) => x.id === document),
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
};

export type TabData = {
  "3-months": { rows: Data[]; totalVolume: number; totalCost: number };
  "next-month": { rows: Data[]; totalVolume: number; totalCost: number };
  "this-month": { rows: Data[]; totalVolume: number; totalCost: number };
  "in-transit": { rows: Data[]; totalVolume: number; totalCost: number };
  landed: { rows: Data[]; totalVolume: number; totalCost: number };
  settled: { rows: Data[]; totalVolume: number; totalCost: number };
  "year-to-date": { rows: Data[]; totalVolume: number; totalCost: number };
};

export const tabulateData = (data: Data[]) => {
  const output: TabData = {
    "3-months": { rows: [], totalVolume: 0, totalCost: 0 },
    "next-month": { rows: [], totalVolume: 0, totalCost: 0 },
    "this-month": { rows: [], totalVolume: 0, totalCost: 0 },
    "in-transit": { rows: [], totalVolume: 0, totalCost: 0 },
    landed: { rows: [], totalVolume: 0, totalCost: 0 },
    settled: { rows: [], totalVolume: 0, totalCost: 0 },
    "year-to-date": { rows: [], totalVolume: 0, totalCost: 0 },
  };

  const threeMonths = new Date();
  threeMonths.setUTCMonth(threeMonths.getUTCMonth() + 3);
  const nextMonth = new Date();
  nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
  const currentDate = new Date();

  for (const row of data) {
    if (row.settlementDate) {
      const date = row.settlementDate;
      if (
        date.getTime() < threeMonths.getTime() &&
        date.getTime() > currentDate.getTime()
      ) {
        output["3-months"].rows.push(row);
        output["3-months"].totalVolume += row.volume;
        output["3-months"].totalCost += row.cost;
      }
      if (
        date.getUTCFullYear() === currentDate.getUTCFullYear() &&
        date.getUTCMonth() === currentDate.getUTCMonth()
      ) {
        output["this-month"].rows.push(row);
        output["this-month"].totalVolume += row.volume;
        output["this-month"].totalCost += row.cost;
      }
      if (
        date.getUTCFullYear() === nextMonth.getUTCFullYear() &&
        date.getUTCMonth() === nextMonth.getUTCMonth()
      ) {
        output["next-month"].rows.push(row);
        output["next-month"].totalVolume += row.volume;
        output["next-month"].totalCost += row.cost;
      }
      if (
        date.getUTCFullYear() === currentDate.getUTCFullYear() &&
        date.getTime() < currentDate.getTime()
      ) {
        output["year-to-date"].rows.push(row);
        output["year-to-date"].totalVolume += row.volume;
        output["year-to-date"].totalCost += row.cost;
      }
    }
    if (row.statuses.some((update) => update.status === "settled")) {
      output.settled.rows.push(row);
      output.settled.totalVolume += row.volume;
      output.settled.totalCost += row.cost;
      continue;
    }
    if (row.statuses.some((update) => update.status === "landed")) {
      output.landed.rows.push(row);
      output.landed.totalVolume += row.volume;
      output.landed.totalCost += row.cost;
      continue;
    }
    if (row.statuses.length <= 1) {
      continue;
    }
    output["in-transit"].rows.push(row);
    output["in-transit"].totalVolume += row.volume;
    output["in-transit"].totalCost += row.cost;
  }
  return output;
};

export const dataToOutput = (ev: RequestEventLoader, data: Data[]) => {
  const tabbedData = tabulateData(data);
  const tabQuery = ev.query.get("filter");
  const selectedTab = (Object.keys(tabbedData).find((x) => x === tabQuery) ??
    null) as keyof TabData | null;
  const rows = selectedTab === null ? data : tabbedData[selectedTab].rows;
  const tabbedDataEntries = Object.entries(tabbedData);
  const totals = Object.fromEntries(
    tabbedDataEntries.map(([k, v]) => [
      k,
      { totalVolume: v.totalVolume, totalCost: v.totalCost },
    ]),
  ) as Record<keyof TabData, { totalCost: number; totalVolume: number }>;

  return { rows, totals, selectedTab };
};
