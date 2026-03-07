// blockchain-tests/VoteGuardBlockchain.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VoteGuardBlockchain", function () {
    let contract;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        const VoteGuardBlockchain = await ethers.getContractFactory("VoteGuardBlockchain");
        contract = await VoteGuardBlockchain.deploy();
        await contract.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await contract.owner()).to.equal(owner.address);
        });

        it("Should create genesis block", async function () {
            expect(await contract.chainLength()).to.equal(1);
            expect(await contract.totalTransactions()).to.equal(1);
        });

        it("Should set correct difficulty", async function () {
            const [, , difficulty] = await contract.getChainStats();
            expect(difficulty).to.equal(4);
        });
    });

    describe("Elections", function () {
        it("Should add an election", async function () {
            const electionId = ethers.id("test-election-1");
            const startTime = Math.floor(Date.now() / 1000) + 3600;
            const endTime = startTime + 86400;

            await expect(
                contract.addElection(
                    electionId,
                    "Test Election",
                    "Description",
                    "Constituency A",
                    startTime,
                    endTime
                )
            )
                .to.emit(contract, "ElectionCreated")
                .withArgs(electionId, "Test Election", "Constituency A", startTime, endTime, 1);

            const election = await contract.getElection(electionId);
            expect(election.title).to.equal("Test Election");
            expect(election.exists).to.be.true;
        });

        it("Should reject duplicate election", async function () {
            const electionId = ethers.id("test-election-1");
            const startTime = Math.floor(Date.now() / 1000) + 3600;
            const endTime = startTime + 86400;

            await contract.addElection(
                electionId,
                "Test Election",
                "Description",
                "Constituency A",
                startTime,
                endTime
            );

            await expect(
                contract.addElection(
                    electionId,
                    "Duplicate",
                    "Description",
                    "Constituency B",
                    startTime,
                    endTime
                )
            ).to.be.revertedWith("Election already exists");
        });

        it("Should update election status", async function () {
            const electionId = ethers.id("test-election-status");
            const startTime = Math.floor(Date.now() / 1000) + 3600;
            const endTime = startTime + 86400;

            await contract.addElection(
                electionId,
                "Status Test",
                "Description",
                "Constituency A",
                startTime,
                endTime
            );

            await expect(contract.updateElectionStatus(electionId, 1)) // 1 = LIVE
                .to.emit(contract, "ElectionStatusUpdated");

            const election = await contract.getElection(electionId);
            expect(election.status).to.equal(1);
        });
    });

    describe("Candidates", function () {
        let electionId;

        beforeEach(async function () {
            electionId = ethers.id("test-election-candidates");
            const startTime = Math.floor(Date.now() / 1000) + 3600;
            const endTime = startTime + 86400;

            await contract.addElection(
                electionId,
                "Candidate Test",
                "Description",
                "Constituency A",
                startTime,
                endTime
            );
        });

        it("Should add a candidate", async function () {
            const candidateId = ethers.id("candidate-1");

            await expect(
                contract.addCandidate(
                    candidateId,
                    "John Doe",
                    "Democratic Party",
                    "🦅",
                    45,
                    "PhD",
                    "15 years",
                    electionId
                )
            )
                .to.emit(contract, "CandidateAdded")
                .withArgs(candidateId, electionId, "John Doe", "Democratic Party", 2);

            const candidate = await contract.getCandidate(candidateId);
            expect(candidate.name).to.equal("John Doe");
            expect(candidate.age).to.equal(45);
            expect(candidate.exists).to.be.true;
        });

        it("Should reject invalid age", async function () {
            const candidateId = ethers.id("candidate-invalid");

            await expect(
                contract.addCandidate(
                    candidateId,
                    "Too Young",
                    "Party",
                    "Symbol",
                    15, // Invalid age
                    "Education",
                    "Experience",
                    electionId
                )
            ).to.be.revertedWith("Invalid age");
        });

        it("Should get candidates by election", async function () {
            const candidateId1 = ethers.id("candidate-1");
            const candidateId2 = ethers.id("candidate-2");

            await contract.addCandidate(
                candidateId1,
                "Candidate 1",
                "Party A",
                "Symbol",
                40,
                "Education",
                "Experience",
                electionId
            );

            await contract.addCandidate(
                candidateId2,
                "Candidate 2",
                "Party B",
                "Symbol",
                50,
                "Education",
                "Experience",
                electionId
            );

            const candidates = await contract.getCandidatesByElection(electionId);
            expect(candidates.length).to.equal(2);
        });
    });

    describe("Voting", function () {
        let electionId;
        let candidateId;

        beforeEach(async function () {
            electionId = ethers.id("vote-test-election");
            candidateId = ethers.id("vote-test-candidate");

            // Create election with LIVE status
            const startTime = Math.floor(Date.now() / 1000) - 3600; // Started 1 hour ago
            const endTime = Math.floor(Date.now() / 1000) + 86400; // Ends in 24 hours

            await contract.addElection(
                electionId,
                "Vote Test",
                "Description",
                "Constituency A",
                startTime,
                endTime
            );

            await contract.updateElectionStatus(electionId, 1); // Set to LIVE

            await contract.addCandidate(
                candidateId,
                "Test Candidate",
                "Party",
                "Symbol",
                40,
                "Education",
                "Experience",
                electionId
            );
        });

        it("Should cast a vote", async function () {
            const voteId = ethers.id("vote-1");
            const userId = ethers.id("user-1");
            const receiptHash = ethers.id("receipt-1");

            await expect(
                contract.castVote(
                    voteId,
                    userId,
                    electionId,
                    candidateId,
                    receiptHash,
                    "encrypted-vote-data"
                )
            )
                .to.emit(contract, "VoteCast")
                .withArgs(voteId, userId, electionId, candidateId, receiptHash, 4);

            const vote = await contract.getVote(voteId);
            expect(vote.userId).to.equal(userId);
            expect(vote.candidateId).to.equal(candidateId);

            const voteCount = await contract.getCandidateVoteCount(candidateId);
            expect(voteCount).to.equal(1);
        });

        it("Should prevent double voting", async function () {
            const voteId1 = ethers.id("vote-1");
            const voteId2 = ethers.id("vote-2");
            const userId = ethers.id("user-1");
            const receiptHash1 = ethers.id("receipt-1");
            const receiptHash2 = ethers.id("receipt-2");

            await contract.castVote(
                voteId1,
                userId,
                electionId,
                candidateId,
                receiptHash1,
                "encrypted-vote-data"
            );

            await expect(
                contract.castVote(
                    voteId2,
                    userId,
                    electionId,
                    candidateId,
                    receiptHash2,
                    "encrypted-vote-data"
                )
            ).to.be.revertedWith("Already voted");
        });

        it("Should verify vote by receipt", async function () {
            const voteId = ethers.id("vote-verify");
            const userId = ethers.id("user-verify");
            const receiptHash = ethers.id("receipt-verify");

            await contract.castVote(
                voteId,
                userId,
                electionId,
                candidateId,
                receiptHash,
                "encrypted-vote-data"
            );

            const vote = await contract.verifyVoteByReceipt(receiptHash);
            expect(vote.id).to.equal(voteId);
            expect(vote.receiptHash).to.equal(receiptHash);
        });
    });

    describe("Audit Logs", function () {
        it("Should record audit log", async function () {
            const auditId = ethers.id("audit-1");
            const userId = ethers.id("user-1");

            await expect(
                contract.recordAuditLog(
                    auditId,
                    userId,
                    "VIEWED_DASHBOARD",
                    "User accessed dashboard",
                    "127.0.0.1"
                )
            )
                .to.emit(contract, "AuditLogRecorded")
                .withArgs(auditId, userId, "VIEWED_DASHBOARD", 1);

            const auditLog = await contract.getAuditLog(auditId);
            expect(auditLog.action).to.equal("VIEWED_DASHBOARD");
            expect(auditLog.userId).to.equal(userId);
        });
    });

    describe("Blockchain Operations", function () {
        it("Should get block information", async function () {
            const block = await contract.getBlock(0);
            expect(block.index).to.equal(0);
            expect(block.transactionCount).to.equal(1);
        });

        it("Should track chain statistics", async function () {
            const [chainLength, totalTx, difficulty] = await contract.getChainStats();
            expect(chainLength).to.be.gt(0);
            expect(totalTx).to.be.gt(0);
            expect(difficulty).to.equal(4);
        });
    });

    describe("Access Control", function () {
        it("Should only allow owner to add elections", async function () {
            const electionId = ethers.id("unauthorized-election");
            const startTime = Math.floor(Date.now() / 1000) + 3600;
            const endTime = startTime + 86400;

            await expect(
                contract.connect(addr1).addElection(
                    electionId,
                    "Unauthorized",
                    "Description",
                    "Constituency",
                    startTime,
                    endTime
                )
            ).to.be.revertedWith("Only owner can execute this");
        });

        it("Should transfer ownership", async function () {
            await contract.transferOwnership(addr1.address);
            expect(await contract.owner()).to.equal(addr1.address);
        });
    });
});
