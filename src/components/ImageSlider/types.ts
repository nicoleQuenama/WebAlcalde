export interface ImageSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  initialPosition?: number;
  className?: string;
  afterFit?: 'cover' | 'contain' | 'fill' | 'none';
  afterPosition?: string;
  afterScale?: number;
}
