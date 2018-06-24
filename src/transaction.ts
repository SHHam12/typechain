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