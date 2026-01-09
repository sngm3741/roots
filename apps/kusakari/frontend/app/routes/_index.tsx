import { Area } from "../components/Area";
import { Contact } from "../components/Contact";
import { Hero } from "../components/Hero";
import { PageLayout } from "../components/PageLayout";
import { Problems } from "../components/Problems";
import { Services } from "../components/Services";
import { Strengths } from "../components/Strengths";
import { Works } from "../components/Works";

export default function IndexRoute() {
  return (
    <PageLayout>
      <Hero />
      <Problems />
      <Strengths />
      <Services />
      <Works />
      <Area />
      <Contact />
    </PageLayout>
  );
}
