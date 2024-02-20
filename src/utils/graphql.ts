import type {
  RequestEventAction,
  RequestEventBase,
  RequestEventLoader,
} from "@builder.io/qwik-city";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { print } from "graphql";
import { getRequiredEnv, getSharedMap } from "~/routes/plugin@auth";

export type GraphQlResponse<T> =
  | {
      success: true;
      data: T;
      extensions?: any[];
    }
  | {
      success: false;
      data?: T;
      errors: {
        message: string;
        locations: {
          line: number;
          column: number;
        }[];
      }[];
      extensions?: any[];
    };

export const graphqlRequest = async <T, V extends Record<string, unknown>>(
  request: RequestEventBase,
  queryDocument: TypedDocumentNode<T, V>,
  variables: V,
  noCache: boolean = false,
): Promise<GraphQlResponse<T>> => {
  try {
    const query = print(queryDocument);
    const access_token = getSharedMap(request.sharedMap, "session").accessToken;
    if (!access_token) {
      console.error("access_token not found");
      return { success: false, errors: [] };
    }

    noCache ||= request.url.searchParams.get("noCache") === "true";

    const cacheControl: Record<string, string> = noCache
      ? { "cache-control": "no-cache" }
      : {};

    let sourceIp = request.request.headers.get("Nerve-Source-Ip");
    if (!sourceIp && import.meta.env.DEV) {
      sourceIp = "127.0.0.1";
    }
    const sourceIpHeader: Record<string, string> = sourceIp
      ? { "Nerve-Source-Ip": sourceIp }
      : {};

    const endpoint = getRequiredEnv(request.env, "MEMBRANE_ENDPOINT");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        authorization: `Bearer ${access_token}`,
        "content-type": "application/json",
        ...sourceIpHeader,
        ...cacheControl,
      },
      body: JSON.stringify({ query, variables }),
    });

    const body = await response.json();

    if (response.ok && body.data && !body.errors)
      return { success: true, ...body };

    console.error(
      `${response.status}: Graphql request failed\n${JSON.stringify(
        body,
        null,
        2,
      )}`,
    );

    if (body.errors) {
      return { success: false, ...body };
    }
    return { success: false, errors: [] };
  } catch (e) {
    console.error("GraphQl Query Error:", { error: e });
    return { success: false, errors: [] };
  }
};

export const graphqlLoader = <T, V extends Record<string, unknown>>(
  queryDocument: TypedDocumentNode<T, V>,
  variables: V,
  noCache: boolean = false,
) => {
  return async (request: RequestEventAction | RequestEventLoader) => {
    const gqlReq = await graphqlRequest(
      request,
      queryDocument,
      variables,
      noCache,
    );
    if (gqlReq.success) {
      return { ...gqlReq.data, success: true };
    }
    return request.fail(500, gqlReq);
  };
};

export const graphqlAction = <T, V extends Record<string, unknown>>(
  queryDocument: TypedDocumentNode<T, V>,
  noCache: boolean = false,
) => {
  return async (data: V, request: RequestEventAction) => {
    return graphqlLoader(queryDocument, data, noCache)(request);
  };
};
