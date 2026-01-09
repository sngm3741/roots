import { Twitter, Instagram, MessageCircle } from 'lucide-react';

interface SocialLinksProps {
  twitter?: string;
  instagram?: string;
  line?: string;
}

export default function SocialLinks({ twitter, instagram, line }: SocialLinksProps) {
  const hasAnySocial = twitter || instagram || line;
  
  if (!hasAnySocial) return null;

  return (
    <div className="col-span-12 sm:col-start-3 sm:col-span-8 md:col-start-4 md:col-span-6">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-start-4 col-span-6 sm:col-start-5 sm:col-span-4">
          <div className="grid grid-cols-3 gap-4">
            {twitter && (
              <a
                href={twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <Twitter className="w-6 h-6 text-gray-700" />
              </a>
            )}
            {instagram && (
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <Instagram className="w-6 h-6 text-gray-700" />
              </a>
            )}
            {line && (
              <a
                href={line}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <MessageCircle className="w-6 h-6 text-gray-700" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
