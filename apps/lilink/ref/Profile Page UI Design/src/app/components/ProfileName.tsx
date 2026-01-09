interface ProfileNameProps {
  name: string;
}

export default function ProfileName({ name }: ProfileNameProps) {
  return (
    <div className="col-span-12 sm:col-start-3 sm:col-span-8 md:col-start-4 md:col-span-6">
      <h1 className="text-2xl font-bold text-center">{name}</h1>
    </div>
  );
}
