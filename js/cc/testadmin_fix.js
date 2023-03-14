function initFintecheeAccount () {
  window.fintecheeAccount = {
    accountId: null,
    tradeToken: null,
    xpub: null,
    syncMessageCount: 0,
    asyncMessageCount: 0,
    info: null
  }
}
initFintecheeAccount();

function showAsyncMsg (brokerName, accountId, message) {
  $("#asyncMessageList").prepend(
    '<a href="#" class="dropdown-item">' +
    '<div class="media">' +
    '<div class="media-body">' +
    '<h3 class="dropdown-item-title">' +
    brokerName + " " + accountId +
    '<span class="float-right text-sm text-danger"><i class="fas fa-star"></i></span>' +
    '</h3>' +
    '<p class="text-sm">' + message + '</p>' +
    '<p class="text-sm text-muted"><i class="far fa-clock mr-1"></i></p>' +
    '</div>' +
    '</div>' +
    '</a>' +
    '<div class="dropdown-divider"></div>'
  );
  window.fintecheeAccount.asyncMessageCount++;
  $("#asyncMessageCount").html(window.fintecheeAccount.asyncMessageCount);
  $("#asyncMessageCount").show();
}

function showSyncMsg (message) {
  $("#syncMessageList").prepend(
    '<div class="dropdown-divider"></div>' +
    '<a href="#" class="dropdown-item">' +
    '<i class="fas fa-envelope mr-2"></i>' + message +
    '<span class="float-right text-muted text-sm"></span>' +
    '</a>'
  );
  window.fintecheeAccount.syncMessageCount++;
  $("#syncMessageCount").html(window.fintecheeAccount.syncMessageCount);
  $("#syncMessageCount").show();
}

function renderSymbolColorBid (data, type, row) {
  if (data > row[window.fintecheeAccount.info.symbols.colIndex.prevBid]) {
    return '<p style="color:#21BA45">' + data + '</p>';
  } else if (data < row[window.fintecheeAccount.info.symbols.colIndex.prevBid]) {
    return '<p style="color:#DB2828">' + data + '</p>';
  } else {
    return '<p style="color:#eee">' + data + '</p>';
  }
}

function renderSymbolColorAsk (data, type, row) {
  if (data > row[window.fintecheeAccount.info.symbols.colIndex.prevAsk]) {
    return '<p style="color:#21BA45">' + data + '</p>';
  } else if (data < row[window.fintecheeAccount.info.symbols.colIndex.prevAsk]) {
    return '<p style="color:#DB2828">' + data + '</p>';
  } else {
    return '<p style="color:#eee">' + data + '</p>';
  }
}

function renderGrpOpenPosColorBid (data, type, row) {
  if (data > row[window.fintecheeAccount.info.groupedOpenPositions.colIndex.prevBid]) {
    return '<p style="color:#21BA45">' + data + '</p>';
  } else if (data < row[window.fintecheeAccount.info.groupedOpenPositions.colIndex.prevBid]) {
    return '<p style="color:#DB2828">' + data + '</p>';
  } else {
    return '<p style="color:#eee">' + data + '</p>';
  }
}

function renderGrpOpenPosColorAsk (data, type, row) {
  if (data > row[window.fintecheeAccount.info.groupedOpenPositions.colIndex.prevAsk]) {
    return '<p style="color:#21BA45">' + data + '</p>';
  } else if (data < row[window.fintecheeAccount.info.groupedOpenPositions.colIndex.prevAsk]) {
    return '<p style="color:#DB2828">' + data + '</p>';
  } else {
    return '<p style="color:#eee">' + data + '</p>';
  }
}

function loadDashboard () {
  fisdk.subscribeToNotification("signing_in_done", function (res) {
    console.log("signing_in_done");
    console.log(res);
    let message = "You signed in."
    window.fintecheeAccount.accountId = res.accountId;
    window.fintecheeAccount.tradeToken = res.tradeToken;
    $("#accountId").html(res.accountId);
    showSyncMsg(message);
  });

  fisdk.subscribeToNotification("failed_to_sign_in", function (res) {
    console.log("failed_to_sign_in");
    console.log(res);
    showSyncMsg("Failed to sign in.");
  });

  fisdk.subscribeToNotification("setting_fix_done", function (res) {
    console.log("setting_fix_done");
    console.log(res);
    showSyncMsg("Setting FIX is done successfully.");
  });

  fisdk.subscribeToNotification("failed_to_set_fix", function (res) {
    console.log("failed_to_set_fix");
    console.log(res);
    showSyncMsg("Failed to set FIX.");
  });

  fisdk.subscribeToNotification("starting_service_done", function (res) {
    console.log("starting_service_done");
    console.log(res);
    showSyncMsg("Starting service is done successfully.");
  });

  fisdk.subscribeToNotification("failed_to_start_service", function (res) {
    console.log("failed_to_start_service");
    console.log(res);
    showSyncMsg("Failed to start service.");
  });

  fisdk.subscribeToNotification("stopping_service_done", function (res) {
    console.log("stopping_service_done");
    console.log(res);
    showSyncMsg("Stopping service is done successfully.");
  });

  fisdk.subscribeToNotification("failed_to_stop_service", function (res) {
    console.log("failed_to_stop_service");
    console.log(res);
    showSyncMsg("Failed to stop service.");
  });

  fisdk.subscribeToNotification("receive_latest_notification", function (res) {
    console.log(res);
    showAsyncMsg(res.brokerName, res.accountId, res.message);
  });

  $("#btnSignIn").on("click", function () {
    fisdk.logout();
    initFintecheeAccount();
    if ($("#passwordSignIn").val() != "") {
      fisdk.signInByPassword($("#brokerNameSignIn").val(), $("#accountIdSignIn").val(), $("#passwordSignIn").val());
    } else {
      fisdk.signInByInvestorPassword($("#brokerNameSignIn").val(), $("#accountIdSignIn").val(), $("#investorPasswordSignIn").val());
    }
    $("#signInDlg").modal("hide");
  });

  $("#btnSetFIX").on("click", function () {
    if (window.fintecheeAccount.tradeToken != null) {
      let idx = Number.isInteger($("#indexFix").val()) ? parseInt($("#indexFix").val()) : -1;
      let lp = Number.isInteger($("#lpFix").val()) ? parseInt($("#lpFix").val()) : -1;
      let fixSettings = {
        index: idx,
        lp: lp,
        uat: $("#chkUat").prop("checked"),
        dataUserName: $("#dataUserNameFix").val(),
        dataPassword: $("#dataPasswordFix").val(),
        dataBrand: $("#dataBrandFix").val(),
        dataAccount: $("#dataAccountFix").val(),
        dataSender: $("#dataSenderFix").val(),
        dataTarget: $("#dataTargetFix").val(),
        dataTargetSub: $("#dataTargetSubFix").val(),
        orderUserName: $("#orderUserNameFix").val(),
        orderPassword: $("#orderPasswordFix").val(),
        orderBrand: $("#orderBrandFix").val(),
        orderAccount: $("#orderAccountFix").val(),
        orderSender: $("#orderSenderFix").val(),
        orderTarget: $("#orderTargetFix").val(),
        orderTargetSub: $("#orderTargetSubFix").val(),
        bSendMarketDataRequestList: $("#chkSendMarketDataRequestList").prop("checked"),
        bFixSettingsDone: $("#chkFixSettingsDone").prop("checked")
      };

      fisdk.setFIX(fixSettings);

      $("#fixSettingsDlg").modal("hide");
    } else {
      console.log("Please login");
    }
  });

  $("#btnStartService").on("click", function () {
    if (window.fintecheeAccount.tradeToken != null) {
      fisdk.startService();

      $("#fixSettingsDlg").modal("hide");
    } else {
      console.log("Please login");
    }
  });

  $("#btnStopService").on("click", function () {
    if (window.fintecheeAccount.tradeToken != null) {
      fisdk.stopService();

      $("#fixSettingsDlg").modal("hide");
    } else {
      console.log("Please login");
    }
  });

  $("#btnSyncMessage").on("click", function () {
    window.fintecheeAccount.syncMessageCount = 0;
    $("#syncMessageCount").html(window.fintecheeAccount.syncMessageCount);
    $("#syncMessageCount").hide();
  });

  $("#btnAsyncMessage").on("click", function () {
    window.fintecheeAccount.asyncMessageCount = 0;
    $("#asyncMessageCount").html(window.fintecheeAccount.asyncMessageCount);
    $("#asyncMessageCount").hide();
  });

}
