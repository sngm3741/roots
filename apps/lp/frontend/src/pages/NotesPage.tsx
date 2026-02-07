import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import notes from "../data/notes";
import Breadcrumbs from "../components/molecules/Breadcrumbs";
import ContentPage from "../components/templates/ContentPage";
import NotesList from "../components/organisms/NotesList";
import PillLink from "../components/atoms/PillLink";
import { useI18n } from "../contexts/I18nContext";

export default function NotesPage() {
  const { t } = useI18n();
  return (
    <ContentPage>
      <div className="mb-8">
        <Breadcrumbs
          items={[
            { label: t("nav.home"), href: "/", icon: <Home size={14} aria-hidden="true" /> },
          ]}
        />
      </div>

      <header className="text-center">
        <h1 className="text-title tracking-tight text-slate-900">{t("notes.title")}</h1>
      </header>

      <NotesList notes={notes} />

      <div className="mt-10 flex justify-center">
        <PillLink to="/">{t("notes.backToTop")}</PillLink>
      </div>
    </ContentPage>
  );
}
