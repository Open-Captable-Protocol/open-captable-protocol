import { ethers } from "ethers";
import ISSUANCE from "../../chain/out/StockIssuance.sol/StockIssuanceLib.json" assert { type: "json" };
import TRANSFER from "../../chain/out/StockTransfer.sol/StockTransferLib.json" assert { type: "json" };
import CANCELLATION from "../../chain/out/StockCancellation.sol/StockCancellationLib.json" assert { type: "json" };
import RETRACTION from "../../chain/out/StockRetraction.sol/StockRetractionLib.json" assert { type: "json" };
import REISSUANCE from "../../chain/out/StockReissuance.sol/StockReissuanceLib.json" assert { type: "json" };
import REPURCHASE from "../../chain/out/StockRepurchase.sol/StockRepurchaseLib.json" assert { type: "json" };
import ACCEPTANCE from "../../chain/out/StockAcceptance.sol/StockAcceptanceLib.json" assert { type: "json" };
import ADJUSTMENT from "../../chain/out/Adjustment.sol/Adjustment.json" assert { type: "json" };

const getTXLibContracts = (contractTarget, wallet) => {
    const libraries = {
        issuance: new ethers.Contract(contractTarget, ISSUANCE.abi, wallet),
        transfer: new ethers.Contract(contractTarget, TRANSFER.abi, wallet),
        cancellation: new ethers.Contract(contractTarget, CANCELLATION.abi, wallet),
        retraction: new ethers.Contract(contractTarget, RETRACTION.abi, wallet),
        reissuance: new ethers.Contract(contractTarget, REISSUANCE.abi, wallet),
        repurchase: new ethers.Contract(contractTarget, REPURCHASE.abi, wallet),
        acceptance: new ethers.Contract(contractTarget, ACCEPTANCE.abi, wallet),
        adjustment: new ethers.Contract(contractTarget, ADJUSTMENT.abi, wallet),
    };
    return libraries
}

export default getTXLibContracts