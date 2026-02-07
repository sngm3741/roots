import type { ReactNode } from "react";

type Profile = {
  imageUrl: string;
  imageAlt: string;
  companyName: ReactNode;
  domain: string;
  displayName: ReactNode;
};

export const profile: Profile = {
  imageUrl: "https://avatars.githubusercontent.com/u/237466375?v=4&size=64",
  imageAlt: "プロフィール画像",
  companyName: (
    <ruby className="company-name">
      四<rt className="text-slate-400">ヨ</rt>ツ<rt className="text-slate-400">ツ</rt>谷
      <rt className="text-slate-400">ヤ</rt> ITサービス
    </ruby>
  ),
  domain: "yotsuya-it-service.com",
  displayName: (
    <ruby>
      南<rt className="text-slate-400">ナ</rt>雲
      <rt className="text-slate-400">グモ</rt>
      <span className="pl-[3px]">太</span>
      <rt className="text-slate-400">タ</rt>一
      <rt className="text-slate-400">イチ</rt>
    </ruby>
  ),
};
