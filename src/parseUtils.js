'use strict';
import JSONBigInt from 'json-bigint';

export function parseUnsignedTx(str) {
    let json = JSONBigInt.parse(str);
    return {
        id: json.id,
        inputs: json.inputs,
        dataInputs: json.dataInputs,
        outputs: json.outputs.map(output => (parseUtxo(output))),
    };
}
export function parseUtxo(json) {
    var newJson = { ...json };
    if (newJson.assets === null) {
        newJson.assets = [];
    }
    return {
        boxId: newJson.boxId,
        value: newJson.value.toString(),
        ergoTree: newJson.ergoTree,
        assets: newJson.assets.map(asset => ({
            tokenId: asset.tokenId,
            amount: asset.amount.toString(),
        })),
        additionalRegisters: newJson.additionalRegisters,
        creationHeight: newJson.creationHeight,
        transactionId: newJson.transactionId,
        index: newJson.index
    };
}
