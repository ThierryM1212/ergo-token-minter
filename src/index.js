'use strict';
import * as wasm from "ergo-lib-wasm-browser";
import JSONBigInt from 'json-bigint';

const NANOERG_TO_ERG = 1000000000;

function parseUnsignedTx(str) {
    let json = JSONBigInt.parse(str);
    return {
        id: json.id,
        inputs: json.inputs,
        dataInputs: json.dataInputs,
        outputs: json.outputs.map(output => (parseUtxo(output))),
    };
}

function parseUtxo(json) {
    return {
        boxId: json.boxId,
        value: json.value.toString(),
        ergoTree: json.ergoTree,
        assets: json.assets.map(asset => ({
            tokenId: asset.tokenId,
            amount: asset.amount.toString(),
        })),
        additionalRegisters: json.additionalRegisters,
        creationHeight: json.creationHeight,
        transactionId: json.transactionId,
        index: json.index
    }
}

async function setStatus(msg, type) {
    const status = document.getElementById("status");
    status.innerText = msg;
    status.className = "alert alert-" + type;
}

async function logErrorStatus(e, msg) {
    const s = msg + `: ${JSON.stringify(e)}`;
    console.error(s, e);
    setStatus(s, "danger");
}

async function connectErgoWallet() {
    ergo_request_read_access().then(function (access_granted) {
        const connectWalletButton = document.getElementById("connect-wallet");
        if (!access_granted) {
            setStatus("Wallet access denied", "warning")
            connectWalletButton.onclick = connectErgoWallet;
        } else {
            console.log("ergo access given");
            setStatus("Wallet connected", "primary")

            ergo.get_balance().then(async function (result) {
                const walletAmount = parseFloat(parseFloat(result) / parseFloat(NANOERG_TO_ERG)).toFixed(3);
                connectWalletButton.innerText = "Balance: " + walletAmount + " ERG";
            });
            const mintButton = document.getElementById("mint-token");
            mintButton.onclick = mintTokens;
        }
    });
}

async function mintTokens(event) {
    // prevent submit
    event.preventDefault(event);
    const tokenForm = document.getElementById("token-form");
    // run the form validation
    tokenForm.reportValidity();
    if (!tokenForm.checkValidity()) {
        console.log("validation error");
        return false;
    }
    // set constants
    const creationHeight = 600000;
    const feeAddress = "9hDPCYffeTEAcShngRGNMJsWddCUQLpNzAqwM9hQyx2w6qubmab";
    const minterAddress = await ergo.get_change_address();

    //get the inputs
    const tokenAmount = document.getElementById("quantity").value;
    const decimals = document.getElementById("decimals").value;
    const tokenAmountAdjusted = BigInt(tokenAmount * Math.pow(10, decimals)).toString();
    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const ergs = parseFloat(document.getElementById("ergs").value);
    if (ergs < 0.002) {
        setStatus("Minimal amount to send with tokens is 0.002, please retry with a higher amount.", "danger");
        return null;
    }
    const fee = parseFloat(document.getElementById("fee").value);
    console.log(tokenAmountAdjusted, decimals, name, description, ergs, fee);

    // Prepare the amounts to send
    const amountToSend = BigInt(Math.round((ergs + fee) * NANOERG_TO_ERG));
    const amountToSendBoxValue = wasm.BoxValue.from_i64(wasm.I64.from_str(amountToSend.toString()));

    // Get the input boxes from the connected wallet
    const utxos = await getUtxos(amountToSend);
    const selector = new wasm.SimpleBoxSelector();
    let boxSelection = {};
    try {
        boxSelection = selector.select(
            wasm.ErgoBoxes.from_boxes_json(utxos),
            wasm.BoxValue.from_i64(amountToSendBoxValue.as_i64().checked_add(wasm.TxBuilder.SUGGESTED_TX_FEE().as_i64())),
            new wasm.Tokens());
    } catch (e) {
        let msg = "[Wallet] Error: "
        if (JSON.stringify(e).includes("BoxValue out of bounds") ){
            msg = msg + "Increase the Erg amount to process the transaction. "
        }
        logErrorStatus(e, msg);
        return null;
    }
    console.log('utxos: ', utxos);
    const ergsStr = (ergs * NANOERG_TO_ERG).toString();
    const ergsAmountBoxValue = wasm.BoxValue.from_i64(wasm.I64.from_str(ergsStr.toString()));

    // Build the output boxes
    const outputCandidates = wasm.ErgoBoxCandidates.empty();
    
    // prepare the box for the minted tokens
    const token = new wasm.Token(
        wasm.TokenId.from_box_id(wasm.BoxId.from_str(utxos[utxos.length - 1].boxId)),
        wasm.TokenAmount.from_i64(wasm.I64.from_str(tokenAmountAdjusted)));
    const minterBoxBuilder = new wasm.ErgoBoxCandidateBuilder(
        ergsAmountBoxValue,
        wasm.Contract.pay_to_address(wasm.Address.from_base58(minterAddress)),
        creationHeight);
    minterBoxBuilder.mint_token(token, name, description, decimals);
    try {
        outputCandidates.add(minterBoxBuilder.build());
    } catch (e) {
        logErrorStatus(e, "minterBox building error");
        return null;
    }
    
    // Build the fee output box
    const feeStr = (fee * NANOERG_TO_ERG).toString();
    const feeAmountBoxValue = wasm.BoxValue.from_i64(wasm.I64.from_str(feeStr));
    const feeBoxBuilder = new wasm.ErgoBoxCandidateBuilder(
        feeAmountBoxValue,
        wasm.Contract.pay_to_address(wasm.Address.from_base58(feeAddress)),
        creationHeight);
    try {
        outputCandidates.add(feeBoxBuilder.build());
    } catch (e) {
        logErrorStatus(e, "feeBox building error");
        return null;
    }
    
    // Create the transaction 
    const txBuilder = wasm.TxBuilder.new(
        boxSelection,
        outputCandidates,
        creationHeight,
        wasm.TxBuilder.SUGGESTED_TX_FEE(),
        wasm.Address.from_base58(minterAddress),
        wasm.BoxValue.SAFE_USER_MIN());
        
    const dataInputs = new wasm.DataInputs();
    txBuilder.set_data_inputs(dataInputs);
    const tx = parseUnsignedTx(txBuilder.build().to_json());
    console.log(`tx: ${JSONBigInt.stringify(tx)}`);

    const correctTx = parseUnsignedTx(wasm.UnsignedTransaction.from_json(JSONBigInt.stringify(tx)).to_json());
    // Put back complete selected inputs in the same order
    correctTx.inputs = correctTx.inputs.map(box => {
        console.log(`box: ${JSONBigInt.stringify(box)}`);
        const fullBoxInfo = utxos.find(utxo => utxo.boxId === box.boxId);
        return {
            ...fullBoxInfo,
            extension: {}
        };
    });
    console.log(`correct tx: ${JSONBigInt.stringify(correctTx)}`);

    // Send transaction for signing
    setStatus("Awaiting transaction signing", "primary");
    console.log(`${JSONBigInt.stringify(correctTx)}`);
    processTx(correctTx).then(txId => {
        console.log('[txId]', txId);
        if (txId) {
            displayTxId(txId);
            tokenForm.reset();
        }
    });
    return false;
}

async function getUtxos(amountToSend) {
    const fee = BigInt(wasm.TxBuilder.SUGGESTED_TX_FEE().as_i64().to_str());
    const fullAmountToSend = amountToSend + fee;
    const filteredUtxos = [];
    const utxos = await ergo.get_utxos(fullAmountToSend.toString());
    for (const utxo of utxos) {
        try {
            wasm.ErgoBox.from_json(JSONBigInt.stringify(utxo));
            filteredUtxos.push(utxo);
        } catch (e) {
            logErrorStatus(e, "[getUtxos] UTxO failed parsing:");
            return null;
        }
    }
    return filteredUtxos;
}

async function signTx(txToBeSigned) {
    try {
        return await ergo.sign_tx(txToBeSigned);
    } catch (e) {
        logErrorStatus(e, "[signTx] Error");
        return null;
    }
}

async function submitTx(txToBeSubmitted) {
    try {
        return await ergo.submit_tx(txToBeSubmitted);
    } catch (e) {
        logErrorStatus(e, "[submitTx] Error");
        return null;
    }
}

async function processTx(txToBeProcessed) {
    const msg = s => {
        console.log('[processTx]', s);
        setStatus(s, "primary");
    };
    const signedTx = await signTx(txToBeProcessed);
    if (!signedTx) {
        console.error(`No signed transaction found`);
        return null;
    }
    msg("Transaction signed - awaiting submission");
    const txId = await submitTx(signedTx);
    if (!txId) {
        console.log(`No submitted tx ID`);
        return null;
    }
    msg("Transaction submitted ");
    return txId;
}

function displayTxId(txId) {
    const status = document.getElementById("status");
    const cr = document.createElement("br");
    const txTracker = document.createElement("a");
    txTracker.appendChild(document.createTextNode(`View transaction in explorer: ${txId}`));
    txTracker.href = `https://explorer.ergoplatform.com/en/transactions/${txId}`;
    txTracker.target = "_blank"
    status.appendChild(cr);
    status.appendChild(txTracker);
    status.className = "alert alert-primary";
}

// INIT page
if (typeof ergo_request_read_access === "undefined") {
    setStatus("Yorio ergo dApp not found, install the extension", "warning");
} else {
    console.log("Yorio ergo dApp found");
    window.addEventListener("ergo_wallet_disconnected", function (event) {
        const connectWalletButton = document.getElementById("connect-wallet");
        connectWalletButton.value = "Connect wallet";
        connectWalletButton.onclick = connectErgoWallet;
        setStatus("Ergo wallet disconnected", "warning");
    });
    connectErgoWallet();
}





