const { ethers } = require("ethers");
const { v4: uuid } = require("uuid");
require("dotenv").config();

const CAP_TABLE_ABI = require("../chain/out/CapTable.sol/CapTable.json").abi;

async function localSetup() {
    // if deployed using forge script
    //const CONTRACT_ADDRESS_LOCAL = require("../chain/broadcast/CapTable.s.sol/31337/run-latest.json").transactions[0].contractAddress;
    const CONTRACT_ADDRESS_LOCAL = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; // fill in from capTableFactory

    const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY_FAKE_ACCOUNT;

    const customNetwork = {
        chainId: 31337,
        name: "local",
    };

    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545", customNetwork);
    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS_LOCAL, CAP_TABLE_ABI, wallet);

    return contract;
}

async function optimismGoerliSetup() {
    // if deployed using forge script
    // const CONTRACT_ADDRESS_OPTIMISM_GOERLI = require("../chain/broadcast/CapTable.s.sol/420/run-latest.json").transactions[0].contractAddress;
    const CONTRACT_ADDRESS_OPTIMISM_GOERLI = "0x027A280A63376308658A571ac2DB5D612bA77912";
    const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY_POET_TEST;

    const provider = new ethers.providers.JsonRpcProvider(process.env.OPTIMISM_GOERLI_RPC_URL);
    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS_OPTIMISM_GOERLI, CAP_TABLE_ABI, wallet);

    return contract;
}

async function updateLegalName(contract) {
    try {
        const tx = await contract.updateLegalName("New Null Corp Inc.");
        await tx.wait();
        console.log("Legal name updated successfully!");
    } catch (error) {
        console.error("Error encountered:", error.error.reason);
    }
}

async function displayIssuer(contract) {
    try {
        const newIssuer = await contract.getIssuer();
        console.log("New issuer with name:", newIssuer);
    } catch (error) {
        console.error("Error encountered:", error.error.reason);
    }
}

async function createAndDisplayStakeholder(contract) {
    const stakeholderId = uuid();
    try {
        const tx = await contract.createStakeholder(stakeholderId, 1000000);
        await tx.wait();
    } catch (error) {
        console.log("Error encountered:", error.error.reason);
    }
    const stakeHolderAdded = await contract.getStakeholderById(stakeholderId);
    const id = stakeHolderAdded[0];
    const shares = stakeHolderAdded[1].toString();
    console.log("Stakeholder for Existing ID:", { id, shares });

    return stakeholderId;
}

async function displayNonExistingStakeholder(contract) {
    try {
        const nonExistingStakeholder = await contract.getStakeholderById("222-222-222");
        console.log("Stakeholder for Non-Existing ID:", nonExistingStakeholder);
    } catch (error) {
        console.error("Error encountered:", error.error.reason);
    }
}

async function createAndDisplayStockClass(contract) {
    try {
        const stockClassId = uuid();
        const newStockClass = await contract.createStockClass(stockClassId, "COMMON", 100, 100, 4000000);
        await newStockClass.wait();
        const stockClassAdded = await contract.getStockClassById(stockClassId);
        console.log("Stock class object ", stockClassAdded);
        console.log("--- Stock Class for Existing ID ---");
        console.log("Getting new stock class:");
        console.log("ID:", stockClassAdded[0]);
        console.log("Type:", stockClassAdded[1]);
        console.log("Price Per Share:", ethers.utils.formatUnits(stockClassAdded[2], 6));
        console.log("Par Value:", ethers.utils.formatUnits(stockClassAdded[3], 6));
        console.log("Initial Shares Authorized:", stockClassAdded[4].toString());
    } catch (error) {
        console.error("Error encountered:", error.error.reason);
    }
}

async function displayNonExistingStockClass(contract) {
    try {
        const nonExistingStockClass = await contract.getStockClassById("222-222-222");
        console.log("--- Stock Class for Non-Existing ID ---");
        console.log("Getting new stock class:");
        console.log("ID:", nonExistingStockClass[0]);
        console.log("Type:", nonExistingStockClass[1]);
        console.log("Price Per Share:", ethers.utils.formatUnits(nonExistingStockClass[2], 6));
        console.log("Par Value:", ethers.utils.formatUnits(nonExistingStockClass[3], 6));
        console.log("Initial Shares Authorized:", nonExistingStockClass[4].toString());
    } catch (error) {
        console.error("Error encountered:", error.error.reason);
    }
}

async function totalNumberOfStakeholders(contract) {
    try {
        const totalStakeholders = await contract.getTotalNumberOfStakeholders();
        console.log("Total number of stakeholders:", totalStakeholders.toString());
    } catch (error) {
        console.error("Error encountered:", error.error.reason);
    }
}

async function totalNumberOfStockClasses(contract) {
    try {
        const totalStockClasses = await contract.getTotalNumberOfStockClasses();
        console.log("Total number of stock classes:", totalStockClasses.toString());
    } catch (error) {
        console.error("Error encountered:", error.error.reason);
    }
}

async function transferOwnership(contract, sellerId) {
    try {
        const tx = await contract.transferStockOwnership(sellerId, true, 300000);
        await tx.wait();
        console.log("Ownership transferred successfully!");

        const seller = await contract.getStakeholderById(sellerId);
        const sellerIdFetched = seller[0];
        const sellerShares = seller[1].toString();

        const buyer = await contract.getStakeholderById("9876-9876-9876");
        const buyerIdFetched = buyer[0];
        const buyerShares = buyer[1].toString();

        console.log("Seller new values after transfer:", { id: sellerIdFetched, shares: sellerShares });
        console.log("Buyer new values after transfer:", { id: buyerIdFetched, shares: buyerShares });
    } catch (error) {
        console.error("Error encountered for transfer ownership:", error);
    }
}

async function main({ chain }) {
    let contract;
    if (chain === "local") {
        contract = await localSetup();
    }

    if (chain === "optimism-goerli") {
        contract = await optimismGoerliSetup();
    }

    // await updateLegalName(contract);
    await displayIssuer(contract);
    const id = await createAndDisplayStakeholder(contract);
    //await displayNonExistingStakeholder(contract);
    await createAndDisplayStockClass(contract);
    await displayNonExistingStockClass(contract);
    await totalNumberOfStakeholders(contract);
    await totalNumberOfStockClasses(contract);
    await transferOwnership(contract, id);
}

const chain = process.argv[2];

console.log("testing process.argv", chain);

main({ chain }).catch(console.error);
