import { Home, Search, Bookmark, User } from 'lucide-react';

export function BottomNavigation() {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'bookmarks', icon: Bookmark, label: 'Bookmarks' },
    { id: 'account', icon: User, label: 'Account' },
  ];

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-2 flex justify-around items-center">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.id === 'account'; // Account is active in this profile view
        
        return (
          <button
            key={item.id}
            className="flex flex-col items-center gap-1 py-2 px-4 transition-colors hover:bg-gray-50 rounded-lg"
          >
            <Icon
              className={`w-5 h-5 ${
                isActive ? 'text-black' : 'text-gray-400'
              }`}
            />
            <span
              className={`text-xs ${
                isActive ? 'text-black font-medium' : 'text-gray-400'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
