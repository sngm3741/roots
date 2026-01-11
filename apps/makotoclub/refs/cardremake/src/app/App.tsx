import { MessageDetailCard } from "./components/MessageDetailCard";

export default function App() {
  // サンプルデータ
  const messageData = {
    originalMessage: {
      id: "1",
      author: "名無しさん",
      content: "ここはガチクソ店",
      timestamp: "2時間前",
      avatar: "👤"
    },
    replyMessage: {
      id: "2",
      author: "名無しさん",
      content: "www",
      timestamp: "1時間前",
      avatar: "👤"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <MessageDetailCard 
          originalMessage={messageData.originalMessage}
          replyMessage={messageData.replyMessage}
        />
      </div>
    </div>
  );
}
