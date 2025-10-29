const { ethers } = require("ethers");
const { provider, getWallet, getPublicKey } = require("./accountManager");

async function createTransaction(contractAddress, abi, method, params, account) {
  const etherInterface = new ethers.utils.Interface(abi);
  const wallet = getWallet(account);
  const publickeys = getPublicKey(account);
  const nonce = await provider.getTransactionCount(publickeys, "latest");
  const gasPrice = await provider.getGasPrice();
  const network = await provider.getNetwork();

  const tx = {
    from: publickeys,
    to: contractAddress,
    nonce,
    gasPrice,
    chainId: network.chainId,
    data: etherInterface.encodeFunctionData(method, params)
  };

  if (method === "buyProduct" && params.length > 0) {
    try {
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const productId = params[0];
      const product = await contract.products(productId);
      const price = product.price;

      if (price && price > 0) {
        tx.value = price;
        console.log(`Precio detectado automáticamente: ${ethers.utils.formatEther(price)} ETH`);
      } else {
        console.log("El producto no tiene precio definido o está inactivo.");
      }
    } catch (err) {
      console.error("Error al obtener el precio del producto:", err);
    }
  }

  // Estimar gas y enviar
  tx.gasLimit = await provider.estimateGas(tx);
  const signTx = await wallet.signTransaction(tx);
  const receipt = await provider.sendTransaction(signTx);
  await receipt.wait();
  console.log(`Transacción '${method}' enviada con éxito:`, receipt.hash);
  return receipt;
}

async function depositToContract(contractAddress, abi, amount, account) {
  const wallet = getWallet(account);
  const contract = new ethers.Contract(contractAddress, abi, wallet);
  const tx = await contract.deposit({ value: ethers.utils.parseEther(amount) });
  console.log("Deposit Done:", tx.hash);
  return tx;
}

function getContract(contractAddress, abi) {
  return new ethers.Contract(contractAddress, abi, provider);
}

module.exports = {
  createTransaction,
  depositToContract,
  getContract
};
