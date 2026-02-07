import StatusIndicator from "../atoms/StatusIndicator";

type HeroAvatarProps = {
  status: "online" | "offline" | "sleep";
  imageUrl: string;
  alt: string;
};

export default function HeroAvatar({ status, imageUrl, alt }: HeroAvatarProps) {
  return (
    <div className="relative flex h-24 w-24 items-center justify-center overflow-visible">
      <div className="h-24 w-24 overflow-hidden rounded-full border border-slate-200 bg-blue-50">
        <img src={imageUrl} alt={alt} className="h-full w-full object-cover" />
      </div>
      <StatusIndicator status={status} />
    </div>
  );
}
