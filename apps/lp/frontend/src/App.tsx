import CarouselStack from "./components/organisms/CarouselStack";
import LogTimeline from "./components/organisms/LogTimeline";
import { AnimationSettings, defaultAnimationSettings } from "./data/animationSettings";
import HeroSection from "./components/organisms/HeroSection";
import ServicesSection from "./components/organisms/ServicesSection";
import SectionTitle from "./components/molecules/SectionTitle";
import { getServiceGroups } from "./data/services";
import NarrowSection from "./components/molecules/NarrowSection";
import TopRightControls from "./components/organisms/TopRightControls";
import { useI18n } from "./contexts/I18nContext";
import ScrollReveal from "./components/molecules/ScrollReveal";

export default function App() {
  const { t, lang } = useI18n();
  const settings: AnimationSettings = defaultAnimationSettings;
  return (
    <div className="App relative flex min-h-screen flex-col items-center bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <TopRightControls />
      <ScrollReveal>
        <HeroSection />
      </ScrollReveal>

      <ScrollReveal requireScroll>
        <SectionTitle label={t("section.services")} />
        <ServicesSection groups={getServiceGroups(lang)} />
      </ScrollReveal>

      <ScrollReveal>
        <SectionTitle label={t("section.portfolio")} />

        <NarrowSection className="work-section">
          <div className="container flex-col">
            <CarouselStack settings={settings} />
          </div>
        </NarrowSection>
      </ScrollReveal>

      <ScrollReveal>
        <SectionTitle label={t("section.log")} />
        <LogTimeline />
      </ScrollReveal>
    </div>
  );
}
