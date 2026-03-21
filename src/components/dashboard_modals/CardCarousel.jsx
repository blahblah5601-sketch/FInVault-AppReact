// components/CardCarousel.jsx
import { motion } from 'framer-motion';

/**
 * CardCarousel Component - Navigation for switching between cards
 * @param {Object} props
 * @param {Array} props.cards - Array of card objects
 * @param {Object} props.selectedCard - Currently selected card
 * @param {Function} props.onSelectCard - Callback when card is selected
 */
export default function CardCarousel({ cards, selectedCard, onSelectCard }) {
  const isActive = card => card.id === selectedCard;
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="flex gap-4 px-8 py-4 bg-black/40 backdrop-blur-xl rounded-full border border-white/10">
        {cards.map((card, index) => (
          <motion.button
            key={card.id}
            onClick={() => onSelectCard(card)}
            className={`relative w-20 h-12 rounded-xl transition-all ${
              isActive(card)
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-orange-500/50'
                : 'bg-slate-700/50 hover:bg-slate-600/50'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Card Number */}
            <div className="absolute inset-0 flex items-center justify-center">
              <p className={`text-xs font-bold ${
                isActive(card) ? 'text-white' : 'text-slate-400'
              }`}>
                {card.account_no.slice(-4)}
              </p>
            </div>

            {/* Selection Indicator */}
            {isActive(card) && (
              <motion.div
                layoutId="activeCard"
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-orange-400"
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
