'use strict';
import * as wasm from "ergo-lib-wasm-browser";
import JSONBigInt from 'json-bigint';
import Swal from 'sweetalert2'
import { v4 as uuidv4 } from 'uuid';
import { parseUnsignedTx, parseUtxo } from "./parseUtils";
import { formatTokenAmount, formatTokenId, decodeToken } from "./utils";
import { currentHeight } from "./ergo-related/explorer"

/* global ergo */

const NANOERG_TO_ERG = 1000000000;
const FEE_ADDRESS = "3WvyPzH38cTUtzEvNrbEGQBoxSAHtbBQSHdAmjaRYtARhVogLg5c"; // TESTNET
const MIN_ERG_AMOUNT = 0.002;
const DAPP_FEE = 0.001;
const SIGUSD_TOKENID = "03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04";
const SIGRSV_TOKENID = "003bd19d0187117f130b62e1bcab0939929ff5c7709f843c5c4dd158949285d0";
const GENUINE_TOKENID_LIST = [SIGUSD_TOKENID, SIGRSV_TOKENID];

function setStatus(msg, type) {
    const status = document.getElementById("status");
    status.innerText = msg;
    status.className = "alert alert-" + type;
}

async function logErrorStatus(e, msg) {
    const s = msg + `: ${JSON.stringify(e)}`;
    console.error(s, e);
    setStatus(s, "danger");
}

async function setBalance() {
    const connectWalletButton = document.getElementById("connect-wallet");
    ergo.get_balance().then(async function (result) {
        const walletAmount = parseFloat(parseFloat(result) / parseFloat(NANOERG_TO_ERG)).toFixed(3);
        connectWalletButton.innerText = "Balance: " + walletAmount + " ERG";
    });
}

// run the form validation
function checkFormValidity() {
    const tokenForm = document.getElementById("token-form");
    tokenForm.reportValidity();
    if (!tokenForm.checkValidity()) {
        console.log("validation error");
        return false;
    };
    return true;
}

async function connectErgoWallet() {
    ergo_request_read_access().then(function (access_granted) {
        const connectWalletButton = document.getElementById("connect-wallet");
        if (!access_granted) {
            setStatus("Wallet access denied", "warning");
            connectWalletButton.onclick = connectErgoWallet;
        } else {
            console.log("ergo access given");
            setStatus("Wallet connected", "primary");

            setBalance().then(async function () {
                var currentLocation = window.location;
                if (currentLocation.toString().includes("burn.html")) {
                    const container = document.getElementById("main");
                    container.removeAttribute("hidden");
                    await loadBurnPage();
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
    console.log("utxos",utxos);
    const container = document.getElementById("container");
    var assetsFound = false;
    for (const i in utxos) {
        const jsonUtxo = parseUtxo(utxos[i]);
        for (var j in jsonUtxo.assets) {
            assetsFound = true;
            console.log("tokenId",jsonUtxo.assets[j].tokenId)
            const tokenBox = await decodeToken(jsonUtxo.assets[j].tokenId);
            const rowUUID = uuidv4();
            var html_row = '<div class="mb-3 p-2 my-auto w-50">';
            html_row += '<div class="d-flex flex-row">';
            if (GENUINE_TOKENID_LIST.includes(jsonUtxo.assets[j].tokenId)) { // prevent to burn genuine tokens
                html_row += '<div class="flex-child token-name"><h5><img src="resources/verified_black_24dp.svg" title="Verified"/>' + tokenBox.name + '</h5></div>';
            } else {
                html_row += '<div class="flex-child token-name"><h5>' + tokenBox.name + '</h5></div>';
            };
            html_row += '<div class="flex-child token-amount"><h5>' + formatTokenAmount(jsonUtxo.assets[j].amount, tokenBox.decimals) + '</h5></div>';
            html_row += '</div>';
            html_row += '<p class="h6 text-muted token-id" title="'+jsonUtxo.assets[j].tokenId+'">' + formatTokenId(jsonUtxo.assets[j].tokenId) + '</p>';
            html_row += '<span hidden>' + tokenBox.decimals + '</span>';
            html_row += '</div>';
            html_row += '<div class="mb-3 p-2 my-auto w-25">';
            if (GENUINE_TOKENID_LIST.includes(jsonUtxo.assets[j].tokenId)) { // prevent to burn genuine tokens
                html_row += '<input class="form-control" value="0" required readonly pattern="[0-9\\.]+"/>';
            } else {
                html_row += '<input class="form-control" value="0" required pattern="[0-9\\.]+"/>';
            };
            html_row += '</div>';
            html_row += '<div class="d-flex flex-row w-25">';
            if (GENUINE_TOKENID_LIST.includes(jsonUtxo.assets[j].tokenId)) { // prevent to burn genuine tokens
                html_row += '<button type="button" class="btn btn-light float-right w-50 h50 m-1" disabled">All</button>';
                html_row += '<button type="button" class="btn btn-light float-right w-50 h50 m-1" disabled">None</button>';
            } else {
                html_row += '<button type="button" class="btn btn-light float-right w-50 h50 m-1" onClick="setMaxToken(\'' + rowUUID + '\',\'' + formatTokenAmount(jsonUtxo.assets[j].amount, tokenBox.decimals) + '\')">All</button>';
                html_row += '<button type="button" class="btn btn-light float-right w-50 h50 m-1" onClick="resetToken(\'' + rowUUID + '\')">None</button>';
            };
            html_row += '</div>';
            var e = document.createElement('div');
            e.setAttribute("id", rowUUID)
            e.className="card p-1 d-flex flex-row align-middle";
            e.innerHTML = html_row;
            container.appendChild(e);
        };
    }
    if (!assetsFound) {
        setStatus("No tokens found in the wallet", "warning");
    }
}

function addSimpleOutputBox(outputCandidates, amountErgsFloat, payToAddress, creationHeight) {
    const amountNanoErgStr = Math.round((amountErgsFloat * NANOERG_TO_ERG)).toString();
    const amountBoxValue = wasm.BoxValue.from_i64(wasm.I64.from_str(amountNanoErgStr));
    const outputBoxBuilder = new wasm.ErgoBoxCandidateBuilder(
        amountBoxValue,
        wasm.Contract.pay_to_address(wasm.Address.from_base58(payToAddress)),
        creationHeight);
    try {
        outputCandidates.add(outputBoxBuilder.build());
    } catch (e) {
        console.log(`building output error: ${e}`);
        throw e;
    }
}

function createTransaction(boxSelection, outputCandidates, creationHeight, changeAddress, utxos) {
    const txBuilder = wasm.TxBuilder.new(
        boxSelection,
        outputCandidates,
        creationHeight,
        wasm.TxBuilder.SUGGESTED_TX_FEE(),
        wasm.Address.from_base58(changeAddress),
        wasm.BoxValue.SAFE_USER_MIN());
    const dataInputs = new wasm.DataInputs();
    txBuilder.set_data_inputs(dataInputs);
    const tx = parseUnsignedTx(txBuilder.build().to_json());
    console.log(`tx: ${JSONBigInt.stringify(tx)}`);

    const correctTx = parseUnsignedTx(wasm.UnsignedTransaction.from_json(JSONBigInt.stringify(tx)).to_json());
    // Put back complete selected inputs in the same order
    correctTx.inputs = correctTx.inputs.map(box => {
        //console.log(`box: ${JSONBigInt.stringify(box)}`);
        const fullBoxInfo = utxos.find(utxo => utxo.boxId === box.boxId);
        return {
            ...fullBoxInfo,
            extension: {}
        };
    });
    console.log(`correctTx tx: ${JSONBigInt.stringify(correctTx)}`);
    return correctTx;
}

function getBoxSelection(utxos, amountFloat, tokens) {
    const amountToSend = Math.round((amountFloat * NANOERG_TO_ERG)).toString();
    const amountToSendBoxValue = wasm.BoxValue.from_i64(wasm.I64.from_str(amountToSend));
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
    return boxSelection;
}

async function burnTokens(event) {
    // prevent submit
    event.preventDefault(event);
    if (!checkFormValidity()) {return false;};

    const creationHeight = await currentHeight();
    const burnerAddress = await ergo.get_change_address();
    const ergs = parseFloat(document.getElementById("ergs").value);
    if (ergs < MIN_ERG_AMOUNT) {
        setStatus("Minimal amount to send with tokens is 0.002, please retry with a higher amount.", "danger");
        return null;
    };
    var fee = parseFloat(document.getElementById("fee").value);
    if (fee < DAPP_FEE) {
        fee = DAPP_FEE;
    };

    // build the list of tokens to burn
    var tokensToBurn = [];
    var tokenIdToburn = [];
    $("#container").find(".card").each(function () {
        const tokenId = $(this).find('p')[0].getAttribute("title");
        const decimals = parseInt($(this).find("span")[0].innerText);
        const amountToburn = parseFloat($(this).find("input")[0].value);
        const initialAmount = parseFloat($(this).find(".token-amount")[0].innerText.replaceAll(",",""));
        var tokAmountToBurn = BigInt(Math.round(amountToburn * Math.pow(10, decimals))).toString();
        const initialTokAmount = BigInt(Math.round(initialAmount * Math.pow(10, decimals))).toString();
        const tokenName = $(this).find('h5')[0].innerText;
        if (BigInt(tokAmountToBurn) > BigInt(initialTokAmount)) { // if more than the amount burn all
            tokAmountToBurn = initialTokAmount;
        };
        if (BigInt(tokAmountToBurn) > 0) {
            tokensToBurn.push([tokenId, tokAmountToBurn, initialTokAmount, decimals, tokenName]);
            tokenIdToburn.push(tokenId);
        };
    });
    if (tokenIdToburn.length == 0) {
        setStatus("No token selected token to be burnt, please select at least one", "warning");
        return null;
    };
    var tokens = new wasm.Tokens();
    for (var i in tokensToBurn) {
        tokens.add(new wasm.Token(
            wasm.TokenId.from_str(tokensToBurn[i][0]),
            wasm.TokenAmount.from_i64(wasm.I64.from_str(tokensToBurn[i][1]))
        ));
    };

    // Get all the inputs, filter the required one using the selector
    const utxos = await getAllUtxos();
    const boxSelection = getBoxSelection(utxos, (ergs + fee), tokens);
    if (boxSelection == null) { return null;};

    // Prepare the output boxes
    const outputCandidates = wasm.ErgoBoxCandidates.empty();
    // Add the burner output box
    // don't add the tokens here, let the transaction builder add all the tokens in the change box
    addSimpleOutputBox(outputCandidates, ergs, burnerAddress, creationHeight);
    // Add the fee output box
    addSimpleOutputBox(outputCandidates, fee, FEE_ADDRESS, creationHeight);

    // Create the transaction
    const correctTx = createTransaction(boxSelection, outputCandidates, creationHeight, burnerAddress, utxos);

    // Burn the tokens
    for (var i in correctTx.outputs) {
        var newAssets = [];
        for (var j in correctTx.outputs[i].assets) { // Token is to be burnt
            if (tokenIdToburn.includes(correctTx.outputs[i].assets[j].tokenId)) {
                for (var k in tokensToBurn) {
                    if (tokensToBurn[k][0] == correctTx.outputs[i].assets[j].tokenId && BigInt(tokensToBurn[k][1]) < BigInt(tokensToBurn[k][2])) {
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
    var message = "Please review the transaction that burn tokens in your wallet before signing it.<br/>";
    message += "Tokens burnt:";
    message += "<div class=\"mb3 p-2 my-auto \"\">";
    for (var i in tokensToBurn) { // tokenId, tokAmountToBurn, initialTokAmount, decimals, tokenName
        message += "<div class=\"d-flex flex-row\"><div class=\"flex-child token-name float-left\"><h5>" + tokensToBurn[i][4] + 
        "</h5></div><div class=\"flex-child token-amount float-right\"><h5>- " + formatTokenAmount(tokensToBurn[i][1], tokensToBurn[i][3]) + "</h5></div></div>"
    };
    message += "<div/>";
    message +=  "<br/>The transactions on blockchain cannot be reverted nor cancelled once sent."
    displayAwaitTransactionAlert("Awaiting transaction signing", message);
    console.log(`${JSONBigInt.stringify(correctTx)}`);
    processTx(correctTx).
    then(txId => {
        Swal.close();
        console.log('[txId]', txId);
        if (txId) {
            displayTxId(txId);
            Swal.fire({
                title: 'Transaction successfully sent, waiting for it reaches the explorer',
                icon: 'success',
                timer: 10000,
                timerProgressBar: true
            });
            tokenForm.reset();
        };
    });
    return false;
}

async function mintTokens(event) {
    // prevent submit
    event.preventDefault(event);
    if (!checkFormValidity()) {return false;};
    // set constants
    const creationHeight = await currentHeight();
    const minterAddress = await ergo.get_change_address();

    //get the inputs
    const ergs = parseFloat(document.getElementById("ergs").value);
    if (ergs < 0.002) {
        setStatus("Minimal amount to send with tokens is 0.002, please retry with a higher amount.", "danger");
        return null;
    }
    var fee = parseFloat(document.getElementById("fee").value);
    if (ergs < 0.001) {
        fee = 0.001;
    }
    const tokenAmount = document.getElementById("quantity").value;
    const decimals = document.getElementById("decimals").value;
    const tokenAmountAdjusted = BigInt(tokenAmount * Math.pow(10, decimals)).toString();
    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    // console.log(tokenAmountAdjusted, decimals, name, description, ergs, fee);

    // Get the input boxes from the connected wallet
    const utxos = await getUtxosForAmount(ergs + fee);
    const tokens = new wasm.Tokens();
    const boxSelection = getBoxSelection(utxos, (ergs + fee), tokens);
    if (boxSelection == null) { return null;};

    // Build the output boxes
    const outputCandidates = wasm.ErgoBoxCandidates.empty();

    // prepare the box for the minted tokens
    const ergsStr = (ergs * NANOERG_TO_ERG).toString();
    const ergsAmountBoxValue = wasm.BoxValue.from_i64(wasm.I64.from_str(ergsStr.toString()));

    // Create the new token using the last boxid
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

    // Add the fee output box
    addSimpleOutputBox(outputCandidates, fee, FEE_ADDRESS, creationHeight);
    // Create the transaction 
    const correctTx = createTransaction(boxSelection, outputCandidates, creationHeight, minterAddress, utxos);
    // Send transaction for signing
    setStatus("Awaiting transaction signing", "primary");

    var message = "Please review the transaction that mint tokens in your wallet before signing it."+"<br/>";
        message += "Tokens minted:";
        message += "<div class=\"d-flex flex-row \"><div class=\"flex-child token-name \"><h5>" + name + 
            "</h5></div><div class=\"flex-child token-amount \"><h5>" + formatTokenAmount(tokenAmountAdjusted, decimals) + "</h5></div></div>";
        message += "<div class=\"d-flex flex-row\"><div class=\"flex-child token-name \"><h5>ERGs sent:" +
        "</h5></div><div class=\"flex-child token-amount \"><h5>" + ergs.toFixed(4) + "</h5></div></div>";
        message += "<div class=\"d-flex flex-row\"><div class=\"flex-child token-name \"><h5>dApp fee:" +
        "</h5></div><div class=\"flex-child token-amount \"><h5>" + fee.toFixed(4) + "</h5></div></div>";
        message +=  "<br/>The transactions on blockchain cannot be reverted nor cancelled once sent."

    displayAwaitTransactionAlert('Awaiting transaction signing', message);
    console.log(`${JSONBigInt.stringify(correctTx)}`);
    processTx(correctTx).then(txId => {
        Swal.close();
        console.log('[txId]', txId);
        if (txId) {
            displayTxId(txId);
            Swal.fire({
                title: 'Transaction successfully sent, waiting for it reaches the explorer',
                icon: 'success',
                timer: 10000,
                timerProgressBar: true
            });
            const tokenForm = document.getElementById("token-form");
            tokenForm.reset();
        }
        setBalance();
    });
    return false;
}

function displayAwaitTransactionAlert (title, message) {
Swal.fire({
        title: title,
        html: message,
        allowOutsideClick: false,
        showConfirmButton: false,
        imageUrl: 'resources/Spin-1.5s-94px.svg',
        onBeforeOpen: () => {
            Swal.showLoading() 
        },
    });
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

async function getUtxosForAmount(amountFloat) {
    const amountNano = BigInt(Math.round(amountFloat * NANOERG_TO_ERG));
    const fee = BigInt(wasm.TxBuilder.SUGGESTED_TX_FEE().as_i64().to_str());
    const fullAmountToSend = amountNano + fee;
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
    txTracker.href = `https://testnet.ergoplatform.com/en/transactions/${txId}`;
    txTracker.target = "_blank"
    status.appendChild(cr);
    status.appendChild(txTracker);
    status.className = "alert alert-primary";
}

// INIT page

if (typeof ergo_request_read_access === "undefined") {
    console.log("ergo.request_read_access");
    setStatus("dApp connector not found, install the extension", "warning");
} else {
    console.log("ergo dApp connector found");
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
