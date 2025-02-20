import { useEffect, useState } from "react";
import { IItemWithAvgRating } from "@kenil_vora/neighborly";
import { getItemsOfALender } from "../../../../services/operations/itemAPI";
import Loader from "../../../common/Loader";
import LendItemCard from "./LendItemCard";

const ViewLendItems = () => {
  const [loading, setLoading] = useState(true);

  const [items, setItems] = useState<IItemWithAvgRating[]>([]);

  useEffect(() => {
    const getAllItems = async () => {
      try {
        const items = await getItemsOfALender();
        setItems(items);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getAllItems();
  }, []);

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-10">
          {items &&
            items.map((item, i) => {
              return (
                <LendItemCard
                  key={i}
                  item={item.item}
                  avgRating={item.avgRating}
                />
              );
            })}
        </div>
      )}
    </>
  );
};

export default ViewLendItems;
