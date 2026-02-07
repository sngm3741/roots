import { useState } from 'react';
import { ProfileHeader } from '@/app/components/ProfileHeader';
import { TabNavigation } from '@/app/components/TabNavigation';
import { ArticleList } from '@/app/components/ArticleList';
import { BottomNavigation } from '@/app/components/BottomNavigation';

export default function App() {
  const [activeTab, setActiveTab] = useState<'articles' | 'activity' | 'about'>('articles');

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      {/* Mobile container */}
      <div className="w-full max-w-[375px] h-screen bg-white flex flex-col relative">
        <ProfileHeader />
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'articles' && <ArticleList />}
          {activeTab === 'activity' && (
            <div className="p-6 text-center text-gray-500">
              Activity content
            </div>
          )}
          {activeTab === 'about' && (
            <div className="p-6 text-center text-gray-500">
              About content
            </div>
          )}
        </div>

        <BottomNavigation />
      </div>
    </div>
  );
}
