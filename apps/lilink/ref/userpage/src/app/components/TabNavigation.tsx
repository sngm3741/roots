interface TabNavigationProps {
  activeTab: 'articles' | 'activity' | 'about';
  onTabChange: (tab: 'articles' | 'activity' | 'about') => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: 'articles' as const, label: 'Articles' },
    { id: 'activity' as const, label: 'Activity' },
    { id: 'about' as const, label: 'About' },
  ];

  return (
    <div className="flex border-b border-gray-200 bg-white">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
            activeTab === tab.id
              ? 'text-black'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
          )}
        </button>
      ))}
    </div>
  );
}
