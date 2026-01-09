import { Breadcrumb } from "../components/Breadcrumb";
import { Contact } from "../components/Contact";
import { PageHeader } from "../components/PageHeader";
import { PageLayout } from "../components/PageLayout";

export default function ContactRoute() {
  return (
    <PageLayout>
      <PageHeader title="お問い合わせ" subtitle="Contact" description="お気軽にお問い合わせください" />
      <Breadcrumb
        items={[
          { label: "TOP", path: "/" },
          { label: "お問い合わせ", path: "/contact" },
        ]}
      />
      <Contact />
    </PageLayout>
  );
}
