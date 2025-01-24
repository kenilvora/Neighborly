interface IRating {
  rating: number;
  review?: string;
}

export default function getAvgRating(ratings: IRating[]): number {
  const length = ratings.length;

  if (length === 0) {
    return 0;
  }

  const totalRating = ratings.reduce((acc, rating) => acc + rating.rating, 0);

  return Math.round((totalRating/ length) * 2) / 2 || 0; // how to give only 1 decimal place?
}
