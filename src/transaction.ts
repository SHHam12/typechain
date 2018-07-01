import * as CryptoJS from "crypto-js";
import * as elliptic from "elliptic";
import {toHexString} from "./utils";

const ec = new elliptic.ec("secp256k1");

class TxOut { // transaction output

    public address;
    public amount;

    constructor(address:string, amount:number) {
        this.address = address;
        this.amount = amount;
    }
}

class TxIn { // transaction input
    public uTxOutId;
    public uTxOutIndex;
    public signature;

    constructor(uTxOutId:string, uTxOutIndex:number, signature:string) {
        this.uTxOutId = uTxOutId;
        this.uTxOutIndex = uTxOutIndex;
        this.signature = signature;
    }
}

class Transaction {
    public id;
    public txIns;
    public txOuts;

    constructor(id:string, txIns:TxIn[], txOuts:TxOut[]) {
        this.id = id;
        this.txIns = txIns;
        this.txOuts = txOuts;
    }
}

class UTxOut { // unspend transaction output

    public txOutId;
    public txOutIndex;
    public address;
    public amount;

    constructor(txOutId: string, txOutIndex: number, address: string, amount: number) {
        this.txOutId = txOutId;
        this.txOutIndex = txOutIndex;
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

const findUTxOut = (txOutId:string, txOutIndex:number, uTxOutList:UTxOut[]):UTxOut => {
    return uTxOutList.find(
        uTxOut => uTxOut.txOutId === txOutId && uTxOut.txOutIndex === txOutIndex
    );
};

const signTxIn = (tx:Transaction, txInIndex:number, privateKey:string, uTxOut:UTxOut):string => {
    const txIn = tx.txIns[txInIndex];
    const dataToSign = tx.id;
    const referencedUTxOut = findUTxOut(txIn.txOutId, txIn.txOutIndex, uTxOuts);
    if (referencedUTxOut === null) {
        return;
    }
    const key = ec.keyFromPrivate(privateKey, "hex");
    const signature = toHexString(key.sign(dataToSign).toDER());
    return signature;
};

const updateUTxOuts = (newTxs:Transaction[], uTxOutList:UTxOut[]):UTxOut[] => {
    const newUTxOuts = newTxs
        .map(tx => {
            tx.txOuts.map((txOut, index) => {
                new UTxOut(tx.id, index, txOut.address, txOut.amount);
            });
        })
        .reduce((a, b) => a.concat(b), []);

    const spendTxOuts = newTxs
        .map(tx => tx.txIns)
        .reduce((a, b) => a.concat(b), [])
        .map(txIn => new UTxOut(txIn.txOutId, txIn.txOutIndex, "", 0));

    const resultingUTxOuts = uTxOutList.filter(
        uTxO => !findUTxOut(uTxO.txOutId, uTxO.txOutIndex, spendTxOuts))
    .concat(newUTxOuts);

    return resultingUTxOuts;
}

const isTxInStructureValid = (txIn:TxIn):boolean => {
    if (txIn === null) {
        console.log("The txIn appears to be null");
        return false;
    } else {
        return true;
    }
};

const isAddressValid = (address:string) :boolean => {
    if (address.length !== 130) {
        console.log("The address length is not the expected one");
        return false;
    } else if (address.match("^[a-fA-F0-9]+$") === null) {
        console.log("The address doesn't match the hex patter");
        return false;
    } else if (!address.startsWith("04")) {
        console.log("The address doesn't start with 04");
        return false;
    } else {
        return true;
    }
};

const isTxOutStructureValid = (txOut:TxOut):boolean => {
    if (txOut === null) {
        return false;
    } else if (!isAddressValid(txOut.address)) {
        console.log("The txOut doesn't have a valid address");
        return false;
    } else {
        return true;
    }
};

const isTxStructureValid = (tx:Transaction):boolean => {
    if (
        !tx.txIns.map(isTxInStructureValid).reduce((a, b) => a && b, true)
    ) {
        console.log("The structure of one of the txIn is not valid");
        return false;
    } else if (
        !tx.txOuts.map(isTxOutStructureValid).reduce((a, b) => a && b, true)
    ) {
        console.log("The structure of one of the txOut is not valid");
        return false;
    } else {
        return true;
    }
};