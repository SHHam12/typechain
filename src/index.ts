import * as CryptoJS from "crypto-js";

class Block {
    static calculateBlockHash = (
        index: number,
        previousHash: string,
        timestamp: number,
        data: string,
    ): string =>
        CryptoJS.SHA256(index + previousHash + timestamp + data).toString();

    static validateStructure = (aBlock: Block): boolean =>
        typeof aBlock.index === "number" &&
        typeof aBlock.hash === "string" &&
        typeof aBlock.previousHash === "string" &&
        typeof aBlock.timestamp === "number" &&
        typeof aBlock.data === "string";

    public index: number;
    public hash: string;
    public previousHash: string;
    public data: string;
    public timestamp: number;

    constructor(
        index: number,
        hash: string,
        previousHash: string,
        data: string,
        timestamp: number,
    ){
        this.index = index;
        this.hash = hash;
        this.previousHash = previousHash;
        this.data = data;
        this.timestamp = timestamp;
    }
}

const genesisBlock: Block = new Block(
    0, 
    "27F55B6119B76DC7E9742F1DB6EDAF1750FD5E65EB8CC663823705057166CEC71528076308176",
    "",
    "Genesis",
    1528076308176
);

let blockchain: [Block] = [genesisBlock];

const getBlockchain = (): Block[] => blockchain;

const getLatestBlock = (): Block => blockchain[blockchain.length - 1];

const getNewTimeStamp = (): number => Math.round(new Date().getTime() / 1000);

const createNewBlock = (data: string): Block => {
    const previousBlock: Block = getLatestBlock();
    const newIndex: number = previousBlock.index + 1;
    const newTimestamp: number = getNewTimeStamp();
    const newHash: string = Block.calculateBlockHash(
        newIndex,
        previousBlock.hash,
        newTimestamp,
        data
    );
    const newBlock: Block = new Block(
        newIndex,
        newHash,
        previousBlock.hash,
        data,
        newTimestamp
    );
    addBlock(newBlock);
    return newBlock;
};

const getHashforBlock = (aBlock: Block): string =>
    Block.calculateBlockHash(
        aBlock.index,
        aBlock.previousHash,
        aBlock.timestamp,
        aBlock.data
    );

const isBlockValid = (candidateBlock: Block, previousBlock: Block): boolean => {
    if (!Block.validateStructure(candidateBlock)) {
        return false;
    } else if (previousBlock.index + 1 !== candidateBlock.index) {
        return false;
    } else if (previousBlock.hash !== candidateBlock.previousHash) {
        return false;
    } else if (getHashforBlock(candidateBlock) !== candidateBlock.hash) {
        return false;
    } else {
        return true;
    }
};

const addBlock = (candidateBlock: Block): void => {
    if (isBlockValid(candidateBlock, getLatestBlock())) {
        blockchain.push(candidateBlock);
    }
};

const isChainValid = (candidateChain: Block[]): boolean => {
    const isGenesisValid = (block: Block) => {
        return JSON.stringify(block) === JSON.stringify(genesisBlock);
    };
    if (!isGenesisValid(candidateChain[0])) {
        console.log(
            "The candidateChains's genesisBlock is not the same as our genesisBlock"
        );
        return false;
    }
    for(let i = 1; i < candidateChain.length; i ++) {
        if (isBlockValid(candidateChain[i], candidateChain[i - 1])) {
            return false;
        }
    }
    return true;
}

export {};