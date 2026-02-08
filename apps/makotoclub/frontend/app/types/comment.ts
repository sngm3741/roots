export interface StoreComment {
  id: string;
  storeId: string;
  seq?: number;
  parentId?: string | null;
  authorName?: string | null;
  body: string;
  goodCount?: number;
  badCount?: number;
  createdAt: string;
  deletedAt?: string | null;
}

export interface StoreCommentDetail {
  comment: StoreComment;
  parent?: StoreComment | null;
  replies?: StoreComment[];
  replyCounts?: Record<string, number>;
  store: {
    id: string;
    storeName: string;
    storeBranch?: string | null;
    storePrefecture: string;
    storeArea?: string | null;
  };
}

export interface StoreCommentListResponse {
  items: StoreComment[];
  total: number;
  page: number;
  limit: number;
}
