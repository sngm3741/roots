import { Survey } from '../App';
import { Calendar, MessageSquare, BarChart3, Eye } from 'lucide-react';

interface SurveyListProps {
  surveys: Survey[];
  onViewDetail: (surveyId: string) => void;
  onViewResults: (surveyId: string) => void;
}

export function SurveyList({ surveys, onViewDetail, onViewResults }: SurveyListProps) {
  return (
    <div>
      <h2 className="mb-6 text-gray-800">公開中のアンケート</h2>
      
      {surveys.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">アンケートがまだありません</p>
          <p className="text-gray-400 text-sm mt-2">新規アンケートを作成してください</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {surveys.map((survey) => (
            <div
              key={survey.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100"
            >
              <h3 className="text-gray-900 mb-2">{survey.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{survey.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{survey.createdAt.toLocaleDateString('ja-JP')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{survey.questions.length}問</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1 text-sm">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  <span className="text-gray-700">{survey.responses.length}件の回答</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => onViewDetail(survey.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                >
                  <Eye className="w-4 h-4" />
                  回答する
                </button>
                <button
                  onClick={() => onViewResults(survey.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  <BarChart3 className="w-4 h-4" />
                  結果を見る
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
