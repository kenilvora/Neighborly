import { IBorrowedItemData } from "@kenil_vora/neighborly";
import { useEffect, useState } from "react";
import { getAllBorrowedItems } from "../../../../services/operations/itemAPI";
import Loader from "../../../common/Loader";
import BorrowItemCard from "./BorrowItemCard";

const BorrowedItems = () => {
  const [borrowedItems, setBorrowedItems] = useState<IBorrowedItemData[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBorrowedItems = async () => {
      try {
        setLoading(true);

        const res = await getAllBorrowedItems();

        setBorrowedItems(res);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchBorrowedItems();
  }, []);

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          {borrowedItems.length === 0 ? (
            <div className="flex justify-center items-center h-80 mt-5">
              <p className="text-lg text-gray-500">No borrowed items</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
              {borrowedItems.map((item, index) => (
                <BorrowItemCard key={index} data={item} />
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default BorrowedItems;
