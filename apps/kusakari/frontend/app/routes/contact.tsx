import { Breadcrumb } from "../components/Breadcrumb";
import { Contact } from "../components/Contact";
import { PageHeader } from "../components/PageHeader";
import { PageLayout } from "../components/PageLayout";

export default function ContactRoute() {
  return (
    <PageLayout>
      <PageHeader
        title="お問い合わせ"
        subtitle="Contact"
        backgroundImage="/page-headers/contact.png"
      />
      <Breadcrumb
        items={[
          { label: "TOP", path: "/" },
          { label: "お問い合わせ", path: "/contact" },
        ]}
      />
      <Contact showHeading={false} />
    </PageLayout>
  );
}
