import { useMemo, useState } from "react";
import { Abi } from "abitype";
import { useContract, useProvider } from "wagmi";
import { Spinner } from "~~/components/Spinner";
import {
  Address,
  Balance,
  getAllContractFunctions,
  getContractReadOnlyMethodsWithParams,
  getContractVariablesAndNoParamsReadMethods,
  getContractWriteMethods,
} from "~~/components/scaffold-eth";
import { useDeployedContractInfo, useNetworkColor } from "~~/hooks/scaffold-eth";
import { getTargetNetwork } from "~~/utils/scaffold-eth";
import { ContractName } from "~~/utils/scaffold-eth/contract";

type ContractUIProps = {
  contractName: ContractName;
  className?: string;
};

/**
 * UI component to interface with deployed contracts.
 **/
export const ContractUI = ({ contractName, className = "" }: ContractUIProps) => {
  const provider = useProvider();
  const [refreshDisplayVariables, setRefreshDisplayVariables] = useState(false);
  const configuredNetwork = getTargetNetwork();

  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(contractName);
  const networkColor = useNetworkColor();

  const contract = useContract({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi as Abi,
    signerOrProvider: provider,
  });

  const displayedContractFunctions = useMemo(() => getAllContractFunctions(contract), [contract]);

  const contractVariablesDisplay = useMemo(() => {
    return getContractVariablesAndNoParamsReadMethods(contract, displayedContractFunctions, refreshDisplayVariables);
  }, [contract, displayedContractFunctions, refreshDisplayVariables]);

  const contractMethodsDisplay = useMemo(
    () => getContractReadOnlyMethodsWithParams(contract, displayedContractFunctions),
    [contract, displayedContractFunctions],
  );
  const contractWriteMethods = useMemo(
    () => getContractWriteMethods(contract, displayedContractFunctions, setRefreshDisplayVariables),
    [contract, displayedContractFunctions],
  );

  if (deployedContractLoading) {
    return (
      <div className="mt-14">
        <Spinner width="50px" height="50px" />
      </div>
    );
  }

  if (!deployedContractData) {
    return (
      <p className="mt-14 text-3xl">
        {`No contract found by the name of "${contractName}" on chain "${configuredNetwork.name}"!`}
      </p>
    );
  }

  return (
    <div className={`my-0 grid w-full max-w-7xl grid-cols-1 px-6 lg:grid-cols-6 lg:gap-12 lg:px-10 ${className}`}>
      <div className="col-span-5 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
        <div className="col-span-1 flex flex-col">
          <div className="mb-6 space-y-1 rounded-3xl border border-base-300 bg-base-100 px-6 py-4 shadow-md shadow-secondary lg:px-8">
            <div className="flex">
              <div className="flex flex-col gap-1">
                <span className="font-bold">{contractName}</span>
                <Address address={deployedContractData.address} />
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold">Balance:</span>
                  <Balance address={deployedContractData.address} className="h-1.5 min-h-[0.375rem] px-0" />
                </div>
              </div>
            </div>
            {configuredNetwork && (
              <p className="my-0 text-sm">
                <span className="font-bold">Network</span>:{" "}
                <span style={{ color: networkColor }}>{configuredNetwork.name}</span>
              </p>
            )}
          </div>
          <div className="rounded-3xl bg-base-300 px-6 py-4 shadow-lg shadow-base-300 lg:px-8">
            {contractVariablesDisplay.methods.length > 0 ? contractVariablesDisplay.methods : "No contract variables"}
          </div>
        </div>
        <div className="col-span-1 flex flex-col gap-6 lg:col-span-2">
          <div className="z-10">
            <div className="relative mt-10 flex flex-col rounded-3xl border border-base-300 bg-base-100 shadow-md shadow-secondary">
              <div className="absolute -top-[38px] -left-[1px] -z-10 h-[5rem] w-[5.5rem] self-start rounded-[22px] bg-base-300 py-[0.65rem] shadow-lg shadow-base-300">
                <div className="flex items-center justify-center space-x-2">
                  <p className="my-0 text-sm">Read</p>
                </div>
              </div>
              <div className="divide-y divide-base-300 p-5">
                {contractMethodsDisplay.methods.length > 0 ? contractMethodsDisplay.methods : "No read methods"}
              </div>
            </div>
          </div>
          <div className="z-10">
            <div className="relative mt-10 flex flex-col rounded-3xl border border-base-300 bg-base-100 shadow-md shadow-secondary">
              <div className="absolute -top-[38px] -left-[1px] -z-10 h-[5rem] w-[5.5rem] self-start rounded-[22px] bg-base-300 py-[0.65rem] shadow-lg shadow-base-300">
                <div className="flex items-center justify-center space-x-2">
                  <p className="my-0 text-sm">Write</p>
                </div>
              </div>
              <div className="divide-y divide-base-300 p-5">
                {contractWriteMethods.methods.length > 0 ? contractWriteMethods.methods : "No write methods"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
