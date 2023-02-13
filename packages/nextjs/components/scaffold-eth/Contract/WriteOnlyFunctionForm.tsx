import { FunctionFragment } from "ethers/lib/utils";
import { Dispatch, SetStateAction, useState } from "react";
import { useContractWrite, useNetwork, useWaitForTransaction } from "wagmi";
import InputUI from "./InputUI";
import TxReceipt from "./TxReceipt";
import { getFunctionInputKey, getParsedEthersError } from "./utilsContract";
import { TxValueInput } from "./utilsComponents";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { toast, parseTxnValue, getTargetNetwork } from "~~/utils/scaffold-eth";

const getParsedContractFunctionArgs = (form: Record<string, any>) => {
  const keys = Object.keys(form);
  const parsedArguments = keys.map(key => {
    try {
      const keySplitArray = key.split("_");
      const baseTypeOfArg = keySplitArray[keySplitArray.length - 1];
      console.log("⚡️ ~ file: WriteOnlyFunctionForm.tsx:17 ~ parsedArguments ~ baseTypeOfArg", baseTypeOfArg);
      let valueOfArg = form[key];

      if (["array", "tuple"].includes(baseTypeOfArg)) {
        valueOfArg = JSON.parse(valueOfArg);
      } else if (baseTypeOfArg === "bool") {
        if (["true", "1", "0x1", "0x01", "0x0001"].includes(valueOfArg)) {
          valueOfArg = 1;
        } else {
          valueOfArg = 0;
        }
      }

      console.log("⚡️ ~ file: WriteOnlyFunctionForm.tsx:18 ~ parsedArguments ~ valueOfArg", valueOfArg);
      return valueOfArg;
    } catch (error: any) {
      // ignore error, it will be handled when sending transaction by useContractWrite
    }
  });
  return parsedArguments;
};

// TODO set sensible initial state values to avoid error on first render, also put it in utilsContract
const getInitialFormState = (functionFragment: FunctionFragment) => {
  const initialForm: Record<string, any> = {};
  functionFragment.inputs.forEach((input, inputIndex) => {
    const key = getFunctionInputKey(functionFragment, input, inputIndex);
    initialForm[key] = "";
  });
  return initialForm;
};

type TWriteOnlyFunctionFormProps = {
  functionFragment: FunctionFragment;
  contractAddress: string;
  setRefreshDisplayVariables: Dispatch<SetStateAction<boolean>>;
};

export const WriteOnlyFunctionForm = ({
  functionFragment,
  contractAddress,
  setRefreshDisplayVariables,
}: TWriteOnlyFunctionFormProps) => {
  const [form, setForm] = useState<Record<string, any>>(() => getInitialFormState(functionFragment));
  const [txValue, setTxValue] = useState("");
  const { chain } = useNetwork();
  const configuredChain = getTargetNetwork();
  const writeTxn = useTransactor();
  const writeDisabled = !chain || chain?.id !== configuredChain.id;

  // We are omitting usePrepareContractWrite here to avoid unnecessary RPC calls and wrong gas estimations.
  // See:
  //   - https://github.com/scaffold-eth/se-2/issues/59
  //   - https://github.com/scaffold-eth/se-2/pull/86#issuecomment-1374902738
  const {
    data: result,
    isLoading,
    writeAsync,
  } = useContractWrite({
    address: contractAddress,
    functionName: functionFragment.name,
    abi: [functionFragment],
    args: getParsedContractFunctionArgs(form),
    mode: "recklesslyUnprepared",
    overrides: {
      value: txValue ? parseTxnValue(txValue) : undefined,
    },
  });

  const handleWrite = async () => {
    if (writeAsync && writeTxn) {
      try {
        await writeTxn(writeAsync());
        setRefreshDisplayVariables(prevState => !prevState);
      } catch (e: any) {
        const message = getParsedEthersError(e);
        toast.error(message);
      }
    }
  };

  const { data: txResult } = useWaitForTransaction({
    hash: result?.hash,
  });

  // TODO use `useMemo` to optimize also update in ReadOnlyFunctionForm
  const inputs = functionFragment.inputs.map((input, inputIndex) => {
    const key = getFunctionInputKey(functionFragment, input, inputIndex);
    return (
      <InputUI
        key={key}
        setForm={setForm}
        form={form}
        stateObjectKey={key}
        paramType={input}
        functionFragment={functionFragment}
      />
    );
  });

  return (
    <div className="flex flex-col gap-3">
      <p className="font-medium my-0 break-words">{functionFragment.name}</p>
      {inputs}
      {functionFragment.payable ? <TxValueInput setTxValue={setTxValue} txValue={txValue} /> : null}
      <div className="flex justify-between gap-2">
        <div className="flex-grow basis-0">{txResult ? <TxReceipt txResult={txResult} /> : null}</div>
        <div
          className={`flex ${
            writeDisabled &&
            "tooltip before:content-[attr(data-tip)] before:right-[-10px] before:left-auto before:transform-none"
          }`}
          data-tip={`${writeDisabled && "Wallet not connected or in the wrong network"}`}
        >
          <button
            className={`btn btn-secondary btn-sm ${isLoading ? "loading" : ""}`}
            disabled={writeDisabled}
            onClick={handleWrite}
          >
            Send 💸
          </button>
        </div>
      </div>
    </div>
  );
};
