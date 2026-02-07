interface Article {
  id: string;
  title: string;
  author: string;
  timeAgo: string;
  readTime: string;
  image: string;
}

const articles: Article[] = [
  {
    id: '1',
    title: 'Contemporary apartment design gallery',
    author: 'John Doe',
    timeAgo: '1 day ago',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1594873604892-b599f847e859?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NjkyNDA4MDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: '2',
    title: 'My favorite stools from around the world',
    author: 'Bob Sina',
    timeAgo: '1 day ago',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1592885331172-bf57d2281135?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwZnVybml0dXJlJTIwY2hhaXJzfGVufDF8fHx8MTc2OTI1NzM1MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: '3',
    title: 'Quick interior decor styling tips and tricks',
    author: 'John Doe',
    timeAgo: '4 days ago',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1588796460666-590f1d712a2e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiZWRyb29tJTIwZGVjb3J8ZW58MXx8fHwxNzY5MjU3MzUwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: '4',
    title: 'Lush linens to warm up your winter',
    author: 'Maria Johnson',
    timeAgo: '5 days ago',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1672586420444-1a1a492e7bd6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXJtJTIwbGl2aW5nJTIwcm9vbXxlbnwxfHx8fDE3NjkyNTczNTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
];

export function ArticleList() {
  return (
    <div className="bg-white">
      {articles.map((article) => (
        <div
          key={article.id}
          className="px-4 py-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100"
        >
          <div className="flex gap-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1 leading-tight">
                {article.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{article.timeAgo}</span>
                <span>·</span>
                <span>{article.readTime}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{article.author}</p>
            </div>
            <img
              src={article.image}
              alt={article.title}
              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
