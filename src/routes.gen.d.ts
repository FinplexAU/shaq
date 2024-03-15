///////////////////////////////////////////////////////////////////////////
/// GENERATED FILE --- DO NOT EDIT --- YOUR CHANGES WILL BE OVERWRITTEN ///
///////////////////////////////////////////////////////////////////////////

export type AppRoutes =
  | "/"
  | "/app/"
  | "/app/cash/"
  | "/app/create/"
  | "/app/create/entity/"
  | "/app/map/"
  | "/app/user/"
  | "/auth/sign-in/"
  | "/auth/sign-up/"
  | "/auth/verify-email/"
  | "/prx/"
  | "/v2/contract/[id]/"
  | "/v2/contract/[id]/joint-venture/"
  | "/v2/document/[id]/";

export interface AppRouteMap {
  "/": {};
  "/app/": {};
  "/app/cash/": {};
  "/app/create/": {};
  "/app/create/entity/": {};
  "/app/map/": {};
  "/app/user/": {};
  "/auth/sign-in/": {};
  "/auth/sign-up/": {};
  "/auth/verify-email/": {};
  "/prx/": {};
  "/v2/contract/[id]/": { id: string };
  "/v2/contract/[id]/joint-venture/": { id: string };
  "/v2/document/[id]/": { id: string };
}

export interface AppRouteParamsFunction {
  (route: "/", params?: {}): string;
  (route: "/app/", params?: {}): string;
  (route: "/app/cash/", params?: {}): string;
  (route: "/app/create/", params?: {}): string;
  (route: "/app/create/entity/", params?: {}): string;
  (route: "/app/map/", params?: {}): string;
  (route: "/app/user/", params?: {}): string;
  (route: "/auth/sign-in/", params?: {}): string;
  (route: "/auth/sign-up/", params?: {}): string;
  (route: "/auth/verify-email/", params?: {}): string;
  (route: "/prx/", params?: {}): string;
  (route: "/v2/contract/[id]/", params: { id: string }): string;
  (route: "/v2/contract/[id]/joint-venture/", params: { id: string }): string;
  (route: "/v2/document/[id]/", params: { id: string }): string;
}

export type AppLinkProps =
  | { route: "/" }
  | { route: "/app/" }
  | { route: "/app/cash/" }
  | { route: "/app/create/" }
  | { route: "/app/create/entity/" }
  | { route: "/app/map/" }
  | { route: "/app/user/" }
  | { route: "/auth/sign-in/" }
  | { route: "/auth/sign-up/" }
  | { route: "/auth/verify-email/" }
  | { route: "/prx/" }
  | { route: "/v2/contract/[id]/"; "param:id": string }
  | { route: "/v2/contract/[id]/joint-venture/"; "param:id": string }
  | { route: "/v2/document/[id]/"; "param:id": string };
