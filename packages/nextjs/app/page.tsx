"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { useAccount, useWalletClient } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [verifiers, setVerifiers] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");
  const [goalId, setGoalId] = useState("");
  const [userGoals, setUserGoals] = useState<bigint[]>([]);

  const { data: goalChainContract } = useScaffoldContract({
    contractName: "GoalChain",
    walletClient,
  });
  const isValidEthereumAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };
  const createGoal = async () => {
    if (goalChainContract) {
      try {
        // Trim whitespace from each verifier address
        const trimmedVerifiers = verifiers.split(",").map(address => address.trim());

        // Validate each verifier address
        const invalidAddresses = trimmedVerifiers.filter(address => !isValidEthereumAddress(address));
        if (invalidAddresses.length > 0) {
          throw new Error(`Invalid Ethereum addresses: ${invalidAddresses.join(", ")}`);
        }
        await goalChainContract.write.createGoal(
          [description, BigInt(new Date(deadline).getTime() / 1000), trimmedVerifiers],
          { value: BigInt(stakeAmount) },
        );
        alert("Goal created successfully!");
      } catch (error) {
        console.error("Error creating goal:", error);
        alert("Error creating goal. Check console for details.");
      }
    }
  };

  const verifyGoal = async () => {
    if (goalChainContract) {
      try {
        await goalChainContract.write.verifyGoal([BigInt(goalId)]);
        alert("Goal verified successfully!");
      } catch (error) {
        console.error("Error verifying goal:", error);
        alert("Error verifying goal. Check console for details.");
      }
    }
  };

  const withdrawFunds = async () => {
    if (goalChainContract) {
      try {
        await goalChainContract.write.withdrawFunds([BigInt(goalId)]);
        alert("Funds withdrawn successfully!");
      } catch (error) {
        console.error("Error withdrawing funds:", error);
        alert("Error withdrawing funds. Check console for details.");
      }
    }
  };

  const mintNFT = async () => {
    if (goalChainContract) {
      try {
        await goalChainContract.write.mintNFT([BigInt(goalId)]);
        alert("NFT minted successfully!");
      } catch (error) {
        console.error("Error minting NFT:", error);
        alert("Error minting NFT. Check console for details.");
      }
    }
  };

  useEffect(() => {
    const fetchUserGoals = async () => {
      if (goalChainContract && connectedAddress) {
        try {
          const goals = await goalChainContract.read.getUserGoals([connectedAddress]);
          setUserGoals([...goals]);
        } catch (error) {
          console.error("Error fetching user goals:", error);
        }
      }
    };

    fetchUserGoals();
  }, [goalChainContract, connectedAddress]);

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <h1 className="text-center mb-8">
        <span className="block text-2xl mb-2">Welcome to</span>
        <span className="block text-4xl font-bold">GoalChain</span>
      </h1>

      <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
        <p className="my-2 font-medium">Connected Address:</p>
        <Address address={connectedAddress} />
      </div>

      <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
        <div className="flex flex-wrap justify-center gap-12">
          <div className="bg-base-100 p-10 rounded-3xl">
            <h2 className="text-2xl font-bold mb-4">Create Goal</h2>
            <input
              type="text"
              placeholder="Description"
              className="input input-bordered w-full max-w-xs mb-2"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            <input
              type="datetime-local"
              className="input input-bordered w-full max-w-xs mb-2"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
            />
            <input
              type="text"
              placeholder="Verifiers (comma-separated)"
              className="input input-bordered w-full max-w-xs mb-2"
              value={verifiers}
              onChange={e => setVerifiers(e.target.value)}
            />
            <input
              type="text"
              placeholder="Stake Amount (in wei)"
              className="input input-bordered w-full max-w-xs mb-2"
              value={stakeAmount}
              onChange={e => setStakeAmount(e.target.value)}
            />
            <button className="btn btn-primary w-full" onClick={createGoal}>
              Create Goal
            </button>
          </div>

          <div className="bg-base-100 p-10 rounded-3xl">
            <h2 className="text-2xl font-bold mb-4">Manage Goals</h2>
            <input
              type="text"
              placeholder="Goal ID"
              className="input input-bordered w-full max-w-xs mb-2"
              value={goalId}
              onChange={e => setGoalId(e.target.value)}
            />
            <button className="btn btn-secondary w-full mb-2" onClick={verifyGoal}>
              Verify Goal
            </button>
            <button className="btn btn-secondary w-full mb-2" onClick={withdrawFunds}>
              Withdraw Funds
            </button>
            <button className="btn btn-secondary w-full" onClick={mintNFT}>
              Mint NFT
            </button>
          </div>

          <div className="bg-base-100 p-10 rounded-3xl">
            <h2 className="text-2xl font-bold mb-4">Your Goals</h2>
            {userGoals.length > 0 ? (
              userGoals.map((goalId, index) => (
                <p key={index} className="mb-2">
                  Goal ID: {goalId.toString()}
                </p>
              ))
            ) : (
              <p>No goals found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
