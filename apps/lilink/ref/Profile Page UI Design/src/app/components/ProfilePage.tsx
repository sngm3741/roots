import ProfileIcon from './ProfileIcon';
import ProfileName from './ProfileName';
import ProfileSubtitle from './ProfileSubtitle';
import SocialLinks from './SocialLinks';
import LinkList from './LinkList';

// モックデータ
const mockData = {
  profile: {
    icon: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300',
    name: '山田 太郎',
    subtitle: 'Webデザイナー / フリーランス',
  },
  social: {
    twitter: 'https://twitter.com/example',
    instagram: 'https://instagram.com/example',
    line: 'https://line.me/R/ti/p/@example',
  },
  links: [
    { id: '1', title: 'ポートフォリオサイト', url: 'https://example.com/portfolio', icon: '', visible: true, order: 1 },
    { id: '2', title: 'ブログ', url: 'https://example.com/blog', icon: '', visible: true, order: 2 },
    { id: '3', title: 'オンラインストア', url: 'https://example.com/store', icon: '', visible: true, order: 3 },
    { id: '4', title: 'お問い合わせフォーム', url: 'https://example.com/contact', icon: '', visible: true, order: 4 },
    { id: '5', title: 'サービス紹介', url: 'https://example.com/services', icon: '', visible: true, order: 5 },
  ],
};

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* 12グリッドコンテナ */}
      <div className="grid grid-cols-12 gap-4 px-4 py-12">
        <ProfileIcon 
          src={mockData.profile.icon} 
          alt={mockData.profile.name} 
        />
        
        <ProfileName name={mockData.profile.name} />
        
        <ProfileSubtitle subtitle={mockData.profile.subtitle} />
        
        <SocialLinks 
          twitter={mockData.social.twitter}
          instagram={mockData.social.instagram}
          line={mockData.social.line}
        />
        
        <LinkList links={mockData.links} />
      </div>
    </div>
  );
}
