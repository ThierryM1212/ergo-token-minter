'use strict';
import { decodeNum, decodeString } from './ergo-related/serializer';
import { getTokenBox } from './ergo-related/explorer';

// return formatted token amount like 6,222,444.420
// amountInt: number of token as provided in utxo (to be divided by 10^decimals)
// decimalsInt: number of decimals of te token
export function formatTokenAmount(amountInt, decimalsInt) {
    if (decimalsInt > 0) {
        const numberAmount = (Number(amountInt)/Number(Math.pow(10, parseInt(decimalsInt)))).toFixed(parseInt(decimalsInt));
        var str = numberAmount.toString().split(".");
        str[0] = str[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return str.join(".");
    } else {
        return amountInt.replace(/\B(?=(\d{3})+(?!\d))/g, ",");;
    }
}

// return shortened string of the token id
export function formatTokenId(tokenId) {
    return tokenId.substring(0,10)+'...'+tokenId.substring(tokenId.length-10,tokenId.length)
}

// return token details
export async function decodeToken(tokenId) {
    let box = await getTokenBox(tokenId)
    console.log("decodeToken",box)
    if (!box) return
    let name = '', description = '', decimals = 0;
    if (box.additionalRegisters.R4) name = await decodeString(box.additionalRegisters.R4);
    if (box.additionalRegisters.R5) description = await decodeString(box.additionalRegisters.R5) ;
    if (box.additionalRegisters.R6) {
        try {
            decimals = await decodeString(box.additionalRegisters.R6);
        } catch(e){
            console.log(e)
        }
    }
    
    return ({ name: name, description: description, decimals: decimals })
}

