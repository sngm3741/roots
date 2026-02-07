export type AnimationSettings = {
  springDuration: number;
  springBounce: number;
  xSpringDuration: number;
  xSpringBounce: number;
  dragElastic: number;
  swipeConfidenceThreshold: number;
  zIndexDelay: number;
};

export const defaultAnimationSettings: AnimationSettings = {
  springDuration: 0.3,
  springBounce: 0.3,
  xSpringDuration: 0.5,
  xSpringBounce: 0.1,
  dragElastic: 0.7,
  swipeConfidenceThreshold: 10000,
  zIndexDelay: 0.05,
};
