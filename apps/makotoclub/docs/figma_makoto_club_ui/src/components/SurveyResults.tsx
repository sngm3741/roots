import { Survey } from '../App';
import { BarChart3, MessageSquare, Calendar } from 'lucide-react';

interface SurveyResultsProps {
  survey: Survey;
}

export function SurveyResults({ survey }: SurveyResultsProps) {
  const getChoiceResults = (questionId: string, options: string[]) => {
    const results: Record<string, number> = {};
    options.forEach(option => {
      results[option] = 0;
    });

    survey.responses.forEach(response => {
      const answer = response.answers[questionId];
      if (Array.isArray(answer)) {
        answer.forEach(a => {
          if (results[a] !== undefined) {
            results[a]++;
          }
        });
      } else if (typeof answer === 'string' && results[answer] !== undefined) {
        results[answer]++;
      }
    });

    return results;
  };

  const getTextAnswers = (questionId: string) => {
    return survey.responses
      .map(response => response.answers[questionId] as string)
      .filter(answer => answer && answer.trim());
  };

  const calculatePercentage = (count: number) => {
    if (survey.responses.length === 0) return 0;
    return Math.round((count / survey.responses.length) * 100);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
        <h2 className="mb-4 text-gray-800">{survey.title}</h2>
        <p className="text-gray-600 mb-4">{survey.description}</p>
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>作成日: {survey.createdAt.toLocaleDateString('ja-JP')}</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span>{survey.questions.length}問</span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span>{survey.responses.length}件の回答</span>
          </div>
        </div>
      </div>

      {survey.responses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">まだ回答がありません</p>
        </div>
      ) : (
        <div className="space-y-6">
          {survey.questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-xl shadow-sm p-8">
              <h3 className="mb-6 text-gray-800">
                {index + 1}. {question.question}
              </h3>

              {(question.type === 'single' || question.type === 'multiple') && question.options && (
                <div className="space-y-4">
                  {Object.entries(getChoiceResults(question.id, question.options)).map(([option, count]) => {
                    const percentage = calculatePercentage(count);
                    return (
                      <div key={option}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-700">{option}</span>
                          <span className="text-gray-600">
                            {count}票 ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {question.type === 'text' && (
                <div className="space-y-3">
                  {getTextAnswers(question.id).length === 0 ? (
                    <p className="text-gray-500 text-sm">回答なし</p>
                  ) : (
                    getTextAnswers(question.id).map((answer, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-600">
                        <p className="text-gray-700">{answer}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
