import { useState } from "react";
import { Login } from "./components/Login";
import { Layout, type PageName } from "./components/Layout";
import { MainPage } from "./components/MainPage";
import { PivotPage } from "./components/PivotPage";
import { ShortagePage } from "./components/ShortagePage";
import { PlanPage } from "./components/PlanPage";
import { StockPage } from "./components/StockPage";
import { POPage } from "./components/POPage";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activePage, setActivePage] = useState<PageName>("main");

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case "main":     return <MainPage />;
      case "pivot":    return <PivotPage />;
      case "shortage": return <ShortagePage />;
      case "plan":     return <PlanPage />;
      case "stock":    return <StockPage />;
      case "po":       return <POPage />;
      default:         return <MainPage />;
    }
  };

  return (
    <Layout
      activePage={activePage}
      onPageChange={setActivePage}
      onLogout={() => { setIsAuthenticated(false); setActivePage("main"); }}
    >
      {renderPage()}
    </Layout>
  );
}
