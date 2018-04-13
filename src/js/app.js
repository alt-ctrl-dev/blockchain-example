App = {
  web3Provider: null,
  contracts: {},
  c_owner: "0x0",
  account: "0x0",
  loading: false,

  init: function () {
    App.initWeb3();
  },

  initWeb3: function () {
    // Initialize web3 and set the provider to the Ganache.
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
      web3 = new Web3(App.web3Provider);
    }

    App.initContract()
    App.getCurrentAccount();
  },

  getCurrentAccount: function () {
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.error(error);
        return;
      }
      // var accountInterval = setInterval(function () {

      // }, 100);

      window.requestAnimationFrame(() => {
        if (web3.eth.accounts[0] !== App.account) {
          App.account = web3.eth.accounts[0];
          App.updateUI();
        }
        App.getCurrentAccount();
      });
    })
  },

  initContract: function () {

    var firstPromise = $.get("BCCToken.json");
    var secondPromise = $.get("BCCRoomBooking.json");

    $.when(firstPromise, secondPromise).done(function (bccTokenArtifact, bccRoomBookingArtifact) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      App.contracts.BCCToken = TruffleContract(bccTokenArtifact[0]);

      // Set the provider for our contract.
      App.contracts.BCCToken.setProvider(App.web3Provider);

      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      App.contracts.BCCRoomBooking = TruffleContract(bccRoomBookingArtifact[0]);

      // Set the provider for our contract.
      App.contracts.BCCRoomBooking.setProvider(App.web3Provider);

      App.getOwner();

    });



    return App.bindEvents();
  },

  getOwner: function () {
    App.contracts.BCCRoomBooking.deployed().then((instance) => {
      return instance.owner();
    }).then((owner) => {
      App.c_owner = owner;
    });
  },

  bindEvents: function () {
    // $(document).on('click', '#transferButton', App.handleTransfer);
    $(document).on('submit', '#offerForm', App.offerRoom);
  },

  updateUI: function () {
    $('#account').text("Account: " + App.account);
    App.getTokenBalance(App.account);
    // // Use our contract to retieve the balance.
    App.getNumberOfRooms();
    if (App.account == App.c_owner) {
      $('#offer-room').show();
      $('#buy_token').hide();
    } else {
      $('#offer-room').hide();
      $('#buy_token').show();
    }
  },

  // handleTransfer: function (event) {
  //   event.preventDefault();

  //   var amount = parseFloat($('#BCCTokenTransferAmount').val());
  //   var toAddress = $('#BCCTokenTransferAddress').val();
  //   // alert('Transfer ' + amount + ' BCC Token to ' + toAddress);

  //   web3.eth.getAccounts(function (error, accounts) {
  //     if (error) {
  //       console.error(error);
  //       return;
  //     }

  //     var account = accounts[0];

  //     App.contracts.BCCRoomBooking.deployed().then(instance => {
  //       var bccToken = instance;
  //       return bccToken.transfer(toAddress, amount, {
  //         from: account
  //       });
  //     }).then(result => {
  //       alert(`Transfer ${amount} BCC Token to ${toAddress}`);
  //       return App.getBalances();
  //     }).catch(err => {
  //       console.error(err.message);
  //     })
  //   })
  // },

  getNumberOfRooms: function () {
    App.contracts.BCCRoomBooking.deployed().then(function (instance) {
      return instance.getNumberOfRooms();
    }).then(function (result) {
      balance = result.c[0];
      $('#numberOfRooms').text("Rooms offered: " + balance);
    }).catch(function (err) {
      console.log(err.message);
      $('#numberOfRooms').text("Rooms offered: " + err.message);
    });
  },

  getTokenBalance: function () {
    App.contracts.BCCToken.deployed().then(function (instance) {
      return instance.balanceOf(App.account);
    }).then(function (result) {
      $('#accountBalance').text(result.c[0] + " BCC token(s) available");
    }).catch(function (err) {
      console.log(err.message);
      $('#accountBalance').text("Could not get tokens");
    });
  },

  offerRoom: function (event) {
    event.preventDefault();
    var _room_name = event.target[0].value;
    var _room_price = parseFloat(event.target[1].value) || 0;
    var _room_description = event.target[2].value;
    var _room_size = event.target[3].value;
    if ((_room_name.trim() === '') || (_room_price === 0)) {
      // nothing to sell
      alert("You have to have a name of the room and price for the room!");
      return;
    }
    App.contracts.BCCRoomBooking.deployed().then(function (instance) {
      return instance.offerRoom(_room_name, _room_description, _room_size, _room_price, {
        from: App.account,
        gas: 500000
      });
    }).then(function (result) {
      console.log(result);
      $('#offerRoom').modal('hide');
    }).catch(function (err) {
      alert("Could not book room");
      console.error(err);
    })

  },
  // reloadRooms: function () {},

  // listenToEvents: function () {},

  // displayRoom: function (id, owner, bookingPerson, name, description, size, price) {},

  // bookRoom: function () {}
};


$(function () {
  $(window).load(function () {
    App.init();
  });
});