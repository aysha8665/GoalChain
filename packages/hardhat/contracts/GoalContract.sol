// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GoalContract {
    struct Goal {
        address owner;
        string description;
        uint256 deadline;
        uint256 stakedAmount;
        bool isCompleted;
        uint256 verificationCount;
        address[] verifiers;
        mapping(address => bool) hasVerified;
        bool fundsWithdrawn;
    }

    mapping(uint256 => Goal) public goals;
    mapping(address => uint256[]) public userGoals;
    uint256 public goalCount;

    event GoalCreated(uint256 indexed goalId, address indexed owner, string description, uint256 deadline);
    event GoalVerified(uint256 indexed goalId, address indexed verifier);
    event GoalCompleted(uint256 indexed goalId, address indexed owner);
    event FundsWithdrawn(uint256 indexed goalId, address indexed owner, uint256 amount);
    event RewardSent(address indexed from, address indexed to, uint256 amount);

    // Modifier to ensure only the goal owner can call a function
    modifier onlyOwner(uint256 _goalId) {
        require(msg.sender == goals[_goalId].owner, "Only the goal owner can call this function");
        _;
    }

    // Modifier to ensure only assigned verifiers can call a function
    modifier onlyVerifier(uint256 _goalId) {
        require(isVerifier(msg.sender, goals[_goalId].verifiers), "Only assigned verifiers can call this function");
        _;
    }

    // Modifier to ensure a goal is not already completed
    modifier goalNotCompleted(uint256 _goalId) {
        require(!goals[_goalId].isCompleted, "Goal is already completed");
        _;
    }

    /**
     * @dev Creates a new goal with the given description, deadline, and verifiers
     * @param _description The description of the goal
     * @param _deadline The deadline for the goal completion
     * @param _verifiers An array of addresses of the assigned verifiers
     */
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

    /**
     * @dev Allows a verifier to verify a goal
     * @param _goalId The ID of the goal to verify
     */
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

    /**
     * @dev Internal function to mark a goal as completed
     * @param _goalId The ID of the goal to complete
     */
    function completeGoal(uint256 _goalId) internal {
        Goal storage goal = goals[_goalId];
        require(!goal.isCompleted, "Goal already completed");
        require(goal.verificationCount == goal.verifiers.length, "Not all verifiers have verified");

        goal.isCompleted = true;

        emit GoalCompleted(_goalId, goal.owner);
    }

    /**
     * @dev Allows the goal owner to withdraw staked funds after goal completion
     * @param _goalId The ID of the completed goal
     */
    function withdrawFunds(uint256 _goalId) public onlyOwner(_goalId) {
        Goal storage goal = goals[_goalId];
        require(goal.isCompleted, "Goal is not completed yet");
        require(!goal.fundsWithdrawn, "Funds have already been withdrawn");

        goal.fundsWithdrawn = true;
        payable(goal.owner).transfer(goal.stakedAmount);

        emit FundsWithdrawn(_goalId, goal.owner, goal.stakedAmount);
    }

    /**
     * @dev Allows users to send rewards to other users
     * @param _to The address of the reward recipient
     */
    function sendReward(address _to) public payable {
        require(msg.value > 0, "Must send some amount");
        payable(_to).transfer(msg.value);
        emit RewardSent(msg.sender, _to, msg.value);
    }

    /**
     * @dev Retrieves the details of a specific goal
     * @param _goalId The ID of the goal to retrieve
     * @return owner The address of the goal owner
     * @return description The description of the goal
     * @return deadline The deadline for the goal completion
     * @return stakedAmount The amount of funds staked on the goal
     * @return isCompleted Whether the goal is completed
     * @return verificationCount The number of verifications received
     * @return verifiers An array of addresses of the assigned verifiers
     * @return fundsWithdrawn Whether the staked funds have been withdrawn
     */
    function getGoal(uint256 _goalId) public view returns (
        address owner,
        string memory description,
        uint256 deadline,
        uint256 stakedAmount,
        bool isCompleted,
        uint256 verificationCount,
        address[] memory verifiers,
        bool fundsWithdrawn
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
            goal.fundsWithdrawn
        );
    }

    /**
     * @dev Retrieves all goal IDs for a specific user
     * @param _user The address of the user
     * @return An array of goal IDs associated with the user
     */
    function getUserGoals(address _user) public view returns (uint256[] memory) {
        return userGoals[_user];
    }

    /**
     * @dev Internal function to check if an address is in the list of verifiers
     * @param _verifier The address to check
     * @param _verifiers The list of verifier addresses
     * @return bool indicating whether the address is a verifier
     */
    function isVerifier(address _verifier, address[] memory _verifiers) internal pure returns (bool) {
        for (uint i = 0; i < _verifiers.length; i++) {
            if (_verifiers[i] == _verifier) {
                return true;
            }
        }
        return false;
    }
}