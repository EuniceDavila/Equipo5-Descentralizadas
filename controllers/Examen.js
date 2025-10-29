require('dotenv').config({path:require('find-config')('.env')})
const {ethers} = require('ethers')
const contract = require('../artifacts/contracts/Examen.sol/MultiSignPaymentWallet.json')
const {createTransaction, depositToContract, getContract} = require ('../utils/contractHelper')
const{WALLET_CONTRACT} = process.env

//Transacciones
async function sendTransaction(method,params,account) {
    return await createTransaction(WALLET_CONTRACT,contract.abi,method,params,account)

}

async function SubmitTransaction(to,amount,account) {

    const receipt = await sendTransaction('SubmitTransaction',[to,amount],account)
    return receipt
}

async function approveTransaction(txid,account) {
    const receipt = await sendTransaction('approveTransaction',[txid],account)
    return receipt
}

async function getDetailsApproval(txId) {
    const walletContract = getContract(WALLET_CONTRACT, contract.abi)
    const approvals = await walletContract.getDetailsApproval(txId)

    return approvals.map(info => ({
        approver: info.approver,
        timestamp: info.timestamp.toString(),
        date: new Date(info.timestamp.toNumber() * 1000).toLocaleString()
    }))
}

async function executeTransaction(txid,account){
    const receipt = await sendTransaction('executeTransaction', [txid],account)
    return receipt
}
//-----

async function deposit(amount,account) {
    return await depositToContract(WALLET_CONTRACT,contract.abi,amount,account)
}

async function releasePayments(account) {
    const receipt = await sendTransaction('releasePayments',[],account)
    return receipt
}

async function getBalance() {
    const walletContract = getContract(WALLET_CONTRACT,contract.abi)
    const balance = await walletContract.getBalance()
    return balance
}

async function getTransaction() {
    const walletContract = getContract(WALLET_CONTRACT, contract.abi)
    const transactions = await walletContract.getTransaction()

    const formatted = await Promise.all(transactions.map(async (tx, index) => {
        const approvals = await getDetailsApproval(index)
        return {
            to: tx.to,
            amount: ethers.BigNumber.from(tx.amount).toString(),
            approvalCount: ethers.BigNumber.from(tx.approvalCount).toString(),
            executed: tx.executed,
            approvals: approvals
        }
    }))

    return formatted
}

function formatTransaction(info){
    return{
        to:info.to,
        amount: ethers.BigNumber.from(info.amount).toString(),
        approvalCount: ethers.BigNumber.from(info.approvalCount).toString(),
        executed:info.executed
    }
}


async function addProduct(name, price, account) {
  const priceInWei = ethers.utils.parseEther(price.toString());
  const receipt = await sendTransaction('addProduct', [name, priceInWei], account);
  return receipt;
}

async function buyProduct(productId, account) {
  const walletContract = getContract(WALLET_CONTRACT, contract.abi);
  const product = await walletContract.products(productId);
  const price = product.price;

  const tx = await createTransaction(WALLET_CONTRACT, contract.abi, 'buyProduct', [productId], account, price);
  return tx;
}

async function disableProduct(productId, account) {
  const receipt = await sendTransaction('disableProduct', [productId], account);
  return receipt;
}

async function getAllProducts() {
  const walletContract = getContract(WALLET_CONTRACT, contract.abi);
  const products = await walletContract.getAllProducts();

  return products.map(p => ({
    id: Number(p.id),
    name: p.name,
    price: ethers.utils.formatEther(p.price),
    seller: p.seller,
    active: p.active
  }));
}

module.exports={
    deposit,
    SubmitTransaction,
    approveTransaction,
    executeTransaction,
    releasePayments,
    getBalance,
    getTransaction,
    getDetailsApproval,
    addProduct,
    buyProduct,
    disableProduct,
    getAllProducts
}