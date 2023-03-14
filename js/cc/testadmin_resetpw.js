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
  fisdk.subscribeToNotification("sending_reset_pw_email_done", function (res) {
    console.log("sending_reset_pw_email_done");
    console.log(res);
  });

  fisdk.subscribeToNotification("failed_to_send_reset_pw_email", function (res) {
    console.log("failed_to_send_reset_pw_email");
    console.log(res);
    showSyncMsg("Failed to send reset password token.");
    $("#resetPwDlg").modal("hide");
  });

  fisdk.subscribeToNotification("resetting_password_done", function (res) {
    console.log("resetting_password_done");
    console.log(res);
    showSyncMsg("Resetting password is done successfully.");
    $("#resetPwDlg").modal("hide");
  });

  fisdk.subscribeToNotification("failed_to_reset_password", function (res) {
    console.log("failed_to_reset_password");
    console.log(res);
    showSyncMsg("Failed to reset password.");
    $("#resetPwDlg").modal("hide");
  });

  fisdk.subscribeToNotification("receive_latest_notification", function (res) {
    console.log(res);
    showAsyncMsg(res.brokerName, res.accountId, res.message);
  });

  $("#btnSendResetPwToken").on("click", function () {
    fisdk.sendResetPwEmail($("#brokerNameResetPw").val(), $("#emailResetPw").val());
    $("#resetPwDiv").show();
  });

  $("#btnResetPw").on("click", function () {
    fisdk.resetPassword($("#brokerNameResetPw").val(), $("#emailResetPw").val(), $("#resetPwToken").val());
  });

  $("#btnResendResetPwToken").on("click", function () {
    fisdk.sendResetPwEmail($("#brokerNameResetPw").val(), $("#emailResetPw").val());
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
