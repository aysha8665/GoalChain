import { expect } from "chai";
import { ethers } from "hardhat";
import { GoalChain } from "../typechain-types";

describe("GoalChain", function () {
  // We define a fixture to reuse the same setup in every test.

  let goalChain: GoalChain;
  before(async () => {
    //const [owner] = await ethers.getSigners();
    const goalContractFactory = await ethers.getContractFactory("GoalChain");
    goalChain = (await goalContractFactory.deploy()) as GoalChain;
    await goalChain.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should have the right message on deploy", async function () {
      expect(await goalChain.goalCount()).to.equal(0);
    });

    /*     it("Should allow setting a new message", async function () {
      const newGreeting = "Learn Scaffold-ETH 2! :)";

      await goalChain.setGreeting(newGreeting);
      expect(await goalChain.greeting()).to.equal(newGreeting);
    }); */
  });
});
