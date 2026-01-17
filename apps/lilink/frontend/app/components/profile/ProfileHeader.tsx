import type { Profile } from "~/types/profile";

type ProfileHeaderProps = Pick<Profile, "name" | "subtitle" | "avatarUrl">;

export function ProfileHeader({ name, subtitle, avatarUrl }: ProfileHeaderProps) {
  return (
    <section className="grid grid-cols-12 gap-4 text-center">
      <div className="col-span-12 grid place-items-center">
        <div className="h-24 w-24 overflow-hidden rounded-full border border-lilink-border bg-white shadow-[0_12px_30px_rgba(31,42,51,0.12)]">
          <img
            src={avatarUrl}
            alt={name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
      <div className="col-span-12">
        <div className="lilink-glass grid gap-2 px-4 py-3 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
          {subtitle ? (
            <p className="text-sm text-lilink-muted">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
