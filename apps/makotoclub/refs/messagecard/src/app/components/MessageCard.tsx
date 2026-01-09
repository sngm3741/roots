import { useState } from "react";
import { ThumbsUp, ThumbsDown, Share2, Flag, MessageSquare } from "lucide-react";
import exampleImage from 'figma:asset/b6e6cd152b0814774441ec2487d1afc6cc73e276.png';
import { Button } from "./ui/button";
import { toast } from "sonner";

interface MessageCardProps {
  username?: string;
  timestamp?: string;
  isAnonymous?: boolean;
}

export function MessageCard({ 
  username = "defewfe", 
  timestamp = "2026/01/10 07:01",
  isAnonymous = true 
}: MessageCardProps) {
  const [goodCount, setGoodCount] = useState(0);
  const [badCount, setBadCount] = useState(0);
  const [userVote, setUserVote] = useState<'good' | 'bad' | null>(null);

  const handleGood = () => {
    if (userVote === 'good') {
      setGoodCount(goodCount - 1);
      setUserVote(null);
    } else {
      if (userVote === 'bad') {
        setBadCount(badCount - 1);
      }
      setGoodCount(goodCount + 1);
      setUserVote('good');
    }
  };

  const handleBad = () => {
    if (userVote === 'bad') {
      setBadCount(badCount - 1);
      setUserVote(null);
    } else {
      if (userVote === 'good') {
        setGoodCount(goodCount - 1);
      }
      setBadCount(badCount + 1);
      setUserVote('bad');
    }
  };

  const handleShare = () => {
    toast.success("リンクをコピーしました");
  };

  const handleReport = () => {
    toast.info("通報を受け付けました");
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-md">
            <img 
              src={exampleImage} 
              alt="avatar" 
              className="w-6 h-6 object-contain"
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{username}</h3>
            {isAnonymous && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-700">
                匿名
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{timestamp}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReport}
            className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
          >
            <Flag className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="mb-4 min-h-[60px]">
        <p className="text-gray-700 leading-relaxed">
          メッセージの内容がここに表示されます。
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {/* Good Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGood}
            className={`gap-1.5 ${
              userVote === 'good' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${userVote === 'good' ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{goodCount > 0 && goodCount}</span>
          </Button>

          {/* Bad Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBad}
            className={`gap-1.5 ${
              userVote === 'bad' 
                ? 'text-red-600 bg-red-50' 
                : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
            }`}
          >
            <ThumbsDown className={`w-4 h-4 ${userVote === 'bad' ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{badCount > 0 && badCount}</span>
          </Button>

          {/* Reply Button */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm font-medium">返信</span>
          </Button>
        </div>

        {/* Share Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="gap-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50"
        >
          <Share2 className="w-4 h-4" />
          <span className="text-sm font-medium">共有</span>
        </Button>
      </div>
    </div>
  );
}
