export interface CardConfig {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
}

export interface ValueCardsProps {
  cards?: CardConfig[];
  className?: string;
}