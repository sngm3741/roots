type Props = {
  rating?: number;
  earningLabel: string;
  waitLabel: string;
  RatingElement: React.ReactNode;
};

export function StatRow({ rating = 0, earningLabel, waitLabel, RatingElement }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-pink-50 to-purple-50 px-4 py-2.5 border border-pink-100">
          <span className="text-2xl font-bold text-pink-700 drop-shadow-sm">{rating.toFixed(1)}</span>
          {RatingElement}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-xl bg-gradient-to-r from-purple-50 to-white px-3 py-2 text-center font-semibold text-slate-800 border border-purple-100">
          稼ぎ {earningLabel}
        </div>
        <div className="rounded-xl bg-gradient-to-r from-blue-50 to-white px-3 py-2 text-center font-semibold text-slate-800 border border-blue-100">
          待機 {waitLabel}
        </div>
      </div>
    </div>
  );
}
