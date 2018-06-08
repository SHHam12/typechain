import * as express from "express";
import * as bodyParser from "body-parser";
import * as morgan from "morgan";
import { getBlockchain, createNewBlock } from "./index";

const PORT = 3000;

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

app.listen(PORT, () => console.log(`SH-coin Server is running on ${PORT}`));