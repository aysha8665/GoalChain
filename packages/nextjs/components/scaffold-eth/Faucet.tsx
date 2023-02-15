import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { useNetwork } from "wagmi";
import { hardhat, localhost } from "wagmi/chains";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { getLocalProvider, notification } from "~~/utils/scaffold-eth";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import AddressInput from "./AddressInput";
import EtherInput from "./EtherInput";
import { getParsedEthersError } from "./Contract/utilsContract";
import Address from "./Address";
import Balance from "./Balance";

// Account index to use from generated hardhat accounts.
const FAUCET_ACCOUNT_INDEX = 0;

/**
 * Faucet modal which lets you send ETH to any address.
 */
export default function Faucet() {
  const [loading, setLoading] = useState(false);
  const [inputAddress, setInputAddress] = useState("");
  const [faucetAddress, setFaucetAddress] = useState("");
  const [sendValue, setSendValue] = useState("");

  const { chain: ConnectedChain } = useNetwork();
  const provider = getLocalProvider(localhost);
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
        notification.error("Cannot connect to local provider");
        console.log("⚡️ ~ file: Faucet.tsx:39 ~ getFaucetAddress ~ error", error);
      }
    };
    getFaucetAddress();
  }, [provider]);

  const sendETH = async () => {
    try {
      setLoading(true);
      if (faucetTxn) {
        await faucetTxn({ to: inputAddress, value: ethers.utils.parseEther(sendValue) });
      }
      setLoading(false);
      setInputAddress("");
      setSendValue("");
    } catch (error) {
      const parsedError = getParsedEthersError(error);
      console.error("⚡️ ~ file: Faucet.tsx ~ line 26 ~ sendETH ~ error", error);
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
        className="btn btn-primary btn-sm px-2 rounded-full font-normal space-x-2 normal-case"
      >
        <BanknotesIcon className="h-4 w-4" />
        <span>Faucet</span>
      </label>
      <input type="checkbox" id="faucet-modal" className="modal-toggle" />
      <label htmlFor="faucet-modal" className="modal cursor-pointer">
        <label className="modal-box relative">
          {/* dummy input to capture event onclick on modal box */}
          <input className="h-0 w-0 absolute top-0 left-0" />
          <h3 className="text-xl font-bold mb-3">Local Faucet</h3>
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
                <span className="text-sm font-bold pl-3">Available:</span>
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
                className={`h-10 btn btn-primary btn-sm px-2 rounded-full space-x-3 ${
                  loading ? "loading before:!w-4 before:!h-4 before:!mx-0" : ""
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
}
