const { v4: uuid } = require("uuid");

const { localSetup, optimismGoerliSetup } = require("./chainSetup.js");
const { ethers, utils } = require("ethers");


async function createAndDisplayStakeholder(contract) {
    const stakeholderId = uuid();
    const stakeholderIdBytes16 = utils.hexlify(utils.arrayify("0x" + stakeholderId.replace(/-/g, "")));
    console.log("stakeholderId ", stakeholderId);
    console.log("stakeholderIdBytes32", stakeholderIdBytes16);

    try {
        const tx = await contract.createStakeholder(stakeholderIdBytes16, "INDIVIDUAL", "EMPLOYEE");
        await tx.wait();
    } catch (error) {
        console.log("Error encountered:", error);
    }
    const stakeHolderAdded = await contract.getStakeholderById(stakeholderIdBytes16);
    const id = stakeHolderAdded[0];
    const type = stakeHolderAdded[1];
    const role = stakeHolderAdded[2];
    console.log("New Stakeholder created:", { id, type, role });

    return stakeholderIdBytes16;
}

async function createAndDisplayStockClass(contract) {
    try {
        const stockClassId = uuid();
        const stockClassIdBytes16 = utils.hexlify(utils.arrayify("0x" + stockClassId.replace(/-/g, "")));

        const newStockClass = await contract.createStockClass(stockClassIdBytes16, "COMMON", 100, 4000000);
        await newStockClass.wait();
        const stockClassAdded = await contract.getStockClassById(stockClassIdBytes16);
        console.log("--- Stock Class for Existing ID ---");
        console.log("Getting new stock class:");
        console.log("ID:", stockClassAdded[0]);
        console.log("Type:", stockClassAdded[1]);
        console.log("Price Per Share:", ethers.utils.formatUnits(stockClassAdded[2], 6));
        console.log("Initial Shares Authorized:", stockClassAdded[3].toString());

        return stockClassIdBytes16;
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

async function transferOwnership(contract, transferorId, transfereeId, stockClassId) {
    try {
        const amountToTransfer = 300000;
        console.log(`transferring ${amountToTransfer} shares`);
        const tx = await contract.transferStockOwnership(transferorId, transfereeId, stockClassId, true, amountToTransfer, 123);
        await tx.wait();

        console.log("transfer was successfull");

        const seller = await contract.getStakeholderById(transferorId);
        const sellerIdFetched = seller[0];
        const sellerType = seller[1];
        const sellerRole = seller[2];

        const buyer = await contract.getStakeholderById(transfereeId);
        const buyerIdFetched = buyer[0];
        const buyerType = buyer[1];
        const buyerRole = buyer[2];
        console.log("Ownership transferred successfully!");
        console.log("Seller new values after transfer:", { id: sellerIdFetched, type: sellerType, role: sellerRole });
        console.log("Buyer new values after transfer:", { id: buyerIdFetched, type: buyerType, role: buyerRole });

        const firstTX = await contract.transactions(0);
        const secondTX = await contract.transactions(1);
        const thirdTX = await contract.transactions(2);

        console.log("First issuance transaction address:", firstTX);
        console.log("Second issuance transaction address,", secondTX);
        console.log("Transfer transaction address,", thirdTX);
    } catch (error) {
        console.error("Error encountered for transfer ownership:", error.error.reason);
    }
}

const issuerTest = async (contract) => {
    const issuer = await contract.issuer();
    console.log("Issuer", issuer);
};

const issueStakeholderStock = async (contract, stakeholderId, stockClassId) => {
    const amount = 1000000;
    const sharePrice = 123;

    try {
        const tx = await contract.issueStockByTA(stakeholderId, amount, sharePrice, stockClassId);
        await tx.wait();
        console.log("Issued stock successfully");
    } catch (error) {
        console.error("Error encountered for issuing stock", error);
    }
};

async function main({ chain }) {
    let _contract;
    let _provider;
    if (chain === "local") {
        const { contract, provider } = await localSetup();
        _contract = contract;
        _provider = provider;
    }

    if (chain === "optimism-goerli") {
        const { contract, provider } = await optimismGoerliSetup();
        _contract = contract;
        _provider = provider;
    }
    const transferorId = "0x1636c898717741fbaa72f735622cad35";
    const transfereeId = "0xb3174fbc904c495585690a1002351ee3";
    const stockClassId = "0xe6a02695fdf7479bb2e1a362e9cdfc69";

    //await issuerTest(_contract);
    // await displayIssuer(contract);
    //const id = await createAndDisplayStakeholder(_contract);
    //const stockClassId = await createAndDisplayStockClass(_contract);
    //await issueStakeholderStock(_contract, id, stockClassId);
    await transferOwnership(_contract, transferorId, transfereeId, stockClassId);
    // await totalNumberOfStakeholders(contract);
}

const chain = process.argv[2];

console.log("testing process.argv", chain);

main({ chain }).catch(console.error);
