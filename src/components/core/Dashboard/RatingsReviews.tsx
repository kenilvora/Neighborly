import { useState } from "react";
import CustomDropdown from "../../common/CustomDropdown";

const RatingsReviews = () => {
  const options = [
    {
      value: "User",
      label: "Feedback On Me",
    },
    {
      value: "Item",
      label: "Feedback On My Items",
    },
  ];

  const [filter, setFilter] = useState({
    option: options[0].value,
  });

  const [userReviews, setUserReviews] = useState([])

  return (
    <div className="flex flex-col gap-5 mt-5">
      <div className="flex justify-end items-center w-full">
        <div className="min-w-[220px]">
          <CustomDropdown
            data={options}
            label="Filter"
            fn={setFilter}
            value={filter.option}
            name="option"
          />
        </div>
      </div>
    </div>
  );
};

export default RatingsReviews;
