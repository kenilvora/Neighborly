import { useEffect, useState } from "react";
import { IItemWithAvgRating } from "@kenil_vora/neighborly";
import { getItemsOfALender } from "../../../../services/operations/itemAPI";
import Loader from "../../../common/Loader";
import LendItemCard from "./LendItemCard";

const ViewLendItems = () => {
  const [loading, setLoading] = useState(true);

  const [items, setItems] = useState<IItemWithAvgRating[]>([]);

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

  useEffect(() => {
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
                  paymentMode={item.paymentMode!}
                  paymentStatus={item.paymentStatus!}
                  setLoading={setLoading}
                  getItems={getAllItems}
                />
              );
            })}
        </div>
      )}
    </>
  );
};

export default ViewLendItems;
