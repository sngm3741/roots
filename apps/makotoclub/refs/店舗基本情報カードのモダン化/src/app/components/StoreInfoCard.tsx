import { Building2, MapPin, Briefcase, Tag } from 'lucide-react';

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="group flex items-start gap-3 p-4 rounded-lg transition-all hover:bg-gray-50">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-shadow">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-gray-500 mb-1">{label}</div>
        <div className="text-base font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  );
}

export function StoreInfoCard() {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-5">
          <h2 className="text-xl font-bold text-white">店舗基本情報</h2>
        </div>

        {/* Content */}
        <div className="divide-y divide-gray-100">
          <InfoItem
            icon={<Building2 className="w-5 h-5" />}
            label="都道府県"
            value="東京都"
          />
          <InfoItem
            icon={<MapPin className="w-5 h-5" />}
            label="エリア"
            value="吉原"
          />
          <InfoItem
            icon={<Briefcase className="w-5 h-5" />}
            label="業種"
            value="ソープ"
          />
          <InfoItem
            icon={<Tag className="w-5 h-5" />}
            label="ジャンル"
            value="学園系"
          />
        </div>
      </div>
    </div>
  );
}
