import * as CryptoJS from "crypto-js";
import * as hexToBinary from "hex-to-binary";

class Block {
    static calculateBlockHash = (
        index: number,
        previousHash: string,
        timestamp: number,
        data: string,
        difficulty: number,
        nonce: number
    ): string =>
        CryptoJS.SHA256(index + previousHash + timestamp + data + difficulty, nonce).toString();

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
    public difficulty: number;
    public nonce: number;

    constructor(
        index: number,
        hash: string,
        previousHash: string,
        data: string,
        timestamp: number,
        difficulty: number,
        nonce: number
    ){
        this.index = index;
        this.hash = hash;
        this.previousHash = previousHash;
        this.data = data;
        this.timestamp = timestamp;
        this.difficulty = difficulty;
        this.nonce = nonce;
    }
}

const genesisBlock: Block = new Block(
    0, 
    "27F55B6119B76DC7E9742F1DB6EDAF1750FD5E65EB8CC663823705057166CEC71528076308176",
    "",
    "Genesis",
    1528076308176,
    0,
    0
);

let blockchain: Block[] = [genesisBlock];

const getBlockchain = (): Block[] => blockchain;

const getNewestBlock = (): Block => blockchain[blockchain.length - 1];

const getNewTimeStamp = (): number => Math.round(new Date().getTime() / 1000);

const createNewBlock = (data: string): Block => {
    const previousBlock: Block = getNewestBlock();
    const newBlockIndex: number = previousBlock.index + 1;
    const newTimestamp: number = getNewTimeStamp();
    const newBlock: Block = findBlock(
        newBlockIndex,
        previousBlock.hash,
        newTimestamp,
        data,
        20
    );
    addBlockToChain(newBlock);
    require("./p2p").broadcastNewBlock();
    return newBlock;
};

const findBlock = (
    index: number, 
    previousHash: string, 
    timestamp: number,
    data: string,
    difficulty: number
): Block => {
    let nonce = 0;
    while (true) {
        console.log("Current nonce", nonce);
        const hash = Block.calculateBlockHash(
            index,
            previousHash,
            timestamp,
            data,
            difficulty,
            nonce
        );
        // to do check amount of 0s (hash matches difficulty)
        if (hashMatchesDifficulty(hash, difficulty)) {
            return new Block(
                index,
                hash,
                previousHash,
                data,
                timestamp,
                difficulty,
                nonce
            );
        }
        nonce++
    }
}

const hashMatchesDifficulty = (hash, difficulty): string => {
    const hashInBinary = hexToBinary(hash);
    const requireZeros = "0".repeat(difficulty);
    console.log("Trying difficulty:", difficulty, "with hash", hashInBinary);
    return hashInBinary.startsWith(requireZeros);
}

const getHashforBlock = (aBlock: Block): string =>
    Block.calculateBlockHash(
        aBlock.index,
        aBlock.previousHash,
        aBlock.timestamp,
        aBlock.data,
        aBlock.difficulty,
        aBlock.nonce
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

const replaceChain = (candidateChain: Block[]): boolean => {
    if (isChainValid(candidateChain) && candidateChain.length > getBlockchain().length) {
        blockchain = candidateChain;
        return true;
    } else {
        return false;
    }
};

const addBlockToChain = (candidateBlock: Block): boolean => {
    if (isBlockValid(candidateBlock, getNewestBlock())) {
      getBlockchain().push(candidateBlock);
      return true;
    } else {
      return false;
    }
}; 

export { 
    getBlockchain, 
    createNewBlock, 
    getNewestBlock, 
    replaceChain, 
    addBlockToChain,
    Block 
};