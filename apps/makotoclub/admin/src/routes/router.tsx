import { createBrowserRouter, Navigate } from "react-router-dom";
import { Layout } from "./Layout";
import { StoreListPage } from "./stores/StoreListPage";
import { StoreFormPage } from "./stores/StoreFormPage";
import { SurveyListPage } from "./surveys/SurveyListPage";
import { SurveyFormPage } from "./surveys/SurveyFormPage";
import { DraftSurveyListPage } from "./surveys/DraftSurveyListPage";
import { AccessLogPage } from "./access-logs/AccessLogPage";
import { AnalyticsPage } from "./analytics/AnalyticsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/stores" replace /> },
      { path: "stores", element: <StoreListPage /> },
      { path: "stores/new", element: <StoreFormPage mode="create" /> },
      { path: "stores/:id/edit", element: <StoreFormPage mode="edit" /> },
      { path: "surveys", element: <SurveyListPage /> },
      { path: "surveys/new", element: <SurveyFormPage mode="create" /> },
      { path: "surveys/:id/edit", element: <SurveyFormPage mode="edit" /> },
      { path: "surveys/drafts", element: <DraftSurveyListPage /> },
      { path: "access-logs", element: <AccessLogPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
    ],
  },
]);
