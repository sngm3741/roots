import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { Send, Upload, CheckCircle, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { InstagramIcon } from "./InstagramIcon";
import { LineIcon } from "./LineIcon";

interface ContactProps {
  showHeading?: boolean;
}

export function Contact({ showHeading = true }: ContactProps) {
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
  const [attachments, setAttachments] = useState<{ file: File; url: string }[]>([]);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);
  const attachmentsRef = useRef(attachments);
  const maxFiles = 20;
  const maxFileSize = 30 * 1024 * 1024;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    if (attachments.length + files.length > maxFiles) {
      toast.error('写真は最大20枚まで添付できます');
      e.target.value = '';
      return;
    }

    const tooLarge = files.find((file) => file.size > maxFileSize);
    if (tooLarge) {
      toast.error('1枚あたり30MBまでにしてください');
      e.target.value = '';
      return;
    }

    const nextAttachments = [
      ...attachments,
      ...files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    ];
    setAttachments(nextAttachments);
    e.target.value = '';
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => {
      const target = prev[index];
      if (target) {
        URL.revokeObjectURL(target.url);
      }
      const next = prev.filter((_, i) => i !== index);
      if (previewImage?.url === target?.url) {
        setPreviewImage(null);
      }
      return next;
    });
  };

  const formatFileSize = (bytes: number) => {
    const sizeMb = bytes / (1024 * 1024);
    return `${sizeMb.toFixed(1)}MB`;
  };

  useEffect(() => {
    if (!previewImage) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewImage(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewImage]);

  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  useEffect(() => {
    return () => {
      attachmentsRef.current.forEach((attachment) => URL.revokeObjectURL(attachment.url));
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // フォーム検証
    if (!formData.name || !formData.email || !formData.address) {
      toast.error('必須項目を入力してください');
      setIsSubmitting(false);
      return;
    }

    if (attachments.length > maxFiles) {
      toast.error('写真は最大20枚まで添付できます');
      setIsSubmitting(false);
      return;
    }

    if (attachments.some((attachment) => attachment.file.size > maxFileSize)) {
      toast.error('1枚あたり30MBまでにしてください');
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
      setAttachments((prev) => {
        prev.forEach((attachment) => URL.revokeObjectURL(attachment.url));
        return [];
      });
      setFileInputKey((prev) => prev + 1);
      setIsSubmitted(false);
    }, 3000);
  };

  return (
    <section
      id="contact"
      className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-emerald-50"
    >
      <div className="container mx-auto px-4 sm:px-6">
        {showHeading ? (
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-gray-900 mb-4">
              <span className="block text-lg text-emerald-600 font-bold mb-2">CONTACT</span>
              <span className="text-3xl lg:text-4xl">お問い合わせ</span>
            </h2>
            <div className="mt-6 flex flex-col items-center gap-3">
              <p className="text-sm text-gray-600">こちらからのお問い合わせも可能です。</p>
              <div className="flex items-center gap-4">
                <a
                  href="https://lin.ee/kkV7C2T"
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors"
                  aria-label="LINEはこちら"
                >
                  <LineIcon size={28} />
                </a>
                <a
                  href="https://www.instagram.com/toransu0409"
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors"
                  aria-label="Instagramはこちら"
                >
                  <InstagramIcon size={28} />
                </a>
                <a
                  href="mailto:testyou@gmail.com"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors"
                  aria-label="メールはこちら"
                >
                  <Mail size={22} />
                </a>
                <a
                  href="tel:09063349093"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors"
                  aria-label="電話はこちら"
                >
                  <Phone size={22} />
                </a>
              </div>
            </div>
          </div>
        ) : null}

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
                    対象施設・用地
                  </label>
                  <select
                    id="propertyType"
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
                  >
                    <option value="">選択してください</option>
                    <option value="管理物件">管理物件</option>
                    <option value="公共施設">公共施設</option>
                    <option value="行政管理地">行政管理地</option>
                    <option value="道路・歩道">道路・歩道</option>
                    <option value="太陽光発電所">太陽光発電所</option>
                    <option value="駐車場">駐車場</option>
                    <option value="空き地">空き地</option>
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
                    <option value="草刈り・除草">草刈り・除草</option>
                    <option value="剪定">剪定</option>
                    <option value="伐採">伐採</option>
                    <option value="舗装">道路の舗装工事</option>
                    <option value="定期管理">定期管理</option>
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
                      <p className="mb-3">
                        現地の写真がある場合は、こちらで添付してお送りください。
                        <span className="block text-gray-500">最大20枚・1枚30MBまで</span>
                      </p>
                      <input
                        key={fileInputKey}
                        type="file"
                        name="attachments"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-emerald-700"
                      />
                      {attachments.length > 0 ? (
                        <div className="mt-4 space-y-3">
                          <p className="text-xs text-gray-600">
                            選択中: {attachments.length}枚
                          </p>
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {attachments.map((attachment, index) => (
                              <div
                                key={`${attachment.file.name}-${index}`}
                                className="rounded-lg border border-blue-200 bg-white p-2"
                              >
                                <button
                                  type="button"
                                  className="aspect-square w-full overflow-hidden rounded-md border border-gray-100"
                                  onClick={() =>
                                    setPreviewImage({ url: attachment.url, name: attachment.file.name })
                                  }
                                  aria-label={`${attachment.file.name}を拡大表示`}
                                >
                                  <img
                                    src={attachment.url}
                                    alt={attachment.file.name}
                                    className="h-full w-full object-cover"
                                  />
                                </button>
                                <div className="mt-2 space-y-1">
                                  <p className="text-xs text-gray-600 line-clamp-1">
                                    {attachment.file.name}
                                  </p>
                                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                                    <span>{formatFileSize(attachment.file.size)}</span>
                                    <button
                                      type="button"
                                      className="text-red-500 hover:text-red-600"
                                      onClick={() => handleRemoveAttachment(index)}
                                    >
                                      削除
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
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

      {previewImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl"
          >
            <button
              type="button"
              className="absolute -top-10 right-0 text-white text-sm"
              onClick={() => setPreviewImage(null)}
            >
              閉じる
            </button>
            <img
              src={previewImage.url}
              alt={previewImage.name}
              className="max-h-[90vh] w-full rounded-lg object-contain"
              onClick={(event) => event.stopPropagation()}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
