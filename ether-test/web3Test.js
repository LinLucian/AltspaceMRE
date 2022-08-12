import Web3 from 'web3';

import express from "express";

const web3 = new Web3('https://mainnet.infura.io/v3/6b4a6b9998e94db182a48a6ccf3dee55');

const abi = [
    {
        "constant": true,
        "inputs": [
            {
                "name": "_tokenId",
                "type": "uint256"
            }
        ],
        "name": "tokenURI",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
    },
];

async function getNFTDetails(contractAddress, tokenId) {
    const contract = new web3.eth.Contract(abi, String(contractAddress));
    const tokenURI = await contract.methods.tokenURI(String(tokenId)).call();
    const filtertokenURI = tokenURI.replace(/^ipfs?:\/\//, '');
    const TokenURIlink = "https://ipfs.io/ipfs/" + filtertokenURI;
    console.log(TokenURIlink);
    const response = await fetch(TokenURIlink);
    const data = await response.json();
    const filterdata = data["image"].replace(/^ipfs?:\/\//, '');
    const final = "https://ipfs.io/ipfs/" + filterdata;
    return final;
}

const app = express();

app.listen(4002, () => {
    console.log("Application started and Listening on port 4002");
});

app.get("/", async (req, res) => {
    if (req.query.contractAddress != undefined && req.query.tokenId != undefined) {
        const final = await getNFTDetails(req.query.contractAddress, req.query.tokenId);
        console.log(final);
        res.send(final);
    }
});
