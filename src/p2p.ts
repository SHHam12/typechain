import * as WebSockets from "ws";
import { getLastBlock } from "./index";

const sockets = [];

// Message Types
const GET_LATEST = "GET_LATEST";
const GET_ALL = "GET_ALL";
const BLOCKCHAIN_RESPONSE = "BLOCKCHAIN_RESPONSE";

// Message Creators
const getLatest = () => {
    return {
        type: GET_LATEST,
        data: null
    };
};

const getAll = () => {
    return {
        type: GET_ALL,
        data: null
    };
};

const blockchainresponse = (data) => {
    return {
        type: BLOCKCHAIN_RESPONSE,
        data
    };
};

const getSockets = () => sockets;

const startP2PServer = (server):void => {
    const wsServer = new WebSockets.Server({ server });
    wsServer.on("connection", ws => {
        initSocketConnection(ws);
    });
    console.log("SH-coin P2P Server Running");
};

const initSocketConnection = (ws):void => {
    sockets.push(ws);
    handleSocketMessages(ws);
    handleSocketError(ws);
    sendMessage(ws, getLatest());
};

const parseData = (data):any => {
    try {
        return JSON.parse(data)
    } catch (e) {
        console.log(e);
        return null;
    }
};

const handleSocketMessages = (ws):void => {
    ws.on("message", data => {
        const message = parseData(data);
        if (message === null) {
            return;
        }
        console.log(message);
        switch (message.type) {
            case GET_LATEST:
                sendMessage(ws, getLastBlock());
                break;
        }
    });
};

const sendMessage = (ws, message) => ws.send(JSON.stringify(message));

const handleSocketError = (ws):void => {
    const closeSocketConnection = (ws):void => {
        ws.close()
        sockets.splice(sockets.indexOf(ws), 1);
    };
    ws.on("close", () => closeSocketConnection(ws));
    ws.on("error", () => closeSocketConnection(ws));
};

const connectToPeers = (newPeer):void => {
    const ws = new WebSockets(newPeer);
    ws.on("open", () => {
        initSocketConnection(ws);
    });
};

export { startP2PServer, connectToPeers }; 