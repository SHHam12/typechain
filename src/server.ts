import * as express from "express";
import * as bodyParser from "body-parser";
import * as morgan from "morgan";
import { getBlockchain, createNewBlock } from "./index";
import { startP2PServer, connectToPeers } from "./p2p";

const PORT = process.env.HTTP_PORT || 3000;

const app = express();
app.use(bodyParser.json());
app.use(morgan("combined"));

app.get("/blocks", (req, res) => {
    res.send(getBlockchain());
});

app.post("/blocks", (req, res) => {
    const { body: { data } } = req;
    const newBlock = createNewBlock(data);
    res.send(newBlock);
});

app.post("/peers", (req, res) => {
    const { body: { peer } } = req;
    connectToPeers(peer);
    res.send();
})

const server = app.listen(PORT, () =>
    console.log(`SH-coin HTTP Server is running on port ${PORT}`)
);

startP2PServer(server);