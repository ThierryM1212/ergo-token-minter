import * as wasm from "ergo-lib-wasm-browser";
import JSONBigInt from 'json-bigint';

const NANOERG_TO_ERG = 1000000000;

function parseUnsignedTx(str) {
    let json = JSONBigInt.parse(str);
    return {
        id: json.id,
        inputs: json.inputs,
        dataInputs: json.dataInputs,
        outputs: json.outputs.map(output => ({
            boxId: output.boxId,
            value: output.value.toString(),
            ergoTree: output.ergoTree,
            assets: output.assets.map(asset => ({
                tokenId: asset.tokenId,
                amount: asset.amount.toString(),
            })),
            additionalRegisters: output.additionalRegisters,
            creationHeight: output.creationHeight,
            transactionId: output.transactionId,
            index: output.index
        })),

    };
}

async function connectErgoWallet() {
    ergo_request_read_access().then(function (access_granted) {
        const connectWalletButton = document.getElementById("connect-wallet");
        if (!access_granted) {
            const status = document.getElementById("status");
            status.innerText = "Wallet access denied";
            status.className = "alert alert-warning";
            connectWalletButton.onclick = connectErgoWallet;
        } else {
            console.log("ergo access given");
            const status = document.getElementById("status");
            status.innerText = "Wallet connected";
            status.className = "alert alert-primary";

            ergo.get_balance().then(async function (result) {
                let tx = {};

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
    const status = document.getElementById("status");
    const tokenAmount = document.getElementById("quantity").value;
    const decimals = document.getElementById("decimals").value;
    const tokenAmountAdjusted = BigInt(tokenAmount * Math.pow(10, decimals)).toString();
    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const ergs = parseFloat(document.getElementById("ergs").value);
    const fee = parseFloat(document.getElementById("fee").value);
    console.log(tokenAmountAdjusted, decimals, name, description, ergs, fee);

    // prepare the amounts to send
    const amountToSend = BigInt(Math.round((ergs + fee) * NANOERG_TO_ERG));
    const amountToSendBoxValue = wasm.BoxValue.from_i64(wasm.I64.from_str(amountToSend.toString()));
    const ergsStr = (ergs * NANOERG_TO_ERG).toString();
    const ergsAmountBoxValue = wasm.BoxValue.from_i64(wasm.I64.from_str(ergsStr.toString()));
    
    // Get the input boxes from the connected wallet
    const utxos = await getUtxos(amountToSend);
    let utxosValue = utxos.reduce((acc, utxo) => acc += BigInt(utxo.value), BigInt(0));
    console.log('utxos', utxosValue, utxos);
    const changeValue = utxosValue - amountToSend - BigInt(wasm.TxBuilder.SUGGESTED_TX_FEE().as_i64().to_str());
    console.log(`${changeValue} | cv.ts() = ${changeValue.toString()}`);
    const selector = new wasm.SimpleBoxSelector();
    const boxSelection = selector.select(
        wasm.ErgoBoxes.from_boxes_json(utxos),
        wasm.BoxValue.from_i64(amountToSendBoxValue.as_i64().checked_add(wasm.TxBuilder.SUGGESTED_TX_FEE().as_i64())),
        new wasm.Tokens());
    console.log(`boxes selected: ${boxSelection.boxes().len()}`);

    //build the output boxes
    const outputCandidates = wasm.ErgoBoxCandidates.empty();

    // Build the minter output box
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
        console.log(`building error: ${e}`);
        throw e;
    }

    // Build the fee output box
    const feeStr = (fee * NANOERG_TO_ERG).toString();
    const feeAmountBoxValue = wasm.BoxValue.from_i64(wasm.I64.from_str(feeStr.toString()));
    const feeBoxBuilder = new wasm.ErgoBoxCandidateBuilder(
        feeAmountBoxValue,
        wasm.Contract.pay_to_address(wasm.Address.from_base58(feeAddress)),
        creationHeight);
    try {
        outputCandidates.add(feeBoxBuilder.build());
    } catch (e) {
        console.log(`building error: ${e}`);
        throw e;
    }
    console.log(`utxosval: ${utxosValue.toString()}`);

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
    console.log(`original id: ${tx.id}`);
    
    const correctTx = parseUnsignedTx(wasm.UnsignedTransaction.from_json(JSONBigInt.stringify(tx)).to_json());
    console.log(`correct tx: ${JSONBigInt.stringify(correctTx)}`);
    console.log(`new id: ${correctTx.id}`);
    // we must use the exact order chosen as after 0.4.3 in sigma-rust
    // this can change and might not use all the utxos as the coin selection
    // might choose a more optimal amount
    correctTx.inputs = correctTx.inputs.map(box => {
        console.log(`box: ${JSONBigInt.stringify(box)}`);
        const fullBoxInfo = utxos.find(utxo => utxo.boxId === box.boxId);
        return {
            ...fullBoxInfo,
            extension: {}
        };
    });

    // Send transaction for signing
    status.innerText = "Awaiting transaction signing";
    status.className = "alert alert-primary";
    console.log(`${JSONBigInt.stringify(correctTx)}`);
    processTx(correctTx).then(txId => {
        console.log('[txId]', txId);
        if (txId) {
            displayTxId(txId);
        }
    });
    return false;
}

async function getUtxos(amountToSend) {
    const fee = BigInt(wasm.TxBuilder.SUGGESTED_TX_FEE().as_i64().to_str());
    console.log(amountToSend);
    const fullAmountToSend = amountToSend + fee;
    const utxos = await ergo.get_utxos(fullAmountToSend.toString());
    const filteredUtxos = [];
    for (const utxo of utxos) {
        try {
            wasm.ErgoBox.from_json(JSONBigInt.stringify(utxo));
            filteredUtxos.push(utxo);
        } catch (e) {
            console.error('[getUtxos] UTxO failed parsing:', utxo, e);
        }
    }
    return filteredUtxos;
}

async function signTx(txToBeSigned) {
    console.log("signTx");
    const status = document.getElementById("status");
    try {
        return await ergo.sign_tx(txToBeSigned);
    } catch (err) {
        const msg = `[signTx] Error: ${JSON.stringify(err)}`;
        console.error(msg, err);
        status.innerText = msg
        status.className = "alert alert-danger";
        return null;
    }
}

async function submitTx(txToBeSubmitted) {
    const status = document.getElementById("status");
    try {
        return await ergo.submit_tx(txToBeSubmitted);
    } catch (err) {
        const msg = `[submitTx] Error: ${JSON.stringify(err)}`;
        console.error(msg, err);
        status.innerText = msg
        status.className = "alert alert-danger";
        return null;
    }
}

async function processTx(txToBeProcessed) {
    const status = document.getElementById("status");
    const msg = s => {
        console.log('[processTx]', s);
        status.innerText = s;
        status.className = "alert alert-primary";
    };
    const signedTx = await signTx(txToBeProcessed);
    if (!signedTx) {
        console.log(`No signed tx`);
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
const status = document.getElementById("status");
if (typeof ergo_request_read_access === "undefined") {
    status.innerText = "Yorio ergo dApp not found, install the extension";
    status.className = "alert alert-warning";
} else {
    console.log("Yorio ergo dApp found");
    window.addEventListener("ergo_wallet_disconnected", function (event) {
        const connectWalletButton = document.getElementById("connect-wallet");
        connectWalletButton.value = "Connect wallet";
        connectWalletButton.onclick = connectErgoWallet;
        status.innerText = "Ergo wallet disconnected";
        status.className = "alert alert-warning";
    });
    connectErgoWallet();
}





