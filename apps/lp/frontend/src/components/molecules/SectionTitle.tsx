import PageContainer from "../atoms/PageContainer";

type SectionTitleProps = {
  label: string;
};

export default function SectionTitle({ label }: SectionTitleProps) {
  return (
    <div className="px-4 pb-6 pt-12">
      <PageContainer size="narrow">
        <div className="flex items-center justify-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-400 to-transparent" />
          <span className="text-body-sm font-semibold tracking-[0.3em] text-slate-400 dark:text-slate-300">
            {label}
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-400 to-transparent" />
        </div>
      </PageContainer>
    </div>
  );
}
