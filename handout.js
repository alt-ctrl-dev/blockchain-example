BCCToken.deployed().then(instance => {bcctoken = instance; console.log("Ready");})
BCCRoomBooking.deployed().then(instance => {roomBooking = instance; console.log("Ready");})

var acct0 = web3.eth.accounts[0]
var acct1 = web3.eth.accounts[1]



roomBooking.offerRoom("Seabook Room", "Seabook Room's Description", "Large", 99)
roomBooking.getRoomsForBooking()

var logAddressbcctoken = bcctoken.LogAddress({fromBlock: 0, toBlock: 'latest'});
logAddressbcctoken.watch(function(error, result) {console.log("bcctoken | LogAddress");console.log(result.args);});

var logUnitbcctoken = bcctoken.LogUint({fromBlock: 0, toBlock: 'latest'});
logUnitbcctoken.watch(function(error, result) {console.log("bcctoken | LogUint");console.log(result.args);});

bcctoken.balanceOf(acct0)
bcctoken.balanceOf(acct1)


roomBooking.purchaseTokens({from: acct1,"value":web3.toWei(1,"ether")})

//roomBooking.purchaseTokens({from: acct1,"value":web3.toWei(1,"ether"),"gas":web3.toWei(.1,"ether")})

bcctoken.balanceOf(acct0)
bcctoken.transfer(acct1, 1000)
bcctoken.balanceOf(acct1)


1 eth = 100 BCC
1 eth = 1000000000000000000 wei


1 BCC = 10000000000000000 wei

