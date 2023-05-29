import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import type { NextPage } from "next";
import { Address } from "~~/components/scaffold-eth";
import {
  TransactionWithFunction,
  decodeTransactionData,
  getFunctionDetails,
  getTargetNetwork,
} from "~~/utils/scaffold-eth";

const TransactionPage: NextPage = () => {
  const router = useRouter();
  const { txHash } = router.query;
  const [transaction, setTransaction] = useState<TransactionWithFunction | null>(null);
  const [receipt, setReceipt] = useState<ethers.providers.TransactionReceipt | null>(null);
  const [functionCalled, setFunctionCalled] = useState<string | null>(null);

  const configuredNetwork = getTargetNetwork();
  const provider = useMemo(() => new ethers.providers.JsonRpcProvider("http://localhost:8545"), []);

  useEffect(() => {
    if (txHash) {
      const fetchTransaction = async () => {
        const tx = await provider.getTransaction(txHash as string);
        const receipt = await provider.getTransactionReceipt(txHash as string);

        const transactionWithDecodedData = decodeTransactionData(tx);
        setTransaction(transactionWithDecodedData);
        setReceipt(receipt);

        const functionCalled = transactionWithDecodedData.data.substring(0, 10);
        setFunctionCalled(functionCalled);
        console.log("fetching txs in txhash page...");
      };

      fetchTransaction();
    }
  }, [txHash, provider]);

  return (
    <div className="m-10 mb-20">
      <button className="btn btn-primary" onClick={() => router.back()}>
        Back
      </button>
      {transaction ? (
        <div className="overflow-x-auto shadow-lg">
          <h2 className="text-3xl font-bold mb-4 text-center text-primary-content">Transaction Details</h2>{" "}
          <table className="table w-full">
            <tbody>
              <tr>
                <td>
                  <strong>Transaction Hash:</strong>
                </td>
                <td>{transaction.hash}</td>
              </tr>
              <tr>
                <td>
                  <strong>Block Number:</strong>
                </td>
                <td>{transaction.blockNumber}</td>
              </tr>
              <tr>
                <td>
                  <strong>From:</strong>
                </td>
                <td>
                  <Address address={transaction.from} format="long" />
                </td>
              </tr>
              <tr>
                <td>
                  <strong>To:</strong>
                </td>
                <td>
                  {!receipt?.contractAddress ? (
                    transaction.to && <Address address={transaction.to} format="long" />
                  ) : (
                    <span>
                      Contract Creation:
                      <Address address={receipt.contractAddress} format="long" />
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Value:</strong>
                </td>
                <td>
                  {ethers.utils.formatEther(transaction.value)} {configuredNetwork.nativeCurrency.symbol}
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Function called:</strong>
                </td>
                <td>
                  {functionCalled === "0x"
                    ? "This transaction did not call any function."
                    : getFunctionDetails(transaction)}
                  {functionCalled !== "0x" && functionCalled !== "0x60a06040" && (
                    <span className="ml-2 inline-block rounded-full px-3 py-1 text-sm font-semibold text-primary-content bg-accent">
                      {functionCalled}
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Gas Price:</strong>
                </td>
                <td>{ethers.utils.formatUnits(transaction.gasPrice || ethers.constants.Zero, "gwei")} Gwei</td>
              </tr>
              <tr>
                <td>
                  <strong>Data:</strong>
                </td>
                <td className="form-control">
                  <textarea readOnly value={transaction.data} className="p-4 textarea-primary bg-inherit" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-2xl text-base-content">Loading...</p>
      )}
    </div>
  );
};

export default TransactionPage;
