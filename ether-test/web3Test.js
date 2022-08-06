import Web3 from 'web3';

import express from "express";

const web3 = new Web3('https://mainnet.infura.io/v3/6b4a6b9998e94db182a48a6ccf3dee55');
const contractAddress = '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D';

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

const tokenId = 5673;

/*async function getTokenURI(token) {
  const contract = new web3.eth.Contract(abi, contractAddress);
  const tokenURI = await contract.methods.tokenURI(tokenId).call();
  const filtertokenURI = tokenURI.replace(/^ipfs?:\/\//, '');
  const TokenURIlink = "https://ipfs.io/ipfs/" + filtertokenURI;
  console.log(TokenURIlink);
  return TokenURIlink;
}*/

const app = express();

app.listen(4002, () => {
  console.log("Application started and Listening on port 4002");
});

app.get("/", async (req, res) => {
  if (req.query.contractAddress != undefined && req.query.tokenId != undefined) {
    const contract = new web3.eth.Contract(abi, String(req.query.contractAddress));
    const tokenURI = await contract.methods.tokenURI(String(req.query.tokenId)).call();
    const filtertokenURI = tokenURI.replace(/^ipfs?:\/\//, '');
    const TokenURIlink = "https://ipfs.io/ipfs/" + filtertokenURI;
    console.log(TokenURIlink);
    const url = "https://ipfs.io/ipfs/QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/5673";
    const response = await fetch(TokenURIlink);
    const data = await response.json();
    const filterdata = data["image"].replace(/^ipfs?:\/\//, '');
    const final = "https://ipfs.io/ipfs/" + filterdata;
    console.log(final);
    res.send(final);
  }
});