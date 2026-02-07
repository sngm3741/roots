import { Link, useParams } from "react-router-dom";
import { Home } from "lucide-react";
import { getNoteBySlug } from "../data/notes";
import Breadcrumbs from "../components/molecules/Breadcrumbs";
import ContentPage from "../components/templates/ContentPage";
import NoteArticle from "../components/organisms/NoteArticle";
import PillLink from "../components/atoms/PillLink";
import { useI18n } from "../contexts/I18nContext";

export default function NotePage() {
  const { t } = useI18n();
  const { slug } = useParams();
  const note = slug ? getNoteBySlug(slug) : undefined;

  if (!note) {
    return (
      <ContentPage>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-slate-500">{t("note.notFound")}</p>
            <div className="mt-4 flex justify-center">
              <PillLink to="/notes">{t("note.backToList")}</PillLink>
            </div>
          </div>
        </div>
      </ContentPage>
    );
  }

  return (
    <ContentPage>
      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: t("nav.home"), href: "/", icon: <Home size={14} aria-hidden="true" /> },
            { label: t("nav.notes"), href: "/notes" },
          ]}
        />
      </div>

      <NoteArticle note={note} />

      <div className="mt-12 flex items-center justify-center gap-3 text-sm">
        <PillLink to="/">{t("note.backToTop")}</PillLink>
        <PillLink to="/notes" variant="primary">
          {t("notes.backToList")}
        </PillLink>
      </div>
    </ContentPage>
  );
}
