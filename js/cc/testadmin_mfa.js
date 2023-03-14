function initFintecheeAccount () {
  window.fintecheeAccount = {
    brokerName: null,
    accountId: null,
    tradeToken: null,
    mfaEnabled: null,
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
  fisdk.subscribeToNotification("verification_mfa_required", function (res) {
    console.log("verification_mfa_required");
    console.log(res);
    window.fintecheeAccount.mfaEnabled = true;
    $("#signInDlg").modal("hide");
    $("#mfaToken").val(res.mfaToken);
    $("#verifyMfaDlg").modal("show");
  });

  fisdk.subscribeToNotification("signing_in_done", function (res) {
    console.log("signing_in_done");
    console.log(res);
    let message = "You signed in."
    window.fintecheeAccount.brokerName = res.brokerName;
    window.fintecheeAccount.accountId = res.accountId;
    window.fintecheeAccount.tradeToken = res.tradeToken;
    window.fintecheeAccount.mfaEnabled = res.mfaEnabled;
    $("#accountId").html(res.accountId);
    showSyncMsg(message);
  });

  fisdk.subscribeToNotification("failed_to_sign_in", function (res) {
    console.log("failed_to_sign_in");
    console.log(res);
    showSyncMsg("Failed to sign in.");
  });

  fisdk.subscribeToNotification("triggering_mfa_done", function (res) {
    console.log("triggering_mfa_done");
    console.log(res);
    $("#qrCode").attr("src", res.qrCode);
  });

  fisdk.subscribeToNotification("failed_to_trigger_mfa", function (res) {
    console.log("failed_to_trigger_mfa");
    console.log(res);
  });

  fisdk.subscribeToNotification("enabling_or_disabling_mfa_done", function (res) {
    console.log("enabling_or_disabling_mfa_done");
    console.log(res);
    if (res.mfaEnabled) {
      showSyncMsg("Enabling MFA is done successfully.");
    } else {
      showSyncMsg("Disabling MFA is done successfully.");
    }
  });

  fisdk.subscribeToNotification("failed_to_enable_or_disable_mfa", function (res) {
    console.log("failed_to_enable_or_disable_mfa");
    console.log(res);
    showSyncMsg("Failed to enable or disable MFA.");
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

  $("#btnVerifyMfa").on("click", function () {
    fisdk.signInByMfa($("#brokerNameSignIn").val(), $("#accountIdSignIn").val(), $("#mfaCode").val(), $("#mfaToken").val());
    $("#verifyMfaDlg").modal("hide");
  });

  $("#btnEnableMfa").on("click", function () {
    if (window.fintecheeAccount.tradeToken != null) {
      $("#mfaEnabled").val(true + "");
      fisdk.triggerMfa(window.fintecheeAccount.brokerName, window.fintecheeAccount.accountId, window.fintecheeAccount.tradeToken);
    } else {
      console.log("Please login");
    }
  });

  $("#btnDisableMfa").on("click", function () {
    if (window.fintecheeAccount.tradeToken != null) {
      $("#mfaEnabled").val(false + "");
    } else {
      console.log("Please login");
    }
  });

  $("#btnSetMfa").on("click", function () {
    if (window.fintecheeAccount.tradeToken != null) {
      let bEnableMfa = false;
      if ($("#mfaEnabled").val() == "true") bEnableMfa = true;
      if (bEnableMfa) {
        fisdk.enableOrDisableMfa(window.fintecheeAccount.brokerName, window.fintecheeAccount.accountId, window.fintecheeAccount.tradeToken, true);
      } else {
        fisdk.enableOrDisableMfa(window.fintecheeAccount.brokerName, window.fintecheeAccount.accountId, window.fintecheeAccount.tradeToken, false);
      }
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
