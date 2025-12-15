# MakotoClub API 契約（stores / surveys）v1（旧実装互換）

`__before/makoto-club/frontend/src/types` をベースに、フロントが期待するレスポンスの仕様を明文化する。  
Cloudflare Functions (D1) の実装はこの契約に合わせる。

## stores
### StoreSummary
- `id`: string
- `storeName`: string
- `branchName?`: string | null
- `prefecture`: string
- `area?`: string | null
- `category`: string (industry)
- `genre?`: string | null
- `unitPrice?`: string | null
- `businessHours?`: { open: string; close: string } | null (詳細のみ)
- `averageRating`: number (0-5, nullableなら null/undefined)
- `averageEarning`: number (数値; 0 なら0を返す)
- `averageEarningLabel?`: string (例: "15万円")
- `waitTimeHours?`: number
- `waitTimeLabel?`: string (例: "2時間")
- `surveyCount`: number
- `helpfulCount?`: number
- `reviewCount?`: number (後方互換)
- `createdAt?`: string (ISO)
- `updatedAt?`: string (ISO)

### StoreDetail extends StoreSummary
- `surveys`: SurveySummary[]

### StoreListResponse
- `items`: StoreSummary[]
- `page`: number
- `limit`: number
- `total`: number

### クエリ
- `name?`, `prefecture?`, `area?`, `industry?`, `genre?`, `page?`, `limit?`, `sort?`
  - `sort` 値の想定: `""|undefined` = 新着, `oldest` = 古い順, `earning` = 稼ぎ順, `rating` = 評価順

## surveys
### SurveySummary
- `id`: string
- `storeId`: string
- `storeName`: string
- `storeBranch?`: string | null
- `storePrefecture`: string
- `storeArea?`: string | null
- `storeIndustry`: string
- `storeGenre?`: string | null
- `visitedPeriod`: string (例: "2025-01")
- `workType`: string
- `age`: number
- `specScore`: number
- `waitTimeHours`: number
- `averageEarning`: number
- `rating`: number (0-5)
- `customerComment?`: string | null
- `staffComment?`: string | null
- `workEnvironmentComment?`: string | null
- `etcComment?`: string | null
- `castBack?`: string | null
- `emailAddress?`: string | null
- `imageUrls?`: string[] | null
- `helpfulCount?`: number
- `createdAt`: string (ISO)
- `updatedAt`: string (ISO)

### SurveyDetail
- SurveySummary 同等

### SurveyListResponse
- `items`: SurveySummary[]
- `page`: number
- `limit`: number
- `total`: number

### クエリ
- `sort?` ("newest" | "oldest" | ...)
- `limit?`, `page?`

## 値の扱い
- 日付: ISO8601 文字列。値が無い場合は返さず（undefined）にするか、nullを明示する。  
- 数値: 0を意味のある値として扱う。値が無い場合のみnull/undefined。  
- 文字列: 未設定は null または省略。空文字は避ける。

## APIエンドポイント（互換優先）
- GET `/api/stores` → StoreListResponse
- GET `/api/stores/:id` → StoreDetail
- GET `/api/stores/:id/surveys` → SurveySummary[]
- GET `/api/surveys` → SurveyListResponse
- GET `/api/surveys/:id` → SurveyDetail
- POST `/api/surveys` → 作成（リクエストは旧実装のpayloadに合わせる）
- Admin（当面直SQL運用なら後回し）
