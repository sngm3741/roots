interface LinkCardProps {
  title: string;
  url: string;
  icon?: string;
}

export default function LinkCard({ title, url, icon }: LinkCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
    >
      <div className="grid grid-cols-12 gap-3 items-center">
        {icon && (
          <div className="col-span-1">
            <img
              src={icon}
              alt=""
              className="w-6 h-6 rounded object-cover"
            />
          </div>
        )}
        <div className={icon ? "col-span-11" : "col-span-12"}>
          <span className="text-gray-900">{title}</span>
        </div>
      </div>
    </a>
  );
}
