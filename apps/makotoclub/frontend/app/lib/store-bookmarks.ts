import { createBookmarkStore } from "./bookmarks";

const storeBookmarkStore = createBookmarkStore("store-bookmarks", "store-bookmarks:change");

export const getStoreBookmarks = storeBookmarkStore.getBookmarks;
export const isStoreBookmarked = storeBookmarkStore.isBookmarked;
export const toggleStoreBookmark = storeBookmarkStore.toggleBookmark;
export const useStoreBookmark = storeBookmarkStore.useBookmark;
export const useStoreBookmarks = storeBookmarkStore.useBookmarks;
