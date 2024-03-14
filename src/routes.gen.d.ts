///////////////////////////////////////////////////////////////////////////
/// GENERATED FILE --- DO NOT EDIT --- YOUR CHANGES WILL BE OVERWRITTEN ///
///////////////////////////////////////////////////////////////////////////

export type AppRoutes =
  | "/"
  | "/app/"
  | "/app/cash/"
  | "/app/contract/[id]/"
  | "/app/contract/[id]/workflow/"
  | "/app/create/"
  | "/app/create/entity/"
  | "/app/map/"
  | "/app/user/"
  | "/auth/callback/"
  | "/prx/";

export interface AppRouteMap {
  "/": {};
  "/app/": {};
  "/app/cash/": {};
  "/app/contract/[id]/": { id: string };
  "/app/contract/[id]/workflow/": { id: string };
  "/app/create/": {};
  "/app/create/entity/": {};
  "/app/map/": {};
  "/app/user/": {};
  "/auth/callback/": {};
  "/prx/": {};
}

export interface AppRouteParamsFunction {
  (route: "/", params?: {}): string;
  (route: "/app/", params?: {}): string;
  (route: "/app/cash/", params?: {}): string;
  (route: "/app/contract/[id]/", params: { id: string }): string;
  (route: "/app/contract/[id]/workflow/", params: { id: string }): string;
  (route: "/app/create/", params?: {}): string;
  (route: "/app/create/entity/", params?: {}): string;
  (route: "/app/map/", params?: {}): string;
  (route: "/app/user/", params?: {}): string;
  (route: "/auth/callback/", params?: {}): string;
  (route: "/prx/", params?: {}): string;
}

export type AppLinkProps =
  | { route: "/" }
  | { route: "/app/" }
  | { route: "/app/cash/" }
  | { route: "/app/contract/[id]/"; "param:id": string }
  | { route: "/app/contract/[id]/workflow/"; "param:id": string }
  | { route: "/app/create/" }
  | { route: "/app/create/entity/" }
  | { route: "/app/map/" }
  | { route: "/app/user/" }
  | { route: "/auth/callback/" }
  | { route: "/prx/" };
