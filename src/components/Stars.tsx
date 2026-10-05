import Icon from './Icon';

// Estrellas sobrias (sin emojis) sobre 5.
export default function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" title={`${rating}/5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Icon
          key={i}
          name="star"
          className={`h-3.5 w-3.5 ${i < Math.round(rating) ? 'text-amber-400' : 'text-slate-200'}`}
        />
      ))}
    </span>
  );
}
