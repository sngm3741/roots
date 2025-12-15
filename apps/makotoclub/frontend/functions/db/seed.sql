-- Sample seed data for local preview

INSERT OR REPLACE INTO stores (
  id, name, branch_name, prefecture, area, industry, genre, unit_price,
  business_hours_open, business_hours_close, average_rating, created_at, updated_at
) VALUES
('store-001', 'やりすぎ娘', '新宿店', '東京都', '新宿', 'ソープ', '高級店', '10000', '10:00', '24:00', 4.5, DATETIME('now'), DATETIME('now')),
('store-002', 'メンエスLounge', '梅田', '大阪府', '梅田', 'メンエス', 'スタンダード', '8000', '12:00', '23:00', 4.2, DATETIME('now'), DATETIME('now')),
('store-003', 'デリヘル雅', '栄', '愛知県', '栄', 'デリヘル', '学園系', '12000', '11:00', '27:00', 4.0, DATETIME('now'), DATETIME('now'));

INSERT OR REPLACE INTO surveys (
  id, store_id, store_name, store_branch, store_prefecture, store_area,
  store_industry, store_genre, visited_period, work_type, age, spec_score,
  wait_time_hours, average_earning, rating, customer_comment, staff_comment,
  work_environment_comment, etc_comment, cast_back, email_address, image_urls,
  created_at, updated_at
) VALUES
('survey-001', 'store-001', 'やりすぎ娘', '新宿店', '東京都', '新宿',
 'ソープ', '高級店', '2025-01', '在籍', 23, 7, 2, 15, 4.8,
 '客層良し。太客多め。', '講習は丁寧。', '待機所きれい、WiFiあり。', 'シフト柔軟。', '10000', 'test1@example.com', NULL,
 DATETIME('now'), DATETIME('now')),
('survey-002', 'store-001', 'やりすぎ娘', '新宿店', '東京都', '新宿',
 'ソープ', '高級店', '2025-02', '出稼ぎ', 25, 8, 1, 18, 4.6,
 '平日昼は落ち着いてる。', '送りあり。', '寮そこそこ。', 'バックもう少し欲しい。', '12000', 'test2@example.com', NULL,
 DATETIME('now'), DATETIME('now')),
('survey-003', 'store-002', 'メンエスLounge', '梅田', '大阪府', '梅田',
 'メンエス', 'スタンダード', '2024-12', '在籍', 26, 9, 1, 14, 4.4,
 'リピ多めで安定', 'スタッフ親切', '待機室は普通', '特になし', '9000', 'test3@example.com', NULL,
 DATETIME('now'), DATETIME('now')),
('survey-004', 'store-003', 'デリヘル雅', '栄', '愛知県', '栄',
 'デリヘル', '学園系', '2025-01', '在籍', 22, 6, 3, 12, 4.2,
 '若い客が多め', '送り早め', '待機はビジホ', '口コミで来る客多し', '11000', 'test4@example.com', NULL,
 DATETIME('now'), DATETIME('now'));
