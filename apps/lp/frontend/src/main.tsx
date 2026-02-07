
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { I18nProvider } from "./contexts/I18nContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <I18nProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </I18nProvider>
  </ThemeProvider>
);
  
