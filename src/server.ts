import * as express from "express";
import * as bodyParser from "body-parser";
import * as morgan from "morgan";
import { getBlockchain, createNewBlock } from "./index";
import { startP2PServer } from "./p2p";

declare var process: {
    env: {
        HTTP_PORT: string;
    };
};

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

const server = app.listen(PORT, () =>
    console.log(`SH-coin HTTP Server is running on port ${PORT}`)
);

startP2PServer(server);