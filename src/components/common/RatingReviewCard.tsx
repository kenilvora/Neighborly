import RatingStars from "./RatingStars";

const RatingReviewCard = ({
  image,
  firstName,
  lastName,
  email,
  review,
  rating,
}: {
  image: string;
  firstName: string;
  lastName: string;
  email: string;
  review: string;
  rating: number;
}) => {
  return (
    <div className="flex flex-col gap-2 bg-neutral-200 p-5 rounded-xl min-h-[200px] overflow-hidden">
      <div className="flex items-center gap-2">
        <img src={image} alt="profile" className="w-10 h-10 rounded-full" />
        <div className="text-wrap">
          <h1 className="text-lg font-semibold">
            {firstName} {lastName}
          </h1>
          <p className="text-sm text-gray-500 text-wrap">
            {email.slice(0, 26)}
            {email.length > 26 ? "..." : ""}
          </p>
        </div>
      </div>
      <div>
        <p className="text-sm">{review}</p>
      </div>
      <div className="flex gap-2 items-center">
        <strong>{rating}</strong>

        <RatingStars Review_Count={rating} Star_Size={24} />
      </div>
    </div>
  );
};

export default RatingReviewCard;
