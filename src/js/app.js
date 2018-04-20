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
      //App.web3Provider = new Web3.providers.HttpProvider('https://kovan.infura.io/Drc7BtLI8LQWne78LRV2');
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
      web3 = new Web3(App.web3Provider);
    }
    // if(web3.currentProvider.isMetaMask !== undefined && web3.currentProvider.isMetaMask)
    App.initContract()
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
    return App.bindJQEvents();
  },

  bindJQEvents: function () {
    // $(document).on('click', '#transferButton', App.handleTransfer);
    $(document).on('submit', '#offerForm', App.offerRoom);
  },

  getOwner: function () {
    App.contracts.BCCRoomBooking.deployed().then((instance) => {
      return instance.owner();
    }).then((owner) => {
      App.c_owner = owner;
      App.getCurrentAccount();
      App.listenEvents();
    }).catch(err=>{
      console.error("Could not get owner");
      console.error(err);
    });
  },

  listenEvents: function() {
    App.contracts.BCCRoomBooking.deployed().then((roomBooking) => {
      var offerRoomEvent = roomBooking.OfferRoomEvent({
        fromBlock: 0,
        toBlock: 'latest'
      });
      offerRoomEvent.watch(function (error, result) {
        console.log(result.args);
        App.updateUI();
      });
  
      var bookRoomEvent = roomBooking.BookRoomEvent({
        fromBlock: 0,
        toBlock: 'latest'
      });
      bookRoomEvent.watch(function (error, result) {
        console.log(result.args);
        App.updateUI();
      });
    })
  },

  getCurrentAccount: function () {
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.error(error);
        return;
      }
      var coinbase = accounts[0];
      window.requestAnimationFrame(() => {
        if (coinbase !== App.account) {
          App.account = coinbase;
          App.updateUI();
        }
        App.getCurrentAccount();
      });
    })
  },


  updateUI: function () {
    $('#account').text("Account: " + App.account).css({
      "color": ((App.account == App.c_owner) ? "red" : "black")
    });
    App.getTokenBalance(App.account);
    // // Use our contract to retieve the balance.
    App.getNumberOfRooms();
    App.reloadRooms();
    if (App.account == App.c_owner) {
      $('#offer-room').show();
      $('#buy_token').hide();
    } else {
      $('#offer-room').hide();
      $('#buy_token').show();
    }
  },

  getNumberOfRooms: function () {
    App.contracts.BCCRoomBooking.deployed().then(function (instance) {
      return instance.getNumberOfRooms();
    }).then(function (result) {
      balance = result.toNumber();
      $('#numberOfRooms').text("Rooms offered: " + balance);
    }).catch(function (err) {
      console.log(err.message);
      $('#numberOfRooms').text("Rooms offered: " + err.message);
    });
  },

  getTokenBalance: function () {
    App.contracts.BCCRoomBooking.deployed().then(function (instance) {
      return instance.getBalance(App.account);
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
      alert("You have to have a name of the room and price for the room!");
      return;
    }
    App.contracts.BCCRoomBooking.deployed().then(function (instance) {
      return instance.offerRoom(_room_name, _room_description, _room_size, _room_price, {
        from: App.account,
        gas: 500000
      });
    }).then(function (result) {
      //console.log(result);
      $('#offerRoom').modal('hide');
      App.updateUI();
    }).catch(function (err) {
      alert("Could not book room");
      console.error(err);
    })

  },
  reloadRooms: function () {
    // avoid reentry
    if (App.loading) {
      return;
    }
    App.loading = true;

    // refresh account information because the balance may have changed
    App.contracts.BCCRoomBooking.deployed().then(function (appInstance) {
      appInstance.getRoomsForBooking()
        .then(function (roomIds) {
          // Retrieve and clear the room placeholder
          // console.log(roomIds, roomIds.length);
          var roomRow = $('#roomsRow');
          roomRow.empty();
          roomIds.forEach(roomId => {
            appInstance.rooms(roomId).then(function (room) {
              App.displayRoom(room);
            });
          });
          App.loading = false;
        }).catch(function (err) {
          console.log(err.message);
          App.loading = false;
        });;
    }).catch(function (err) {
      console.log(err.message);
      App.loading = false;
    });
  },

  displayRoom: function ([id, owner, bookingPerson, name, description, size, price]) {
    var roomsRow = $('#roomsRow');
    // console.log(typeof bookingPerson);

    // Retrieve and fill the room template
    var roomTemplate = $('#roomTemplate');
    roomTemplate.find('.panel-title').text(name);
    roomTemplate.find('.room-price').text(price);
    roomTemplate.find('.room-size').text(size);
    roomTemplate.find('.room-description').text(description);
    roomTemplate.find('.btn-booking').attr('data-id', id);
    roomTemplate.find('.btn-booking').attr('data-value', price);
    if (App.account === owner && bookingPerson == "0x0000000000000000000000000000000000000000") {
      var bookingPersonAddress = bookingPerson.substring(0, 5) + "..." + bookingPerson.slice(-5);
      roomTemplate.find('.room-booked-by').text(bookingPersonAddress);
      roomTemplate.find('.btn-booking').prop("disabled", true);
      if (bookingPerson.slice(-5).toString() != "00000") {
        roomTemplate.find('.panel-body').addClass("booked");
        roomTemplate.find('.btn-booking').text("Booked");
      } else {
        roomTemplate.find('.panel-body').removeClass("booked");
        roomTemplate.find('.btn-booking').text("Available");
      }
    } else if (App.account != owner && bookingPerson == "0x0000000000000000000000000000000000000000") {
      roomTemplate.find('.room-booked-by').text("n/a");
      roomTemplate.find('.btn-booking').text("Available");
      roomTemplate.find('.btn-booking').addClass("btn-success");
      roomTemplate.find('.btn-booking').prop("disabled", false);
    } else {
      roomTemplate.find('.room-booked-by').text(bookingPerson.substring(0, 5) + "..." + bookingPerson.slice(-5));
      roomTemplate.find('.btn-booking').text("Booked");
      roomTemplate.find('.btn-booking').prop("disabled", true);
    }
    roomsRow.append(roomTemplate.html());
  },

  bookRoom: function (btn) {
    App.contracts.BCCRoomBooking.deployed().then(function (appInstance) {
        var id = $(btn).attr('data-id');
        var price = $(btn).attr('data-value');
        console.log(id)
        console.log(price)
        return appInstance.bookRoom(id, price, {
          from: App.account
        });
      })
      .then(result => {

      }).catch(err => {
        console.error(err);
        alert('error occured');
      });
  },

  buyTokens: function (event) {
    // event.preventDefault();
    App.contracts.BCCRoomBooking.deployed().then(function (appInstance) {
      var val = $("#tokenprice").val();
      return appInstance.purchaseTokens({value:web3.toWei(val,"ether"),from:App.account});
    })
    .then(result => {
      App.updateUI();
      $('#buyToken').modal('hide');
    }).catch(err => {
      console.error(err);
      alert('error occured');
      $('#buyToken').modal('hide');
    });
    
  }
};


$(function () {
  $(window).load(function () {
    App.init();
  });
});