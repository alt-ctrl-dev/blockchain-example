var BCCToken = artifacts.require("BCCToken");
var BCCRoomBooking = artifacts.require("BCCRoomBooking");


// async function doDeploy(deployer) {
//   await deployer.deploy(BCCToken);
//   await deployer.deploy(BCCRoomBooking);
// }


module.exports = (deployer, network, acounts) => {
  //Acounts can be used to initialize contract with different account, by default is it account[0]
  deployer.then(async () => {
    await deployer.deploy(BCCToken);
    console.log(BCCToken.address);
    await deployer.deploy(BCCRoomBooking, BCCToken.address);
  });
};


// module.exports =  (deployer) => {
//   deployer.deploy(BCCToken)
//     .then(function () {
//       return deployer.deploy(BCCRoomBooking).then(function () {
//         console.log("Deployed Done.")
//       })
//     })
// };