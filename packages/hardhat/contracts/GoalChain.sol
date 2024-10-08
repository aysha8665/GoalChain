// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @title GoalChain - A decentralized goal-setting and achievement platform
/// @notice This contract allows users to create goals, verify achievements, and mint NFTs
contract GoalChain is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    /// @notice Structure to store goal information
    struct Goal {
        address owner;              // Address of the goal creator
        string description;         // Description of the goal
        uint256 deadline;           // Deadline for goal completion
        uint256 stakedAmount;       // Amount of ETH staked on the goal
        bool isCompleted;           // Whether the goal is completed
        uint256 verificationCount;  // Number of verifications received
        address[] verifiers;        // List of addresses allowed to verify the goal
        mapping(address => bool) hasVerified;  // Tracks which verifiers have verified
        bool fundsWithdrawn;        // Whether the staked funds have been withdrawn
        uint256 nftTokenId;         // ID of the NFT minted for this goal
    }

    /// @notice Mapping from goal ID to Goal struct
    mapping(uint256 => Goal) public goals;

    /// @notice Mapping from user address to their goal IDs
    mapping(address => uint256[]) public userGoals;

    /// @notice Total number of goals created
    uint256 public goalCount;

    // Events
    event GoalCreated(uint256 indexed goalId, address indexed owner, string description, uint256 deadline);
    event GoalVerified(uint256 indexed goalId, address indexed verifier);
    event GoalCompleted(uint256 indexed goalId, address indexed owner);
    event FundsWithdrawn(uint256 indexed goalId, address indexed owner, uint256 amount);
    event RewardSent(address indexed from, address indexed to, uint256 amount);
    event NFTMinted(uint256 indexed goalId, address indexed owner, uint256 tokenId);

    /// @notice Initialize the ERC721 token with a name and symbol
    constructor() ERC721("GoalChainNFT", "GCN") {}

    /// @notice Ensures that only the goal owner can call a function
    modifier onlyOwner(uint256 _goalId) {
        require(msg.sender == goals[_goalId].owner, "Only the goal owner can call this function");
        _;
    }

    /// @notice Ensures that only assigned verifiers can call a function
    modifier onlyVerifier(uint256 _goalId) {
        require(isVerifier(msg.sender, goals[_goalId].verifiers), "Only assigned verifiers can call this function");
        _;
    }

    /// @notice Ensures that a goal is not already completed
    modifier goalNotCompleted(uint256 _goalId) {
        require(!goals[_goalId].isCompleted, "Goal is already completed");
        _;
    }

    /// @notice Creates a new goal
    /// @param _description Description of the goal
    /// @param _deadline Deadline for goal completion (Unix timestamp)
    /// @param _verifiers Array of addresses allowed to verify the goal
    function createGoal(string memory _description, uint256 _deadline, address[] memory _verifiers) public payable {
        require(msg.value > 0, "Must stake some amount");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(_verifiers.length >= 2, "Must choose at least 2 verifiers");

        goalCount++;
        Goal storage newGoal = goals[goalCount];
        newGoal.owner = msg.sender;
        newGoal.description = _description;
        newGoal.deadline = _deadline;
        newGoal.stakedAmount = msg.value;
        newGoal.isCompleted = false;
        newGoal.verificationCount = 0;
        newGoal.verifiers = _verifiers;
        newGoal.fundsWithdrawn = false;

        userGoals[msg.sender].push(goalCount);

        emit GoalCreated(goalCount, msg.sender, _description, _deadline);
    }

    /// @notice Allows a verifier to verify a goal
    /// @param _goalId ID of the goal to verify
    function verifyGoal(uint256 _goalId) public onlyVerifier(_goalId) goalNotCompleted(_goalId) {
        Goal storage goal = goals[_goalId];
        require(goal.owner != msg.sender, "Owner cannot verify their own goal");
        require(!goal.hasVerified[msg.sender], "You have already verified this goal");

        goal.hasVerified[msg.sender] = true;
        goal.verificationCount++;

        emit GoalVerified(_goalId, msg.sender);

        if (goal.verificationCount == goal.verifiers.length) {
            completeGoal(_goalId);
        }
    }

    /// @notice Internal function to mark a goal as completed
    /// @param _goalId ID of the goal to complete
    function completeGoal(uint256 _goalId) internal {
        Goal storage goal = goals[_goalId];
        require(!goal.isCompleted, "Goal already completed");
        require(goal.verificationCount == goal.verifiers.length, "Not all verifiers have verified");

        goal.isCompleted = true;

        emit GoalCompleted(_goalId, goal.owner);
    }

    /// @notice Allows the goal owner to withdraw staked funds after goal completion
    /// @param _goalId ID of the completed goal
    function withdrawFunds(uint256 _goalId) public onlyOwner(_goalId) {
        Goal storage goal = goals[_goalId];
        require(goal.isCompleted, "Goal is not completed yet");
        require(!goal.fundsWithdrawn, "Funds have already been withdrawn");

        goal.fundsWithdrawn = true;
        payable(goal.owner).transfer(goal.stakedAmount);

        emit FundsWithdrawn(_goalId, goal.owner, goal.stakedAmount);
    }

    /// @notice Allows users to send rewards to other users
    /// @param _to Address of the reward recipient
    function sendReward(address _to) public payable {
        require(msg.value > 0, "Must send some amount");
        payable(_to).transfer(msg.value);
        emit RewardSent(msg.sender, _to, msg.value);
    }

    /// @notice Mints an NFT for a completed goal
    /// @param _goalId ID of the completed goal
    function mintNFT(uint256 _goalId) public onlyOwner(_goalId) {
        Goal storage goal = goals[_goalId];
        require(goal.isCompleted, "Goal must be completed to mint NFT");
        require(goal.nftTokenId == 0, "NFT already minted for this goal");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _safeMint(msg.sender, newTokenId);

        goal.nftTokenId = newTokenId;

        emit NFTMinted(_goalId, msg.sender, newTokenId);
    }

    /// @notice Retrieves the details of a specific goal
    /// @param _goalId ID of the goal to retrieve
    /// @return owner Address of the goal owner
    /// @return description Description of the goal
    /// @return deadline Deadline for goal completion
    /// @return stakedAmount Amount of ETH staked on the goal
    /// @return isCompleted Whether the goal is completed
    /// @return verificationCount Number of verifications received
    /// @return verifiers Array of addresses allowed to verify the goal
    /// @return fundsWithdrawn Whether the staked funds have been withdrawn
    /// @return nftTokenId ID of the NFT minted for this goal
    function getGoal(uint256 _goalId) public view returns (
        address owner,
        string memory description,
        uint256 deadline,
        uint256 stakedAmount,
        bool isCompleted,
        uint256 verificationCount,
        address[] memory verifiers,
        bool fundsWithdrawn,
        uint256 nftTokenId
    ) {
        Goal storage goal = goals[_goalId];
        return (
            goal.owner,
            goal.description,
            goal.deadline,
            goal.stakedAmount,
            goal.isCompleted,
            goal.verificationCount,
            goal.verifiers,
            goal.fundsWithdrawn,
            goal.nftTokenId
        );
    }

    /// @notice Retrieves all goal IDs for a specific user
    /// @param _user Address of the user
    /// @return Array of goal IDs associated with the user
    function getUserGoals(address _user) public view returns (uint256[] memory) {
        return userGoals[_user];
    }

    /// @notice Internal function to check if an address is in the list of verifiers
    /// @param _verifier Address to check
    /// @param _verifiers List of verifier addresses
    /// @return bool indicating whether the address is a verifier
    function isVerifier(address _verifier, address[] memory _verifiers) internal pure returns (bool) {
        for (uint i = 0; i < _verifiers.length; i++) {
            if (_verifiers[i] == _verifier) {
                return true;
            }
        }
        return false;
    }

    /// @notice Returns the URI for a given token ID
    /// @dev Overrides the OpenZeppelin ERC721 implementation
    /// @param tokenId ID of the token to query
    /// @return string URI of the token metadata
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        // You can implement custom token URI logic here
        return string(abi.encodePacked("https://example.com/nft/", Strings.toString(tokenId)));
    }
}