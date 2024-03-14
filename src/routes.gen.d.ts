///////////////////////////////////////////////////////////////////////////
/// GENERATED FILE --- DO NOT EDIT --- YOUR CHANGES WILL BE OVERWRITTEN ///
///////////////////////////////////////////////////////////////////////////

export type AppRoutes =
  | "/"
  | "/app/"
  | "/app/cash/"
  | "/app/contract/[id]/"
  | "/app/create/"
  | "/app/create/entity/"
  | "/app/map/"
  | "/app/user/"
  | "/auth/callback/"
  | "/prx/"
  | "/v2/contract/[id]/";

export interface AppRouteMap {
  "/": {};
  "/app/": {};
  "/app/cash/": {};
  "/app/contract/[id]/": { id: string };
  "/app/create/": {};
  "/app/create/entity/": {};
  "/app/map/": {};
  "/app/user/": {};
  "/auth/callback/": {};
  "/prx/": {};
  "/v2/contract/[id]/": { id: string };
}

export interface AppRouteParamsFunction {
  (route: "/", params?: {}): string;
  (route: "/app/", params?: {}): string;
  (route: "/app/cash/", params?: {}): string;
  (route: "/app/contract/[id]/", params: { id: string }): string;
  (route: "/app/create/", params?: {}): string;
  (route: "/app/create/entity/", params?: {}): string;
  (route: "/app/map/", params?: {}): string;
  (route: "/app/user/", params?: {}): string;
  (route: "/auth/callback/", params?: {}): string;
  (route: "/prx/", params?: {}): string;
  (route: "/v2/contract/[id]/", params: { id: string }): string;
}

export type AppLinkProps =
  | { route: "/" }
  | { route: "/app/" }
  | { route: "/app/cash/" }
  | { route: "/app/contract/[id]/"; "param:id": string }
  | { route: "/app/create/" }
  | { route: "/app/create/entity/" }
  | { route: "/app/map/" }
  | { route: "/app/user/" }
  | { route: "/auth/callback/" }
  | { route: "/prx/" }
  | { route: "/v2/contract/[id]/"; "param:id": string };
