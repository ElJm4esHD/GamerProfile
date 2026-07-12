import { createBrowserRouter } from "react-router-dom";
import { DashboardPage } from "../pages/DashboardPage.js";
import { LibraryPage } from "../pages/LibraryPage.js";
import { RankingsPage } from "../pages/RankingsPage.js";
import { SettingsPage } from "../pages/SettingsPage.js";
import { StatisticsPage } from "../pages/StatisticsPage.js";
import { AppLayout } from "./AppLayout.js";

/** El Dashboard es la puerta de entrada. */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "library", element: <LibraryPage /> },
      { path: "rankings", element: <RankingsPage /> },
      { path: "statistics", element: <StatisticsPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);
