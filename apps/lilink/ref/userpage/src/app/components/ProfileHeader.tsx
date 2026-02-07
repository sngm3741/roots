import { ArrowLeft, Share2, Bookmark } from 'lucide-react';

export function ProfileHeader() {
  return (
    <div className="bg-white">
      {/* Top navigation */}
      <div className="flex items-center justify-between px-4 py-4">
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Share2 className="w-5 h-5 text-gray-700" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Bookmark className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Profile info */}
      <div className="px-4 pb-4">
        <div className="flex items-start gap-3 mb-4">
          <img
            src="https://images.unsplash.com/photo-1649589244330-09ca58e4fa64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc2OTE0NzEzN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Sofia Costa"
            className="w-14 h-14 rounded-full object-cover"
          />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900">Sofia Costa</h1>
            <p className="text-sm text-gray-500">Interior designer</p>
            <p className="text-sm text-gray-500">12k followers</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button className="flex-1 bg-black text-white py-2.5 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors">
            Follow
          </button>
          <button className="flex-1 bg-white text-black py-2.5 px-4 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
            Message
          </button>
        </div>
      </div>
    </div>
  );
}
