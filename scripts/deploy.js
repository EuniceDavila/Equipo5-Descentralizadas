const { ethers } = require("hardhat");

async function multiDeploy() {
    const owners = [
        "0xB32A8EBb8a5c0A77feA3f82186E6aaB48A93215B",
        "0xb17c90BD1BC4fdb4c90b7371CDcEb4D8B1bC68ac"
    ];
    const partes = [70, 30];
    const requireApprovals = 2;

    const MultiSignWallet = await ethers.getContractFactory("MultiSignPaymentWallet");
    const wallet = await MultiSignWallet.deploy(owners, requireApprovals, owners, partes);

    const receipt = await wallet.deployTransaction.wait();

    console.log("Dirección del contrato:", wallet.address);
    console.log("Gas usado en el deploy:", receipt.gasUsed.toString());

    console.log("Owners:");
    owners.forEach((owner, i) => console.log(`Owner ${i + 1}: ${owner}`));
}

multiDeploy()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });