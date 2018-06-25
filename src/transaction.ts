import * as CryptoJS from "crypto-js";

class TxOut { // transaction output

    public address;
    public amount;

    constructor(address:string, amount:number) {
        this.address = address;
        this.amount = amount;
    }
}

class TxIn { // transaction input
    // uTxOutId
    // uTxOutIndex
    // Signature
}

class Transaction {
    // ID
    // txIns[]
    // txOuts[]
}

class UTxOut { // unspend transaction output

    public uTxOutId;
    public uTxOutIndex;
    public address;
    public amount;

    constructor(uTxOutId: number, uTxOutIndex: number, address: string, amount: number) {
        this.uTxOutId = uTxOutId;
        this.uTxOutIndex = uTxOutIndex;
        this.address = address;
        this.amount = amount;
    }
}

let uTxOuts = [];

const getTxId = (tx): string => {
    const txInContent = tx.txIns
        .map(txIn => txIn.uTxOutId + txIn.txOutIndex)
        .reduce((a, b) => a + b, "");

    const txOutContent = tx.txOuts
        .map(txOut => txOut.address + txOut.amount)
        .reduce((a, b) => a + b, "");
    return CryptoJS.SHA256(txInContent + txOutContent).toString();
};