import * as WebSockets from "ws";

const sockets = [];

const startP2PServer = server => {
    const wsServer = new WebSockets.Server({ server });
    wsServer.on("connection", ws => {
        console.log(`Hello ${ws}`);
    });
    console.log("SH-coin P2P Server Running");
};

export {startP2PServer}; 