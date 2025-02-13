import { useEffect, useRef, useState } from "react";
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
import { setHasMore, setPage } from "../slices/itemSlice";
import { IAllItem } from "@kenil_vora/neighborly";
// import { IoMenu } from "react-icons/io5";

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

const ViewAllItems = () => {
  const { isLoading, hasMore, page, searchQuery } = useSelector(
    (state: RootState) => state.item
  );

  const dispatch = useDispatch();

  const isFirstRender = useRef(true);

  const [categories, setCategories] = useState<Category[]>([]);

  const [filters, setFilters] = useState({
    price: 0,
    deposit: 0,
    category: "",
    country: "",
    state: "",
    city: "",
    condition: "",
    deliveryType: "",
    tags: [] as string[],
    isAvailable: true,
    sorting: "",
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);

  const {
    price,
    deposit,
    category,
    country,
    state,
    city,
    condition,
    deliveryType,
    tags,
    isAvailable,
  } = filters;

  const [stateData, setStateData] = useState([] as State[]);
  const [cityData, setCityData] = useState([] as City[]);

  const loader = useRef<HTMLDivElement | null>(null);

  const [allItems, setAllItems] = useState<IAllItem[]>([]);

  // Fetching states based on selected country
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

  // Fetching cities based on selected state
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

  // Fetching categories
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
        console.error(error);
      }
    };

    getCategories();
  }, []);

  // Fetching items
  const getItems = async () => {
    if (!hasMore || isLoading.getAllItems) return;
    try {
      const res = (await dispatch(
        getAllItems(
          page,
          page === 1,
          searchQuery,
          appliedFilters.price.toString(),
          appliedFilters.deposit.toString(),
          appliedFilters.condition,
          appliedFilters.category.toLowerCase(),
          appliedFilters.deliveryType,
          appliedFilters.city,
          appliedFilters.state,
          appliedFilters.country,
          JSON.stringify(appliedFilters.tags),
          appliedFilters.isAvailable,
          appliedFilters.sorting
        ) as any
      )) as IAllItem[];

      if (res === undefined || res === null) {
        dispatch(setHasMore(false));
        if (allItems.length === 0) {
          setAllItems([]);
        }
        return;
      }

      setAllItems((prev) => [...prev, ...res]);
    } catch (error) {
      toast.error("Something went wrong while fetching items");
    }
  };

  // Fetching items on page changes
  useEffect(() => {
    getItems();
  }, [page, dispatch]);

  // Fetching items on filter changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setAllItems([]);
    dispatch(setPage(1));
    dispatch(setHasMore(true));
    getItems();
  }, [appliedFilters, searchQuery]);

  // Infinite scrolling
  useEffect(() => {
    let observer: IntersectionObserver;

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      if (!isLoading.getAllItems && hasMore && entries[0].isIntersecting) {
        dispatch(setPage(page + 1));
      }
    };

    const createObserver = () => {
      observer = new IntersectionObserver(observerCallback, {
        threshold: 0,
      });

      if (loader.current) {
        observer.observe(loader.current);
      }
    };

    const timeout = setTimeout(createObserver, 200);

    return () => {
      clearTimeout(timeout);
      if (loader.current && observer) {
        observer.unobserve(loader.current);
      }
    };
  }, [isLoading.getAllItems, hasMore]);

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

  const sortingOptions = [
    {
      value: "price-asc",
      label: "Price: Low to High",
    },
    {
      value: "price-desc",
      label: "Price: High to Low",
    },
    {
      value: "rating-desc",
      label: "Rating: High to Low",
    },
    {
      value: "rating-asc",
      label: "Rating: Low to High",
    },
    {
      value: "newest-first",
      label: "Newest First",
    },
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();

      const tag = (e?.target as HTMLInputElement).value.trim();
      if (tag && !tags.includes(tag.toLowerCase())) {
        setFilters((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
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
    setFilters((prev) => ({ ...prev, tags: tagsCopy }));
  };

  const resetFilters = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();

    setFilters({
      price: 0,
      deposit: 0,
      category: "",
      country: "",
      state: "",
      city: "",
      condition: "",
      deliveryType: "",
      tags: [],
      isAvailable: true,
      sorting: "",
    });

    setAppliedFilters({
      price: 0,
      deposit: 0,
      category: "",
      country: "",
      state: "",
      city: "",
      condition: "",
      deliveryType: "",
      tags: [],
      isAvailable: true,
      sorting: "",
    });

    if (allItems.length === 0) {
      dispatch(setPage(1));
      dispatch(setHasMore(true));
      getItems();
    }
  };

  return (
    <>
      {isLoading.getAllItems && page === 1 ? (
        <Loader />
      ) : (
        <div
          className="w-[94%] relative max-w-[1480px] mx-auto my-8 flex gap-9 max-[670px]:flex-col 
        "
        >
          <div className="min-[1200px]:w-[30%] min-[670px]:w-[40%] max-[649px]:w-full min-[670px]:max-w-[570px] min-[1200px]:max-w-[400px] min-[1515px]:max-w-[290px] h-full flex flex-col gap-5">
            <div className="h-fit p-5 shadow-xl border border-neutral-200 rounded-lg flex flex-col gap-5">
              <h1 className="text-2xl font-semibold">Advanced Filters</h1>

              <div>
                <h1 className="">Price Range: Above ₹ {price}</h1>
                <input
                  type="range"
                  className="w-full"
                  min={0}
                  max={10000}
                  value={price}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      price: parseInt(e.target.value),
                    }))
                  }
                />
              </div>

              <div>
                <h1 className="">Deposit Range: Above ₹ {deposit}</h1>
                <input
                  type="range"
                  className="w-full"
                  min={0}
                  max={10000}
                  value={deposit}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      deposit: parseInt(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4 w-full">
              <CustomDropdown
                data={categories}
                label="Category"
                fn={setFilters}
                value={category}
                name="category"
              />

              <CustomDropdown
                data={countryData}
                label="Country"
                fn={setFilters}
                value={country}
                name="country"
              />

              <CustomDropdown
                data={stateData}
                label="State"
                fn={setFilters}
                value={state}
                name="state"
              />

              <CustomDropdown
                data={cityData}
                label="City"
                fn={setFilters}
                value={city}
                name="city"
              />

              <CustomDropdown
                data={conditions}
                label="Condition"
                fn={setFilters}
                value={condition}
                name="condition"
              />

              <CustomDropdown
                data={deliveryTypes}
                label="Delivery Type"
                fn={setFilters}
                value={deliveryType}
                name="deliveryType"
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

              <div className="flex gap-2 items-center">
                <div className="font-semibold text-lg">
                  Show only Available Items
                </div>

                <div className="container">
                  <input
                    type="checkbox"
                    className="checkbox"
                    id="checkbox"
                    checked={isAvailable}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        isAvailable: e.target.checked,
                      }))
                    }
                  />
                  <label className="switch" htmlFor="checkbox">
                    <span className="isAvailable"></span>
                  </label>
                </div>
              </div>

              <CustomDropdown
                data={sortingOptions}
                label="Sort By"
                fn={setFilters}
                value={filters.sorting}
                name="sorting"
              />

              <div className="w-full flex justify-between items-center">
                <button
                  className="bg-blue-500 text-white px-[0.7rem] 
                  py-[0.4rem] h-fit rounded-md hover:bg-blue-600 hover:cursor-pointer text-lg"
                  onClick={(
                    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
                  ) => {
                    e.preventDefault();
                    e.stopPropagation();

                    setAppliedFilters(filters);
                  }}
                >
                  Apply
                </button>
                <button
                  className="bg-neutral-800 text-white px-[0.7rem] py-[0.4rem] h-fit 
                  rounded-md hover:bg-neutral-500 hover:cursor-pointer text-lg"
                  onClick={resetFilters}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
          <div className="w-full">
            {allItems.length > 0 && (
              <div
                className={`w-full grid grid-cols-1 gap-5 min-[1200px]:grid-cols-2 min-[1515px]:grid-cols-3`}
              >
                {allItems.map((item, i) => (
                  <ItemCard key={i} {...item} />
                ))}
              </div>
            )}
            <div
              className={`w-full flex justify-center items-center text-xl font-semibold
              ${allItems.length === 0 ? "h-full" : "mt-20"}
                `}
              ref={loader}
            >
              {hasMore ? "Loading more items..." : "No more Items"}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewAllItems;
