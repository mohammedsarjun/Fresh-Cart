const walletSchema=require("../../model/walletSchema");
const path=require('path')


async function walletPageRender(req, res) {
    try {
        let wallet = await walletSchema.findOne({ userId: req.session.userId });

        if (!wallet) {
            return res.status(404).send("Wallet not found");
        }

        wallet = wallet.toObject(); // Convert Mongoose document to plain object
        wallet.transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        // Format `createdAt` manually
        for(let i=0;i<wallet.transactions.length;i++){
            wallet.transactions[i].createdAt = new Date(wallet.createdAt).toLocaleString("en-US", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true
            }).replace(",", ""); 
        }
   
        res.status(200).render(path.resolve("views", "UserPages", "accountSettings", "wallet"), { wallet });
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send("Internal Server Error"); // Send a response to avoid hanging
    }
}

module.exports = { walletPageRender };


async function addMoney(req,res) {
    const userWallet=await walletSchema.findOne({userId:req.session.userId})
    if(!userWallet){
        const userWallet = new walletSchema({
            userId:req.session.userId,
           });
        await userWallet.save()
    }

    const wallet=await walletSchema.findOne({userId:req.session.userId})

    wallet.balance=wallet.balance+req.body.transactionDetails.amountPaid
    let transactionDetails={
        amount:req.body.transactionDetails.amountPaid,
        type:"Razorpay",
        transactionDetail:"Money added to wallet"
    }
    wallet.transactions.push(transactionDetails)
    await wallet.save()
}

module.exports={
    addMoney,
    walletPageRender
}