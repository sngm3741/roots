import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { Problems } from "../components/Problems";
import { Strengths } from "../components/Strengths";
import { Services } from "../components/Services";
import { Works } from "../components/Works";
import { Area } from "../components/Area";
import { Contact } from "../components/Contact";
import { Footer } from "../components/Footer";

export default function IndexRoute() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <Problems />
        <Strengths />
        <Services />
        <Works />
        <Area />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
