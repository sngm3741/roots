import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, MapPin, Phone, Mail, Calendar, Clock } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import useEmblaCarousel from 'embla-carousel-react';
import eventImage1 from 'figma:asset/98352c13614de552125e42bc80e4cb6eece83f2c.png';
import eventImage2 from 'figma:asset/fcf43337d36674127af50325781d502a9621421c.png';

interface EventCardProps {
  images?: string[];
  title: string;
  date: string;
  venue: string;
  price: string;
  description?: string[];
  contact?: {
    email?: string;
    location?: string;
    address?: string;
    phone?: string;
  };
  linkText?: string;
}

export function EventCard({
  images = [eventImage1, eventImage2],
  title,
  date,
  venue,
  price,
  description,
  contact,
  linkText = '過去のイベントはこちら',
}: EventCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, skipSnaps: false });

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setCurrentImageIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        {/* Image Carousel */}
        <div className="relative aspect-[4/3] overflow-hidden group">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative flex-[0_0_100%] min-w-0"
                >
                  <ImageWithFallback
                    src={image}
                    alt={`${title} - ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    scrollTo(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentImageIndex
                      ? 'bg-white scale-125'
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`画像 ${index + 1}に移動`}
                />
              ))}
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>

        {/* Card Content */}
        <div className="p-6">
          {/* Title */}
          <h3 className="font-bold mb-3">{title}</h3>

          {/* Date */}
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{date}</span>
          </div>

          {/* Venue */}
          <div className="flex items-center gap-2 text-gray-600 mb-4">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{venue}</span>
          </div>

          {/* Accordion Toggle Button */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-center gap-2 py-3 text-gray-600 hover:text-gray-900 transition-colors duration-200 border-t border-gray-100"
            whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-sm font-medium">
              {isOpen ? '詳細を閉じる' : '詳細を見る'}
            </span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </motion.button>

          {/* Accordion Content */}
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  height: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
                  opacity: { duration: 0.3 },
                }}
                className="overflow-hidden"
              >
                <motion.div
                  initial={{ y: -10 }}
                  animate={{ y: 0 }}
                  exit={{ y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="pt-4 pb-2 border-t border-gray-100"
                >
                  {/* Description */}
                  {description && (
                    <div className="space-y-3 mb-6">
                      {description.map((paragraph, index) => (
                        <motion.p
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 + 0.1 }}
                          className="text-sm text-gray-700 leading-relaxed"
                        >
                          {paragraph}
                        </motion.p>
                      ))}
                    </div>
                  )}

                  {/* Contact Information */}
                  {contact && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-3 mb-6 p-4 bg-gray-50 rounded-lg"
                    >
                      <h4 className="font-semibold text-sm text-gray-900 mb-3">
                        お問い合わせ
                      </h4>
                      
                      {contact.email && (
                        <div className="flex items-start gap-3">
                          <Mail className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                          >
                            {contact.email}
                          </a>
                        </div>
                      )}

                      {contact.location && (
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">
                            {contact.location}
                          </span>
                        </div>
                      )}

                      {contact.address && (
                        <div className="flex items-start gap-3 pl-7">
                          <span className="text-sm text-gray-600">
                            {contact.address}
                          </span>
                        </div>
                      )}

                      {contact.phone && (
                        <div className="flex items-start gap-3">
                          <Phone className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <a
                            href={`tel:${contact.phone}`}
                            className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
                          >
                            {contact.phone}
                          </a>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Link */}
                  {linkText && (
                    <motion.a
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      href="#"
                      className="inline-block text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                    >
                      {linkText}
                    </motion.a>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}