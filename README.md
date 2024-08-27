# 🏗 GoalChain

This decentralized application (DApp) empowers users to set personal or professional goals, track their progress, and celebrate their achievements within a community-driven platform. Users can create goals and secure their commitment by depositing funds into the platform. The deposited funds are only accessible after the user’s work towards the goal is verified by at least two other users, ensuring accountability and transparency.

In addition to achieving goals, users can celebrate milestones by sharing funds with others or enabling the option to receive rewards or prizes from the community. The platform also features interactive dashboards where users can showcase their goals, completed achievements, and the work they’ve done, along with descriptions and relevant links.

Profiles of other users are accessible, allowing community members to view each other’s goals and achievements, send monetary rewards, and offer congratulations or applause.

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