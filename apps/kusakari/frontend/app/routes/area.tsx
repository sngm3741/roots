import { Area } from "../components/Area";
import { Breadcrumb } from "../components/Breadcrumb";
import { PageHeader } from "../components/PageHeader";
import { PageLayout } from "../components/PageLayout";

export default function AreaRoute() {
  return (
    <PageLayout>
      <PageHeader
        title="対応エリア"
        subtitle="Service Area"
        backgroundImage="/page-headers/area.jpg"
      />
      <Breadcrumb
        items={[
          { label: "TOP", path: "/" },
          { label: "対応エリア", path: "/area" },
        ]}
      />
      <Area showHeading={false} />
    </PageLayout>
  );
}
