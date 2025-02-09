import { ITransaction } from "@kenil_vora/neighborly";
import { getAllTransactions } from "../../../services/operations/transactionAPI";
import { useEffect, useState } from "react";
import Loader from "../../common/Loader";

const Transactions = () => {
  const [transactionData, setTransactionData] = useState<ITransaction[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const transactions = await getAllTransactions();
        setTransactionData(transactions);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="flex flex-col gap-5 p-5 rounded-lg border border-neutral-300 shadow-md mt-5">
          <h2 className="text-2xl font-bold">Recent Transactions</h2>

          <div className="w-full overflow-x-auto">
            <div className="flex flex-col min-w-max w-full divide-y divide-neutral-300">
              <div className="flex w-full px-5 py-3 font-bold">
                <span className="w-1/6 min-w-[140px]">Transaction ID</span>
                <span className="w-1/6 min-w-[140px]">To (User ID)</span>
                <span className="w-1/6 min-w-[140px]">Type</span>
                <span className="w-1/6 min-w-[140px]">Amount</span>
                <span className="w-1/6 min-w-[140px]">Status</span>
                <span className="w-1/6 min-w-[140px]">Date</span>
              </div>
              <div className="flex flex-col w-full divide-y divide-neutral-300">
                {!transactionData || transactionData.length === 0 ? (
                  <div className="flex w-full px-5 py-3">
                    <span className="w-full text-center">
                      No Transactions Found
                    </span>
                  </div>
                ) : (
                  transactionData.map((transaction, i) => (
                    <div key={i} className="flex w-full px-5 py-3">
                      <span className="w-1/6 min-w-[140px]">
                        {transaction.paymentId}
                      </span>
                      <span className="w-1/6 min-w-[140px]">
                        {transaction.payeeId
                          ? transaction.payeeId?.firstName +
                            " " +
                            transaction.payeeId?.lastName
                          : "N/A"}
                      </span>
                      <span className="w-1/6 min-w-[140px]">
                        {transaction.transactionType}
                      </span>
                      <span className="w-1/6 min-w-[140px]">
                        ₹{transaction.amount}
                      </span>
                      <span className="w-1/6 min-w-[140px]">
                        {transaction.status}
                      </span>
                      <span className="w-1/6 min-w-[140px]">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Transactions;
