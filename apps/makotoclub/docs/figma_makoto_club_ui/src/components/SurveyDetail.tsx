import { useState } from 'react';
import { Survey } from '../App';
import { BarChart3, Send } from 'lucide-react';

interface SurveyDetailProps {
  survey: Survey;
  onSubmit: (surveyId: string, answers: Record<string, string | string[]>) => void;
  onViewResults: () => void;
}

export function SurveyDetail({ survey, onSubmit, onViewResults }: SurveyDetailProps) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSingleChoice = (questionId: string, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleMultipleChoice = (questionId: string, value: string) => {
    const currentAnswers = (answers[questionId] as string[]) || [];
    const newAnswers = currentAnswers.includes(value)
      ? currentAnswers.filter(v => v !== value)
      : [...currentAnswers, value];
    setAnswers({ ...answers, [questionId]: newAnswers });
  };

  const handleTextInput = (questionId: string, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    const unanswered = survey.questions.filter(q => {
      const answer = answers[q.id];
      if (!answer) return true;
      if (Array.isArray(answer) && answer.length === 0) return true;
      if (typeof answer === 'string' && !answer.trim()) return true;
      return false;
    });

    if (unanswered.length > 0) {
      alert('すべての質問に回答してください');
      return;
    }

    onSubmit(survey.id, answers);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="mb-4 text-gray-800">回答ありがとうございました！</h2>
          <p className="text-gray-600 mb-8">
            あなたの回答を送信しました。貴重なご意見をありがとうございます。
          </p>
          <button
            onClick={onViewResults}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            アンケート結果を見る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="mb-8">
          <h2 className="mb-4 text-gray-800">{survey.title}</h2>
          <p className="text-gray-600">{survey.description}</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
            <BarChart3 className="w-4 h-4" />
            <span>{survey.responses.length}件の回答</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {survey.questions.map((question, index) => (
            <div key={question.id} className="border-t border-gray-200 pt-6">
              <label className="block mb-4 text-gray-800">
                {index + 1}. {question.question}
                <span className="text-red-500 ml-1">*</span>
              </label>

              {question.type === 'single' && question.options && (
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={(e) => handleSingleChoice(question.id, e.target.value)}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'multiple' && question.options && (
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        value={option}
                        checked={(answers[question.id] as string[] || []).includes(option)}
                        onChange={() => handleMultipleChoice(question.id, option)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'text' && (
                <textarea
                  value={(answers[question.id] as string) || ''}
                  onChange={(e) => handleTextInput(question.id, e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                  rows={4}
                  placeholder="ご意見をお聞かせください"
                />
              )}
            </div>
          ))}

          <div className="pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Send className="w-5 h-5" />
              回答を送信
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
