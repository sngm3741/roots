import { useState } from 'react';
import { Send, Upload, CheckCircle } from 'lucide-react';
import { toast } from "sonner";

export function Contact() {
  const [formData, setFormData] = useState({
    companyName: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    propertyType: '',
    area: '',
    serviceType: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // フォーム検証
    if (!formData.name || !formData.email || !formData.address) {
      toast.error('必須項目を入力してください');
      setIsSubmitting(false);
      return;
    }

    // 模擬的な送信処理
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success('お問い合わせを送信しました！担当者より3営業日以内にご連絡いたします。');

    // フォームリセット
    setTimeout(() => {
      setFormData({
        companyName: '',
        name: '',
        email: '',
        phone: '',
        address: '',
        propertyType: '',
        area: '',
        serviceType: '',
        message: ''
      });
      setIsSubmitted(false);
    }, 3000);
  };

  return (
    <section id="contact" className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-emerald-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-gray-900 mb-4">
            <span className="block text-lg text-emerald-600 font-bold mb-2">CONTACT</span>
            <span className="text-3xl lg:text-4xl">お問い合わせ</span>
          </h2>
          <p className="text-lg text-gray-700 mt-4">
            まずはお気軽にご相談ください。写真があれば概算見積も可能です。
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-10">
            {isSubmitted ? (
              <div className="text-center py-12">
                <CheckCircle className="text-emerald-600 mx-auto mb-4" size={64} />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">送信完了</h3>
                <p className="text-gray-700">
                  お問い合わせありがとうございます。<br />
                  担当者より3営業日以内にご連絡いたします。
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 会社名 */}
                <div>
                  <label htmlFor="companyName" className="block text-sm font-bold text-gray-700 mb-2">
                    会社名・団体名 <span className="text-gray-400 font-normal">(任意)</span>
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="例: 株式会社〇〇"
                  />
                </div>

                {/* 担当者名 */}
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">
                    ご担当者名 <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="例: 山田太郎"
                  />
                </div>

                {/* メールアドレス */}
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                    メールアドレス <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="example@company.co.jp"
                  />
                </div>

                {/* 電話番号 */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-2">
                    電話番号 <span className="text-gray-400 font-normal">(任意)</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="例: 090-1234-5678"
                  />
                </div>

                {/* 物件所在地 */}
                <div>
                  <label htmlFor="address" className="block text-sm font-bold text-gray-700 mb-2">
                    物件所在地 <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="例: 愛知県半田市〇〇町△丁目"
                  />
                </div>

                {/* 対象種別 */}
                <div>
                  <label htmlFor="propertyType" className="block text-sm font-bold text-gray-700 mb-2">
                    草刈り対象種別
                  </label>
                  <select
                    id="propertyType"
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
                  >
                    <option value="">選択してください</option>
                    <option value="駐車場">駐車場</option>
                    <option value="空き地">空き地</option>
                    <option value="太陽光発電所">太陽光発電所</option>
                    <option value="管理物件">管理物件</option>
                    <option value="工場・倉庫">工場・倉庫</option>
                    <option value="その他">その他</option>
                  </select>
                </div>

                {/* 面積 */}
                <div>
                  <label htmlFor="area" className="block text-sm font-bold text-gray-700 mb-2">
                    おおよその面積 <span className="text-gray-400 font-normal">(任意)</span>
                  </label>
                  <input
                    type="text"
                    id="area"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="例: 約200㎡ または 不明"
                  />
                </div>

                {/* サービスタイプ */}
                <div>
                  <label htmlFor="serviceType" className="block text-sm font-bold text-gray-700 mb-2">
                    ご希望のサービス
                  </label>
                  <select
                    id="serviceType"
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
                  >
                    <option value="">選択してください</option>
                    <option value="単発">単発・スポット対応</option>
                    <option value="定期">定期管理契約</option>
                    <option value="未定">未定・相談したい</option>
                  </select>
                </div>

                {/* その他要望 */}
                <div>
                  <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-2">
                    その他ご要望・ご質問
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                    placeholder="ご質問やご要望がございましたらご記入ください"
                  />
                </div>

                {/* 写真添付の案内 */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Upload className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                    <div className="text-sm text-gray-700">
                      <p className="font-bold mb-1">写真があると概算見積がスムーズです</p>
                      <p>現地の写真をお持ちの場合は、お問い合わせ後の返信メールにて添付いただけますと、より正確なお見積りが可能です。</p>
                    </div>
                  </div>
                </div>

                {/* 送信ボタン */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 text-white px-8 py-4 rounded-lg hover:bg-emerald-700 transition-colors font-bold text-lg flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>送信中...</>
                  ) : (
                    <>
                      送信する
                      <Send size={20} />
                    </>
                  )}
                </button>

                <p className="text-sm text-gray-500 text-center">
                  ※送信後、3営業日以内に担当者よりご連絡いたします
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
