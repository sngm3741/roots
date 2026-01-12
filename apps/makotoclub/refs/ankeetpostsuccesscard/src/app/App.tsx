import { useState } from 'react';
import { SuccessModal } from './components/SuccessModal';

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-8">
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-8 rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg"
      >
        モーダルを表示
      </button>

      <SuccessModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
