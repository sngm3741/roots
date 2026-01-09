import { useState, useEffect } from 'react';
import { TopPage } from './pages/TopPage';
import { ServicesPage } from './pages/ServicesPage';
import { StrengthsPage } from './pages/StrengthsPage';
import { PricingPage } from './pages/PricingPage';
import { FaqPage } from './pages/FaqPage';
import { WorksPage } from './pages/WorksPage';
import { WorksCategoryPage } from './pages/WorksCategoryPage';
import { AreaPage } from './pages/AreaPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { BlogPage } from './pages/BlogPage';
import { ColumnPage } from './pages/ColumnPage';
import { MediaPage } from './pages/MediaPage';
import { RecruitPage } from './pages/RecruitPage';
import { ContactPage } from './pages/ContactPage';
import { CompanyPage } from './pages/CompanyPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { SitemapPage } from './pages/SitemapPage';

type Route = {
  path: string;
  component: React.ComponentType<any>;
};

const routes: Route[] = [
  { path: '/', component: TopPage },
  { path: '/services', component: ServicesPage },
  { path: '/strengths', component: StrengthsPage },
  { path: '/pricing', component: PricingPage },
  { path: '/faq', component: FaqPage },
  { path: '/works', component: WorksPage },
  { path: '/works/corporate', component: WorksCategoryPage },
  { path: '/works/parking', component: WorksCategoryPage },
  { path: '/works/solar', component: WorksCategoryPage },
  { path: '/works/vacant', component: WorksCategoryPage },
  { path: '/works/regular', component: WorksCategoryPage },
  { path: '/area', component: AreaPage },
  { path: '/reviews', component: ReviewsPage },
  { path: '/blog', component: BlogPage },
  { path: '/column', component: ColumnPage },
  { path: '/media', component: MediaPage },
  { path: '/recruit', component: RecruitPage },
  { path: '/contact', component: ContactPage },
  { path: '/company', component: CompanyPage },
  { path: '/privacy', component: PrivacyPage },
  { path: '/sitemap', component: SitemapPage },
];

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // グローバルナビゲーション関数を window に設定
  useEffect(() => {
    (window as any).navigateTo = (path: string) => {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo(0, 0);
    };
  }, []);

  const route = routes.find(r => r.path === currentPath) || routes[0];
  const PageComponent = route.component;

  return <PageComponent />;
}
