import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, X, Sparkles } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ 
                type: 'spring', 
                duration: 0.6,
                bounce: 0.3
              }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              {/* Decorative gradient blobs */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-pink-400/30 to-purple-500/30 rounded-full blur-3xl -translate-y-32 translate-x-32" />
              <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-purple-400/30 to-pink-500/30 rounded-full blur-3xl translate-y-28 -translate-x-28" />

              {/* Content */}
              <div className="relative z-10 p-12 text-center">
                {/* Success Icon with animation */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: 'spring',
                    delay: 0.2,
                    duration: 0.8,
                    bounce: 0.5
                  }}
                  className="relative inline-flex items-center justify-center mb-8"
                >
                  {/* Pulsing glow effect */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.3, 1],
                      opacity: [0.4, 0.1, 0.4]
                    }}
                    transition={{ 
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur-3xl"
                    style={{ width: '140px', height: '140px' }}
                  />
                  
                  {/* Icon container with gradient */}
                  <div className="relative bg-gradient-to-br from-pink-500 via-pink-600 to-purple-600 rounded-full p-7 shadow-2xl">
                    <CheckCircle2 className="w-16 h-16 text-white" strokeWidth={2.5} />
                  </div>

                  {/* Sparkle animations */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: [0, 1, 0],
                        scale: [0, 1.2, 0],
                        x: [0, Math.cos((i * Math.PI) / 4) * 80],
                        y: [0, Math.sin((i * Math.PI) / 4) * 80],
                      }}
                      transition={{ 
                        duration: 1.2,
                        delay: 0.5 + i * 0.08,
                        ease: "easeOut"
                      }}
                      className="absolute top-1/2 left-1/2"
                    >
                      <Sparkles 
                        className="w-6 h-6 text-pink-500" 
                        fill="currentColor" 
                      />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Title with gradient text */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-4xl mb-4 bg-gradient-to-r from-pink-600 via-pink-500 to-purple-600 bg-clip-text text-transparent"
                >
                  アンケート完了！
                </motion.h2>
                
                {/* Message */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="text-slate-600 text-lg mb-10 leading-relaxed"
                >
                  ご協力いただき、<br />
                  誠にありがとうございました。
                </motion.p>

                {/* Close button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 text-white py-4 px-10 rounded-2xl hover:from-pink-600 hover:via-pink-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] text-lg"
                >
                  閉じる
                </motion.button>
              </div>

              {/* Close X button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                onClick={onClose}
                className="absolute top-6 right-6 w-11 h-11 flex items-center justify-center rounded-full bg-white/90 hover:bg-white transition-all shadow-lg hover:shadow-xl hover:scale-110 z-20"
              >
                <X className="w-5 h-5 text-slate-600" />
              </motion.button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
