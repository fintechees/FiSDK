window.fintecheeAccount = {
  accountId: null,
  tradeToken: null,
  xpub: null,
  syncMessageCount: 0,
  asyncMessageCount: 0,
  info: null
}

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
  fisdk.subscribeToNotification("verification_code_required", function (res) {
    console.log("verification_code_required");
    console.log(res);
    $("#veriEmailAddrDiv").show();
  });

  fisdk.subscribeToNotification("signing_up_done", function (res) {
    console.log("signing_up_done");
    console.log(res);
    showSyncMsg("Signing up is done successfully.");
    $("#signUpDlg").modal("hide");
  });

  fisdk.subscribeToNotification("failed_to_sign_up", function (res) {
    console.log("failed_to_sign_up");
    console.log(res);
    showSyncMsg("Failed to sign up.");
    $("#signUpDlg").modal("hide");
  });

  fisdk.subscribeToNotification("resending_verification_code_done", function (res) {
    console.log("resending_verification_code_done");
    console.log(res);
  });

  fisdk.subscribeToNotification("failed_to_resend_verification_code", function (res) {
    console.log("failed_to_resend_verification_code");
    console.log(res);
    showSyncMsg("Failed to resend verification code.");
    $("#signUpDlg").modal("hide");
  });

  fisdk.subscribeToNotification("receive_latest_notification", function (res) {
    console.log(res);
    showAsyncMsg(res.brokerName, res.accountId, res.message);
  });

  $("#btnSignUp").on("click", function () {
    fisdk.signUp($("#brokerNameSignUp").val(), $("#emailSignUp").val(), $("#creditsSignUp").val(), $("#refAccountIdSignUp").val());
  });

  $("#btnVeriEmailAddr").on("click", function () {
    fisdk.verifyEmailAddress($("#brokerNameSignUp").val(), $("#emailSignUp").val(), $("#veriCodeSignUp").val());
  });

  $("#btnResendVeriCode").on("click", function () {
    fisdk.resendVerificationCode($("#brokerNameSignUp").val(), $("#emailSignUp").val());
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
