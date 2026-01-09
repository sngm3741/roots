import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { PageHeader } from '../components/PageHeader';
import { Breadcrumb } from '../components/Breadcrumb';
import { Contact } from '../components/Contact';

export function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <PageHeader 
          title="お問い合わせ" 
          subtitle="Contact"
          description="お気軽にお問い合わせください"
        />
        <Breadcrumb 
          items={[
            { label: 'TOP', path: '/' },
            { label: 'お問い合わせ', path: '/contact' }
          ]}
        />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
