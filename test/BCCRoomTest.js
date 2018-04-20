var BCCRoomBooking = artifacts.require("./BCCRoomBooking.sol");
var BCCToken = artifacts.require("./BCCToken.sol");


// test suite
contract('BCCRoomBooking', function (accounts) {

    it("should be initialized with empty values", function () {
        return BCCRoomBooking.deployed().then(function (instance) {
            return instance.getNumberOfRooms();
        }).then(function (data) {
            assert.equal(data.toNumber(), 0, "no room has been offered");
        })
    });

    it("should have one room being able to offer", function () {

        return BCCRoomBooking.deployed().then(function (instance) {
            var _name = "test room";
            var _description = "test description";
            var _size = "large";
            var _price = 100;
            instance.offerRoom(_name, _description, _size, _price);
            return instance;
        }).then(function (instance) {
            return instance.getRoomsForBooking();
        }).then(function (data) {
            console.log("should have one room being able to offer")
            console.log(data.length)
            assert.equal(data.length, 1, "Should have one room been offered");
        })
    });

    it("should have one room being able to offer", async function () {
        var instance = await BCCRoomBooking.deployed();

        var availRoom = await instance.getRoomsForBooking();

        assert.equal(availRoom.length, 1, "Should have one room being able to offer");
        return instance;
    })


    it("should allow room booking", async function () {

        var acct0 = web3.eth.accounts[0];
        var acct1 = web3.eth.accounts[1];
        var tokenInstance = await BCCToken.deployed();
        await tokenInstance.transfer(acct1, 100)

        var roomBookingInstance = await BCCRoomBooking.deployed();

        var availRoom = await roomBookingInstance.getRoomsForBooking();
        assert.equal(availRoom.length, 1, "correct value before booking");

        var balanceAcct0 = await tokenInstance.balanceOf(acct0);
        var balanceAcct1 = await tokenInstance.balanceOf(acct1);

        var _id = 1;
        var _price = 100;
        var booking = await roomBookingInstance.bookRoom(_id, _price, {
            from: acct1
        });

        // console.log("booking");
        // console.log(booking.logs[0].args);
        
        assert.equal(booking.logs[0].event, "BookRoomEvent", "BookRoomEvent did not trigger");

        availRoom = await roomBookingInstance.getRoomsForBooking();
        assert.equal(availRoom.length, 0, "Could not book room");
        
        var newBalanceAcct0 = await tokenInstance.balanceOf(acct0);
        assert.equal((balanceAcct0.toNumber()+_price), newBalanceAcct0, "Account0 does not have the correct tokens");
        
        var newBalanceAcct1 = await tokenInstance.balanceOf(acct1);
        assert.equal((balanceAcct1.toNumber()-_price), newBalanceAcct1, "Account1 does not have the correct tokens");

        return ;//tokenInstance;
    })

    it("should allow token purchase", async function () {
        var acct0 = web3.eth.accounts[0];
        var acct1 = web3.eth.accounts[1];

        var tokenInstance = await BCCToken.deployed();

        var totalSupply = await tokenInstance.INITIAL_SUPPLY();
        // console.log("totalSupply = "+totalSupply);

        var balanceAcct0 = await tokenInstance.balanceOf(acct0);
        // console.log("balanceAcct0 = "+balanceAcct0);
        assert.equal(balanceAcct0.toNumber(), totalSupply.toNumber(), "Account0 does not have the correct tokens");
        
        var balanceAcct1 = await tokenInstance.balanceOf(acct1);
        // console.log("balanceAcct1 = "+balanceAcct1);
        assert.equal(balanceAcct1.toNumber(), 0, "Account1 does not have the correct tokens");

        var roomBookingInstance = await BCCRoomBooking.deployed();

        await roomBookingInstance.purchaseTokens({from:acct1, gas: 200000});

        // var data = await tokenInstance.buyTokens(acct0,{from:acct1});
        // console.log(data);
        
        var newBalanceAcct0 = await tokenInstance.balanceOf(acct0);
        // console.log("newBalanceAcct0 = "+newBalanceAcct0);
        // assert.equal((balanceAcct0.toNumber()+_price), newBalanceAcct0, "Account0 does not have the correct tokens");
        
        var newBalanceAcct1 = await tokenInstance.balanceOf(acct1);
        // console.log("newBalanceAcct1 = "+newBalanceAcct1);
        // assert.equal((balanceAcct1.toNumber()-_price), newBalanceAcct1, "Account1 does not have the correct tokens");

        return ;
    })

});