import { createBrowserRouter } from "react-router-dom";
import { DashboardPage } from "../pages/DashboardPage.js";
import { GameDetailPage } from "../pages/GameDetailPage.js";
import { LibraryPage } from "../pages/LibraryPage.js";
import { RankingsPage } from "../pages/RankingsPage.js";
import { RecommendationsPage } from "../pages/RecommendationsPage.js";
import { SettingsPage } from "../pages/SettingsPage.js";
import { SimRacingPage } from "../pages/SimRacingPage.js";
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
      { path: "library/:id", element: <GameDetailPage /> },
      { path: "rankings", element: <RankingsPage /> },
      { path: "sim-racing", element: <SimRacingPage /> },
      { path: "statistics", element: <StatisticsPage /> },
      { path: "recommendations", element: <RecommendationsPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);
