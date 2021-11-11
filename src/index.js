'use strict';
import * as wasm from "ergo-lib-wasm-browser";
import JSONBigInt from 'json-bigint';
import { v4 as uuidv4 } from 'uuid';
import { parseUnsignedTx, parseUtxo } from "./parseUtils";
import { getTokenBox } from "./ergo-related/explorer";
import { decodeString } from "./ergo-related/serializer";

const NANOERG_TO_ERG = 1000000000;

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

function formatTokenAmount(amount, decimals) {
    const dec = parseInt(decimals);
    if (dec > 0) {
        return amount.substring(0, amount.length - dec) + "." + amount.substring(amount.length - dec)
    } else {
        return amount;
    }
}

function formatTokenId(tokenId) {
    return tokenId.substring(0,10)+'...'+tokenId.substring(tokenId.length-10,tokenId.length)
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
            }).then(async function () {
                var currentLocation = window.location;
                if (currentLocation.toString().includes("burn.html")) {
                    const container = document.getElementById("main");
                    container.removeAttribute("hidden");
                    loadBurnPage();
                    const burnButton = document.getElementById("burn-token");
                    burnButton.onclick = burnTokens;
                } else {
                    const mintButton = document.getElementById("mint-token");
                    mintButton.onclick = mintTokens;
                }
            }
            );
        }
    });
}

async function loadBurnPage() {
    const utxos = await ergo.get_utxos();
    const container = document.getElementById("container");

    for (const i in utxos) {
        const jsonUtxo = parseUtxo(utxos[i]);
        for (var j in jsonUtxo.assets) {
            const tokenBox = await decodeToken(jsonUtxo.assets[j].tokenId);
            const rowUUID = uuidv4();
            const html_row =
                '<div class="mb-3 p-2 my-auto w-50">' +
                  '<div class="d-flex flex-row">' +
                    '<div class="flex-child token-name"><h5>' + tokenBox.name + '</h5></div>' +
                    '<div class="flex-child token-amount"><h5>' + formatTokenAmount(jsonUtxo.assets[j].amount, tokenBox.decimals) + '</h5></div>' +
                  '</div>' +
                  '<p class="h6 text-muted token-id" title="'+jsonUtxo.assets[j].tokenId+'">' + formatTokenId(jsonUtxo.assets[j].tokenId) + '</p>' +
                  '<span hidden>' + tokenBox.decimals + '</span>' +
                '</div>' +
                '<div class="mb-3 p-2 my-auto w-25">' +
                  '<input class="form-control" value="0" required pattern="[0-9\\.]+">' +
                '</div>' +
                '<div class="d-flex flex-row w-25">' +
                  '<button type="button" class="btn btn-light float-right w-50 h50 m-1" onClick="setMaxToken(\'' + rowUUID + '\',\'' + formatTokenAmount(jsonUtxo.assets[j].amount, tokenBox.decimals) + '\')">All</button>' +
                  '<button type="button" class="btn btn-light float-right w-50 h50 m-1" onClick="resetToken(\'' + rowUUID + '\')">None</button>' +
                '</div>';
            var e = document.createElement('div');
            e.setAttribute("id", rowUUID)
            e.className="card p-1 d-flex flex-row align-middle";
            e.innerHTML = html_row;
            container.appendChild(e);
        };
    }
}

async function burnTokens(event) {
    // prevent submit
    event.preventDefault(event);
    const tokenForm = document.getElementById("token-form");
    // run the form validation
    tokenForm.reportValidity();
    if (!tokenForm.checkValidity()) {
        console.log("validation error");
        return false;
    }
    // 
    const creationHeight = 600000;
    const feeAddress = "9hDPCYffeTEAcShngRGNMJsWddCUQLpNzAqwM9hQyx2w6qubmab";
    const burnerAddress = await ergo.get_change_address();
    const ergs = parseFloat(document.getElementById("ergs").value);
    if (ergs < 0.002) {
        setStatus("Minimal amount to send with tokens is 0.002, please retry with a higher amount.", "danger");
        return null;
    }
    var fee = parseFloat(document.getElementById("fee").value);
    if (ergs < 0.001) {
        fee = 0.001;
    }
    // prepare the amounts to send
    const amountToSend = BigInt((ergs + fee) * NANOERG_TO_ERG);
    const amountToSendBoxValue = wasm.BoxValue.from_i64(wasm.I64.from_str(amountToSend.toString()));
    const ergsStr = (ergs * NANOERG_TO_ERG).toString();
    const ergsAmountBoxValue = wasm.BoxValue.from_i64(wasm.I64.from_str(ergsStr.toString()));

    // build the list of tokens to burn
    var tokensToBurn = [];
    var tokenIdToburn = [];
    $("#container").find(".card").each(function () {
        const tokenId = $(this).find('p')[0].getAttribute("title");
        const decimals = parseInt($(this).find("span")[0].innerText);
        const amountToburn = parseFloat($(this).find("input")[0].value);
        const initialAmount = parseFloat($(this).find(".token-amount")[0].innerText);
        const tokAmountToBurn = BigInt(Math.round(amountToburn * Math.pow(10, decimals))).toString();
        
        const initialTokAmount = BigInt(initialAmount * Math.pow(10, decimals)).toString();
        if (tokAmountToBurn > 0) {
            tokensToBurn.push([tokenId, tokAmountToBurn, initialTokAmount]);
            tokenIdToburn.push(tokenId);
        }
    })
    console.log('tokensToBurn: ', tokensToBurn);
    var tokens = new wasm.Tokens();
    for (var i in tokensToBurn) {
        tokens.add(new wasm.Token(
            wasm.TokenId.from_str(tokensToBurn[i][0]),
            wasm.TokenAmount.from_i64(wasm.I64.from_str(tokensToBurn[i][1]))
        )
        )
    }
    console.log('tokens: ', tokens);

    // Get all the inputs, filter the required one using the selector
    const utxos = await getAllUtxos();
    const selector = new wasm.SimpleBoxSelector();
    let boxSelection = {};
    try {
        boxSelection = selector.select(
            wasm.ErgoBoxes.from_boxes_json(utxos),
            wasm.BoxValue.from_i64(amountToSendBoxValue.as_i64().checked_add(wasm.TxBuilder.SUGGESTED_TX_FEE().as_i64())),
            tokens);
    } catch (e) {
        let msg = "[Wallet] Error: "
        if (JSON.stringify(e).includes("BoxValue out of bounds")) {
            msg = msg + "Increase the Erg amount to process the transaction. "
        }
        logErrorStatus(e, msg);
        return null;
    }
    console.log('boxSelection: ', boxSelection.boxes().len());

    // Prepare the output boxes
    const outputCandidates = wasm.ErgoBoxCandidates.empty();
    // Build the burner output box
    const burnerBoxBuilder = new wasm.ErgoBoxCandidateBuilder(
        ergsAmountBoxValue,
        wasm.Contract.pay_to_address(wasm.Address.from_base58(burnerAddress)),
        creationHeight);
    try {
        outputCandidates.add(burnerBoxBuilder.build());
    } catch (e) {
        console.log(`building error: ${e}`);
        throw e;
    }
    // don't add the tokens here, let the transaction builder add all the tokens in the fee
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

    // Create the transaction 
    const txBuilder = wasm.TxBuilder.new(
        boxSelection,
        outputCandidates,
        creationHeight,
        wasm.TxBuilder.SUGGESTED_TX_FEE(),
        wasm.Address.from_base58(burnerAddress),
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
    console.log(`temps tx: ${JSONBigInt.stringify(correctTx)}`);

    // Burn the tokens
    for (var i in correctTx.outputs) {
        var newAssets = [];
        for (var j in correctTx.outputs[i].assets) { // Token is to be burnt
            if (tokenIdToburn.includes(correctTx.outputs[i].assets[j].tokenId)) {
                for (var k in tokensToBurn) {
                    if (tokensToBurn[k][0] == correctTx.outputs[i].assets[j].tokenId && tokensToBurn[k][1] < tokensToBurn[k][2]) {
                        newAssets.push({
                            "amount": (BigInt(tokensToBurn[k][2]) - BigInt(tokensToBurn[k][1])).toString(),
                            "tokenId": tokensToBurn[k][0]
                        });
                    } // else dont add the token
                }
            } else { // Not burnt
                newAssets.push(correctTx.outputs[i].assets[j]);
            }
        }
        correctTx.outputs[i].assets = newAssets;
    }

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
    var fee = parseFloat(document.getElementById("fee").value);
    if (ergs < 0.001) {
        fee = 0.001;
    }
    console.log(tokenAmountAdjusted, decimals, name, description, ergs, fee);

    // Prepare the amounts to send
    const amountToSend = BigInt(Math.round((ergs + fee) * NANOERG_TO_ERG));
    const amountToSendBoxValue = wasm.BoxValue.from_i64(wasm.I64.from_str(amountToSend.toString()));

    // Get the input boxes from the connected wallet
    const utxos = await getUtxosForAmount(amountToSend);
    const selector = new wasm.SimpleBoxSelector();
    let boxSelection = {};
    try {
        boxSelection = selector.select(
            wasm.ErgoBoxes.from_boxes_json(utxos),
            wasm.BoxValue.from_i64(amountToSendBoxValue.as_i64().checked_add(wasm.TxBuilder.SUGGESTED_TX_FEE().as_i64())),
            new wasm.Tokens());
    } catch (e) {
        let msg = "[Wallet] Error: "
        if (JSON.stringify(e).includes("BoxValue out of bounds")) {
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

async function getAllUtxos() {
    const filteredUtxos = [];
    const utxos = await ergo.get_utxos();
    for (const utxo of utxos) {
        try {
            wasm.ErgoBox.from_json(JSONBigInt.stringify(utxo));
            filteredUtxos.push(utxo);
        } catch (e) {
            logErrorStatus(e, "[getAllUtxos] UTxO failed parsing:");
            return null;
        }
    }
    return filteredUtxos;
}

async function getUtxosForAmount(amountToSend) {
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

async function decodeToken(tokenId) {
    let box = await getTokenBox(tokenId)
    if (!box) return
    let name = await decodeString(box.additionalRegisters.R4)
    let description = await decodeString(box.additionalRegisters.R5)
    let decimals = await decodeString(box.additionalRegisters.R6)
    return ({ name: name, description: description, decimals: decimals })
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
        const container = document.getElementById("main");
        container.addAttribute("hidden");
    });
    connectErgoWallet();
}




