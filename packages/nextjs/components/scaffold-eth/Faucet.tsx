import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNetwork } from "wagmi";
import { hardhat, localhost } from "wagmi/chains";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { Address, AddressInput, Balance, EtherInput, getParsedEthersError } from "~~/components/scaffold-eth";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { getLocalProvider, notification } from "~~/utils/scaffold-eth";

// Account index to use from generated hardhat accounts.
const FAUCET_ACCOUNT_INDEX = 0;

const provider = getLocalProvider(localhost);

/**
 * Faucet modal which lets you send ETH to any address.
 */
export const Faucet = () => {
  const [loading, setLoading] = useState(false);
  const [inputAddress, setInputAddress] = useState("");
  const [faucetAddress, setFaucetAddress] = useState("");
  const [sendValue, setSendValue] = useState("");

  const { chain: ConnectedChain } = useNetwork();
  const signer = provider?.getSigner(FAUCET_ACCOUNT_INDEX);
  const faucetTxn = useTransactor(signer);

  useEffect(() => {
    const getFaucetAddress = async () => {
      try {
        if (provider) {
          const accounts = await provider.listAccounts();
          setFaucetAddress(accounts[FAUCET_ACCOUNT_INDEX]);
        }
      } catch (error) {
        notification.error(
          <>
            <p className="mt-0 mb-1 font-bold">Cannot connect to local provider</p>
            <p className="m-0">
              - Did you forget to run <code className="bg-base-300 text-base font-bold italic">yarn chain</code> ?
            </p>
            <p className="mt-1 break-normal">
              - Or you can change <code className="bg-base-300 text-base font-bold italic">targetNetwork</code> in{" "}
              <code className="bg-base-300 text-base font-bold italic">scaffold.config.ts</code>
            </p>
          </>,
        );
        console.error("⚡️ ~ file: Faucet.tsx:getFaucetAddress ~ error", error);
      }
    };
    getFaucetAddress();
  }, []);

  const sendETH = async () => {
    try {
      setLoading(true);
      await faucetTxn({ to: inputAddress, value: ethers.utils.parseEther(sendValue) });
      setLoading(false);
      setInputAddress("");
      setSendValue("");
    } catch (error) {
      const parsedError = getParsedEthersError(error);
      console.error("⚡️ ~ file: Faucet.tsx:sendETH ~ error", error);
      notification.error(parsedError);
      setLoading(false);
    }
  };

  // Render only on local chain
  if (!ConnectedChain || ConnectedChain.id !== hardhat.id) {
    return null;
  }

  return (
    <div>
      <label
        htmlFor="faucet-modal"
        className="btn btn-primary btn-sm space-x-2 rounded-full px-2 font-normal normal-case"
      >
        <BanknotesIcon className="h-4 w-4" />
        <span>Faucet</span>
      </label>
      <input type="checkbox" id="faucet-modal" className="modal-toggle" />
      <label htmlFor="faucet-modal" className="modal cursor-pointer">
        <label className="modal-box relative">
          {/* dummy input to capture event onclick on modal box */}
          <input className="absolute top-0 left-0 h-0 w-0" />
          <h3 className="mb-3 text-xl font-bold">Local Faucet</h3>
          <label htmlFor="faucet-modal" className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
            ✕
          </label>
          <div className="space-y-3">
            <div className="flex space-x-4">
              <div>
                <span className="text-sm font-bold">From:</span>
                <Address address={faucetAddress} />
              </div>
              <div>
                <span className="pl-3 text-sm font-bold">Available:</span>
                <Balance address={faucetAddress} />
              </div>
            </div>
            <div className="flex flex-col space-y-3">
              <AddressInput
                placeholder="Destination Address"
                value={inputAddress}
                onChange={value => setInputAddress(value)}
              />
              <EtherInput placeholder="Amount to send" value={sendValue} onChange={value => setSendValue(value)} />
              <button
                className={`btn btn-primary btn-sm h-10 space-x-3 rounded-full px-2 ${
                  loading ? "loading before:!mx-0 before:!h-4 before:!w-4" : ""
                }`}
                onClick={sendETH}
                disabled={loading}
              >
                {!loading && <BanknotesIcon className="h-6 w-6" />}
                <span>Send</span>
              </button>
            </div>
          </div>
        </label>
      </label>
    </div>
  );
};
