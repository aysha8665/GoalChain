# 🏗 GoalChain
# DApp for Goal Setting, Achievement Celebration, and NFT Minting

## Overview

This decentralized application (DApp) empowers users to set personal or professional goals, track their progress, and celebrate achievements within a community-driven platform. Users can create goals, secure their commitment by depositing funds, and mint unique NFTs as digital badges of honor upon successful completion of their goals.

## Features

- **Goal Creation**: Users can create goals with clear descriptions, set target dates for completion, and deposit funds as a commitment. Funds are locked until the goal is verified by at least two verifiers.
- **Goal Verification**: Selected verifiers review and approve or reject the completion of the goal based on the user's work.
- **NFT Minting**: Upon successful verification of a goal, users can mint a unique NFT representing their achievement.
- **Fund Withdrawal**: Users can withdraw their deposited funds once their goal has been verified.
- **Achievement Celebration**: Users can share funds with others, enable the option to receive rewards or prizes, and celebrate milestones with the community.
- **Interactive Dashboard**: Users have access to a dashboard displaying their active and completed goals, minted NFTs, and related work.
- **Community Interaction**: Users can view other users' profiles, goals, achievements, and minted NFTs, and send or receive monetary rewards as a token of appreciation.

## User Stories

### 1. User Goal Creation
- **As a user,** I want to create a goal with a clear description and set a target date for completion.
- **As a user,** I want to deposit money as a commitment to achieving my goal, which will be locked until verification.
- **As a user,** I want to select at least two other users as verifiers who will confirm whether I have met the necessary criteria to withdraw the deposited money.

### 2. Goal Verification
- **As a verifier,** I want to review the user’s work associated with a goal, ensuring it meets the predefined criteria.
- **As a verifier,** I want to approve or reject the goal achievement based on the quality and completion of the user’s work.

### 3. NFT Minting
- **As a user,** I want to mint a unique NFT representing my completed goal after it has been verified by the selected verifiers.
- **As a user,** I want the minted NFT to be displayed on my profile as a symbol of my achievement.

### 4. Withdrawing Funds
- **As a user,** I want to withdraw the deposited money once my goal has been verified by two verifiers.
- **As a user,** I want to be notified when my goal is verified, and funds are available for withdrawal.

### 5. Celebrating Achievements
- **As a user,** I want to celebrate my achievement by sharing a portion of my withdrawn funds with other users.
- **As a user,** I want to enable the option to receive prizes or monetary rewards from other users upon achieving my goal.

### 6. User Dashboard
- **As a user,** I want to view a dashboard that displays my active and completed goals, along with my minted NFTs and related work.
- **As a user,** I want to see descriptions and links to the work I’ve done for each goal on my dashboard.

### 7. Community Interaction
- **As a user,** I want to view other users’ profiles, goals, achievements, and minted NFTs to stay motivated and inspired.
- **As a user,** I want to applaud or congratulate other users on their achievements.
- **As a user,** I want to send or receive monetary rewards to/from other users as a token of appreciation for their work.

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v18.17)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

To get started with Scaffold-ETH 2, follow the steps below:

1. Clone this repo & install dependencies

```
git clone https://github.com/scaffold-eth/scaffold-eth-2.git
cd scaffold-eth-2
yarn install
```

2. Run a local network in the first terminal:

```
yarn chain
```

This command starts a local Ethereum network using Hardhat. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in `hardhat.config.ts`.

3. On a second terminal, deploy the test contract:

```
yarn deploy
```

This command deploys a test smart contract to the local network. The contract is located in `packages/hardhat/contracts` and can be modified to suit your needs. The `yarn deploy` command uses the deploy script located in `packages/hardhat/deploy` to deploy the contract to the network. You can also customize the deploy script.

4. On a third terminal, start your NextJS app:

```
yarn start
```

Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the `Debug Contracts` page. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.