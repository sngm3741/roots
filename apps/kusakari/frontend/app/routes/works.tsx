import { Breadcrumb } from "../components/Breadcrumb";
import { PageHeader } from "../components/PageHeader";
import { PageLayout } from "../components/PageLayout";
import { Works } from "../components/Works";

export default function WorksRoute() {
  return (
    <PageLayout>
      <PageHeader
        title="施工事例"
        subtitle="Works"
        backgroundImage="/page-headers/works.png"
      />
      <Breadcrumb
        items={[
          { label: "TOP", path: "/" },
          { label: "施工事例", path: "/works" },
        ]}
      />

      <section className="py-16 lg:py-4 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <Works showHeading={false} />
        </div>
      </section>
    </PageLayout>
  );
}
