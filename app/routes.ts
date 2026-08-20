import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/splashscreen.tsx"),      // First page
  route("AuthScreen", "routes/AuthScreen.tsx"),
  route("home", "routes/home.tsx"),
  route("mytrips", "routes/mytrips.tsx"),
  route("schedule", "routes/scheduleride.tsx"),
  route("profile", "routes/myprofile.tsx"),
  route("customize-profile", "routes/customizeprofile.tsx"),
  route("drivers", "routes/becomedriver.tsx"),
  route("fleet-reviews", "routes/driverapplications.tsx"),
] satisfies RouteConfig;