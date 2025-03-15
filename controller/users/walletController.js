const walletSchema=require("../../model/walletSchema");

async function addMoney(req,res) {
    console.log(req.body.transactionDetails.amountPaid+"opudan")
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
    }
    wallet.transactions.push(transactionDetails)
    await wallet.save()
 res.status(201).json({
    message:"Amount Successfully Added to Wallet"
 })
}

module.exports={
    addMoney
}