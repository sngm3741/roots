import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { PageHeader } from '../components/PageHeader';
import { Breadcrumb } from '../components/Breadcrumb';
import { Area } from '../components/Area';

export function AreaPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <PageHeader 
          title="対応エリア" 
          subtitle="Service Area"
          description="知多半島全域に対応しています"
        />
        <Breadcrumb 
          items={[
            { label: 'TOP', path: '/' },
            { label: '対応エリア', path: '/area' }
          ]}
        />
        <Area />
      </main>
      <Footer />
    </div>
  );
}
