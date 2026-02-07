import { EventCard } from '@/app/components/EventCard';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <EventCard
        title="【平日昼間の会】"
        date="2026/02/01 13:00-17:00"
        venue="Studio All-in"
        price="¥6,000"
        description={[
          '場所はStudio All-inです',
          '参加費は、最初から最後まで居て￥3000円！ソフトドリンクはサービスします。',
          '何をやるかというよりまして、皆様はあんなことやこんなことに興味があるのに、',
          'そろいう今日は、夜しかない！！って人のために、あんなことやこんなこと。',
          '平日の昼間からやってしまおう！って感じです。',
          'もちろん、どなたさまは、わかりますよね？？',
          '予約制ではありません。',
          '都合のつく方は気軽加で結構です！',
          '参加条件は安全であること！',
          '皆様のご参加お待ちしております。',
        ]}
        contact={{
          email: 'info@studio-allin.com',
          location: '場所：Studio All-in',
          address: '新宿区愛住町８番地　メゾン四谷8F',
          phone: 'TEL：080-4442-4110',
        }}
        linkText="過去のイベントはこちら"
      />
    </div>
  );
}