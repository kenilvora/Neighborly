interface IRating {
  rating: number;
  review?: string;
}

export default function getAvgRating(ratings: IRating[]): number {
  const length = ratings.length;
  const totalRating = ratings.reduce((acc, rating) => acc + rating.rating, 0);
  return totalRating / length || 0;
}
