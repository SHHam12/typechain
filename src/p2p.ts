import * as WebSockets from "ws";

const sockets = [];

const getSockets = () => sockets;

const startP2PServer = (server):void => {
    const wsServer = new WebSockets.Server({ server });
    wsServer.on("connection", ws => {
        initSocketConnection(ws);
    });
    console.log("SH-coin P2P Server Running");
};

const initSocketConnection = (socket):void => {
    sockets.push(socket);
    handleSocketError(socket);
    socket.on("message", (data) => {
       console.log(data);
    });
    setTimeout(() => {
        socket.send("welcome");
    }, 5000);
};

const handleSocketError = (ws):void => {
    const closeSocketConnection = ws => {
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
}
;
export { startP2PServer, connectToPeers }; 