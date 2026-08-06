import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/AuthScreen.tsx"),      // First page
  route("home", "routes/home.tsx"),
  route("mytrips", "routes/mytrips.tsx"),
  route("schedule", "routes/scheduleride.tsx"),
  // route("profile", "routes/profile"),
  // route("drivers", "routes/drivers"),
] satisfies RouteConfig;