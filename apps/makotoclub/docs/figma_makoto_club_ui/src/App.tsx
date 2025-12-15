import { useState } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { TopPage } from './components/pages/TopPage';
import { StoresListPage } from './components/pages/StoresListPage';
import { StoreDetailPage } from './components/pages/StoreDetailPage';
import { SurveysListPage } from './components/pages/SurveysListPage';
import { SurveyDetailPage } from './components/pages/SurveyDetailPage';
import { SurveyNewPage } from './components/pages/SurveyNewPage';
import { AdminStoresPage } from './components/pages/AdminStoresPage';
import { StaticPage } from './components/pages/StaticPage';

type Route = 
  | { page: 'top' }
  | { page: 'stores'; params?: URLSearchParams }
  | { page: 'store-detail'; id: string }
  | { page: 'surveys'; params?: URLSearchParams }
  | { page: 'survey-detail'; id: string }
  | { page: 'survey-new' }
  | { page: 'admin-stores' }
  | { page: 'terms' }
  | { page: 'privacy' }
  | { page: 'contact' };

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<Route>({ page: 'top' });

  const navigate = (route: Route) => {
    setCurrentRoute(route);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (currentRoute.page) {
      case 'top':
        return <TopPage onNavigate={navigate} />;
      case 'stores':
        return <StoresListPage params={currentRoute.params} onNavigate={navigate} />;
      case 'store-detail':
        return <StoreDetailPage id={currentRoute.id} onNavigate={navigate} />;
      case 'surveys':
        return <SurveysListPage params={currentRoute.params} onNavigate={navigate} />;
      case 'survey-detail':
        return <SurveyDetailPage id={currentRoute.id} onNavigate={navigate} />;
      case 'survey-new':
        return <SurveyNewPage onNavigate={navigate} />;
      case 'admin-stores':
        return <AdminStoresPage onNavigate={navigate} />;
      case 'terms':
        return <StaticPage title="利用規約" onNavigate={navigate} />;
      case 'privacy':
        return <StaticPage title="プライバシーポリシー" onNavigate={navigate} />;
      case 'contact':
        return <StaticPage title="お問い合わせ" onNavigate={navigate} />;
      default:
        return <TopPage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fff9fb] flex flex-col">
      <Header currentPage={currentRoute.page} onNavigate={navigate} />
      <main className="flex-1 pt-20">
        {renderPage()}
      </main>
      <Footer onNavigate={navigate} />
    </div>
  );
}