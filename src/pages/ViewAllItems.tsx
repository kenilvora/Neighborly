import { useEffect, useState } from "react";
import { getAllCategories } from "../services/operations/categoryAPI";
import toast from "react-hot-toast";
import CustomDropdown from "../components/common/CustomDropdown";
import data from "../data/Country-State-City.json";
import { RxCross2 } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import { getAllItems } from "../services/operations/itemAPI";
import { RootState } from "../reducer/store";
import Loader from "../components/common/Loader";
import ItemCard from "../components/core/Items/ItemCard";

const countryData = data as Country[];

interface Country {
  value: string;
  label: string;
  children: State[];
}

interface State {
  value: string;
  label: string;
  children: City[];
}

interface City {
  value: string;
  label: string;
}

interface Category {
  value: string;
  label: string;
}

interface Item {
  _id: string;
  name: string;
  description: string;
  price: number;
  depositAmount: number;
  images: string[];
  condition: "New" | "Like New" | "Good" | "Average" | "Poor";
  deliveryCharges: number;
  avgRating: number;
  totalRating: number;
}

const ViewAllItems = () => {
  const { isLoading } = useSelector((state: RootState) => state.item);

  const dispatch = useDispatch();

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [itemPrice, setItemPrice] = useState(100);
  const [deposit, setDeposit] = useState(100);
  const [category, setCategory] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [condition, setCondition] = useState("");
  const [deliveryType, setDeliveryType] = useState("");
  const [stateData, setStateData] = useState([] as State[]);
  const [cityData, setCityData] = useState([] as City[]);
  const [tags, setTags] = useState([] as string[]);

  const [allItems, setAllItems] = useState<Item[]>([]);

  useEffect(() => {
    if (country === "" || country === null || country === undefined) {
      setStateData([]);
      return;
    }
    const selectedCountry = countryData.find((c) => c.value === country);

    if (selectedCountry) {
      setStateData(selectedCountry.children);
    }
  }, [country]);

  useEffect(() => {
    if (state === "" || state === null || state === undefined) {
      setCityData([]);
      return;
    }
    const selectedState = stateData.find((s) => s.value === state);

    if (selectedState) {
      setCityData(selectedState.children);
    }
  }, [state]);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const res = await getAllCategories();

        const updatedCategories = res.map((category) => ({
          value: category.name,
          label: `${category.name}`,
        }));

        setCategories(updatedCategories);
      } catch (error) {
        toast.error("An error occurred while fetching categories");
      }
    };

    getCategories();
  }, []);

  const getItems = async () => {
    if (!hasMore) return;
    try {
      const res = (await dispatch(
        getAllItems(page, page === 1) as any
      )) as Item[];
      setAllItems((prev) => [...prev, ...res]);

      if (res.length < 15) {
        setHasMore(false);
      }
    } catch (error) {
      toast.error("An error occurred while fetching items");
    }
  };

  useEffect(() => {
    console.log("Current Page: ", page);
    getItems();
  }, [page, dispatch]);

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.scrollHeight
    ) {
      if (hasMore && !isLoading) {
        setPage((prevPage) => prevPage + 1); // Increment page number
      }
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const conditions = [
    {
      value: "New",
      label: "New",
    },
    {
      value: "Like New",
      label: "Like New",
    },
    {
      value: "Good",
      label: "Good",
    },
    {
      value: "Average",
      label: "Average",
    },
    {
      value: "Poor",
      label: "Poor",
    },
  ];

  const deliveryTypes = [
    {
      value: "Pickup",
      label: "Pickup",
    },
    {
      value: "Delivery",
      label: "Delivery",
    },
    {
      value: "Both (Pickup & Delivery)",
      label: "Both (Pickup & Delivery)",
    },
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();

      const tag = (e?.target as HTMLInputElement).value.trim();
      if (tag && !tags.includes(tag.toLowerCase())) {
        setTags([...tags, tag.toLowerCase()]);
      } else if (tag && tags.includes(tag.toLowerCase())) {
        toast.error("Tag already exists");
      }
      (e.target as HTMLInputElement).value = "";
    }
  };

  const removeTag = (
    e: React.MouseEvent<SVGElement, MouseEvent>,
    index: number
  ) => {
    e.preventDefault();
    const tagsCopy = [...tags];
    tagsCopy.splice(index, 1);
    setTags(tagsCopy);
  };

  const resetFilters = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    setItemPrice(100);
    setDeposit(100);
    setCategory("");
    setCountry("");
    setState("");
    setCity("");
    setCondition("");
    setDeliveryType("");
    setTags([]);
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-[94%] max-w-[1480px] mx-auto my-8 mt-[6.7rem] flex gap-9">
          <div className="w-[30%] max-w-[290px] h-full flex flex-col gap-5">
            <div className="h-fit p-5 shadow-xl border border-neutral-200 rounded-lg flex flex-col gap-5">
              <h1 className="text-2xl font-semibold">Advanced Filters</h1>

              <div>
                <h1 className="">Price Range: Above ₹ {itemPrice}</h1>
                <input
                  type="range"
                  className="w-full"
                  min={100}
                  max={10000}
                  value={itemPrice}
                  onChange={(e) => setItemPrice(parseInt(e.target.value))}
                />
              </div>

              <div>
                <h1 className="">Deposit Range: Above ₹ {deposit}</h1>
                <input
                  type="range"
                  className="w-full"
                  min={100}
                  max={10000}
                  value={deposit}
                  onChange={(e) => setDeposit(parseInt(e.target.value))}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4 w-full">
              <CustomDropdown
                data={categories}
                label="Category"
                fn={setCategory}
                value={category}
              />

              <CustomDropdown
                data={countryData}
                label="Country"
                fn={setCountry}
                value={country}
              />

              <CustomDropdown
                data={stateData}
                label="State"
                fn={setState}
                value={state}
              />

              <CustomDropdown
                data={cityData}
                label="City"
                fn={setCity}
                value={city}
              />

              <CustomDropdown
                data={conditions}
                label="Condition"
                fn={setCondition}
                value={condition}
              />

              <CustomDropdown
                data={deliveryTypes}
                label="Delivery Type"
                fn={setDeliveryType}
                value={deliveryType}
              />

              <div className="flex flex-col w-sm">
                <input
                  type="text"
                  id="tags"
                  className="border border-neutral-300 rounded-md px-3 py-[9px] text-[1rem] outline-blue-500"
                  placeholder="Search by Tags..."
                  onKeyDown={handleKeyDown}
                />
                {tags && tags.length > 0 && (
                  <div className="flex items-center mt-2 gap-2 flex-wrap">
                    {tags.map((tag, i: number) => (
                      <div
                        className="flex items-center justify-center gap-1 rounded-full bg-sky-200 w-fit px-3 text-sm text-blue-700 py-0.5"
                        key={i}
                      >
                        {tag}
                        <RxCross2
                          className="hover:cursor-pointer"
                          onClick={(e) => removeTag(e, i)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                className="bg-blue-500 text-white px-[0.7rem] py-[0.4rem] h-fit rounded-md hover:bg-blue-600 hover:cursor-pointer text-lg"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          </div>
          <div className="w-full flex gap-6 flex-wrap">
            {allItems.map((item, i) => (
              <ItemCard key={i} {...item} />
            ))}
            {hasMore && (
              <div className="w-full flex justify-center items-center text-xl font-semibold">
                Loading...
              </div>
            )}
            {!hasMore && (
              <div className="w-full flex justify-center items-center text-xl font-semibold">
                No more items to show
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ViewAllItems;
