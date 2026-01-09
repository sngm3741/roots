interface ProfileIconProps {
  src: string;
  alt: string;
}

export default function ProfileIcon({ src, alt }: ProfileIconProps) {
  return (
    <div className="col-span-12 grid grid-cols-12">
      <div className="col-start-5 col-span-4 sm:col-start-6 sm:col-span-2">
        <img
          src={src}
          alt={alt}
          className="w-full aspect-square rounded-full object-cover shadow-md"
        />
      </div>
    </div>
  );
}
