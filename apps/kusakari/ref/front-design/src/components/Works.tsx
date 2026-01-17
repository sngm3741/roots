import { ImageWithFallback } from './figma/ImageWithFallback';

export function Works() {
  const works = [
    {
      beforeImage: 'https://images.unsplash.com/photo-1766990194564-d597b23d1de3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvdmVyZ3Jvd24lMjBncmFzcyUyMGJlZm9yZXxlbnwxfHx8fDE3Njc2ODQyMzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      afterImage: 'https://images.unsplash.com/photo-1766010203610-86665f86acb4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFzcyUyMGN1dHRpbmclMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzY3Njg0MjM4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      area: '知多市',
      type: '駐車場管理',
      size: '約200㎡'
    },
    {
      beforeImage: 'https://images.unsplash.com/photo-1758524051476-cf120cb3f1e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBnYXJkZW5pbmclMjB3b3JrfGVufDF8fHx8MTc2NzY4NDIzOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      afterImage: 'https://images.unsplash.com/photo-1738193830098-2d92352a1856?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXduJTIwbW93aW5nJTIwc2VydmljZXxlbnwxfHx8fDE3Njc2MjE0OTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      area: '半田市',
      type: '空き地管理',
      size: '約350㎡'
    },
    {
      beforeImage: 'https://images.unsplash.com/photo-1752945490118-5b1518f98d77?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwbGFuZCUyMG1haW50ZW5hbmNlfGVufDF8fHx8MTc2NzY4NDI0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      afterImage: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2xhciUyMHBhbmVsJTIwZmllbGR8ZW58MXx8fHwxNzY3Njg0MjQwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      area: '東海市',
      type: '太陽光発電所',
      size: '約500㎡'
    }
  ];

  return (
    <section id="works" className="py-2 lg:py-4 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-gray-900 mb-4">
            <span className="block text-lg text-emerald-600 font-bold mb-2">WORKS</span>
            <span className="text-3xl lg:text-4xl">施工実績</span>
          </h2>
          <p className="text-lg text-gray-700 mt-4">
            確かな技術で、確実な結果をお届けします
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {works.map((work, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="grid grid-cols-2 gap-2 p-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1 font-bold">BEFORE</div>
                  <div className="aspect-square rounded overflow-hidden">
                    <ImageWithFallback
                      src={work.beforeImage}
                      alt="施工前"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-emerald-600 mb-1 font-bold">AFTER</div>
                  <div className="aspect-square rounded overflow-hidden">
                    <ImageWithFallback
                      src={work.afterImage}
                      alt="施工後"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-gray-700">エリア:</span>
                    <span>{work.area}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-gray-700">面積:</span>
                    <span>{work.size}</span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="inline-block bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-bold">
                    {work.type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-gray-600">
          <p>その他多数の実績がございます。詳しくはお問い合わせください。</p>
        </div>
      </div>
    </section>
  );
}
