import { MessageCard } from "./components/MessageCard";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <div className="size-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <MessageCard />
      <Toaster />
    </div>
  );
}
