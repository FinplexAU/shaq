///////////////////////////////////////////////////////////////////////////
/// GENERATED FILE --- DO NOT EDIT --- YOUR CHANGES WILL BE OVERWRITTEN ///
///////////////////////////////////////////////////////////////////////////

export type AppRoutes =
  | "/"
  | "/app/"
  | "/app/auth/callback/"
  | "/app/cash/"
  | "/app/map/"
  | "/app/user/"
  | "/prx/";

export interface AppRouteMap {
  "/": {};
  "/app/": {};
  "/app/auth/callback/": {};
  "/app/cash/": {};
  "/app/map/": {};
  "/app/user/": {};
  "/prx/": {};
}

export interface AppRouteParamsFunction {
  (route: "/", params?: {}): string;
  (route: "/app/", params?: {}): string;
  (route: "/app/auth/callback/", params?: {}): string;
  (route: "/app/cash/", params?: {}): string;
  (route: "/app/map/", params?: {}): string;
  (route: "/app/user/", params?: {}): string;
  (route: "/prx/", params?: {}): string;
}

export type AppLinkProps =
  | { route: "/" }
  | { route: "/app/" }
  | { route: "/app/auth/callback/" }
  | { route: "/app/cash/" }
  | { route: "/app/map/" }
  | { route: "/app/user/" }
  | { route: "/prx/" };
