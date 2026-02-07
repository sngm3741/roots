import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { items } from "../../data/portfolio";
import { AnimationSettings } from "../../data/animationSettings";
import PortfolioCard from "./PortfolioCard";

// Image variants aka first card
const createCardVariants = (settings: AnimationSettings) => ({
  visible: (i: number) => ({
    opacity: 1,
    zIndex: [4, 3, 2, 1][i],
    scale: [1, 0.9, 0.85, 0.8][i], // Scale depending on position
    y: [0, -12, 0, 12][i], // Vertical position depending on index (keep scale in mind)
    rotate: [0, 2, 4, 7][i],
    x: [0, 32, 48, 62][i],
    perspective: 400,
    transition: {
      // opacity: { duration: 0.3 },
      zIndex: { delay: settings.zIndexDelay }, // Delay zIndex to avoid visual stacking issues during transition
      scale: { type: "spring", duration: settings.springDuration, bounce: settings.springBounce },
      y: { type: "spring", duration: settings.springDuration, bounce: settings.springBounce },
      x: { type: "spring", duration: settings.xSpringDuration, bounce: settings.xSpringBounce },
    },
  }),
  exit: { opacity: 0, scale: 0.5, y: 50 },
});

/**
 * Experimenting with distilling swipe offset and velocity into a single variable, so the
 * less distance a user has swiped, the more velocity they need to register as a swipe.
 * Should accomodate longer swipes and short flicks without having binary checks on
 * just distance thresholds and velocity > 0.
 */
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

interface CarouselStackProps {
  settings: AnimationSettings;
}

export const CarouselStack: React.FC<CarouselStackProps> = ({ settings }) => {
  const [startIndex, setStartIndex] = useState(0);
  const [dragElastic, setDragElastic] = useState(0.7); // Default to desktop

  useEffect(() => {
    setDragElastic(settings.dragElastic);
  }, [settings.dragElastic]); // Update when settings change

  if (items.length === 0) {
    return null;
  }

  const paginate = () => {
    setStartIndex((prev) => (prev + 1) % items.length);
  };

  const cardVariants = createCardVariants(settings);
  const stackSize = Math.min(4, items.length);
  const visibleIndices = Array.from({ length: stackSize }, (_, i) =>
    (startIndex + i) % items.length
  );

  return (
    <div className="content-container">
      <AnimatePresence initial={false}>
        {visibleIndices.map((index, i) => (
          <motion.div
            key={items[index].id}
            custom={i}
            variants={cardVariants}
            initial="exit"
            animate="visible"
            exit="exit"
            drag={true}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={dragElastic}
            onDragEnd={(_e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);
              if (
                swipe < -settings.swipeConfidenceThreshold ||
                swipe > settings.swipeConfidenceThreshold
              ) {
                paginate();
              }
            }}
            className={`card ${items[index].accent}`}
          >
            <PortfolioCard item={items[index]} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default CarouselStack;
