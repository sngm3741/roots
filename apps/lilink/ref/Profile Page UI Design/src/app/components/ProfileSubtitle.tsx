interface ProfileSubtitleProps {
  subtitle: string;
}

export default function ProfileSubtitle({ subtitle }: ProfileSubtitleProps) {
  if (!subtitle) return null;
  
  return (
    <div className="col-span-12 sm:col-start-3 sm:col-span-8 md:col-start-4 md:col-span-6">
      <p className="text-gray-600 text-center">{subtitle}</p>
    </div>
  );
}
