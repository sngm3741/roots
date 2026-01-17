import type { Profile } from "~/types/profile";
import { ProfileHeader } from "./ProfileHeader";
import { SocialLinks } from "./SocialLinks";
import { LinkList } from "./LinkList";
import { ChatbotCard } from "./ChatbotCard";

type ProfilePageProps = {
  profile: Profile;
};

export function ProfilePage({ profile }: ProfilePageProps) {
  const backgroundImage = profile.backgroundImageUrl
    ? `url("${profile.backgroundImageUrl}")`
    : undefined;

  return (
    <main
      className="lilink-zebra min-h-screen px-6 pb-16 pt-12"
      style={backgroundImage ? { backgroundImage } : undefined}
    >
      <div className="mx-auto w-full max-w-5xl">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-start-3 md:col-span-8">
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12">
                <ProfileHeader
                  name={profile.name}
                  subtitle={profile.subtitle}
                  avatarUrl={profile.avatarUrl}
                />
              </div>
              <div className="col-span-12">
                <SocialLinks socialLinks={profile.socialLinks} />
              </div>
              <div className="col-span-12">
                <LinkList links={profile.links} />
              </div>
              {profile.chatbotEnabled ? (
                <div className="col-span-12">
                  <ChatbotCard />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
