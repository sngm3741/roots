import { useState } from 'react';
import { Survey, Question } from '../App';
import { Plus, Trash2, X } from 'lucide-react';

interface CreateSurveyProps {
  onSubmit: (survey: Omit<Survey, 'id' | 'createdAt' | 'responses'>) => void;
  onCancel: () => void;
}

export function CreateSurvey({ onSubmit, onCancel }: CreateSurveyProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      type: 'single',
      question: '',
      options: ['', '']
    }
  ]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: 'single',
      question: '',
      options: ['', '']
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        const updated = { ...q, ...updates };
        // テキストタイプに変更した場合、optionsを削除
        if (updated.type === 'text') {
          delete updated.options;
        }
        // 選択肢タイプに変更した場合、optionsを追加
        if ((updated.type === 'single' || updated.type === 'multiple') && !updated.options) {
          updated.options = ['', ''];
        }
        return updated;
      }
      return q;
    }));
  };

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        return { ...q, options: [...q.options, ''] };
      }
      return q;
    }));
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options && q.options.length > 2) {
        return {
          ...q,
          options: q.options.filter((_, i) => i !== optionIndex)
        };
      }
      return q;
    }));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    if (!title.trim() || !description.trim()) {
      alert('タイトルと説明を入力してください');
      return;
    }

    if (questions.some(q => !q.question.trim())) {
      alert('すべての質問を入力してください');
      return;
    }

    if (questions.some(q => q.options && q.options.some(opt => !opt.trim()))) {
      alert('すべての選択肢を入力してください');
      return;
    }

    onSubmit({ title, description, questions });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="mb-6 text-gray-800">新規アンケート作成</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">
              アンケートタイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="例：顧客満足度調査"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              説明 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
              rows={3}
              placeholder="アンケートの目的や説明を記入してください"
              required
            />
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-800">質問</h3>
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                質問を追加
              </button>
            </div>

            <div className="space-y-6">
              {questions.map((question, qIndex) => (
                <div key={question.id} className="bg-gray-50 rounded-lg p-6 relative">
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(question.id)}
                      className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                      質問 {qIndex + 1} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      placeholder="質問を入力してください"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">回答形式</label>
                    <select
                      value={question.type}
                      onChange={(e) => updateQuestion(question.id, { type: e.target.value as Question['type'] })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    >
                      <option value="single">単一選択</option>
                      <option value="multiple">複数選択</option>
                      <option value="text">自由記述</option>
                    </select>
                  </div>

                  {(question.type === 'single' || question.type === 'multiple') && question.options && (
                    <div>
                      <label className="block text-gray-700 mb-2">選択肢</label>
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex gap-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                              placeholder={`選択肢 ${optIndex + 1}`}
                              required
                            />
                            {question.options && question.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeOption(question.id, optIndex)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addOption(question.id)}
                          className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          + 選択肢を追加
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              アンケートを作成
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
