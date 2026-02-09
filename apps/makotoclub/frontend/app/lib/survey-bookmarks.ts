import { createBookmarkStore } from "./bookmarks";

const surveyBookmarkStore = createBookmarkStore("survey-bookmarks", "survey-bookmarks:change");

export const getSurveyBookmarks = surveyBookmarkStore.getBookmarks;
export const isSurveyBookmarked = surveyBookmarkStore.isBookmarked;
export const toggleSurveyBookmark = surveyBookmarkStore.toggleBookmark;
export const useSurveyBookmark = surveyBookmarkStore.useBookmark;
export const useSurveyBookmarks = surveyBookmarkStore.useBookmarks;
