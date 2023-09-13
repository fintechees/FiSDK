window.ficfg = {
  isShowDefault: true
}

// account component
window.fiac = {
  storageName: "fiac",
  copyTradingPlatformId: [],
  reset: function () {
    this.brokerName = null;
    this.accountId = null;
    this.tradeToken = null;
    this.investorPassword = null;
    this.mfaEnabled = null;
    this.xpub = null;
    this.syncMessageCount = 0;
    this.asyncMessageCount = 0;
    this.info = null;
    this.ranking = null;
    this.highlight = null;
    this.brHighlight = null;
    this.currBroker = null;
  },
  init: function () {
    this.copyTradingPlatformId["fe"] = "1267340";
    this.reset();

    let that = this;

    // When fisdk.logout() is called, this event will be triggered as well.
    fisdk.subscribeToNotification("loading_done", function (res) {
      console.log(res);
      window.fiac.currBroker = window.fiui.confirmDlg.nextProcessTarget != null ? window.fiui.confirmDlg.nextProcessTarget : window.fiac.brokerName;
      that.info = res;
      that.ranking = null;
      if (!that.info.bManager && that.tradeToken != null) {
        for (let i in that.info.accounts.data) {
          let account = that.info.accounts.data[i];
          let accountId = account[that.info.accounts.colIndex.accountId];
          let xpub = account[that.info.accounts.colIndex.xpub];
          if (accountId === that.accountId) {
            that.xpub = xpub;
            window.fiui.payment.setXpub(xpub);
            break;
          }
        }

        window.fiui.sidebar.hideManagersMenu();
        window.fiui.sidebar.hideExecReportsMenu();
        window.fiui.sidebar.showPaymentMenu();
        window.fiui.sidebar.hideStatsMenu();
        window.fiui.sidebar.hidePrivilegesMenu();
        window.fiui.profile.hideFixSettingsDiv();
        window.fiui.stats.hide();
      } else if (that.info.bManager && that.tradeToken != null) {
        window.fiui.sidebar.showManagersMenu();
        window.fiui.sidebar.showExecReportsMenu();
        window.fiui.sidebar.hidePaymentMenu();
        window.fiui.sidebar.showStatsMenu();
        window.fiui.sidebar.showPrivilegesMenu();
        window.fiui.profile.showFixSettingsDiv();
        window.fiui.payment.hide();
      } else {
        window.fiui.sidebar.hideManagersMenu();
        window.fiui.sidebar.hideExecReportsMenu();
        window.fiui.sidebar.hidePaymentMenu();
        window.fiui.sidebar.hideStatsMenu();
        window.fiui.sidebar.hidePrivilegesMenu();
        window.fiui.profile.hideFixSettingsDiv();
        window.fiui.payment.hide();
        window.fiui.stats.hide();
      }

      window.fiui.brokerList.render(res);
      window.fiui.managerList.render(res);
      window.fiui.accountList.render(res);
      window.fiui.symbolList.render(res);
      window.fiui.openPosList.render(res);
      window.fiui.groupedOpenPosList.render(res);
      window.fiui.fundingHistory.render(res);
      window.fiui.execReports.render(res);
      window.fiui.copyTradeList.render(res);
      window.fiui.privilegeList.render(res);
      window.fiui.championship.render();

      that.calculateStats();
      if (that.info.bManager) {
        that.calculateBrStats();
      }

      window.fiui.loadingDimmer.hide();
    });

    fisdk.subscribeToNotification("failed_to_load", function (res) {
      console.error("failed_to_load");
      if (typeof res.message != "undefined" && res.message != "") {
        console.error(res.message);
        toastr.error(res.message);
      }
      window.fiui.loadingDimmer.hide();
    });
  },
  load: function () {
    let fiac = localStorage.getItem(this.storageName);

    if (fiac != null) {
      let account = JSON.parse(fiac);
      if (account.tradeToken != null) {
        fisdk.signInByTradeToken(account.brokerName, account.accountId, account.tradeToken);
      } else {
        fisdk.signInByInvestorPassword(account.brokerName, account.accountId, account.investorPassword);
      }
    } else {
      window.fiui.loadingDimmer.hide();
    }
  },
  calculateStats: function () {
    let that = this;
    setTimeout(function () {
      that.calculateStats();
    }, 60000);

    if (this.info == null) return;

    this.ranking = [];

    let data = this.info.accounts.data;
    let colIndex = this.info.accounts.colIndex;
    let sortedData = [];
    let traderCnt = 0;
    let balanceSum = 0;
    let marginUsedSum = 0;
    let marginAvailSum = 0;

    for (let i in data) {
      let account = data[i];

      if (account[colIndex.marginUsed] > 0) {
        sortedData.push({
          accountId: account[colIndex.accountId],
          balance: account[colIndex.balance],
          pl: account[colIndex.pl],
          totalPl: (Math.round((account[colIndex.equity] - account[colIndex.balance]) * account[colIndex.toFixed]) / account[colIndex.toFixed]),
          toFixed: account[colIndex.toFixed]
        });
      }

      traderCnt++;
      balanceSum += account[colIndex.balance];
      marginUsedSum += account[colIndex.marginUsed];
      marginAvailSum += account[colIndex.marginAvailable];
    }

    sortedData.sort(function (a, b) {return b.totalPl - a.totalPl});

    if (sortedData.length < 4) {
      this.ranking = sortedData;
    } else {
      this.ranking.push(sortedData[0]);
      this.ranking.push(sortedData[1]);
      this.ranking.push(sortedData[sortedData.length - 2]);
      this.ranking.push(sortedData[sortedData.length - 1]);
    }

    window.fiui.summary.render(traderCnt, Math.round(balanceSum), Math.round(marginUsedSum), Math.round(marginAvailSum));
  },
  calculateBrStats: function () {
    let that = this;

    setTimeout(function () {
      that.calculateBrStats();
    }, 86400000);

    if (this.info == null) return;

    this.brRanking = [];

    let data = this.info.stats;

    for (let i in data) {
      let stats = data[i].stats;

      this.brRanking.push({
        brokerName: data[i].brokerName,
        brBalance: stats[0].data,
        balance: stats[1].data,
        aPl: stats[3].data,
        bPl: stats[4].data,
        time: stats[5].data
      });
    }

    window.fiui.stats.renderBr();
  },
  getStorageName: function () {return this.storageName;},
  calculateProfitFactor: function (trades) {
      let totalProfit = 0;
      let totalLoss = 0;

      for (const trade of trades) {
          if (trade.pl >= 0) {
              totalProfit += trade.pl;
          } else if (trade.pl < 0) {
              totalLoss += Math.abs(trade.pl);
          }
      }

      const profitFactor = totalProfit / totalLoss;
      return profitFactor;
  },
  calculateWinRate: function (trades) {
      const winTrades = trades.filter(trade => trade.pl >= 0);
      const winRate = (winTrades.length / trades.length) * 100;
      return winRate;
  },
  calculateAverageTrade: function (trades) {
      const totalProfitLoss = trades.reduce((acc, trade) => acc + trade.pl, 0);
      const averageTrade = totalProfitLoss / trades.length;
      return averageTrade;
  },
  calculateAverageWin: function (trades) {
      const winTrades = trades.filter(trade => trade.pl >= 0);
      const totalWin = winTrades.reduce((sum, trade) => sum + trade.pl, 0);
      const averageWin = totalWin / winTrades.length;
      return averageWin;
  },
  calculateAverageLoss: function (trades) {
      const lossTrades = trades.filter(trade => trade.pl < 0);
      const totalLoss = lossTrades.reduce((sum, trade) => sum + Math.abs(trade.pl), 0);
      const averageLoss = totalLoss / lossTrades.length;
      return averageLoss;
  },
  calculateWinLossRatio: function (trades) {
      const winTrades = trades.filter(trade => trade.pl >= 0).length;
      const lossTrades = trades.filter(trade => trade.pl < 0).length;
      const winLossRatio = winTrades / lossTrades;
      return winLossRatio;
  },
  calculateRiskRewardRatio: function (trades) {
      const averageWin = this.calculateAverageWin(trades);
      const averageLoss = this.calculateAverageLoss(trades);
      const riskRewardRatio = Math.abs(averageLoss / averageWin);
      return riskRewardRatio;
  },
  calculateTradeCount: function (trades) {
      const tradeCount = trades.length;
      return tradeCount;
  },
  calculateLargestWin: function (trades) {
      const winTrades = trades.filter(trade => trade.pl > 0).map(trade => trade.pl);
      const largestWin = Math.max(...winTrades);
      return largestWin;
  },
  calculateAverageTradeDuration: function (trades) {
      const tradeDurations = trades.map(trade => trade.cTime - trade.time);
      const averageDuration = tradeDurations.reduce((sum, duration) => sum + duration, 0) / tradeDurations.length;
      return averageDuration;
  },
  calculateAverageHoldingPeriod: function (trades) {
      const holdingPeriods = trades.map(trade => trade.cTime - trade.time);
      const averageHoldingPeriod = holdingPeriods.reduce((sum, period) => sum + period, 0) / holdingPeriods.length;
      return averageHoldingPeriod;
  },
  calculateWinningStreak: function (trades) {
      let currentStreak = 0;
      let maxStreak = 0;

      for (const trade of trades) {
          if (trade.pl >= 0) {
              currentStreak++;
              maxStreak = Math.max(maxStreak, currentStreak);
          } else {
              currentStreak = 0;
          }
      }

      return maxStreak;
  },
  calculateLosingStreak: function (trades) {
      let currentStreak = 0;
      let maxStreak = 0;

      for (const trade of trades) {
          if (trade.pl < 0) {
              currentStreak++;
              maxStreak = Math.max(maxStreak, currentStreak);
          } else {
              currentStreak = 0;
          }
      }

      return maxStreak;
  },
  calculateTradeWinPercentage: function (trades) {
      const winTrades = trades.filter(trade => trade.pl >= 0);
      const winPercentage = (winTrades.length / trades.length) * 100;
      return winPercentage;
  },
  calculateExpectancyPerTrade: function (trades) {
      const winRate = this.calculateWinRate(trades);
      const averageWin = this.calculateAverageWin(trades);
      const averageLoss = this.calculateAverageLoss(trades);

      const expectancyPerTrade = (winRate * averageWin) - ((1 - winRate) * averageLoss);
      return expectancyPerTrade;
  },
  calculateMaxDrawdown: function (trades) {
      let peak = 0;
      let maxDrawdown = 0;

      for (const trade of trades) {
          peak = Math.max(peak, trade.totalPl);
          if (peak == 0) continue;
          const drawdown = (peak - trade.totalPl) / peak;
          maxDrawdown = Math.max(maxDrawdown, drawdown);
      }

      return maxDrawdown;
  },
  calculateProfitToDrawdownRatio: function (trades, riskFreeRate) {
      const totalProfit = trades.reduce((sum, trade) => sum + trade.pl, 0);
      const maxDrawdown = this.calculateMaxDrawdown(trades);

      const profitToDrawdownRatio = totalProfit / maxDrawdown;
      return profitToDrawdownRatio;
  },
  calculateExpectancy: function (trades) {
      const positiveTrades = trades.filter(trade => trade.pl >= 0);
      const negativeTrades = trades.filter(trade => trade.pl < 0);

      const winRate = positiveTrades.length / trades.length;
      const averageWin = this.calculateAverageWin(trades);
      const averageLoss = this.calculateAverageLoss(trades);

      const expectancy = (winRate * averageWin) - ((1 - winRate) * averageLoss);
      return expectancy;
  },
  calculateSharpeRatio: function (trades, riskFreeRate) {
      const returns = trades.map(trade => (trade.pl - riskFreeRate) / riskFreeRate);
      const averageReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
      const riskStdDev = Math.sqrt(returns.reduce((sum, ret) => sum + Math.pow(ret - averageReturn, 2), 0) / returns.length);

      const sharpeRatio = (averageReturn / riskStdDev).toFixed(2);
      return sharpeRatio;
  },
  calculateZScore: function (trades) {
      const mean = trades.reduce((sum, trade) => sum + trade.pl, 0) / trades.length;
      const variance = trades.reduce((sum, trade) => sum + Math.pow(trade.pl - mean, 2), 0) / trades.length;
      const stdDev = Math.sqrt(variance);

      const zScores = trades.map(trade => (trade.pl - mean) / stdDev);
      return zScores[zScores.length - 1];
  },
  calculateZIndex: function (trades, benchmark) {
      const excessReturns = trades.map(trade => trade.pl - benchmark);
      const positiveExcessReturns = excessReturns.filter(ret => ret > 0);

      const zIndex = positiveExcessReturns.reduce((sum, ret) => sum + ret, 0) / trades.length;
      return zIndex;
  },
  calculateRewardToVariabilityRatio: function (trades, riskFreeRate) {
      const totalProfit = trades.reduce((sum, trade) => sum + trade.pl, 0);
      const zScores = this.calculateZScore(trades);
      const riskStdDev = Math.sqrt(zScores.reduce((sum, zScore) => sum + Math.pow(zScore, 2), 0) / zScores.length);

      const rewardToVariabilityRatio = totalProfit / riskStdDev;
      return rewardToVariabilityRatio;
  },
  calculateMaxConsecutiveWins: function (trades) {
      let maxConsecutiveWins = 0;
      let currentConsecutiveWins = 0;

      for (const trade of trades) {
          if (trade.pl >= 0) {
              currentConsecutiveWins++;
              maxConsecutiveWins = Math.max(maxConsecutiveWins, currentConsecutiveWins);
          } else {
              currentConsecutiveWins = 0;
          }
      }

      return maxConsecutiveWins;
  },
  calculateMaxConsecutiveLosses: function (trades) {
      let maxConsecutiveLosses = 0;
      let currentConsecutiveLosses = 0;

      for (const trade of trades) {
          if (trade.pl < 0) {
              currentConsecutiveLosses++;
              maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentConsecutiveLosses);
          } else {
              currentConsecutiveLosses = 0;
          }
      }

      return maxConsecutiveLosses;
  },
  calculateMaxConsecutiveProfit: function (trades) {
      let maxConsecutiveProfit = 0;
      let currentConsecutiveProfit = 0;

      for (const trade of trades) {
          if (trade.pl >= 0) {
              currentConsecutiveProfit += trade.pl;
              maxConsecutiveProfit = Math.max(maxConsecutiveProfit, currentConsecutiveProfit);
          } else {
              currentConsecutiveProfit = 0;
          }
      }
      return maxConsecutiveProfit;
  },
  calculateMaxConsecutiveLoss: function (trades) {
      let maxConsecutiveLoss = 0;
      let currentConsecutiveLoss = 0;

      for (const trade of trades) {
          if (trade.pl < 0) {
              currentConsecutiveLoss += trade.pl;
              maxConsecutiveLoss = Math.min(maxConsecutiveLoss, currentConsecutiveLoss);
          } else {
              currentConsecutiveLoss = 0;
          }
      }

      return maxConsecutiveLoss;
  }
}

// layout component
window.fiui = {
  // loading dimmer
  loadingDimmer: {
    show: function () {
      $("#loading").show();
    },
    hide: function () {
      $("#loading").hide();
    }
  },
  // navi sync message
  syncMsg: {
    init: function () {
      $("#btnSyncMessage").on("click", function () {
        window.fiac.syncMessageCount = 0;
        $("#syncMessageCount").html(window.fiac.syncMessageCount);
        $("#syncMessageCount").hide();
      });
    },
    prepend: function (params) {
      $("#syncMessageList").prepend(
        '<a href="#" class="dropdown-item" style="white-space:normal">' +
        '<i class="fas fa-envelope mr-2"></i><p class="p-msg">' + params.message +
        '</p><span class="float-right text-muted text-sm">' + (new Date().toLocaleTimeString()) + '</span>' +
        '</a>' +
        '<div class="dropdown-divider"></div>'
      );

      $("#syncMessageList a").on("click", function() {
        const pText = $(this).find("p.p-msg").text();
        window.fiui.messageDlg.show(pText);
      });

      window.fiac.syncMessageCount++;
      $("#syncMessageCount").html(window.fiac.syncMessageCount);
      $("#syncMessageCount").show();
    }
  },
  // navi async message
  asyncMsg: {
    init: function () {
      $("#btnAsyncMessage").on("click", function () {
        window.fiac.asyncMessageCount = 0;
        $("#asyncMessageCount").html(window.fiac.asyncMessageCount);
        $("#asyncMessageCount").hide();
      });

      let that = this;

      fisdk.subscribeToNotification("receive_latest_notification", function (res) {
        console.log(res);
        if (typeof res.message == "undefined") {
          res.message = "";
        }

        that.prepend(res);
      });
    },
    prepend: function (params) {
      $("#asyncMessageList").prepend(
        '<a href="#" class="dropdown-item">' +
        '<div class="media">' +
        '<div class="media-body">' +
        '<h3 class="dropdown-item-title">' +
        params.brokerName + " " + params.accountId +
        '<span class="float-right text-sm text-danger"><i class="fas fa-star"></i></span>' +
        '</h3>' +
        '<p class="text-sm p-msg">' + params.message + '</p>' +
        '<p class="text-sm text-muted"><i class="far fa-clock mr-1"></i>' + (new Date().toLocaleTimeString()) + '</p>' +
        '</div>' +
        '</div>' +
        '</a>' +
        '<div class="dropdown-divider"></div>'
      );

      $("#asyncMessageList a").on("click", function() {
        const pText = $(this).find("p.p-msg").text();
        window.fiui.messageDlg.show(pText);
      });

      window.fiac.asyncMessageCount++;
      $("#asyncMessageCount").html(window.fiac.asyncMessageCount);
      $("#asyncMessageCount").show();
    }
  },
  // navi profile
  profile: {
    init: function () {
      // todo
    },
    showAccountId: function (accountId) {
      $("#accountId").html(accountId);
    },
    showSettings: function () {
      $("#settingsDiv").show();
    },
    hideSettings: function () {
      $("#settingsDiv").hide();
    },
    showFixSettingsDiv: function () {
      $("#fixSettingsDiv").show();
    },
    hideFixSettingsDiv: function () {
      $("#fixSettingsDiv").hide();
    }
  },
  // sidebar menu
  sidebar: {
    init: function () {
      $("#btnShowBrokers").on("click", function () {
        window.fiui.summary.hide();
        window.fiui.brokerList.show();
        window.fiui.managerList.hide();
        window.fiui.accountList.hide();
        window.fiui.symbolList.hide();
        window.fiui.openPosList.hide();
        window.fiui.groupedOpenPosList.hide();
        window.fiui.fundingHistory.hide();
        window.fiui.execReports.hide();
        window.fiui.payment.hide();
        window.fiui.stats.hide();
        window.fiui.copyTradeList.hide();
        window.fiui.privilegeList.hide();
        window.fiui.championship.hide();
      });

      $("#btnShowManagers").on("click", function () {
        window.fiui.summary.hide();
        window.fiui.brokerList.hide();
        window.fiui.managerList.show();
        window.fiui.accountList.hide();
        window.fiui.symbolList.hide();
        window.fiui.openPosList.hide();
        window.fiui.groupedOpenPosList.hide();
        window.fiui.fundingHistory.hide();
        window.fiui.execReports.hide();
        window.fiui.payment.hide();
        window.fiui.stats.hide();
        window.fiui.copyTradeList.hide();
        window.fiui.privilegeList.hide();
        window.fiui.championship.hide();
        window.fiui.managerList.adjustCol();
      });

      $("#btnShowAccounts").on("click", function () {
        window.fiui.summary.hide();
        window.fiui.brokerList.hide();
        window.fiui.managerList.hide();
        window.fiui.accountList.show();
        window.fiui.symbolList.hide();
        window.fiui.openPosList.hide();
        window.fiui.groupedOpenPosList.hide();
        window.fiui.fundingHistory.hide();
        window.fiui.execReports.hide();
        window.fiui.payment.hide();
        window.fiui.stats.hide();
        window.fiui.copyTradeList.hide();
        window.fiui.privilegeList.hide();
        window.fiui.championship.hide();
        window.fiui.accountList.adjustCol();
      });

      $("#btnShowSymbols").on("click", function () {
        window.fiui.summary.hide();
        window.fiui.brokerList.hide();
        window.fiui.managerList.hide();
        window.fiui.accountList.hide();
        window.fiui.symbolList.show();
        window.fiui.openPosList.hide();
        window.fiui.groupedOpenPosList.hide();
        window.fiui.fundingHistory.hide();
        window.fiui.execReports.hide();
        window.fiui.payment.hide();
        window.fiui.stats.hide();
        window.fiui.copyTradeList.hide();
        window.fiui.privilegeList.hide();
        window.fiui.championship.hide();
      });

      $("#btnShowOpenPositions").on("click", function () {
        window.fiui.summary.hide();
        window.fiui.brokerList.hide();
        window.fiui.managerList.hide();
        window.fiui.accountList.hide();
        window.fiui.symbolList.hide();
        window.fiui.openPosList.show();
        window.fiui.groupedOpenPosList.hide();
        window.fiui.fundingHistory.hide();
        window.fiui.execReports.hide();
        window.fiui.payment.hide();
        window.fiui.stats.hide();
        window.fiui.copyTradeList.hide();
        window.fiui.privilegeList.hide();
        window.fiui.championship.hide();
      });

      $("#btnShowGroupedOpenPos").on("click", function () {
        window.fiui.summary.hide();
        window.fiui.brokerList.hide();
        window.fiui.managerList.hide();
        window.fiui.accountList.hide();
        window.fiui.symbolList.hide();
        window.fiui.openPosList.hide();
        window.fiui.groupedOpenPosList.show();
        window.fiui.fundingHistory.hide();
        window.fiui.execReports.hide();
        window.fiui.payment.hide();
        window.fiui.stats.hide();
        window.fiui.copyTradeList.hide();
        window.fiui.privilegeList.hide();
        window.fiui.championship.hide();
      });

      $("#btnShowFundingHistory").on("click", function () {
        window.fiui.summary.hide();
        window.fiui.brokerList.hide();
        window.fiui.managerList.hide();
        window.fiui.accountList.hide();
        window.fiui.symbolList.hide();
        window.fiui.openPosList.hide();
        window.fiui.groupedOpenPosList.hide();
        window.fiui.fundingHistory.show();
        window.fiui.execReports.hide();
        window.fiui.payment.hide();
        window.fiui.stats.hide();
        window.fiui.copyTradeList.hide();
        window.fiui.privilegeList.hide();
        window.fiui.championship.hide();
      });

      $("#btnShowExecReports").on("click", function () {
        window.fiui.summary.hide();
        window.fiui.brokerList.hide();
        window.fiui.managerList.hide();
        window.fiui.accountList.hide();
        window.fiui.symbolList.hide();
        window.fiui.openPosList.hide();
        window.fiui.groupedOpenPosList.hide();
        window.fiui.fundingHistory.hide();
        window.fiui.execReports.show();
        window.fiui.payment.hide();
        window.fiui.stats.hide();
        window.fiui.copyTradeList.hide();
        window.fiui.privilegeList.hide();
        window.fiui.championship.hide();
        window.fiui.execReports.adjustCol();
      });

      $("#btnShowPayment").on("click", function () {
        window.fiui.summary.hide();
        window.fiui.brokerList.hide();
        window.fiui.managerList.hide();
        window.fiui.accountList.hide();
        window.fiui.symbolList.hide();
        window.fiui.openPosList.hide();
        window.fiui.groupedOpenPosList.hide();
        window.fiui.fundingHistory.hide();
        window.fiui.execReports.hide();
        window.fiui.payment.show();
        window.fiui.stats.hide();
        window.fiui.copyTradeList.hide();
        window.fiui.privilegeList.hide();
        window.fiui.championship.hide();
      });

      $("#btnShowStats").on("click", function () {
        window.fiui.summary.hide();
        window.fiui.brokerList.hide();
        window.fiui.managerList.hide();
        window.fiui.accountList.hide();
        window.fiui.symbolList.hide();
        window.fiui.openPosList.hide();
        window.fiui.groupedOpenPosList.hide();
        window.fiui.fundingHistory.hide();
        window.fiui.execReports.hide();
        window.fiui.payment.hide();
        window.fiui.stats.show();
        window.fiui.copyTradeList.hide();
        window.fiui.privilegeList.hide();
        window.fiui.championship.hide();
      });

      $("#btnShowCopyTrades").on("click", function () {
        window.fiui.summary.hide();
        window.fiui.brokerList.hide();
        window.fiui.managerList.hide();
        window.fiui.accountList.hide();
        window.fiui.symbolList.hide();
        window.fiui.openPosList.hide();
        window.fiui.groupedOpenPosList.hide();
        window.fiui.fundingHistory.hide();
        window.fiui.execReports.hide();
        window.fiui.payment.hide();
        window.fiui.stats.hide();
        window.fiui.copyTradeList.show();
        window.fiui.privilegeList.hide();
        window.fiui.championship.hide();
      });

      $("#btnShowPrivileges").on("click", function () {
        window.fiui.summary.hide();
        window.fiui.brokerList.hide();
        window.fiui.managerList.hide();
        window.fiui.accountList.hide();
        window.fiui.symbolList.hide();
        window.fiui.openPosList.hide();
        window.fiui.groupedOpenPosList.hide();
        window.fiui.fundingHistory.hide();
        window.fiui.execReports.hide();
        window.fiui.payment.hide();
        window.fiui.stats.hide();
        window.fiui.copyTradeList.hide();
        window.fiui.privilegeList.show();
        window.fiui.championship.hide();
      });

      $("#btnShowChampionship").on("click", function () {
        window.fiui.summary.hide();
        window.fiui.brokerList.hide();
        window.fiui.managerList.hide();
        window.fiui.accountList.hide();
        window.fiui.symbolList.hide();
        window.fiui.openPosList.hide();
        window.fiui.groupedOpenPosList.hide();
        window.fiui.fundingHistory.hide();
        window.fiui.execReports.hide();
        window.fiui.payment.hide();
        window.fiui.stats.hide();
        window.fiui.copyTradeList.hide();
        window.fiui.privilegeList.hide();
        window.fiui.championship.show();
      });
    },
    showSummary: function () {
      $("#summarySection").show();
      window.fiui.brokerList.hide();
      window.fiui.managerList.hide();
      window.fiui.accountList.hide();
      window.fiui.symbolList.hide();
      window.fiui.openPosList.hide();
      window.fiui.groupedOpenPosList.hide();
      window.fiui.fundingHistory.hide();
      window.fiui.execReports.hide();
      window.fiui.payment.hide();
      window.fiui.stats.hide();
      window.fiui.copyTradeList.hide();
      window.fiui.privilegeList.hide();
      window.fiui.championship.hide();
    },
    showManagersMenu: function () {
      $("#btnShowManagers").show();
    },
    hideManagersMenu: function () {
      $("#btnShowManagers").hide();
    },
    showExecReportsMenu: function () {
      $("#btnShowExecReports").show();
    },
    hideExecReportsMenu: function () {
      $("#btnShowExecReports").hide();
    },
    showPaymentMenu: function () {
      $("#btnShowPayment").show();
    },
    hidePaymentMenu: function () {
      $("#btnShowPayment").hide();
    },
    showStatsMenu: function () {
      $("#btnShowStats").show();
    },
    hideStatsMenu: function () {
      $("#btnShowStats").hide();
    },
    showPrivilegesMenu: function () {
      $("#btnShowPrivileges").show();
    },
    hidePrivilegesMenu: function () {
      $("#btnShowPrivileges").hide();
    }
  },
  confirmDlg: {
    init: function () {
      let html = `
      <div class="modal fade" id="confirmDlg">
      <div class="modal-dialog">
      <div class="modal-content bg-info">
      <div class="modal-header">
      <h4 class="modal-title">Confirmation</h4>
      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
      <span aria-hidden="true">&times;</span>
      </button>
      </div>
      <div class="modal-body">
      <div class="login-box" style="width:auto">
      <div class="card">
      <div class="card-body login-card-body" style="border:none;background-color:#17a2b8">
      <p class="login-box-msg">Please click Ok if you want to proceed.</p>
      <div class="row">
      <div class="col-12" style="text-align:center">
      <div class="btn-group">
      <button type="button" class="btn btn-default" data-dismiss="modal" aria-label="Close">Cancel</button>
      <button type="button" class="btn btn-primary" id="btnConfirm">Ok</button>
      </div>
      </div>
      </div>
      </div>
      </div>
      </div>
      </div>
      </div>
      </div>
      </div>`;

      $("#confirmSection").html(html);

      let that = this;

      $("#btnConfirm").on("click", function () {
        that.hide();
        that.nextProcessCallback();
      });
    },
    nextProcessTarget: null,
    nextProcessCallback: null,
    show: function () {
      $("#confirmDlg").modal("show");
    },
    hide: function () {
      $("#confirmDlg").modal("hide");
    }
  },
  messageDlg: {
    init: function () {
      let html = `
      <div class="modal fade" id="messageDlg">
      <div class="modal-dialog">
      <div class="modal-content bg-info">
      <div class="modal-header">
      <h4 class="modal-title">Message</h4>
      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
      <span aria-hidden="true">&times;</span>
      </button>
      </div>
      <div class="modal-body">
      <div class="login-box" style="width:auto">
      <div class="card">
      <div class="card-body login-card-body" style="border:none;background-color:#17a2b8">
      <p class="login-box-msg" id="messageContent"></p>
      </div>
      </div>
      </div>
      </div>
      </div>
      </div>
      </div>`;

      $("#messageSection").html(html);
    },
    show: function (message) {
      $("#messageContent").text(message);
      $("#messageDlg").modal("show");
    },
    hide: function () {
      $("#messageDlg").modal("hide");
    }
  }
}

// signUp component
window.fiui.signUp = {
  init: function () {
    let html = `
    <div class="modal fade" id="signUpDlg">
    <div class="modal-dialog">
    <div class="modal-content bg-info">
    <div class="modal-header">
    <h4 class="modal-title">Sign Up</h4>
    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
    <span aria-hidden="true">&times;</span>
    </button>
    </div>
    <div class="modal-body">
    <div class="login-box" style="width:auto">
    <div class="card">
    <div class="card-body login-card-body" style="border:none;background-color:#17a2b8">
    <p class="login-box-msg">Register for an account</p>
    <form id="signUpForm">
    <div class="input-group mb-3">
    <select class="form-control" style="color:#000;background:#eee" id="brokerNameSignUp">
    </select>
    </div>
    <div class="input-group mb-3">
    <input type="email" class="form-control" placeholder="Email Address" style="color:#000;background:#eee" id="emailSignUp">
    <div class="input-group-append">
    <div class="input-group-text" style="background:#eee">
    <span class="fas fa-envelope"></span>
    </div>
    </div>
    </div>
    <div class="panel box box-primary">
      <div class="box-header with-border">
        <p class="box-title" style="text-align:center">
          <a data-toggle="collapse" data-parent="#accordion" href="#optionalSignUp" aria-expanded="false" class="collapsed" style="color:#FFF">
          &lt; Optional &gt;
          </a>
        </p>
      </div>
      <div id="optionalSignUp" class="panel-collapse collapse" aria-expanded="false">
        <div class="box-body">
          <div class="input-group mb-3">
          <input type="text" class="form-control" placeholder="Credits" style="color:#000;background:#eee" id="creditsSignUp">
          <div class="input-group-append">
          <div class="input-group-text" style="background:#eee">
          <span class="fas fa-money-bill-alt"></span>
          </div>
          </div>
          </div>
          <div class="input-group mb-3">
          <input type="text" class="form-control" placeholder="IB Account ID" style="color:#000;background:#eee" id="refAccountIdSignUp">
          <div class="input-group-append">
          <div class="input-group-text" style="background:#eee">
          <span class="fas fa-user"></span>
          </div>
          </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
    <div class="col-12">
    <button type="button" class="btn btn-primary btn-block" id="btnSignUp">Sign Up</button>
    </div>
    </div>
    <div id="veriEmailAddrDiv" style="display:none">
    <div class="dropdown-divider"></div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Verification Code" style="color:#000;background:#eee" id="veriCodeSignUp">
    <span class="input-group-append">
    <button type="button" class="btn btn-primary btn-flat" id="btnResendVeriCode">Resend</button>
    </span>
    </div>
    <div class="row">
    <div class="col-12">
    <button type="button" class="btn btn-primary btn-block" id="btnVeriEmailAddr">Verify Email Address</button>
    </div>
    </div>
    </div>
    </form>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>`;

    $("#signUpSection").html(html);

    let that = this;
    let dropdownList = [];
    for (let i in window.shownBrokerName) {
      dropdownList.push('<option value="' + window.shownBrokerName[i] + '">' + window.signInShownBrokerName[i] + '</option>');
    }
    if (window.ficfg.isShowDefault) {
      dropdownList.push('<option value="Fintechee Demo">Fintechee Demo Server</option>');
    }
    $("#brokerNameSignUp").html(dropdownList.join("\n"));

    fisdk.subscribeToNotification("verification_code_required", function (res) {
      console.log("verification_code_required");
      if (typeof res.message != "undefined" && res.message != "") {
        console.log(res.message);
      }
      $("#veriEmailAddrDiv").show();
      that.show();
    });

    fisdk.subscribeToNotification("signing_up_done", function (res) {
      let params = {
        message: "Please remember your account info. Account ID: " + res.accountId + ", Password: " + res.password + ", Investor Password: " + res.investorPassword
      };
      console.log("signing_up_done");
      console.log(params.message);
      toastr.info(params.message);
      window.fiui.syncMsg.prepend(params);
      that.hide();
    });

    fisdk.subscribeToNotification("failed_to_sign_up", function (res) {
      console.error("failed_to_sign_up");
      if (typeof res.message != "undefined" && res.message != "") {
        console.error(res.message);
        toastr.error(res.message);
      }
    });

    fisdk.subscribeToNotification("resending_verification_code_done", function (res) {
      console.log("resending_verification_code_done");
      if (typeof res.message != "undefined" && res.message != "") {
        console.log(res.message);
        toastr.info(res.message);
      }
      that.show();
    });

    fisdk.subscribeToNotification("failed_to_resend_verification_code", function (res) {
      console.error("failed_to_resend_verification_code");
      if (typeof res.message != "undefined" && res.message != "") {
        console.error(res.message);
        toastr.error(res.message);
      }
    });

    $("#btnSignUp").on("click", function () {
      that.hide();

      fisdk.signUp($("#brokerNameSignUp").val(), $("#emailSignUp").val(), $("#creditsSignUp").val(), $("#refAccountIdSignUp").val());
    });

    $("#btnVeriEmailAddr").on("click", function () {
      fisdk.verifyEmailAddress($("#brokerNameSignUp").val(), $("#emailSignUp").val(), $("#veriCodeSignUp").val());
      $("#btnVeriEmailAddr").prop("disabled", true);
      $("#btnResendVeriCode").prop("disabled", true);
      setTimeout(function () {
        $("#btnVeriEmailAddr").prop("disabled", false);
        $("#btnResendVeriCode").prop("disabled", false);
      }, 60000);
    });

    $("#btnResendVeriCode").on("click", function () {
      fisdk.resendVerificationCode($("#brokerNameSignUp").val(), $("#emailSignUp").val());
      $("#btnVeriEmailAddr").prop("disabled", true);
      $("#btnResendVeriCode").prop("disabled", true);
      setTimeout(function () {
        $("#btnVeriEmailAddr").prop("disabled", false);
        $("#btnResendVeriCode").prop("disabled", false);
      }, 60000);
    });
  },
  show: function () {
    $("#signUpDlg").modal("show");
  },
  hide: function () {
    $("#signUpDlg").modal("hide");
  }
};

// signIn component
window.fiui.signIn = {
  init: function () {
    let signInHtml = `
    <div class="modal fade" id="signInDlg">
    <div class="modal-dialog">
    <div class="modal-content bg-info">
    <div class="modal-header">
    <h4 class="modal-title">Sign In</h4>
    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
    <span aria-hidden="true">&times;</span>
    </button>
    </div>
    <div class="modal-body">
    <div class="login-box" style="width:auto">
    <div class="card">
    <div class="card-body login-card-body" style="border:none;background-color:#17a2b8">
    <p class="login-box-msg">Sign in to start your session</p>
    <form id="loginForm">
    <div class="input-group mb-3">
    <select class="form-control" style="color:#000;background:#eee" id="brokerNameSignIn">
    </select>
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Account ID" style="color:#000;background:#eee" id="accountIdSignIn">
    <div class="input-group-append">
    <div class="input-group-text" style="background:#eee">
    <span class="fas fa-user"></span>
    </div>
    </div>
    </div>
    <div class="input-group mb-3">
    <input type="password" class="form-control" placeholder="Password" style="color:#000;background:#eee" id="passwordSignIn">
    <div class="input-group-append">
    <div class="input-group-text" style="background:#eee">
    <span class="fas fa-lock"></span>
    </div>
    </div>
    </div>
    <div class="input-group mb-3">
    <input type="password" class="form-control" placeholder="Investor Password" style="color:#000;background:#eee" id="investorPasswordSignIn">
    <div class="input-group-append">
    <div class="input-group-text" style="background:#eee">
    <span class="fas fa-lock"></span>
    </div>
    </div>
    </div>
    <div class="row">
    <div class="col-8">
    <div class="icheck-primary">
    <input type="checkbox" id="chkRemember">
    <label for="chkRemember">
    Remember Me
    </label>
    </div>
    </div>
    <div class="col-4">
    <button type="button" class="btn btn-primary btn-block" id="btnSignIn">Sign In</button>
    </div>
    </div>
    </form>
    <p class="mb-1">
    <a href="#" style="color:#fff" id="lnkResetPw">I forgot my password</a>
    </p>
    <p class="mb-0">
    <a href="#" class="text-center" style="color:#fff" id="lnkSignUp">Register a new membership</a>
    </p>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>`;

    $("#signInSection").html(signInHtml);

    let verifyMfaHtml = `
    <div class="modal fade" id="verifyMfaDlg">
    <div class="modal-dialog">
    <div class="modal-content bg-info">
    <div class="modal-header">
    <h4 class="modal-title">MFA</h4>
    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
    <span aria-hidden="true">&times;</span>
    </button>
    </div>
    <div class="modal-body">
    <div class="login-box" style="width:auto">
    <div class="card">
    <div class="card-body login-card-body" style="border:none;background-color:#17a2b8">
    <p class="login-box-msg">Check your MFA APP</p>
    <form id="verifyMfaForm">
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="MFA Code" style="color:#000;background:#eee" id="mfaCode">
    <div class="input-group-append">
    <div class="input-group-text" style="background:#eee">
    <span class="fas fa-envelope"></span>
    </div>
    </div>
    </div>
    <input type="hidden" id="mfaToken">
    <div class="row">
    <div class="col-12">
    <button type="button" class="btn btn-primary btn-block" id="btnVerifyMfa">Sign In</button>
    </div>
    </div>
    </form>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>`;

    $("#verifyMfaSection").html(verifyMfaHtml);

    let that = this;
    let dropdownList = [];
    for (let i in window.shownBrokerName) {
      dropdownList.push('<option value="' + window.shownBrokerName[i] + '">' + window.signInShownBrokerName[i] + '</option>');
    }
    if (window.ficfg.isShowDefault) {
      dropdownList.push('<option value="Fintechee Demo">Fintechee Demo Server</option>');
    }
    $("#brokerNameSignIn").html(dropdownList.join("\n"));

    fisdk.subscribeToNotification("verification_mfa_required", function (res) {
      console.log("verification_mfa_required");
      if (typeof res.message != "undefined" && res.message != "") {
        console.log(res.message);
      }
      window.fiac.mfaEnabled = true;
      window.fiui.loadingDimmer.hide();
      $("#mfaToken").val(res.mfaToken);
      that.showMfa();
      $("#mfaCode").focus();
    });

    fisdk.subscribeToNotification("signing_in_done", function (res) {
      console.log("signing_in_done");
      toastr.info("You signed in successfully.");
      if (typeof res.message != "undefined" && res.message != "") {
        console.log(res.message);
      }
      window.fiac.brokerName = res.brokerName;
      window.fiac.accountId = res.accountId;
      window.fiac.tradeToken = res.tradeToken;
      window.fiac.investorPassword = res.investorPassword;
      window.fiac.mfaEnabled = res.mfaEnabled;
      window.fiac.currBroker = res.brokerName;
      if (res.tradeToken != null) {
        window.fiui.profile.showSettings();
      } else {
        window.fiui.profile.hideSettings();
      }
      window.fiui.sidebar.hidePaymentMenu();
      window.fiui.sidebar.hideStatsMenu();
      window.fiui.payment.hide();
      window.fiui.stats.hide();
      if ($("#chkRemember").prop("checked") || $("#accountIdSignIn").val() == "") {
        localStorage.setItem(window.fiac.getStorageName(), JSON.stringify({
          brokerName: window.fiac.brokerName,
          accountId: window.fiac.accountId,
          tradeToken: window.fiac.tradeToken,
          investorPassword: window.fiac.investorPassword
        }));
      } else {
        if (localStorage.getItem(window.fiac.getStorageName()) != null) {
          localStorage.removeItem(window.fiac.getStorageName());
        }
      }
      window.fiui.profile.showAccountId(res.accountId);
      if (typeof res.message != "undefined" && res.message != "") {
        window.fiui.syncMsg.prepend(res);
      }

      window.fiui.loadingDimmer.hide();
    });

    fisdk.subscribeToNotification("failed_to_sign_in", function (res) {
      console.error("failed_to_sign_in");
      if (typeof res.message != "undefined" && res.message != "") {
        console.error(res.message);
        toastr.error(res.message);
      }
      window.fiui.loadingDimmer.hide();
    });

    $("#btnSignIn").on("click", function () {
      that.signIn();
    });

    $("#passwordSignIn").keypress( function (event) {
      let keycode = (event.keyCode ? event.keyCode : event.which);
      if (keycode == "13") {
        that.signIn();
      }
    });

    $("#investorPasswordSignIn").keypress( function (event) {
      let keycode = (event.keyCode ? event.keyCode : event.which);
      if (keycode == "13") {
        that.signIn();
      }
    });

    $("#btnVerifyMfa").on("click", function () {
      that.signInWithMfa();
    });

    $("#mfaCode").keypress( function (event) {
      let keycode = (event.keyCode ? event.keyCode : event.which);
      if (keycode == "13") {
        that.signInWithMfa();
      }
    });

    $("#lnkResetPw").on("click", function () {
      that.hide();
      window.fiui.resetPw.show();
    });

    $("#lnkSignUp").on("click", function () {
      that.hide();
      window.fiui.signUp.show();
    });
  },
  signIn: function () {
    this.hide();

    fisdk.logout();

    window.fiui.loadingDimmer.show();

    window.fiac.reset();

    if ($("#passwordSignIn").val() != "") {
      fisdk.signInByPassword($("#brokerNameSignIn").val(), $("#accountIdSignIn").val(), $("#passwordSignIn").val());
    } else {
      fisdk.signInByInvestorPassword($("#brokerNameSignIn").val(), $("#accountIdSignIn").val(), $("#investorPasswordSignIn").val());
    }
  },
  signInWithMfa: function () {
    this.hideMfa();
    window.fiui.loadingDimmer.show();

    fisdk.signInByMfa($("#brokerNameSignIn").val(), $("#accountIdSignIn").val(), $("#mfaCode").val(), $("#mfaToken").val());
  },
  show: function () {
    $("#signInDlg").modal("show");
  },
  hide: function () {
    $("#signInDlg").modal("hide");
  },
  showMfa: function () {
    $("#verifyMfaDlg").modal("show");
  },
  hideMfa: function () {
    $("#verifyMfaDlg").modal("hide");
  }
};

// mfa component
window.fiui.mfa = {
  init: function () {
    let html = `
    <div class="modal fade" id="mfaDlg">
    <div class="modal-dialog">
    <div class="modal-content bg-info">
    <div class="modal-header">
    <h4 class="modal-title">MFA</h4>
    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
    <span aria-hidden="true">&times;</span>
    </button>
    </div>
    <div class="modal-body">
    <div class="login-box" style="width:auto">
    <div class="card">
    <div class="card-body login-card-body" style="border:none;background-color:#17a2b8">
    <p class="login-box-msg">Enable or disable MFA</p>
    <form id="mfaForm">
    <div class="input-group mb-3">
    <div class="attachment-block clearfix" style="width:100%;border:none;background-color:#17a2b8">
    <img class="attachment-img" src="/images/mfa.png" alt="Attachment Image" id="qrCode">
    <div class="attachment-pushed">
    <div class="attachment-text">
    MFA can help you improve the security of authentication. Please note that, if you have enabled MFA and start a new operation, regardless of the purpose of the new operation(to enable MFA or to disable MFA), your old MFA status will be reset to DISABLED and your old MFA key can NOT be restored. Fortunately, you can proceed to enable MFA again by scanning a new QR code.<br>
    The QR code contains your MFA secret key, so, please DO NOT share this image with anyone else.
    </div>
    </div>
    </div>
    </div>
    <div class="row">
    <div class="col-12" id="chkConfirmMfaDiv" style="display:none">
    <div class="icheck-primary">
    <input type="checkbox" id="chkConfirmMfa">
    <label for="chkConfirmMfa">
    <p>Have you scanned the QR code?</p>
    </label>
    </div>
    </div>
    <input type="hidden" id="mfaEnabled">
    <div class="col-12" style="text-align:center">
    <div class="btn-group">
    <button type="button" class="btn btn-default" data-dismiss="modal" aria-label="Close">Cancel</button>
    <button type="button" class="btn btn-primary" id="btnDisableMfa">Disable</button>
    <button type="button" class="btn btn-primary" id="btnEnableMfa">Enable</button>
    <button type="button" class="btn btn-primary" id="btnSetMfa" style="display:none">Ok</button>
    </div>
    </div>
    </div>
    </form>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>`;

    $("#mfaSection").html(html);

    let that = this;

    fisdk.subscribeToNotification("triggering_mfa_done", function (res) {
      console.log("triggering_mfa_done");
      if (typeof res.message != "undefined" && res.message != "") {
        console.log(res.message);
      }
      $("#qrCode").attr("src", res.qrCode);
      $("#btnDisableMfa").hide();
      $("#btnEnableMfa").hide();
      $("#btnSetMfa").show();
    });

    fisdk.subscribeToNotification("failed_to_trigger_mfa", function (res) {
      console.error("failed_to_trigger_mfa");
      if (typeof res.message != "undefined" && res.message != "") {
        console.error(res.message);
        toastr.error(res.message);
        window.fiui.syncMsg.prepend(res);
      }
      $("#btnDisableMfa").show();
      $("#btnEnableMfa").show();
      $("#btnSetMfa").hide();
    });

    fisdk.subscribeToNotification("enabling_or_disabling_mfa_done", function (res) {
      console.log("enabling_or_disabling_mfa_done");
      if (typeof res.message != "undefined" && res.message != "") {
        console.log(res.message);
        toastr.info(res.message);
        window.fiui.syncMsg.prepend(res);
      }
      $("#btnDisableMfa").show();
      $("#btnEnableMfa").show();
      $("#btnSetMfa").hide();
      $("#chkConfirmMfaDiv").hide();
      that.hide();
    });

    fisdk.subscribeToNotification("failed_to_enable_or_disable_mfa", function (res) {
      console.error("failed_to_enable_or_disable_mfa");
      if (typeof res.message != "undefined" && res.message != "") {
        console.error(res.message);
        toastr.error(res.message);
        window.fiui.syncMsg.prepend(res);
      }
      $("#btnDisableMfa").show();
      $("#btnEnableMfa").show();
      $("#btnSetMfa").hide();
      $("#chkConfirmMfaDiv").hide();
      that.hide();
    });

    $("#btnEnableMfa").on("click", function () {
      if (window.fiac.tradeToken != null) {
        $("#mfaEnabled").val(true + "");
        fisdk.triggerMfa(window.fiac.brokerName, window.fiac.accountId, window.fiac.tradeToken);
        $("#btnDisableMfa").hide();
        $("#btnEnableMfa").hide();
        $("#chkConfirmMfaDiv").show();
      } else {
        that.hide();

        if (window.fiac.investorPassword != null) {
          toastr.error("You can't enable MFA in the investor mode.");
        } else {
          toastr.error("Please login.");
        }
      }
    });

    $("#btnDisableMfa").on("click", function () {
      if (window.fiac.tradeToken != null) {
        $("#mfaEnabled").val(false + "");
        $("#btnDisableMfa").hide();
        $("#btnEnableMfa").hide();
        $("#btnSetMfa").show();
        $("#chkConfirmMfaDiv").hide();
      } else {
        that.hide();

        if (window.fiac.investorPassword != null) {
          toastr.error("You can't disable MFA in the investor mode.");
        } else {
          toastr.error("Please login.");
        }
      }
    });

    $("#btnSetMfa").on("click", function () {
      if (window.fiac.tradeToken != null) {
        $("#btnSetMfa").hide();

        let bEnableMfa = false;

        if ($("#mfaEnabled").val() == "true") bEnableMfa = true;
        if (bEnableMfa) {
          fisdk.enableOrDisableMfa(window.fiac.brokerName, window.fiac.accountId, window.fiac.tradeToken, true);
        } else {
          fisdk.enableOrDisableMfa(window.fiac.brokerName, window.fiac.accountId, window.fiac.tradeToken, false);
        }
      } else {
        if (window.fiac.investorPassword != null) {
          toastr.error("You can't set MFA in the investor mode.");
        } else {
          toastr.error("Please login.");
        }
        that.hide();
      }
    });
  },
  show: function () {
    $("#mfaDlg").modal("show");
  },
  hide: function () {
    $("#mfaDlg").modal("hide");
  }
};

// reset password component
window.fiui.resetPw = {
  init: function () {
    let html = `
    <div class="modal fade" id="resetPwDlg">
    <div class="modal-dialog">
    <div class="modal-content bg-info">
    <div class="modal-header">
    <h4 class="modal-title">Reset Password</h4>
    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
    <span aria-hidden="true">&times;</span>
    </button>
    </div>
    <div class="modal-body">
    <div class="login-box" style="width:auto">
    <div class="card">
    <div class="card-body login-card-body" style="border:none;background-color:#17a2b8">
    <p class="login-box-msg">Send a token to reset your password</p>
    <form id="resetPwForm">
    <div class="input-group mb-3">
    <select class="form-control" style="color:#000;background:#eee" id="brokerNameResetPw">
    </select>
    </div>
    <div class="input-group mb-3">
    <input type="email" class="form-control" placeholder="Email Address" style="color:#000;background:#eee" id="emailResetPw">
    <div class="input-group-append">
    <div class="input-group-text" style="background:#eee">
    <span class="fas fa-envelope"></span>
    </div>
    </div>
    </div>
    <div class="row">
    <div class="col-12">
    <button type="button" class="btn btn-primary btn-block" id="btnSendResetPwToken">Send Reset Password Token</button>
    </div>
    </div>
    <div id="resetPwDiv" style="display:none">
    <div class="dropdown-divider"></div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Reset Password Token" style="color:#000;background:#eee" id="resetPwToken">
    <span class="input-group-append">
    <button type="button" class="btn btn-primary btn-flat" id="btnResendResetPwToken">Resend</button>
    </span>
    </div>
    <div class="row">
    <div class="col-12">
    <button type="button" class="btn btn-primary btn-block" id="btnResetPw">Reset Password</button>
    </div>
    </div>
    </div>
    </form>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>`;

    $("#resetPwSection").html(html);

    let that = this;
    let dropdownList = [];
    for (let i in window.shownBrokerName) {
      dropdownList.push('<option value="' + window.shownBrokerName[i] + '">' + window.signInShownBrokerName[i] + '</option>');
    }
    if (window.ficfg.isShowDefault) {
      dropdownList.push('<option value="Fintechee Demo">Fintechee Demo Server</option>');
    }
    $("#brokerNameResetPw").html(dropdownList.join("\n"));

    fisdk.subscribeToNotification("sending_reset_pw_email_done", function (res) {
      console.log("sending_reset_pw_email_done");
      if (typeof res.message != "undefined" && res.message != "") {
        console.log(res.message);
        toastr.info(res.message);
      }
      that.show();
    });

    fisdk.subscribeToNotification("failed_to_send_reset_pw_email", function (res) {
      console.error("failed_to_send_reset_pw_email");
      if (typeof res.message != "undefined" && res.message != "") {
        console.error(res.message);
        toastr.error(res.message);
      }
    });

    fisdk.subscribeToNotification("resetting_password_done", function (res) {
      console.log("resetting_password_done");
      if (typeof res.message != "undefined" && res.message != "") {
        console.log(res.message);
        toastr.info(res.message);
      }
    });

    fisdk.subscribeToNotification("failed_to_reset_password", function (res) {
      console.error("failed_to_reset_password");
      if (typeof res.message != "undefined" && res.message != "") {
        console.error(res.message);
        toastr.error(res.message);
      }
    });

    $("#btnSendResetPwToken").on("click", function () {
      $("#resetPwDiv").show();

      fisdk.sendResetPwEmail($("#brokerNameResetPw").val(), $("#emailResetPw").val());
    });

    $("#btnResetPw").on("click", function () {
      that.hide();

      fisdk.resetPassword($("#brokerNameResetPw").val(), $("#emailResetPw").val(), $("#resetPwToken").val());
    });

    $("#btnResendResetPwToken").on("click", function () {
      fisdk.sendResetPwEmail($("#brokerNameResetPw").val(), $("#emailResetPw").val());
      $("#btnSendResetPwToken").prop("disabled", true);
      $("#btnResendResetPwToken").prop("disabled", true);
      setTimeout(function () {
        $("#btnSendResetPwToken").prop("disabled", false);
        $("#btnResendResetPwToken").prop("disabled", false);
      }, 60000);
    });
  },
  show: function () {
    $("#resetPwDlg").modal("show");
  },
  hide: function () {
    $("#resetPwDlg").modal("hide");
  }
};

// change password component
window.fiui.changePw = {
  init: function () {
    let html = `
    <div class="modal fade" id="changePwDlg">
    <div class="modal-dialog">
    <div class="modal-content bg-info">
    <div class="modal-header">
    <h4 class="modal-title">Change Password</h4>
    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
    <span aria-hidden="true">&times;</span>
    </button>
    </div>
    <div class="modal-body">
    <div class="login-box" style="width:auto">
    <div class="card">
    <div class="card-body login-card-body" style="border:none;background-color:#17a2b8">
    <p class="login-box-msg">Change your password and investor password</p>
    <form id="changePwForm">
    <div class="input-group mb-3">
    <input type="password" class="form-control" placeholder="Password" style="color:#000;background:#eee" id="passwordChangePw">
    <div class="input-group-append">
    <div class="input-group-text" style="background:#eee">
    <span class="fas fa-lock"></span>
    </div>
    </div>
    </div>
    <div class="input-group mb-3">
    <input type="password" class="form-control" placeholder="Investor Password" style="color:#000;background:#eee" id="investorPasswordChangePw">
    <div class="input-group-append">
    <div class="input-group-text" style="background:#eee">
    <span class="fas fa-lock"></span>
    </div>
    </div>
    </div>
    <div class="row">
    <button type="button" class="btn btn-primary btn-block" id="btnChangePw">Change Password</button>
    </div>
    </form>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>`;

    $("#changePwSection").html(html);

    let that = this;

    fisdk.subscribeToNotification("changing_password_done", function (res) {
      console.log("changing_password_done");
      if (typeof res.message != "undefined" && res.message != "") {
        console.log(res.message);
        toastr.info(res.message);
        window.fiui.syncMsg.prepend(res);
      }
    });

    fisdk.subscribeToNotification("failed_to_change_password", function (res) {
      console.error("failed_to_change_password");
      if (typeof res.message != "undefined" && res.message != "") {
        console.error(res.message);
        toastr.error(res.message);
        window.fiui.syncMsg.prepend(res);
      }
    });

    $("#btnChangePw").on("click", function () {
      that.hide();

      if (window.fiac.tradeToken != null) {
        fisdk.changePassword(window.fiac.brokerName, window.fiac.accountId, window.fiac.tradeToken, $("#passwordChangePw").val(), $("#investorPasswordChangePw").val());
      } else {
        if (window.fiac.investorPassword != null) {
          toastr.error("You can't change the password in the investor mode.");
        } else {
          toastr.error("Please login.");
        }
      }
    });
  },
  show: function () {
    $("#changePwDlg").modal("show");
  },
  hide: function () {
    $("#changePwDlg").modal("hide");
  }
};

// payment component
window.fiui.payment = {
  init: function () {
    let html = `
    <div class="content-header">
    <div class="container-fluid">
    <div class="row mb-2">
    <div class="col-sm-6">
    <h1 class="m-0">Payments</h1>
    </div>
    <div class="col-sm-6">
    <ol class="breadcrumb float-sm-right">
    <li class="breadcrumb-item"><a href="javascript:window.fiui.sidebar.showSummary()">Home</a></li>
    <li class="breadcrumb-item active">Payments</li>
    </ol>
    </div>
    </div>
    </div>
    </div>
    <section class="content">
    <div class="container-fluid">
    <div class="row">
    <div class="col-md-12">
    <p style="color:#ff5500">The payment gateway connected to the current Demo Server is on the Ethereum Testnet Goerli USDC, not the Mainnet USDC. Please do not use Mainnet USDC for payment transfers.</p>
    </div>
    </div>
    <div class="row">
    <!-- invoice -->
    <div class="col-md-6">
    <div class="card card-primary">
    <div class="card-header">
    <h3 class="card-title">Deposit</h3>
    </div>
    <form>
    <div class="card-body">
    <div class="form-group">
    <label for="fundsInvoice">Funds</label>
    <input type="text" class="form-control" id="fundsInvoice" placeholder="Funds">
    </div>
    <div class="form-group">
    <label for="commentInvoice">Comment</label>
    <input type="text" class="form-control" id="commentInvoice" placeholder="Comment">
    </div>
    <div class="form-group">
    <label for="xpubInvoice">xpub (Your Etherium Public Address)</label>
    <input type="text" class="form-control" id="xpubInvoice" placeholder="xpub">
    </div>
    </div>
    <div class="card-footer">
    <button type="button" class="btn btn-primary" id="btnCreateInvoice">Deposit</button>
    </div>
    </form>
    </div>
    </div>
    <!-- invoice -->
    <!-- payout -->
    <div class="col-md-6">
    <div class="card card-primary">
    <div class="card-header">
    <h3 class="card-title">Withdraw</h3>
    </div>
    <form>
    <div class="card-body">
    <div class="form-group">
    <label for="fundsPayout">Funds</label>
    <input type="text" class="form-control" id="fundsPayout" placeholder="Funds">
    </div>
    <div class="form-group">
    <label for="commentPayout">Comment</label>
    <input type="text" class="form-control" id="commentPayout" placeholder="Comment">
    </div>
    <div class="form-group">
    <label for="xpubPayout">xpub (Your Etherium Public Address)</label>
    <input type="text" class="form-control" id="xpubPayout" placeholder="xpub">
    </div>
    </div>
    <div class="card-footer">
    <button type="button" class="btn btn-primary" id="btnCreatePayout">Withdraw</button>
    </div>
    </form>
    </div>
    </div>
    <!-- payout -->
    </div>
    </div>
    </section>`;

    $("#paymentSection").html(html);

    fisdk.subscribeToNotification("creating_invoice_done", function (res) {
      console.log("creating_invoice_done");

      window.bitcart.showInvoice(res.invoiceId);
    });

    fisdk.subscribeToNotification("failed_to_create_invoice", function (res) {
      console.error("failed_to_create_invoice");
      if (typeof res.message != "undefined" && res.message != "") {
        toastr.error(res.message);
      }
    });

    fisdk.subscribeToNotification("creating_payout_done", function (res) {
      console.log("creating_payout_done");
      console.log(res);
      if (typeof res.message != "undefined" && res.message != "") {
        toastr.info(res.message);
      }
    });

    fisdk.subscribeToNotification("failed_to_create_payout", function (res) {
      console.error("failed_to_create_payout");
      if (typeof res.message != "undefined" && res.message != "") {
        toastr.error(res.message);
      }
    });

    $("#btnCreateInvoice").on("click", function () {
      window.fiui.confirmDlg.nextProcessCallback = function () {
        if (window.fiac.tradeToken != null) {
          fisdk.createInvoice(window.fiac.brokerName, window.fiac.accountId, window.fiac.tradeToken, $("#fundsInvoice").val(), $("#commentInvoice").val(), $("#xpubInvoice").val());
        } else {
          if (window.fiac.investorPassword != null) {
            toastr.error("You can't deposit in the investor mode.");
          } else {
            toastr.error("Please login.");
          }
        }
      }

      window.fiui.confirmDlg.show();
    });

    $("#btnCreatePayout").on("click", function () {
      window.fiui.confirmDlg.nextProcessCallback = function () {
        if (window.fiac.tradeToken != null) {
          fisdk.createPayout(window.fiac.brokerName, window.fiac.accountId, window.fiac.tradeToken, $("#fundsPayout").val(), $("#commentPayout").val(), $("#xpubPayout").val());
        } else {
          if (window.fiac.investorPassword != null) {
            toastr.error("You can't withdraw in the investor mode.");
          } else {
            toastr.error("Please login.");
          }
        }
      }

      window.fiui.confirmDlg.show();
    });
  },
  show: function () {
    $("#paymentSection").show();
  },
  hide: function () {
    $("#paymentSection").hide();
  },
  setXpub: function (xpub) {
    $("#xpubInvoice").val(xpub);
    $("#xpubPayout").val(xpub);
  }
};

// FIX component
window.fiui.fix = {
  init: function () {
    let html = `
    <div class="modal fade" id="fixSettingsDlg">
    <div class="modal-dialog">
    <div class="modal-content bg-info">
    <div class="modal-header">
    <h4 class="modal-title">FIX Settings</h4>
    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
    <span aria-hidden="true">&times;</span>
    </button>
    </div>
    <div class="modal-body">
    <div class="login-box" style="width:auto">
    <div class="card">
    <div class="card-body login-card-body" style="border:none;background-color:#17a2b8">
    <p class="login-box-msg">Please do NOT forget to check the "Settings Done" option.</p>
    <form id="fixSettingsForm">
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Setting ID" style="color:#000;background:#eee" id="indexFix">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Liquidity Provider" style="color:#000;background:#eee" id="lpFix">
    </div>
    <div class="input-group mb-3">
    <div class="icheck-primary">
    <input type="checkbox" id="chkUat">
    <label for="chkUat">
    UAT
    </label>
    </div>
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Data UserName" style="color:#000;background:#eee" id="dataUserNameFix">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Data Password" style="color:#000;background:#eee" id="dataPasswordFix">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Data Brand" style="color:#000;background:#eee" id="dataBrandFix">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Data AccountId" style="color:#000;background:#eee" id="dataAccountFix">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Data SenderCompID" style="color:#000;background:#eee" id="dataSenderFix">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Data TargetCompID" style="color:#000;background:#eee" id="dataTargetFix">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Data TargetSubID" style="color:#000;background:#eee" id="dataTargetSubFix">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Trade UserName" style="color:#000;background:#eee" id="orderUserNameFix">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Trade Password" style="color:#000;background:#eee" id="orderPasswordFix">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Trade Brand" style="color:#000;background:#eee" id="orderBrandFix">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Trade AccountId" style="color:#000;background:#eee" id="orderAccountFix">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Trade SenderCompID" style="color:#000;background:#eee" id="orderSenderFix">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Trade TargetCompID" style="color:#000;background:#eee" id="orderTargetFix">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Trade TargetSubID" style="color:#000;background:#eee" id="orderTargetSubFix">
    </div>
    <div class="input-group mb-3">
    <div class="icheck-primary">
    <input type="checkbox" id="chkSendMarketDataRequestList">
    <label for="chkSendMarketDataRequestList">
    Send Data Request List
    </label>
    </div>
    </div>
    <div class="input-group mb-3">
    <div class="icheck-primary">
    <input type="checkbox" id="chkFixSettingsDone">
    <label for="chkFixSettingsDone">
    Settings Done
    </label>
    </div>
    </div>
    <div class="row">
    <div class="col-12" style="text-align:center">
    <div class="btn-group">
    <button type="button" class="btn btn-default" data-dismiss="modal" aria-label="Close">Cancel</button>
    <button type="button" class="btn btn-primary" id="btnSetFIX">Set FIX</button>
    <button type="button" class="btn btn-primary" id="btnStartService">Start Service</button>
    <button type="button" class="btn btn-primary" id="btnStopService">Stop Service</button>
    </div>
    </div>
    </div>
    </form>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>`;

    $("#fixSettingsSection").html(html);

    let that = this;

    fisdk.subscribeToNotification("setting_fix_done", function (res) {
      console.log("setting_fix_done");
      if (typeof res.message != "undefined" && res.message != "") {
        console.log(res.message);
        toastr.info(res.message);
        window.fiui.syncMsg.prepend(res);
      }
    });

    fisdk.subscribeToNotification("failed_to_set_fix", function (res) {
      console.error("failed_to_set_fix");
      if (typeof res.message != "undefined" && res.message != "") {
        console.error(res.message);
        toastr.error(res.message);
        window.fiui.syncMsg.prepend(res);
      }
    });

    fisdk.subscribeToNotification("starting_service_done", function (res) {
      console.log("starting_service_done");
      if (typeof res.message != "undefined" && res.message != "") {
        console.log(res.message);
        toastr.info(res.message);
        window.fiui.syncMsg.prepend(res);
      }
      window.fiui.loadingDimmer.hide();
    });

    fisdk.subscribeToNotification("failed_to_start_service", function (res) {
      console.error("failed_to_start_service");
      if (typeof res.message != "undefined" && res.message != "") {
        console.error(res.message);
        toastr.error(res.message);
        window.fiui.syncMsg.prepend(res);
      }
      window.fiui.loadingDimmer.hide();
    });

    fisdk.subscribeToNotification("stopping_service_done", function (res) {
      console.log("stopping_service_done");
      if (typeof res.message != "undefined" && res.message != "") {
        console.log(res.message);
        toastr.info(res.message);
        window.fiui.syncMsg.prepend(res);
      }
      window.fiui.loadingDimmer.hide();
    });

    fisdk.subscribeToNotification("failed_to_stop_service", function (res) {
      console.error("failed_to_stop_service");
      if (typeof res.message != "undefined" && res.message != "") {
        console.error(res.message);
        toastr.error(res.message);
        window.fiui.syncMsg.prepend(res);
      }
      window.fiui.loadingDimmer.hide();
    });

    $("#btnSetFIX").on("click", function () {
      that.hide();

      if (window.fiac.tradeToken != null) {
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
      } else {
        if (window.fiac.investorPassword != null) {
          toastr.error("You can't set FIX in the investor mode.");
        } else {
          toastr.error("Please login.");
        }
      }
    });

    $("#btnStartService").on("click", function () {
      that.hide();

      if (window.fiac.tradeToken != null) {
        window.fiui.loadingDimmer.show();

        fisdk.startService();
      } else {
        if (window.fiac.investorPassword != null) {
          toastr.error("You can't start the service in the investor mode.");
        } else {
          toastr.error("Please login.");
        }
      }
    });

    $("#btnStopService").on("click", function () {
      that.hide();

      if (window.fiac.tradeToken != null) {
        window.fiui.loadingDimmer.show();

        fisdk.stopService();
      } else {
        if (window.fiac.investorPassword != null) {
          toastr.error("You can't stop the service in the investor mode.");
        } else {
          toastr.error("Please login.");
        }
      }
    });
  },
  show: function () {
    $("#fixSettingsDlg").modal("show");
  },
  hide: function () {
    $("#fixSettingsDlg").modal("hide");
  }
};

// white label component
window.fiui.brokerList = {
  init: function () {
    let brokerListHtml = `
    <div class="content-header">
    <div class="container-fluid">
    <div class="row mb-2">
    <div class="col-sm-6">
    <h1 class="m-0">Brokers</h1>
    </div>
    <div class="col-sm-6">
    <ol class="breadcrumb float-sm-right">
    <li class="breadcrumb-item"><a href="javascript:window.fiui.sidebar.showSummary()">Home</a></li>
    <li class="breadcrumb-item active">Brokers</li>
    </ol>
    </div>
    </div>
    </div>
    </div>
    <section class="content">
    <div class="container-fluid">
    <div class="row">
    <div class="col-12">
    <div class="card">
    <div class="card-header">
    <h3 class="card-title">White Label List</h3>
    </div>
    <div class="card-body">
    <table id="brokerList" class="table table-bordered table-striped">
    </table>
    </div>
    <div class="card-footer">
    <button type="button" class="btn btn-primary" id="btnShowBroker">Add</button>
    </div>
    </div>
    </div>
    </div>
    </div>
    </section>`;

    $("#brokerSection").html(brokerListHtml);

    let brokerProfileHtml = `
    <div class="modal fade" id="brokerProfileDlg">
    <div class="modal-dialog">
    <div class="modal-content bg-info">
    <div class="modal-header">
    <h4 class="modal-title">Broker Profile</h4>
    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
    <span aria-hidden="true">&times;</span>
    </button>
    </div>
    <div class="modal-body">
    <div class="login-box" style="width:auto">
    <div class="card">
    <div class="card-body login-card-body" style="border:none;background-color:#17a2b8">
    <p class="login-box-msg">Leave the fields blank when you have no plan to change them.</p>
    <form id="brokerProfileForm">
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Broker ID" style="color:#000;background:#eee" id="brokerIdBp">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Broker Name" style="color:#000;background:#eee" id="BrokerNameBp">
    </div>
    <div class="input-group mb-3">
    <input type="email" class="form-control" placeholder="Contact Email Address" style="color:#000;background:#eee" id="contactBp">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Description" style="color:#000;background:#eee" id="descBp">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Balance" style="color:#000;background:#eee" id="balanceBp">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Level" style="color:#000;background:#eee" id="levelBp">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Commission Opening Long" style="color:#000;background:#eee" id="commissionOpeningLongBp">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Commission Closing Long" style="color:#000;background:#eee" id="commissionClosingLongBp">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Commission Opening Short" style="color:#000;background:#eee" id="commissionOpeningShortBp">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Commission Closing Short" style="color:#000;background:#eee" id="commissionClosingShortBp">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Ask Mark Up" style="color:#000;background:#eee" id="askMarkUpBp">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Bid Mark Up" style="color:#000;background:#eee" id="bidMarkUpBp">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Currency" style="color:#000;background:#eee" id="currencyBp">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="ToFixed" style="color:#000;background:#eee" id="toFixedBp">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Withdrawal Limit" style="color:#000;background:#eee" id="withdrawalLimitBp">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Margin Call Level" style="color:#000;background:#eee" id="marginCallLevelBp">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Margin Closeout Level" style="color:#000;background:#eee" id="marginCloseoutLevelBp">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="SMTP" style="color:#000;background:#eee" id="smtpBp">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="SMTP Port" style="color:#000;background:#eee" id="smtpPortBp">
    </div>
    <div class="input-group mb-3">
    <input type="password" class="form-control" placeholder="SMTP Password" style="color:#000;background:#eee" id="emailPasswordBp">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Credits Onboard(true or false)" style="color:#000;background:#eee" id="creditsOnboardBp">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Credits Onboard Limit" style="color:#000;background:#eee" id="creditsOnboardLimitBp">
    </div>
    <div class="input-group mb-3">
    <input type="password" class="form-control" placeholder="Crypto Payment Gateway Key" style="color:#000;background:#eee" id="cryptoPaymentGatewayKeyBp">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Payment Gateway Store Id" style="color:#000;background:#eee" id="paymentGatewayStoreIdBp">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Payment Gateway Wallet Id" style="color:#000;background:#eee" id="paymentGatewayWalletIdBp">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Success Redirect URL" style="color:#000;background:#eee" id="pgSuccessRedirectUrlBp">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Identifier(please type remove if you want to remove this field in the database)" style="color:#000;background:#eee" id="identifierBp">
    </div>
    <div class="row">
    <div class="col-12" style="text-align:center">
    <div class="btn-group">
    <button type="button" class="btn btn-default" data-dismiss="modal" aria-label="Close">Cancel</button>
    <button type="button" class="btn btn-primary" id="btnAddBroker">Add</button>
    <button type="button" class="btn btn-primary" id="btnModifyBroker">Modify</button>
    </div>
    </div>
    </div>
    </form>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>`;

    $("#brokerProfileSection").html(brokerProfileHtml);

    let downloadReportHtml = `
    <div class="modal fade" id="downloadWlReportDlg">
    <div class="modal-dialog">
    <div class="modal-content bg-info">
    <div class="modal-header">
    <h4 class="modal-title">Download Report</h4>
    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
    <span aria-hidden="true">&times;</span>
    </button>
    </div>
    <div class="modal-body">
    <div class="login-box" style="width:auto">
    <div class="card">
    <div class="card-body login-card-body" style="border:none;background-color:#17a2b8">
    <p class="login-box-msg">Download the report of the specific white label</p>
    <form id="downloadWlReportForm">
    <div class="input-group mb-3">
    <div class="form-group col-12" style="padding-left:0px;padding-right:0px">
    <div class="input-group date" data-target-input="nearest">
    <input type="text" placeholder="Start Date" class="form-control datetimepicker-input" data-target="#startDtDwr" style="color:#000;background:#eee" id="startDtDwr" />
    <div class="input-group-append" data-target="#startDtDwr" data-toggle="datetimepicker">
    <div class="input-group-text"><i class="fa fa-calendar" style="color:#fff"></i></div>
    </div>
    </div>
    </div>
    </div>
    <div class="input-group mb-3">
    <div class="form-group col-12" style="padding-left:0px;padding-right:0px">
    <div class="input-group date" data-target-input="nearest">
    <input type="text" placeholder="End Date" class="form-control datetimepicker-input" data-target="#endDtDwr" style="color:#000;background:#eee" id="endDtDwr" />
    <div class="input-group-append" data-target="#endDtDwr" data-toggle="datetimepicker">
    <div class="input-group-text"><i class="fa fa-calendar" style="color:#fff"></i></div>
    </div>
    </div>
    </div>
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Broker Name" style="color:#000;background:#eee" id="brokerNameDwr">
    </div>
    <input type="hidden" id="mainWhiteLabelDwr">
    <div class="row">
    <div class="col-12" style="text-align:center">
    <div class="btn-group">
    <button type="button" class="btn btn-default" data-dismiss="modal" aria-label="Close">Cancel</button>
    <button type="button" class="btn btn-primary" id="btnDownloadWlReport">Download</button>
    </div>
    </div>
    </div>
    </form>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>`;

    $("#downloadWlReportSection").html(downloadReportHtml);

    let that = this;

    fisdk.subscribeToNotification("broker_updated", function (res) {
      console.log("broker_updated");
      console.log(res);
      if (typeof res.message != "undefined" && res.message != "") {
        toastr.info(res.message);
      }
    });

    fisdk.subscribeToNotification("adding_broker_done", function (res) {
      console.log("adding_broker_done");
      console.log(res);
      if (typeof res.message != "undefined" && res.message != "") {
        toastr.info(res.message);
      }
      if (typeof that.brokerTable != "undefined") {
        that.brokerTable.row.add(res.newBroker).draw(false);
      }
    });

    fisdk.subscribeToNotification("failed_to_add_broker", function (res) {
      console.error("failed_to_add_broker");
      if (typeof res.message != "undefined" && res.message != "") {
        console.error(res.message);
        toastr.error(res.message);
      }
    });

    fisdk.subscribeToNotification("modifying_broker_done", function (res) {
      console.log("modifying_broker_done");
      console.log(res);
      if (typeof res.message != "undefined" && res.message != "") {
        toastr.info(res.message);
      }
      if (typeof that.brokerDataTable != "undefined") {
        that.brokerDataTable.fnDeleteRow(res.rowId);
      }
      if (typeof that.brokerTable != "undefined") {
        that.brokerTable.row.add(res.broker).draw(false);
      }
    });

    fisdk.subscribeToNotification("failed_to_modify_broker", function (res) {
      console.error("failed_to_modify_broker");
      if (typeof res.message != "undefined" && res.message != "") {
        console.error(res.message);
        toastr.error(res.message);
      }
    });

    fisdk.subscribeToNotification("removing_broker_done", function (res) {
      console.log("removing_broker_done");
      console.log(res);
      if (typeof res.message != "undefined" && res.message != "") {
        toastr.info(res.message);
      }
      if (typeof that.brokerDataTable != "undefined") {
        that.brokerDataTable.fnDeleteRow(res.rowId);
      }
    });

    fisdk.subscribeToNotification("failed_to_remove_broker", function (res) {
      console.error("failed_to_remove_broker");
      if (typeof res.message != "undefined" && res.message != "") {
        console.error(res.message);
        toastr.error(res.message);
      }
    });

    $("#btnShowBroker").on("click", function () {
      if (window.fiac.tradeToken != null) {
        that.showDlg();
      } else {
        toastr.error("Please login.");
      }
    });

    $("#btnAddBroker").on("click", function () {
      that.hideDlg();

      if (window.fiac.tradeToken != null) {
        let newBroker = null;
        try {
          newBroker = that.getBroker();
        } catch (e) {
          toastr.error(e.message);
        }

        fisdk.addBroker(newBroker);
      } else {
        if (window.fiac.investorPassword != null) {
          toastr.error("You can't create the broker profile in the investor mode.");
        } else {
          toastr.error("Please login.");
        }
      }
    });

    $("#btnModifyBroker").on("click", function () {
      that.hideDlg();

      if (window.fiac.tradeToken != null) {
        let newBroker = null;
        try {
          newBroker = that.getBroker();
        } catch (e) {
          toastr.error(e.message);
        }

        fisdk.modifyBroker(newBroker);
      } else {
        if (window.fiac.investorPassword != null) {
          toastr.error("You can't modify the broker profile in the investor mode.");
        } else {
          toastr.error("Please login.");
        }
      }
    });

    $("#btnDownloadWlReport").on("click", function () {
      that.hideReport();

      if ($("#mainWhiteLabelDwr").val() == "false") {
        fisdk.downloadWhiteLabelReport(window.fiac.brokerName, window.fiac.accountId, window.fiac.tradeToken, $("#brokerNameDwr").val(), Math.floor(new Date($("#startDtDwr").val()).getTime() / 1000), Math.floor(new Date($("#endDtDwr").val()).getTime() / 1000));
      } else {
        fisdk.downloadMainWhiteLabelReport(window.fiac.brokerName, window.fiac.accountId, window.fiac.tradeToken, $("#brokerNameDwr").val(), Math.floor(new Date($("#startDtDwr").val()).getTime() / 1000), Math.floor(new Date($("#endDtDwr").val()).getTime() / 1000));
      }
    });
  },
  getBroker: function () {
    if ($("#brokerIdBp").val() == "") {
      throw new Error("Broker ID is required.");
    }
    if ($("#BrokerNameBp").val() == "") {
      throw new Error("Broker Name is required.");
    }
    if ($("#contactBp").val() == "") {
      throw new Error("Contact Email Address is required.");
    }
    let levelBp = -1
    if ($("#levelBp").val() != "") {
      levelBp = parseInt($("#levelBp").val());
    }
    let commissionOpeningLongBp = -1
    if ($("#commissionOpeningLongBp").val() != "") {
      commissionOpeningLongBp = parseFloat($("#commissionOpeningLongBp").val());
    }
    let commissionClosingLongBp = -1
    if ($("#commissionClosingLongBp").val() != "") {
      commissionClosingLongBp = parseFloat($("#commissionClosingLongBp").val());
    }
    let commissionOpeningShortBp = -1
    if ($("#commissionOpeningShortBp").val() != "") {
      commissionOpeningShortBp = parseFloat($("#commissionOpeningShortBp").val());
    }
    let commissionClosingShortBp = -1
    if ($("#commissionClosingShortBp").val() != "") {
      commissionClosingShortBp = parseFloat($("#commissionClosingShortBp").val());
    }
    let askMarkUpBp = -1
    if ($("#askMarkUpBp").val() != "") {
      askMarkUpBp = parseFloat($("#askMarkUpBp").val());
    }
    let bidMarkUpBp = -1
    if ($("#bidMarkUpBp").val() != "") {
      bidMarkUpBp = parseFloat($("#bidMarkUpBp").val());
    }
    let withdrawalLimitBp = -1
    if ($("#withdrawalLimitBp").val() != "") {
      withdrawalLimitBp = parseFloat($("#withdrawalLimitBp").val());
    }
    if ($("#creditsOnboardBp").val() == "") {
      throw new Error("Credits Onboard is required. You need to explicitly set it to true or false.");
    }
    let creditsOnboardLimitBp = -1
    if ($("#creditsOnboardLimitBp").val() != "") {
      creditsOnboardLimitBp = parseFloat($("#creditsOnboardLimitBp").val());
    }
    return {
      brokerName: $("#brokerIdBp").val(), // backend's brokerName == frontend's brokerId
      shownBrokerName: $("#BrokerNameBp").val(), // backend's shownBrokerName == frontend's brokerName
      email: $("#contactBp").val(),
      enabled: true,
      brokerDesc: $("#descBp").val(),
      balance: parseFloat($("#balanceBp").val()),
      level: levelBp,
      buyOpnCmmssn: commissionOpeningLongBp,
      buyClsdCmmssn: commissionClosingLongBp,
      sellOpnCmmssn: commissionOpeningShortBp,
      sellClsdCmmssn: commissionClosingShortBp,
      ask: askMarkUpBp,
      bid: bidMarkUpBp,
      currency: $("#currencyBp").val(),
      toFixed: parseFloat($("#toFixedBp").val()),
      hedgingEnabled: true,
      pl: 0.0,
      withdrawalLimit: withdrawalLimitBp,
      marginCallLevel: parseFloat($("#marginCallLevelBp").val()),
      marginCloseoutLevel: parseFloat($("#marginCloseoutLevelBp").val()),
      equity: 0.0,
      marginUsed: 0.0,
      smtp: $("#smtpBp").val(),
      smtpPort: parseInt($("#smtpPortBp").val()),
      emailPassword: $("#emailPasswordBp").val(),
      password: "",
      domainWP: "",
      userNameWP: "",
      passwordWP: "",
      getBalanceURLForWP: "",
      syncBalanceURLForWP: "",
      creditsOnboard: ($("#creditsOnboardBp").val() == "true" ? true : false),
      creditsOnboardLimit: creditsOnboardLimitBp,
      cryptoPaymentGatewayKey: $("#cryptoPaymentGatewayKeyBp").val(),
      paymentGatewayStoreId: $("#paymentGatewayStoreIdBp").val(),
      paymentGatewayWalletId: $("#paymentGatewayWalletIdBp").val(),
      pgSuccessRedirect: $("#pgSuccessRedirectUrlBp").val(),
      identifier: $("#identifierBp").val()
    };
  },
  render: function (res) {
    let brokerTable = null;
    if ($.fn.dataTable.isDataTable("#brokerList")) {
      brokerTable = $("#brokerList").DataTable();
      if (brokerTable.data().count() > 0) {
        brokerTable.clear().draw();
      }
      brokerTable.destroy();
      $("#brokerList").empty();
    }

    if (res.bManager) {
      brokerTable = $("#brokerList").DataTable({
        "responsive": true, "lengthChange": false, "autoWidth": false,
        "buttons": ["copy", "csv", "print", "colvis"],
        "columns": res.brokers.columns,
        "columnDefs": [{targets: -1, data: null,
          defaultContent:
          '<div class="btn-group">' +
          (res.brokers.data.length > 1 ? '<button class="btn btn-sm" id="btnSwitchBroker" title="Switch broker"><i class="fas fa-exchange-alt nav-icon"></i></button>' : "") +
          '<button class="btn btn-sm" id="btnEditBrokerInfo"><i class="fas fa-pen nav-icon" title="Edit broker profile"></i></button>' +
          '<button class="btn btn-sm" id="btnRemoveBroker"><i class="fas fa-eraser nav-icon" title="Remove broker"></i></button>' +
          '<button class="btn btn-sm" id="btnShowDownloadWlReportDlg"><i class="fas fa-download nav-icon" title="Download white label report"></i></button>' +
          '<button class="btn btn-sm" id="btnShowDownloadMainWlReportDlg"><i class="fas fa-file-download nav-icon" title="Download main white label report"></i></button>' +
          '</div>'}]
      });

      $("#btnShowBroker").show();
    } else {
      if (res.brokers.data.length > 1) {
        brokerTable = $("#brokerList").DataTable({
          "responsive": true, "lengthChange": false, "autoWidth": false,
          "buttons": ["copy", "csv", "print", "colvis"],
          "columns": res.brokers.columns,
          "columnDefs": [{targets: -1, data: null,
            defaultContent:
            '<div class="btn-group">' +
            '<button class="btn btn-sm" id="btnSwitchBroker"><i class="fas fa-exchange-alt nav-icon"></i></button>' +
            '</div>'}]
        });
      } else {
        res.brokers.columns.splice(res.brokers.columns.length - 1, 1)
        brokerTable = $("#brokerList").DataTable({
          "responsive": true, "lengthChange": false, "autoWidth": false,
          "buttons": ["copy", "csv", "print", "colvis"],
          "columns": res.brokers.columns
        });
      }

      $("#btnShowBroker").hide();
    }
    brokerTable.buttons().container().appendTo("#brokerList_wrapper .col-md-6:eq(0)");
    this.brokerTable = brokerTable;
    this.brokerDataTable = $("#brokerList").dataTable();
    let that = this;

    $("#brokerList tbody").on("click", "[id*=btnSwitchBroker]", function () {
      if (brokerTable != null) {
        let data = brokerTable.row($(this).parents("tr")).data();

        if (window.fiac.currBroker != data[res.brokers.colIndex.brokerName]) {
          window.fiui.confirmDlg.nextProcessTarget = data[res.brokers.colIndex.brokerName];
          window.fiui.confirmDlg.nextProcessCallback = function () {
            window.fiui.loadingDimmer.show();

            fisdk.switchBroker(window.fiui.confirmDlg.nextProcessTarget);
          }

          window.fiui.confirmDlg.show();
        }
      }
    });

    $("#brokerList tbody").on("click", "[id*=btnEditBrokerInfo]", function () {
      if (brokerTable != null) {
        let data = brokerTable.row($(this).parents("tr")).data();

        $("#brokerIdBp").val(data[res.brokers.colIndex.brokerId]);
        $("#BrokerNameBp").val(data[res.brokers.colIndex.brokerName]);
        $("#contactBp").val(data[res.brokers.colIndex.email]);
        $("#descBp").val(data[res.brokers.colIndex.desc]);
        $("#balanceBp").val(data[res.brokers.colIndex.balance]);
        $("#currencyBp").val(data[res.brokers.colIndex.currency]);
        $("#toFixedBp").val(data[res.brokers.colIndex.toFixed]);

        that.showDlg();
      }
    });

    $("#brokerList tbody").on("click", "[id*=btnRemoveBroker]", function () {
      if (brokerTable != null) {
        let data = brokerTable.row($(this).parents("tr")).data();

        window.fiui.confirmDlg.nextProcessTarget = data[res.brokers.colIndex.brokerName];
        window.fiui.confirmDlg.nextProcessCallback = function () {
          fisdk.removeBroker(window.fiui.confirmDlg.nextProcessTarget);
        }

        window.fiui.confirmDlg.show();
      }
    });

    $("#brokerList tbody").on("click", "[id*=btnShowDownloadWlReportDlg]", function () {
      if (brokerTable != null) {
        let data = brokerTable.row($(this).parents("tr")).data();

        $("#brokerNameDwr").val(data[res.brokers.colIndex.brokerName]);
        $("#mainWhiteLabelDwr").val(false + "");

        that.showReport();

        $("#startDtDwr").datetimepicker({
          format: "L"
        });
        $("#endDtDwr").datetimepicker({
          format: "L"
        });
      }
    });

    $("#brokerList tbody").on("click", "[id*=btnShowDownloadMainWlReportDlg]", function () {
      if (brokerTable != null) {
        let data = brokerTable.row($(this).parents("tr")).data();

        $("#brokerNameDwr").val(data[res.brokers.colIndex.brokerName]);
        $("#mainWhiteLabelDwr").val(true + "");

        that.showReport();

        $("#startDtDwr").datetimepicker({
          format: "L"
        });
        $("#endDtDwr").datetimepicker({
          format: "L"
        });
      }
    });

    for (let i in res.brokers.data) {
      brokerTable.row.add(res.brokers.data[i]).draw(false);
    }
  },
  show: function () {
    $("#brokerSection").show();
  },
  hide: function () {
    $("#brokerSection").hide();
  },
  showDlg: function () {
    $("#brokerProfileDlg").modal("show");
  },
  hideDlg: function () {
    $("#brokerProfileDlg").modal("hide");
  },
  showReport: function () {
    $("#downloadWlReportDlg").modal("show");
  },
  hideReport: function () {
    $("#downloadWlReportDlg").modal("hide");
  }
};

// manager list component
window.fiui.managerList = {
  init: function () {
    let managerListHtml = `
    <div class="content-header">
    <div class="container-fluid">
    <div class="row mb-2">
    <div class="col-sm-6">
    <h1 class="m-0">Managers</h1>
    </div>
    <div class="col-sm-6">
    <ol class="breadcrumb float-sm-right">
    <li class="breadcrumb-item"><a href="javascript:window.fiui.sidebar.showSummary()">Home</a></li>
    <li class="breadcrumb-item active">Managers</li>
    </ol>
    </div>
    </div>
    </div>
    </div>
    <section class="content">
    <div class="container-fluid">
    <div class="row">
    <div class="col-12">
    <div class="card">
    <div class="card-header">
    <h3 class="card-title">Manager List</h3>
    </div>
    <div class="card-body">
    <table id="managerList" class="table table-bordered table-striped">
    </table>
    </div>
    </div>
    </div>
    </div>
    </div>
    </section>`;

    $("#managerSection").html(managerListHtml);

    let that = this;

    fisdk.subscribeToNotification("downgrading_role_done", function (res) {
      console.log("downgrading_role_done");
      console.log(res);
      if (typeof res.message != "undefined" && res.message != "") {
        toastr.info(res.message);
      }
      if (typeof that.managerDataTable != "undefined") {
        that.managerDataTable.fnDeleteRow(res.rowId);
      }
      if (typeof window.fiui.accountList != "undefined" && typeof window.fiui.accountList.accountTable != "undefined") {
        window.fiui.accountList.accountTable.row.add(res.newAccount).draw(false);
      }
    });

    fisdk.subscribeToNotification("failed_to_downgrade_role", function (res) {
      console.error("failed_to_downgrade_role");
      if (typeof res.message != "undefined" && res.message != "") {
        console.error(res.message);
        toastr.error(res.message);
      }
    });
  },
  render: function (res) {
    let managerTable = null;

    if ($.fn.dataTable.isDataTable("#managerList")) {
      managerTable = $("#managerList").DataTable();
      if (managerTable.data().count() > 0) {
        managerTable.clear().draw();
      }
      managerTable.destroy();
      $("#managerList").empty();
    }

    if (res.bManager && window.fiac.tradeToken != null) {
      managerTable = $("#managerList").DataTable({
        "responsive": false, "lengthChange": false, "autoWidth": true, "scrollX": true,
        "buttons": ["copy", "csv", "print", "colvis"],
        "columns": res.managers.columns,
        "columnDefs": [
          {targets: -1, data: null,
          defaultContent:
          '<div class="btn-group">' +
          '<button class="btn btn-sm" id="btnDowngradeRole" title="Downgrade"><i class="fas fa-arrow-down nav-icon"></i></button>' +
          '<button class="btn btn-sm" id="btnGetManagerLog" title="Get log"><i class="fas fa-map nav-icon"></i></button>' +
          '</div>'}
        ],
        "fixedColumns": {
          left: 1
        }
      });

      managerTable.buttons().container().appendTo("#managerList_wrapper .col-md-6:eq(0)");
      this.managerTable = managerTable;
      this.managerDataTable = $("#managerList").dataTable();

      $("#managerList tbody").on("click", "[id*=btnDowngradeRole]", function () {
        if (managerTable != null) {
          let data = managerTable.row($(this).parents("tr")).data();

          window.fiui.confirmDlg.nextProcessTarget = data[res.accounts.colIndex.accountId];
          window.fiui.confirmDlg.nextProcessCallback = function () {
            fisdk.downgradeRole(window.fiui.confirmDlg.nextProcessTarget);
          }

          window.fiui.confirmDlg.show();
        }
      });

      $("#managerList tbody").on("click", "[id*=btnGetManagerLog]", function () {
        if (managerTable != null) {
          let data = managerTable.row($(this).parents("tr")).data();

          window.fiui.confirmDlg.nextProcessTarget = data[res.accounts.colIndex.accountId];
          window.fiui.confirmDlg.nextProcessCallback = function () {
            fisdk.getLog(window.fiac.brokerName, window.fiac.accountId, window.fiac.tradeToken, window.fiui.confirmDlg.nextProcessTarget);
          }

          window.fiui.confirmDlg.show();
        }
      });

      for (let i in res.managers.data) {
        managerTable.row.add(res.managers.data[i]).draw(false);
      }
    }
  },
  show: function () {
    $("#managerSection").show();
  },
  hide: function () {
    $("#managerSection").hide();
  },
  adjustCol: function () {
    if ($.fn.dataTable.isDataTable("#managerList")) {
      $("#managerList").DataTable().columns.adjust();
    }
  }
};

// account list component
window.fiui.accountList = {
  init: function () {
    let accountListHtml = `
    <div class="content-header">
    <div class="container-fluid">
    <div class="row mb-2">
    <div class="col-sm-6">
    <h1 class="m-0">Accounts</h1>
    </div>
    <div class="col-sm-6">
    <ol class="breadcrumb float-sm-right">
    <li class="breadcrumb-item"><a href="javascript:window.fiui.sidebar.showSummary()">Home</a></li>
    <li class="breadcrumb-item active">Accounts</li>
    </ol>
    </div>
    </div>
    </div>
    </div>
    <section class="content">
    <div class="container-fluid">
    <div class="row">
    <div class="col-12">
    <div class="card">
    <div class="card-header">
    <h3 class="card-title">Account List</h3>
    </div>
    <div class="card-body">
    <table id="accountList" class="table table-bordered table-striped">
    </table>
    </div>
    </div>
    </div>
    </div>
    </div>
    </section>`;

    $("#accountSection").html(accountListHtml);

    let bindAccountHtml = `
    <div class="modal fade" id="bindAccountDlg">
    <div class="modal-dialog">
    <div class="modal-content bg-info">
    <div class="modal-header">
    <h4 class="modal-title">Bind Account</h4>
    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
    <span aria-hidden="true">&times;</span>
    </button>
    </div>
    <div class="modal-body">
    <div class="login-box" style="width:auto">
    <div class="card">
    <div class="card-body login-card-body" style="border:none;background-color:#17a2b8">
    <p class="login-box-msg">Bind your account with your FIX MAM identifier</p>
    <form id="bindAccountForm">
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Account ID" style="color:#000;background:#eee" id="accountIdBa">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Identifier" style="color:#000;background:#eee" id="identifierBa">
    </div>
    <div class="row">
    <div class="col-12" style="text-align:center">
    <div class="btn-group">
    <button type="button" class="btn btn-default" data-dismiss="modal" aria-label="Close">Cancel</button>
    <button type="button" class="btn btn-primary" id="btnBindAccount">Bind</button>
    </div>
    </div>
    </div>
    </form>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>`;

    $("#bindAccountSection").html(bindAccountHtml);

    let transferFundsHtml = `
    <div class="modal fade" id="transferFundsDlg">
    <div class="modal-dialog">
    <div class="modal-content bg-info">
    <div class="modal-header">
    <h4 class="modal-title">Transfer Funds</h4>
    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
    <span aria-hidden="true">&times;</span>
    </button>
    </div>
    <div class="modal-body">
    <div class="login-box" style="width:auto">
    <div class="card">
    <div class="card-body login-card-body" style="border:none;background-color:#17a2b8">
    <p class="login-box-msg">Transfer funds</p>
    <form id="transferFundsForm">
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Broker Name" style="color:#000;background:#eee" id="brokerNameTf">
    </div>
    <div class="input-group mb-3">
    <input type="email" class="form-control" placeholder="Email Address" style="color:#000;background:#eee" id="emailTf">
    </div>
    <div class="input-group mb-3">
    <div class="form-group">
    <div class="form-check">
    <input class="form-check-input" type="radio" name="creditOrDebitTf" value="credit" checked>
    <label class="form-check-label">Credit</label>
    </div>
    <div class="form-check">
    <input class="form-check-input" type="radio" name="creditOrDebitTf" value="debit">
    <label class="form-check-label">Debit</label>
    </div>
    </div>
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Funds" style="color:#000;background:#eee" id="fundsTf">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Comment" style="color:#000;background:#eee" id="commentTf">
    </div>
    <div class="row">
    <div class="col-12" style="text-align:center">
    <div class="btn-group">
    <button type="button" class="btn btn-default" data-dismiss="modal" aria-label="Close">Cancel</button>
    <button type="button" class="btn btn-primary" id="btnTransferFunds">Transfer Funds</button>
    </div>
    </div>
    </div>
    </form>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>`;

    $("#transferFundsSection").html(transferFundsHtml);

    let levelHtml = `
    <div class="modal fade" id="levelDlg">
    <div class="modal-dialog">
    <div class="modal-content bg-info">
    <div class="modal-header">
    <h4 class="modal-title">Level</h4>
    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
    <span aria-hidden="true">&times;</span>
    </button>
    </div>
    <div class="modal-body">
    <div class="login-box" style="width:auto">
    <div class="card">
    <div class="card-body login-card-body" style="border:none;background-color:#17a2b8">
    <p class="login-box-msg">Change the level of the account</p>
    <form id="levelForm">
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Account ID" style="color:#000;background:#eee" id="accountIdL">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Level" style="color:#000;background:#eee" id="levelL">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Commission Opening Long" style="color:#000;background:#eee" id="commissionOpeningLongL">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Commission Closing Long" style="color:#000;background:#eee" id="commissionClosingLongL">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Commission Opening Short" style="color:#000;background:#eee" id="commissionOpeningShortL">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Commission Closing Short" style="color:#000;background:#eee" id="commissionClosingShortL">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Ask Mark Up" style="color:#000;background:#eee" id="askMarkUpL">
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Bid Mark Up" style="color:#000;background:#eee" id="bidMarkUpL">
    </div>
    <div class="row">
    <div class="col-12" style="text-align:center">
    <div class="btn-group">
    <button type="button" class="btn btn-default" data-dismiss="modal" aria-label="Close">Cancel</button>
    <button type="button" class="btn btn-primary" id="btnChangeLevel">Change</button>
    </div>
    </div>
    </div>
    </form>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>`;

    $("#levelSection").html(levelHtml);

    let downloadReportHtml = `
    <div class="modal fade" id="downloadTraderReportDlg">
    <div class="modal-dialog">
    <div class="modal-content bg-info">
    <div class="modal-header">
    <h4 class="modal-title">Download Report</h4>
    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
    <span aria-hidden="true">&times;</span>
    </button>
    </div>
    <div class="modal-body">
    <div class="login-box" style="width:auto">
    <div class="card">
    <div class="card-body login-card-body" style="border:none;background-color:#17a2b8">
    <p class="login-box-msg">Download the report of the specific trader</p>
    <form id="downloadTraderReportForm">
    <div class="input-group mb-3">
    <div class="form-group col-12" style="padding-left:0px;padding-right:0px">
    <div class="input-group date" data-target-input="nearest">
    <input type="text" placeholder="Start Date" class="form-control datetimepicker-input" data-target="#startDtDtr" style="color:#000;background:#eee" id="startDtDtr" />
    <div class="input-group-append" data-target="#startDtDtr" data-toggle="datetimepicker">
    <div class="input-group-text"><i class="fa fa-calendar" style="color:#fff"></i></div>
    </div>
    </div>
    </div>
    </div>
    <div class="input-group mb-3">
    <div class="form-group col-12" style="padding-left:0px;padding-right:0px">
    <div class="input-group date" data-target-input="nearest">
    <input type="text" placeholder="End Date" class="form-control datetimepicker-input" data-target="#endDtDtr" style="color:#000;background:#eee" id="endDtDtr" />
    <div class="input-group-append" data-target="#endDtDtr" data-toggle="datetimepicker">
    <div class="input-group-text"><i class="fa fa-calendar" style="color:#fff"></i></div>
    </div>
    </div>
    </div>
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Account ID" style="color:#000;background:#eee" id="accountIdDtr">
    </div>
    <div class="row">
    <div class="col-12" style="text-align:center">
    <div class="btn-group">
    <button type="button" class="btn btn-default" data-dismiss="modal" aria-label="Close">Cancel</button>
    <button type="button" class="btn btn-primary" id="btnDownloadTraderReport">Download</button>
    </div>
    </div>
    </div>
    </form>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>`;

    $("#downloadTraderReportSection").html(downloadReportHtml);

    let that = this;

    fisdk.subscribeToNotification("account_created", function (res) {
      console.log("account_created");
      console.log(res);
      if (typeof res.message != "undefined" && res.message != "") {
        toastr.info(res.message);
      }
      if (typeof that.accountTable != "undefined") {
        that.accountTable.row.add(res.newAccount).draw(false);
      }
    });

    fisdk.subscribeToNotification("account_updated", function (res) {
      if (typeof that.accountDataTable != "undefined") {
        try {
          that.accountDataTable.fnUpdate(res.val, res.rowId, res.colId, false, false);
          let account = window.fiac.info.accounts.data[res.rowId];
          let colIndex = window.fiac.info.accounts.colIndex;
          if (account[colIndex.accountId] == window.fiac.highlight) {
            window.fiui.summary.refreshRankedDetails({
              totalPl: (Math.round((account[colIndex.equity] - account[colIndex.balance]) * account[colIndex.toFixed]) / account[colIndex.toFixed]),
              equity: account[colIndex.equity],
              marginUsed: account[colIndex.marginUsed],
              marginAvailable: account[colIndex.marginAvailable]
            });
          }
        } catch (e) {
          console.error("account_updated " + res.val +", "+ res.colId);
        }
      }
    });

    fisdk.subscribeToNotification("account_removed", function (res) {
      console.log("account_removed");
      console.log(res);
      if (typeof res.message != "undefined" && res.message != "") {
        toastr.info(res.message);
      }
      if (typeof that.accountDataTable != "undefined") {
        that.accountDataTable.fnDeleteRow(res.rowId);
      }
    });

    fisdk.subscribeToNotification("approve_trading", function (res) {
      console.log("approve_trading");
      console.log(res);
      if (typeof res.message != "undefined" && res.message != "") {
        toastr.info(res.message);
      }
    });

    fisdk.subscribeToNotification("failed_to_approve_trading", function (res) {
      console.error("failed_to_approve_trading");
      if (typeof res.message != "undefined" && res.message != "") {
        console.error(res.message);
        toastr.error(res.message);
      }
    });

    fisdk.subscribeToNotification("removing_account_done", function (res) {
      console.log("removing_account_done");
      console.log(res);
      if (typeof res.message != "undefined" && res.message != "") {
        toastr.info(res.message);
      }
    });

    fisdk.subscribeToNotification("failed_to_remove_account", function (res) {
      console.error("failed_to_remove_account");
      if (typeof res.message != "undefined" && res.message != "") {
        console.error(res.message);
        toastr.error(res.message);
      }
    });

    fisdk.subscribeToNotification("binding_account_done", function (res) {
      console.log("binding_account_done");
      console.log(res);
      if (typeof res.message != "undefined" && res.message != "") {
        toastr.info(res.message);
      }
    });

    fisdk.subscribeToNotification("failed_to_bind_account", function (res) {
      console.error("failed_to_bind_account");
      if (typeof res.message != "undefined" && res.message != "") {
        console.error(res.message);
        toastr.error(res.message);
      }
    });

    fisdk.subscribeToNotification("upgrading_role_done", function (res) {
      console.log("upgrading_role_done");
      console.log(res);
      if (typeof res.message != "undefined" && res.message != "") {
        toastr.info(res.message);
      }
      if (typeof that.accountDataTable != "undefined") {
        that.accountDataTable.fnDeleteRow(res.rowId);
      }
      if (typeof window.fiui.managerList != "undefined" && typeof window.fiui.managerList.managerTable != "undefined") {
        window.fiui.managerList.managerTable.row.add(res.newManager).draw(false);
      }
    });

    fisdk.subscribeToNotification("failed_to_upgrade_role", function (res) {
      console.error("failed_to_upgrade_role");
      if (typeof res.message != "undefined" && res.message != "") {
        console.error(res.message);
        toastr.error(res.message);
      }
    });

    fisdk.subscribeToNotification("transferring_funds_done", function (res) {
      console.log("transferring_funds_done");
      console.log(res);
      if (typeof res.message != "undefined" && res.message != "") {
        toastr.info(res.message);
      }
    });

    fisdk.subscribeToNotification("failed_to_transfer_funds", function (res) {
      console.error("failed_to_transfer_funds");
      if (typeof res.message != "undefined" && res.message != "") {
        console.error(res.message);
        toastr.error(res.message);
      }
    });

    fisdk.subscribeToNotification("changing_book_type_done", function (res) {
      console.log("changing_book_type_done");
      console.log(res);
      if (typeof res.message != "undefined" && res.message != "") {
        toastr.info(res.message);
      }
    });

    fisdk.subscribeToNotification("failed_to_change_book_type", function (res) {
      console.error("failed_to_change_book_type");
      if (typeof res.message != "undefined" && res.message != "") {
        console.error(res.message);
        toastr.error(res.message);
      }
    });

    fisdk.subscribeToNotification("changing_level_done", function (res) {
      console.log("changing_level_done");
      console.log(res);
      if (typeof res.message != "undefined" && res.message != "") {
        toastr.info(res.message);
      }
    });

    fisdk.subscribeToNotification("failed_to_change_level", function (res) {
      console.error("failed_to_change_level");
      if (typeof res.message != "undefined" && res.message != "") {
        console.error(res.message);
        toastr.error(res.message);
      }
    });

    fisdk.subscribeToNotification("downloading_report_done", function (res) {
      console.log("downloading_report_done");
      console.log(res);

      let trades = [];
      trades.push(res.trades.columns.map(x=>x.title).join(","));

      for (let i in res.trades.data) {
        let trade = res.trades.data[i];
        trades.push(trade.join(","));
      }

      that.download(trades.join("\n"), "report.csv", "text/plain");
    });

    fisdk.subscribeToNotification("failed_to_download_report", function (res) {
      console.error("failed_to_download_report");
      if (typeof res.message != "undefined" && res.message != "") {
        console.error(res.message);
        toastr.error(res.message);
      }
    });

    fisdk.subscribeToNotification("getting_log_done", function (res) {
      console.log("getting_log_done");

      that.download(JSON.stringify(res.transactions), "report.json", "text/plain");
    });

    fisdk.subscribeToNotification("failed_to_get_log", function (res) {
      console.error("failed_to_get_log");
      if (typeof res.message != "undefined" && res.message != "") {
        console.error(res.message);
        toastr.error(res.message);
      }
    });

    $("#btnBindAccount").on("click", function () {
      that.hideBind();

      fisdk.bindAccount($("#accountIdBa").val(), $("#identifierBa").val());
    });

    $("#btnTransferFunds").on("click", function () {
      that.hideFunding();

      if ($('input[name="creditOrDebitTf"]:checked', '#transferFundsForm').val() == "credit") {
        fisdk.transferFunds($("#brokerNameTf").val(), $("#emailTf").val(), parseFloat($("#fundsTf").val()), $("#commentTf").val());
      } else {
        fisdk.transferFunds($("#brokerNameTf").val(), $("#emailTf").val(), -parseFloat($("#fundsTf").val()), $("#commentTf").val());
      }
    });

    $("#btnChangeLevel").on("click", function () {
      try {
        if ($("#levelL").val() == "") {
          throw new Error("Level is required.")
        }
        if ($("#commissionOpeningLongL").val() == "") {
          throw new Error("Commission Opening Long is required.")
        }
        if ($("#commissionClosingLongL").val() == "") {
          throw new Error("Commission Closing Long is required.")
        }
        if ($("#commissionOpeningShortL").val() == "") {
          throw new Error("Commission Opening Short is required.")
        }
        if ($("#commissionClosingShortL").val() == "") {
          throw new Error("Commission Closing Short is required.")
        }
        if ($("#askMarkUpL").val() == "") {
          throw new Error("Ask Mark Up is required.")
        }
        if ($("#bidMarkUpL").val() == "") {
          throw new Error("Bid Mark Up is required.")
        }
      } catch (e) {
        that.hideLevel();
        toastr.error(e.message);
        return;
      }

      that.hideLevel();

      fisdk.changeLevel($("#accountIdL").val(), parseInt($("#levelL").val()),
        parseFloat($("#commissionOpeningLongL").val()), parseFloat($("#commissionClosingLongL").val()), parseFloat($("#commissionOpeningShortL").val()), parseFloat($("#commissionClosingShortL").val()),
        parseFloat($("#askMarkUpL").val()), parseFloat($("#bidMarkUpL").val()));
    });

    $("#btnDownloadTraderReport").on("click", function () {
      that.hideReport();

      fisdk.downloadTraderReport(window.fiac.brokerName, window.fiac.accountId, window.fiac.tradeToken, $("#accountIdDtr").val(), Math.floor(new Date($("#startDtDtr").val()).getTime() / 1000), Math.floor(new Date($("#endDtDtr").val()).getTime() / 1000));
    });
  },
  renderColor: function (data, type, row) {
    if (data >= 0) {
      return '<p style="color:#21BA45">' + data + '</p>';
    } else {
      return '<p style="color:#DB2828">' + data + '</p>';
    }
  },
  renderAccountColorEquity: function (data, type, row) {
    if (data >= row[window.fiac.info.accounts.colIndex.balance] + row[window.fiac.info.accounts.colIndex.pl]) {
      return '<p style="color:#21BA45">' + data + '</p>';
    } else {
      return '<p style="color:#DB2828">' + data + '</p>';
    }
  },
  render: function (res) {
    let that = this;
    let accountTable = null;

    if ($.fn.dataTable.isDataTable("#accountList")) {
      accountTable = $("#accountList").DataTable();
      if (accountTable.data().count() > 0) {
        accountTable.clear().draw();
      }
      accountTable.destroy();
      $("#accountList").empty();
    }

    if (res.bManager) {
      res.accounts.columns[res.accounts.colIndex.pl].render = this.renderColor;
      res.accounts.columns[res.accounts.colIndex.aPl].render = this.renderColor;
      res.accounts.columns[res.accounts.colIndex.bPl].render = this.renderColor;
      res.accounts.columns[res.accounts.colIndex.equity].render = this.renderAccountColorEquity;
      accountTable = $("#accountList").DataTable({
        "responsive": false, "lengthChange": false, "autoWidth": true, "scrollX": true,
        "buttons": ["copy", "csv", "print", "colvis"],
        "columns": res.accounts.columns,
        "columnDefs": [
          {targets: -1, data: null,
          defaultContent:
          '<div class="btn-group">' +
          '<button class="btn btn-sm" id="btnApproveTrading" title="Approve trading"><i class="fas fa-check nav-icon"></i></button>' +
          '<button class="btn btn-sm" id="btnRemoveAccount" title="Remove account"><i class="fas fa-eraser nav-icon"></i></button>' +
          '<button class="btn btn-sm" id="btnShowBindAccountDlg" title="Bind account"><i class="fas fa-magnet nav-icon"></i></button>' +
          '<button class="btn btn-sm" id="btnUpgradeRole" title="Upgrade"><i class="fas fa-arrow-up nav-icon"></i></button>' +
          '<button class="btn btn-sm" id="btnShowTransferFundsDlg" title="Transfer funds"><i class="fas fa-money-check nav-icon"></i></button>' +
          '<button class="btn btn-sm" id="btnChangeBookType" title="Change book type"><i class="fas fa-book nav-icon"></i></button>' +
          '<button class="btn btn-sm" id="btnShowChangeLevelDlg" title="Change level, set commission and set markup"><i class="fas fa-sliders-h nav-icon"></i></button>' +
          '<button class="btn btn-sm" id="btnShowDownloadTraderReportDlg" title="Download trader report"><i class="fas fa-download nav-icon"></i></button>' +
          '<button class="btn btn-sm" id="btnGetTraderLog" title="Get log"><i class="fas fa-map nav-icon"></i></button>' +
          '</div>'}
        ],
        "fixedColumns": {
          left: 1
        }
      });
    } else {
      res.accounts.columns[res.accounts.colIndex.pl].render = this.renderColor;
      res.accounts.columns[res.accounts.colIndex.equity].render = this.renderAccountColorEquity;
      if (window.fiac.tradeToken != null) {
        accountTable = $("#accountList").DataTable({
          "responsive": false, "lengthChange": false, "autoWidth": true, "scrollX": true,
          "buttons": ["copy", "csv", "print", "colvis"],
          "columns": res.accounts.columns,
          "columnDefs": [
            {targets: -1, data: null,
            defaultContent:
            '<div class="btn-group">' +
            '<button class="btn btn-sm" id="btnShowDownloadTraderReportDlg" title="Download trader report"><i class="fas fa-download nav-icon"></i></button>' +
            '</div>'}
          ],
          "fixedColumns": {
            left: 1
          }
        });
      } else {
        res.accounts.columns.splice(res.accounts.columns.length - 1, 1);
        accountTable = $("#accountList").DataTable({
          "responsive": false, "lengthChange": false, "autoWidth": true, "scrollX": true,
          "buttons": ["copy", "csv", "print", "colvis"],
          "columns": res.accounts.columns,
          "fixedColumns": {
            left: 1
          }
        });
      }
    }
    accountTable.buttons().container().appendTo("#accountList_wrapper .col-md-6:eq(0)");
    this.accountTable = accountTable;
    this.accountDataTable = $("#accountList").dataTable();

    $("#accountList tbody").on("click", "[id*=btnApproveTrading]", function () {
      if (accountTable != null) {
        let data = accountTable.row($(this).parents("tr")).data();

        window.fiui.confirmDlg.nextProcessTarget = data[res.accounts.colIndex.accountId];
        window.fiui.confirmDlg.nextProcessCallback = function () {
          fisdk.approveTrading(window.fiui.confirmDlg.nextProcessTarget);
        }

        window.fiui.confirmDlg.show();
      }
    });

    $("#accountList tbody").on("click", "[id*=btnRemoveAccount]", function () {
      if (accountTable != null) {
        let data = accountTable.row($(this).parents("tr")).data();

        window.fiui.confirmDlg.nextProcessTarget = data[res.accounts.colIndex.accountId];
        window.fiui.confirmDlg.nextProcessCallback = function () {
          fisdk.removeAccount(window.fiui.confirmDlg.nextProcessTarget);
        }

        window.fiui.confirmDlg.show();
      }
    });

    $("#accountList tbody").on("click", "[id*=btnShowBindAccountDlg]", function () {
      if (accountTable != null) {
        let data = accountTable.row($(this).parents("tr")).data();

        $("#accountIdBa").val(data[res.accounts.colIndex.accountId]);

        that.showBind();
      }
    });

    $("#accountList tbody").on("click", "[id*=btnUpgradeRole]", function () {
      if (accountTable != null) {
        let data = accountTable.row($(this).parents("tr")).data();

        window.fiui.confirmDlg.nextProcessTarget = data[res.accounts.colIndex.accountId];
        window.fiui.confirmDlg.nextProcessCallback = function () {
          fisdk.upgradeRole(window.fiui.confirmDlg.nextProcessTarget);
        }

        window.fiui.confirmDlg.show();
      }
    });

    $("#accountList tbody").on("click", "[id*=btnShowTransferFundsDlg]", function () {
      if (accountTable != null) {
        let data = accountTable.row($(this).parents("tr")).data();
        let brokerId = data[res.accounts.colIndex.brokerId];
        let brokerName = null;

        for (let i in window.fiac.info.brokers.data) {
          let broker = window.fiac.info.brokers.data[i];
          if (broker[window.fiac.info.brokers.colIndex.brokerId] == brokerId) {
            brokerName = broker[window.fiac.info.brokers.colIndex.brokerName];
            break;
          }
        }
        $("#brokerNameTf").val(brokerName);
        $("#emailTf").val(data[res.accounts.colIndex.email]);

        that.showFunding();
      }
    });

    $("#accountList tbody").on("click", "[id*=btnChangeBookType]", function () {
      if (accountTable != null) {
        let data = accountTable.row($(this).parents("tr")).data();

        window.fiui.confirmDlg.nextProcessTarget = {
          accountId: data[res.accounts.colIndex.accountId],
          aBook: data[res.accounts.colIndex.aBook]
        };
        window.fiui.confirmDlg.nextProcessCallback = function () {
          if (window.fiui.confirmDlg.nextProcessTarget.aBook == "A") {
            fisdk.changeBookType(window.fiui.confirmDlg.nextProcessTarget.accountId, false);
          } else {
            fisdk.changeBookType(window.fiui.confirmDlg.nextProcessTarget.accountId, true);
          }
        }

        window.fiui.confirmDlg.show();
      }
    });

    $("#accountList tbody").on("click", "[id*=btnShowChangeLevelDlg]", function () {
      if (accountTable != null) {
        let data = accountTable.row($(this).parents("tr")).data();

        $("#accountIdL").val(data[res.accounts.colIndex.accountId]);
        $("#levelL").val(data[res.accounts.colIndex.level]);
        $("#commissionOpeningLongL").val(data[res.accounts.colIndex.commissionOpeningLong]);
        $("#commissionClosingLongL").val(data[res.accounts.colIndex.commissionClosingLong]);
        $("#commissionOpeningShortL").val(data[res.accounts.colIndex.commissionOpeningShort]);
        $("#commissionClosingShortL").val(data[res.accounts.colIndex.commissionClosingShort]);
        $("#askMarkUpL").val(data[res.accounts.colIndex.ask]);
        $("#bidMarkUpL").val(data[res.accounts.colIndex.bid]);

        that.showLevel();
      }
    });

    $("#accountList tbody").on("click", "[id*=btnShowDownloadTraderReportDlg]", function () {
      if (accountTable != null) {
        let data = accountTable.row($(this).parents("tr")).data();

        $("#accountIdDtr").val(data[res.accounts.colIndex.accountId]);

        that.showReport();

        $("#startDtDtr").datetimepicker({
          format: "L"
        });
        $("#endDtDtr").datetimepicker({
          format: "L"
        });
      }
    });

    $("#accountList tbody").on("click", "[id*=btnGetTraderLog]", function () {
      if (accountTable != null) {
        let data = accountTable.row($(this).parents("tr")).data();

        window.fiui.confirmDlg.nextProcessTarget = data[res.accounts.colIndex.accountId];
        window.fiui.confirmDlg.nextProcessCallback = function () {
          fisdk.getLog(window.fiac.brokerName, window.fiac.accountId, window.fiac.tradeToken, window.fiui.confirmDlg.nextProcessTarget);
        }

        window.fiui.confirmDlg.show();
      }
    });

    for (let i in res.accounts.data) {
      accountTable.row.add(res.accounts.data[i]).draw(false);
    }
  },
  show: function () {
    $("#accountSection").show();
  },
  hide: function () {
    $("#accountSection").hide();
  },
  showBind: function () {
    $("#bindAccountDlg").modal("show");
  },
  hideBind: function () {
    $("#bindAccountDlg").modal("hide");
  },
  showFunding: function () {
    $("#transferFundsDlg").modal("show");
  },
  hideFunding: function () {
    $("#transferFundsDlg").modal("hide");
  },
  showLevel: function () {
    $("#levelDlg").modal("show");
  },
  hideLevel: function () {
    $("#levelDlg").modal("hide");
  },
  showReport: function () {
    $("#downloadTraderReportDlg").modal("show");
  },
  hideReport: function () {
    $("#downloadTraderReportDlg").modal("hide");
  },
  adjustCol: function () {
    if ($.fn.dataTable.isDataTable("#accountList")) {
      $("#accountList").DataTable().columns.adjust();
    }
  },
  download: function (content, fileName, contentType) {
    let a = document.createElement("a");
    let file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }
};

// symbol list component
window.fiui.symbolList = {
  init: function () {
    let symbolListHtml = `
    <div class="content-header">
    <div class="container-fluid">
    <div class="row mb-2">
    <div class="col-sm-6">
    <h1 class="m-0">Symbols</h1>
    </div>
    <div class="col-sm-6">
    <ol class="breadcrumb float-sm-right">
    <li class="breadcrumb-item"><a href="javascript:window.fiui.sidebar.showSummary()">Home</a></li>
    <li class="breadcrumb-item active">Symbols</li>
    </ol>
    </div>
    </div>
    </div>
    </div>
    <section class="content">
    <div class="container-fluid">
    <div class="row">
    <div class="col-12">
    <div class="card">
    <div class="card-header">
    <h3 class="card-title">Symbol List</h3>
    </div>
    <div class="card-body">
    <table id="symbolList" class="table table-bordered table-striped">
    </table>
    </div>
    <div class="card-footer">
    <button type="button" class="btn btn-primary" id="btnShowSymbolsDlg">Add</button>
    </div>
    </div>
    </div>
    </div>
    </div>
    </section>`;

    $("#symbolSection").html(symbolListHtml);

    let symbolsHtml = `
    <div class="modal fade" id="symbolsDlg">
    <div class="modal-dialog">
    <div class="modal-content bg-info">
    <div class="modal-header">
    <h4 class="modal-title">Symbols</h4>
    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
    <span aria-hidden="true">&times;</span>
    </button>
    </div>
    <div class="modal-body">
    <div class="login-box" style="width:auto">
    <div class="card">
    <div class="card-body login-card-body" style="border:none;background-color:#17a2b8">
    <p class="login-box-msg">Import symbols</p>
    <form id="symbolsForm">
    <div class="input-group mb-3">
    <textarea class="form-control" rows="20" placeholder="Symbols" style="color:#000;background:#eee" id="symbols"></textarea>
    </div>
    <div class="row">
    <div class="col-12" style="text-align:center">
    <div class="btn-group">
    <button type="button" class="btn btn-default" data-dismiss="modal" aria-label="Close">Cancel</button>
    <button type="button" class="btn btn-primary" id="btnAddSymbols">Add</button>
    <button type="button" class="btn btn-primary" id="btnModifySymbol">Modify</button>
    </div>
    </div>
    </div>
    </form>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>`;

    $("#symbolsSection").html(symbolsHtml);

    let that = this;

    fisdk.subscribeToNotification("bid_updated", function (res) {
      if (typeof that.symbolDataTable != "undefined") {
        if (res.val != window.fiac.info.symbols.data[res.rowId][window.fiac.info.symbols.colIndex.prevBid]) {
          that.symbolDataTable.fnUpdate(res.val, res.rowId, res.colId, false, false);
        }
      }
    });

    fisdk.subscribeToNotification("ask_updated", function (res) {
      if (typeof that.symbolDataTable != "undefined") {
        if (res.val != window.fiac.info.symbols.data[res.rowId][window.fiac.info.symbols.colIndex.prevAsk]) {
          that.symbolDataTable.fnUpdate(res.val, res.rowId, res.colId, false, false);
        }
      }
    });

    fisdk.subscribeToNotification("adding_symbols_done", function (res) {
      console.log("adding_symbols_done");
      console.log(res);
      if (typeof res.message != "undefined" && res.message != "") {
        toastr.info(res.message);
      }
    });

    fisdk.subscribeToNotification("failed_to_add_symbols", function (res) {
      console.error("failed_to_add_symbols");
      if (typeof res.message != "undefined" && res.message != "") {
        console.error(res.message);
        toastr.error(res.message);
      }
    });

    fisdk.subscribeToNotification("modifying_symbol_done", function (res) {
      console.log("modifying_symbol_done");
      console.log(res);
      if (typeof res.message != "undefined" && res.message != "") {
        toastr.info(res.message);
      }
    });

    fisdk.subscribeToNotification("failed_to_modify_symbol", function (res) {
      console.error("failed_to_modify_symbol");
      if (typeof res.message != "undefined" && res.message != "") {
        console.error(res.message);
        toastr.error(res.message);
      }
    });

    fisdk.subscribeToNotification("removing_symbol_done", function (res) {
      console.log("removing_symbol_done");
      console.log(res);
      if (typeof res.message != "undefined" && res.message != "") {
        toastr.info(res.message);
      }
    });

    fisdk.subscribeToNotification("failed_to_remove_symbol", function (res) {
      console.error("failed_to_remove_symbol");
      if (typeof res.message != "undefined" && res.message != "") {
        console.error(res.message);
        toastr.error(res.message);
      }
    });

    $("#btnShowSymbolsDlg").on("click", function () {
      if (window.fiac.tradeToken != null) {
        that.showDlg();
      } else {
        toastr.error("Please login.");
      }
    });

    $("#btnAddSymbols").on("click", function () {
      that.hideDlg();

      if (window.fiac.tradeToken != null) {
        fisdk.addSymbols($("#symbols").val());
      } else {
        if (window.fiac.investorPassword != null) {
          toastr.error("You can't import the symbols' information in the investor mode.");
        } else {
          toastr.error("Please login.");
        }
      }
    });

    $("#btnModifySymbol").on("click", function () {
      that.hideDlg();

      if (window.fiac.tradeToken != null) {
        fisdk.modifySymbol($("#symbols").val());
      } else {
        if (window.fiac.investorPassword != null) {
          toastr.error("You can't modify the symbol's information in the investor mode.");
        } else {
          toastr.error("Please login.");
        }
      }
    });
  },
  renderSymbolColorBid: function (data, type, row) {
    if (data > row[window.fiac.info.symbols.colIndex.prevBid]) {
      return '<p style="color:#21BA45">' + data + '</p>';
    } else if (data < row[window.fiac.info.symbols.colIndex.prevBid]) {
      return '<p style="color:#DB2828">' + data + '</p>';
    } else {
      return '<p style="color:#eee">' + data + '</p>';
    }
  },
  renderSymbolColorAsk: function (data, type, row) {
    if (data > row[window.fiac.info.symbols.colIndex.prevAsk]) {
      return '<p style="color:#21BA45">' + data + '</p>';
    } else if (data < row[window.fiac.info.symbols.colIndex.prevAsk]) {
      return '<p style="color:#DB2828">' + data + '</p>';
    } else {
      return '<p style="color:#eee">' + data + '</p>';
    }
  },
  render: function (res) {
    let symbolTable = null;
    if ($.fn.dataTable.isDataTable("#symbolList")) {
      symbolTable = $("#symbolList").DataTable();
      if (symbolTable.data().count() > 0) {
        symbolTable.clear().draw();
      }
      symbolTable.destroy();
      $("#symbolList").empty();
    }

    res.symbols.columns[res.symbols.colIndex.bid].render = this.renderSymbolColorBid;
    res.symbols.columns[res.symbols.colIndex.ask].render = this.renderSymbolColorAsk;
    if (res.bManager) {
      symbolTable = $("#symbolList").DataTable({
        "responsive": true, "lengthChange": false, "autoWidth": false,
        "buttons": ["copy", "csv", "print", "colvis"],
        "columns": res.symbols.columns,
        "columnDefs": [{targets: -1, data: null,
          defaultContent:
          '<div class="btn-group">' +
          '<button class="btn btn-sm" id="btnEditSymbolInfo" title="Edit symbol information"><i class="fas fa-pen nav-icon"></i></button>' +
          '<button class="btn btn-sm" id="btnRemoveSymbol" title="Remove symbol"><i class="fas fa-eraser nav-icon"></i></button>' +
          '</div>'}]
      });

      $("#btnShowSymbolsDlg").show();
    } else {
      res.symbols.columns.splice(res.symbols.columns.length - 1, 1);

      symbolTable = $("#symbolList").DataTable({
        "responsive": true, "lengthChange": false, "autoWidth": false,
        "buttons": ["copy", "csv", "print", "colvis"],
        "columns": res.symbols.columns
      });

      $("#btnShowSymbolsDlg").hide();
    }
    symbolTable.buttons().container().appendTo("#symbolList_wrapper .col-md-6:eq(0)");
    this.symbolTable = symbolTable;
    this.symbolDataTable = $("#symbolList").dataTable();

    let that = this;

    $("#symbolList tbody").on("click", "[id*=btnEditSymbolInfo]", function () {
      if (symbolTable != null) {
        let data = symbolTable.row($(this).parents("tr")).data();

        $("#symbols").val(data[res.symbols.colIndex.symbolName]);

        that.showDlg();
      }
    });

    $("#symbolList tbody").on("click", "[id*=btnRemoveSymbol]", function () {
      if (symbolTable != null) {
        let data = symbolTable.row($(this).parents("tr")).data();

        window.fiui.confirmDlg.nextProcessTarget = data[res.symbols.colIndex.symbolName]
        window.fiui.confirmDlg.nextProcessCallback = function () {
          fisdk.removeSymbol(window.fiui.confirmDlg.nextProcessTarget);
        }

        window.fiui.confirmDlg.show();
      }
    });

    for (let i in res.symbols.data) {
      symbolTable.row.add(res.symbols.data[i]).draw(false);
    }
  },
  show: function () {
    $("#symbolSection").show();
  },
  hide: function () {
    $("#symbolSection").hide();
  },
  showDlg: function () {
    $("#symbolsDlg").modal("show");
  },
  hideDlg: function () {
    $("#symbolsDlg").modal("hide");
  }
};

// open position list component
window.fiui.openPosList = {
  init: function () {
    let html = `
    <div class="content-header">
    <div class="container-fluid">
    <div class="row mb-2">
    <div class="col-sm-6">
    <h1 class="m-0">Open Postions</h1>
    </div>
    <div class="col-sm-6">
    <ol class="breadcrumb float-sm-right">
    <li class="breadcrumb-item"><a href="javascript:window.fiui.sidebar.showSummary()">Home</a></li>
    <li class="breadcrumb-item active">Open Postions</li>
    </ol>
    </div>
    </div>
    </div>
    </div>
    <section class="content">
    <div class="container-fluid">
    <div class="row">
    <div class="col-12">
    <div class="card">
    <div class="card-header">
    <h3 class="card-title">Open Postion List</h3>
    </div>
    <div class="card-body">
    <table id="openPosList" class="table table-bordered table-striped">
    </table>
    </div>
    </div>
    </div>
    </div>
    </div>
    </section>`;

    $("#openPosSection").html(html);

    let that = this;

    fisdk.subscribeToNotification("open_pos_added", function (res) {
      if (typeof that.openPosTable != "undefined") {
        that.openPosTable.row.add(res.newPos).draw(false);
      }
    });

    fisdk.subscribeToNotification("open_pos_updated", function (res) {
      if (typeof that.openPosDataTable != "undefined") {
        try {
          that.openPosDataTable.fnUpdate(res.val, res.rowId, res.colId, false, false);
        } catch (e) {
          console.error("open_pos_updated " + res.val +", "+ res.colId);
        }
      }
    });

    fisdk.subscribeToNotification("open_pos_removed", function (res) {
      if (typeof that.openPosDataTable != "undefined") {
        that.openPosDataTable.fnDeleteRow(res.rowId);
      }
    });
  },
  renderColor: function (data, type, row) {
    if (data >= 0) {
      return '<p style="color:#21BA45">' + data + '</p>';
    } else {
      return '<p style="color:#DB2828">' + data + '</p>';
    }
  },
  render: function (res) {
    let openPosTable = null;
    if ($.fn.dataTable.isDataTable("#openPosList")) {
      openPosTable = $("#openPosList").DataTable();
      if (openPosTable.data().count() > 0) {
        openPosTable.clear().draw();
      }
      openPosTable.destroy();
      $("#openPosList").empty();
    }

    res.openPositions.columns.splice(res.openPositions.columns.length - 1, 1);
    res.openPositions.columns[res.openPositions.colIndex.unrealizedPL].render = this.renderColor;
    openPosTable = $("#openPosList").DataTable({
      "responsive": true, "lengthChange": false, "autoWidth": false,
      "buttons": ["copy", "csv", "print", "colvis"],
      "columns": res.openPositions.columns
    });
    openPosTable.buttons().container().appendTo("#openPosList_wrapper .col-md-6:eq(0)");
    this.openPosTable = openPosTable;
    this.openPosDataTable = $("#openPosList").dataTable();

    for (let i in res.openPositions.data) {
      openPosTable.row.add(res.openPositions.data[i]).draw(false);
    }
  },
  show: function () {
    $("#openPosSection").show();
  },
  hide: function () {
    $("#openPosSection").hide();
  }
};

// grouped open position list component
window.fiui.groupedOpenPosList = {
  init: function () {
    let html = `
    <div class="content-header">
    <div class="container-fluid">
    <div class="row mb-2">
    <div class="col-sm-6">
    <h1 class="m-0">Grouped Open Postions</h1>
    </div>
    <div class="col-sm-6">
    <ol class="breadcrumb float-sm-right">
    <li class="breadcrumb-item"><a href="javascript:window.fiui.sidebar.showSummary()">Home</a></li>
    <li class="breadcrumb-item active">Grouped Open Postions</li>
    </ol>
    </div>
    </div>
    </div>
    </div>
    <section class="content">
    <div class="container-fluid">
    <div class="row">
    <div class="col-12">
    <div class="card">
    <div class="card-header">
    <h3 class="card-title">Grouped Open Postion List</h3>
    </div>
    <div class="card-body">
    <table id="groupedOpenPosList" class="table table-bordered table-striped">
    </table>
    </div>
    </div>
    </div>
    </div>
    </div>
    </section>`;

    $("#groupedOpenPosSection").html(html);

    let that = this;

    fisdk.subscribeToNotification("grouped_open_pos_added", function (res) {
      if (typeof that.groupedOpenPosTable != "undefined") {
        that.groupedOpenPosTable.row.add(res.newPos).draw(false);
      }
    });

    fisdk.subscribeToNotification("grouped_open_pos_updated", function (res) {
      if (typeof that.groupedOpenPosDataTable != "undefined") {
        try {
          if ((res.colId != window.fiac.info.groupedOpenPositions.colIndex.bid && res.colId != window.fiac.info.groupedOpenPositions.colIndex.ask) ||
              (res.colId == window.fiac.info.groupedOpenPositions.colIndex.bid && res.val != window.fiac.info.groupedOpenPositions.data[res.rowId][window.fiac.info.groupedOpenPositions.colIndex.prevBid]) ||
              (res.colId == window.fiac.info.groupedOpenPositions.colIndex.ask && res.val != window.fiac.info.groupedOpenPositions.data[res.rowId][window.fiac.info.groupedOpenPositions.colIndex.prevAsk])) {
            that.groupedOpenPosDataTable.fnUpdate(res.val, res.rowId, res.colId, false, false);
          }
        } catch (e) {
          console.error("grouped_open_pos_updated " + res.val +", "+ res.colId);
        }
      }
    });

    fisdk.subscribeToNotification("grouped_open_pos_removed", function (res) {
      if (typeof that.groupedOpenPosDataTable != "undefined") {
        that.groupedOpenPosDataTable.fnDeleteRow(res.rowId);
      }
    });
  },
  renderGrpOpenPosColorBid: function (data, type, row) {
    if (data > row[window.fiac.info.groupedOpenPositions.colIndex.prevBid]) {
      return '<p style="color:#21BA45">' + data + '</p>';
    } else if (data < row[window.fiac.info.groupedOpenPositions.colIndex.prevBid]) {
      return '<p style="color:#DB2828">' + data + '</p>';
    } else {
      return '<p style="color:#eee">' + data + '</p>';
    }
  },
  renderGrpOpenPosColorAsk: function (data, type, row) {
    if (data > row[window.fiac.info.groupedOpenPositions.colIndex.prevAsk]) {
      return '<p style="color:#21BA45">' + data + '</p>';
    } else if (data < row[window.fiac.info.groupedOpenPositions.colIndex.prevAsk]) {
      return '<p style="color:#DB2828">' + data + '</p>';
    } else {
      return '<p style="color:#eee">' + data + '</p>';
    }
  },
  render: function (res) {
    let groupedOpenPosTable = null;
    if ($.fn.dataTable.isDataTable("#groupedOpenPosList")) {
      groupedOpenPosTable = $("#groupedOpenPosList").DataTable();
      if (groupedOpenPosTable.data().count() > 0) {
        groupedOpenPosTable.clear().draw();
      }
      groupedOpenPosTable.destroy();
      $("#groupedOpenPosList").empty();
    }

    res.groupedOpenPositions.columns[res.groupedOpenPositions.colIndex.bid].render = this.renderGrpOpenPosColorBid;
    res.groupedOpenPositions.columns[res.groupedOpenPositions.colIndex.ask].render = this.renderGrpOpenPosColorAsk;
    groupedOpenPosTable = $("#groupedOpenPosList").DataTable({
      "responsive": true, "lengthChange": false, "autoWidth": false,
      "buttons": ["copy", "csv", "print", "colvis"],
      "columns": res.groupedOpenPositions.columns,
      "columnDefs": [{width: "25%", targets: 0}, {width: "25%", targets: 1}, {width: "25%", targets: 2}, {width: "25%", targets: 3}]
    });
    groupedOpenPosTable.buttons().container().appendTo("#groupedOpenPosList_wrapper .col-md-6:eq(0)");
    this.groupedOpenPosTable = groupedOpenPosTable;
    this.groupedOpenPosDataTable = $("#groupedOpenPosList").dataTable();

    for (let i in res.groupedOpenPositions.data) {
      groupedOpenPosTable.row.add(res.groupedOpenPositions.data[i]).draw(false);
    }
  },
  show: function () {
    $("#groupedOpenPosSection").show();
  },
  hide: function () {
    $("#groupedOpenPosSection").hide();
  }
};

// funding history component
window.fiui.fundingHistory = {
  init: function () {
    let html = `
    <div class="content-header">
    <div class="container-fluid">
    <div class="row mb-2">
    <div class="col-sm-6">
    <h1 class="m-0">Funding History</h1>
    </div>
    <div class="col-sm-6">
    <ol class="breadcrumb float-sm-right">
    <li class="breadcrumb-item"><a href="javascript:window.fiui.sidebar.showSummary()">Home</a></li>
    <li class="breadcrumb-item active">Funding History</li>
    </ol>
    </div>
    </div>
    </div>
    </div>
    <section class="content">
    <div class="container-fluid">
    <div class="row">
    <div class="col-12">
    <div class="card">
    <div class="card-header">
    <h3 class="card-title">Funding History</h3>
    </div>
    <div class="card-body">
    <table id="fundingHistory" class="table table-bordered table-striped">
    </table>
    </div>
    </div>
    </div>
    </div>
    </div>
    </section>`;

    $("#fundingSection").html(html);

    let that = this;

    fisdk.subscribeToNotification("transfer_funds_added", function (res) {
      if (typeof that.fundingHistoryTable != "undefined") {
        that.fundingHistoryTable.row.add(res.newFunds).draw(false);
      }
    });

    fisdk.subscribeToNotification("transfer_funds_updated", function (res) {
      if (typeof that.fundingHistoryDataTable != "undefined") {
        try {
          that.fundingHistoryDataTable.fnUpdate(res.val, res.rowId, res.colId, false, false);
        } catch (e) {
          console.error("transfer_funds_updated " + res.val +", "+ res.colId);
        }
      }
    });
  },
  renderColor: function (data, type, row) {
    if (data >= 0) {
      return '<p style="color:#21BA45">' + data + '</p>';
    } else {
      return '<p style="color:#DB2828">' + data + '</p>';
    }
  },
  render: function (res) {
    let fundingHistoryTable = null;
    if ($.fn.dataTable.isDataTable("#fundingHistory")) {
      fundingHistoryTable = $("#fundingHistory").DataTable();
      if (fundingHistoryTable.data().count() > 0) {
        fundingHistoryTable.clear().draw();
      }
      fundingHistoryTable.destroy();
      $("#fundingHistory").empty();
    }

    res.fundingHistory.columns.splice(res.fundingHistory.columns.length - 1, 1);
    res.fundingHistory.columns[res.fundingHistory.colIndex.funds].render = this.renderColor;
    fundingHistoryTable = $("#fundingHistory").DataTable({
      "responsive": true, "lengthChange": false, "autoWidth": false,
      "buttons": ["copy", "csv", "print", "colvis"],
      "columns": res.fundingHistory.columns
    });
    fundingHistoryTable.buttons().container().appendTo("#fundingHistory_wrapper .col-md-6:eq(0)");
    this.fundingHistoryTable = fundingHistoryTable;
    this.fundingHistoryDataTable = $("#fundingHistory").dataTable();

    for (let i in res.fundingHistory.data) {
      fundingHistoryTable.row.add(res.fundingHistory.data[i]).draw(false);
    }
  },
  show: function () {
    $("#fundingSection").show();
  },
  hide: function () {
    $("#fundingSection").hide();
  }
};

// execution report component
window.fiui.execReports = {
  init: function () {
    let html = `
    <div class="content-header">
    <div class="container-fluid">
    <div class="row mb-2">
    <div class="col-sm-6">
    <h1 class="m-0">Execution Reports</h1>
    </div>
    <div class="col-sm-6">
    <ol class="breadcrumb float-sm-right">
    <li class="breadcrumb-item"><a href="javascript:window.fiui.sidebar.showSummary()">Home</a></li>
    <li class="breadcrumb-item active">Execution Reports</li>
    </ol>
    </div>
    </div>
    </div>
    </div>
    <section class="content">
    <div class="container-fluid">
    <div class="row">
    <div class="col-12">
    <div class="card">
    <div class="card-header">
    <h3 class="card-title">Execution Reports</h3>
    </div>
    <div class="card-body">
    <table id="execReports" class="table table-bordered table-striped">
    </table>
    </div>
    </div>
    </div>
    </div>
    </div>
    </section>`;

    $("#execReportSection").html(html);

    let that = this;

    fisdk.subscribeToNotification("exec_report_added", function (res) {
      if (typeof that.execReportTable != "undefined") {
        that.execReportTable.row.add(res.newExecReport).draw(false);
      }
    });
  },
  render: function (res) {
    let execReportTable = null;
    if ($.fn.dataTable.isDataTable("#execReports")) {
      execReportTable = $("#execReports").DataTable();
      if (execReportTable.data().count() > 0) {
        execReportTable.clear().draw();
      }
      execReportTable.destroy();
      $("#execReports").empty();
    }

    execReportTable = $("#execReports").DataTable({
      "responsive": false, "lengthChange": false, "autoWidth": true, "scrollX": true,
      "buttons": ["copy", "csv", "print", "colvis"],
      "columns": res.execReports.columns
    });
    execReportTable.buttons().container().appendTo("#execReports_wrapper .col-md-6:eq(0)");
    this.execReportTable = execReportTable;

    for (let i in res.execReports.data) {
      execReportTable.row.add(res.execReports.data[i]).draw(false);
    }
  },
  show: function () {
    $("#execReportSection").show();
  },
  hide: function () {
    $("#execReportSection").hide();
  },
  adjustCol: function () {
    if ($.fn.dataTable.isDataTable("#execReports")) {
      $("#execReports").DataTable().columns.adjust();
    }
  }
};

// summary component
window.fiui.summary = {
  init: function () {
    let html = `
    <div class="content-header">
    <div class="container-fluid">
    <div class="row mb-2">
    <div class="col-sm-6">
    <h1 class="m-0">Dashboard</h1>
    </div>
    </div>
    </div>
    </div>
    <section class="content">
    <div class="container-fluid">
    <div class="row">
    <div class="col-12 col-sm-6 col-md-3">
    <div class="info-box">
    <span class="info-box-icon bg-info elevation-1"><i class="fas fa-users"></i></span>
    <div class="info-box-content">
    <span class="info-box-text">Traders</span>
    <span class="info-box-number" id="traderCnt">0</span>
    </div>
    </div>
    </div>
    <div class="col-12 col-sm-6 col-md-3">
    <div class="info-box mb-3">
    <span class="info-box-icon bg-danger elevation-1"><i class="fas fa-shopping-cart"></i></span>
    <div class="info-box-content">
    <span class="info-box-text">Margin Used</span>
    <span class="info-box-number" id="marginUsedSum">0</span>
    </div>
    </div>
    </div>
    <div class="clearfix hidden-md-up"></div>
    <div class="col-12 col-sm-6 col-md-3">
    <div class="info-box mb-3">
    <span class="info-box-icon bg-success elevation-1"><i class="fas fa-money-bill"></i></span>
    <div class="info-box-content">
    <span class="info-box-text">Balance</span>
    <span class="info-box-number" id="balanceSum">0</span>
    </div>
    </div>
    </div>
    <div class="col-12 col-sm-6 col-md-3">
    <div class="info-box mb-3">
    <span class="info-box-icon bg-warning elevation-1"><i class="fas fa-coins"></i></span>
    <div class="info-box-content">
    <span class="info-box-text">Margin Available</span>
    <span class="info-box-number" id="marginAvailSum">0</span>
    </div>
    </div>
    </div>
    </div>
    <div class="row">
    <div class="col-md-12">
    <div class="card">
    <div class="card-header">
    <h5 class="card-title">Performance</h5>
    <div class="card-tools">
    <button type="button" class="btn btn-tool" data-card-widget="collapse">
    <i class="fas fa-minus"></i>
    </button>
    <button type="button" class="btn btn-tool" data-card-widget="remove">
    <i class="fas fa-times"></i>
    </button>
    </div>
    </div>
    <div class="card-body">
    <div class="row">
    <div class="col-md-8">
    <p class="text-center">
    <strong>Latest Total PL</strong>
    </p>
    <div class="chart">
    <canvas id="plChart" height="180" style="height: 180px;"></canvas>
    </div>
    </div>
    <div class="col-md-4">
    <p class="text-center">
    <strong>PL / Balance</strong>
    </p>
    <div class="progress-group">
    <span class="progress-text">ID: <a href="#" id="lnkAccountId0"></a></span>
    <span class="float-right" id="plBalance0"><b>0</b> / 0</span>
    <div class="progress progress-sm">
    <div class="progress-bar bg-success" style="width: 100%" id="performance0"></div>
    </div>
    </div>
    <div class="progress-group">
    <span class="progress-text">ID: <a href="#" id="lnkAccountId1"></a></span>
    <span class="float-right" id="plBalance1"><b>0</b> / 0</span>
    <div class="progress progress-sm">
    <div class="progress-bar bg-primary" style="width: 100%" id="performance1"></div>
    </div>
    </div>
    <div class="progress-group">
    <span class="progress-text">ID: <a href="#" id="lnkAccountId2"></a></span>
    <span class="float-right" id="plBalance2"><b>0</b> / 0</span>
    <div class="progress progress-sm">
    <div class="progress-bar bg-warning" style="width: 100%" id="performance2"></div>
    </div>
    </div>
    <div class="progress-group">
    <span class="progress-text">ID: <a href="#" id="lnkAccountId3"></a></span>
    <span class="float-right" id="plBalance3"><b>0</b> / 0</span>
    <div class="progress progress-sm">
    <div class="progress-bar bg-danger" style="width: 100%" id="performance3"></div>
    </div>
    </div>
    </div>
    </div>
    </div>
    <div class="card-footer">
    <div class="row">
    <div class="col-sm-3 col-6">
    <div class="description-block border-right">
    <span class="description-percentage text-warning" id="totalPlIndi"><i class="fas fa-caret-left"></i></span>
    <h5 class="description-header" id="totalPl">0</h5>
    <span class="description-text">PROFIT &amp; LOSS</span>
    </div>
    </div>
    <div class="col-sm-3 col-6">
    <div class="description-block border-right">
    <span class="description-percentage text-warning" id="equityIndi"><i class="fas fa-caret-left"></i></span>
    <h5 class="description-header" id="equity">0</h5>
    <span class="description-text">EQUITY</span>
    </div>
    </div>
    <div class="col-sm-3 col-6">
    <div class="description-block border-right">
    <span class="description-percentage text-warning" id="marginUsedIndi"><i class="fas fa-caret-left"></i></span>
    <h5 class="description-header" id="marginUsed">0</h5>
    <span class="description-text">MARGIN USED</span>
    </div>
    </div>
    <div class="col-sm-3 col-6">
    <div class="description-block">
    <span class="description-percentage text-warning" id="marginAvailableIndi"><i class="fas fa-caret-left"></i></span>
    <h5 class="description-header" id="marginAvailable">0</h5>
    <span class="description-text">MARGIN AVAIL</span>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    </section>`;

    $("#summarySection").html(html);

    let that = this;
    for (let k = 0; k < 4; k++) {
      (function (j) {
        $("#lnkAccountId" + j).on("click", function () {
          window.fiac.highlight = $("#lnkAccountId" + j).html();

          let totalPl = null;
          let data = window.fiac.info.accounts.data;
          let colIndex = window.fiac.info.accounts.colIndex;

          for (let i in data) {
            let account = data[i];

            if (window.fiac.highlight == account[colIndex.accountId]) {
              totalPl = (Math.round((account[colIndex.equity] - account[colIndex.balance]) * account[colIndex.toFixed]) / account[colIndex.toFixed]);
              that.refreshRankedDetails({
                totalPl: totalPl,
                equity: account[colIndex.equity],
                marginUsed: account[colIndex.marginUsed],
                marginAvailable: account[colIndex.marginAvailable]
              });

              break;
            }
          }

          if (window.fiac.highlight != null) {
            let time = new Date().toLocaleTimeString();

            if (that.plChart.data.labels.length >= 10) {
              that.removeChartData();
            }
            that.addChartData(time, totalPl);
          }
        });
      })(k);
    }

    let plChartCanvas = $("#plChart").get(0).getContext("2d")
    let plChartData = {
      labels: [1, 2],
      datasets: [{
        label: "Total PL",
        backgroundColor: "rgba(60,141,188,0.9)",
        borderColor: "rgba(60,141,188,0.8)",
        pointRadius: false,
        pointColor: "#3b8bba",
        pointStrokeColor: "rgba(60,141,188,1)",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(60,141,188,1)",
        data: [1, 2]
      }]
    };
    let plChartOptions = {
      maintainAspectRatio: false,
      responsive: true,
      legend: {
        display: false
      },
      scales: {
        xAxes: [{
          gridLines: {
            display: false
          }
        }],
        yAxes: [{
          gridLines: {
            display: false
          }
        }]
      }
    };
    this.plChart = new Chart(plChartCanvas, {
      type: "line",
      data: plChartData,
      options: plChartOptions
    });
  },
  refreshTime: 0,
  refreshInterval: 3000,
  refreshRankedDetails: function (val) {
    let time = new Date().getTime();
    if (time - this.refreshTime < this.refreshInterval) return;

    this.refreshTime = time;
    let oldTotalPl = $("#totalPl").html();
    let oldEquity = $("#equity").html();
    let oldMarginUsed = $("#marginUsed").html();
    let oldMarginAvailable = $("#marginAvailable").html();
    $("#totalPl").html(val.totalPl);
    $("#equity").html(val.equity);
    $("#marginUsed").html(val.marginUsed);
    $("#marginAvailable").html(val.marginAvailable);

    let tag = null;
    let color = null;
    tag = '<i class="fas fa-caret-left"></i>';
    color = "warning";
    if (oldTotalPl != "") {
      if (parseFloat(oldTotalPl) < val.totalPl) {
        tag = '<i class="fas fa-caret-up"></i>';
        color = "success";
      } else if (parseFloat(oldTotalPl) > val.totalPl) {
        tag = '<i class="fas fa-caret-down"></i>';
        color = "danger";
      }
    }
    $("#totalPlIndi").html(tag);
    $("#totalPlIndi").removeClass();
    $("#totalPlIndi").addClass("description-percentage");
    $("#totalPlIndi").addClass("text-" + color);
    tag = '<i class="fas fa-caret-left"></i>';
    color = "warning";
    if (oldEquity != "") {
      if (parseFloat(oldEquity) < val.equity) {
        tag = '<i class="fas fa-caret-up"></i>';
        color = "success";
      } else if (parseFloat(oldEquity) > val.equity) {
        tag = '<i class="fas fa-caret-down"></i>';
        color = "danger";
      }
    }
    $("#equityIndi").html(tag);
    $("#equityIndi").removeClass();
    $("#equityIndi").addClass("description-percentage");
    $("#equityIndi").addClass("text-" + color);
    tag = '<i class="fas fa-caret-left"></i>';
    color = "warning";
    if (oldMarginUsed != "") {
      if (parseFloat(oldMarginUsed) < val.marginUsed) {
        tag = '<i class="fas fa-caret-up"></i>';
        color = "success";
      } else if (parseFloat(oldMarginUsed) > val.marginUsed) {
        tag = '<i class="fas fa-caret-down"></i>';
        color = "danger";
      }
    }
    $("#marginUsedIndi").html(tag);
    $("#marginUsedIndi").removeClass();
    $("#marginUsedIndi").addClass("description-percentage");
    $("#marginUsedIndi").addClass("text-" + color);
    tag = '<i class="fas fa-caret-left"></i>';
    color = "warning";
    if (oldMarginAvailable != "") {
      if (parseFloat(oldMarginAvailable) < val.marginAvailable) {
        tag = '<i class="fas fa-caret-up"></i>';
        color = "success";
      } else if (parseFloat(oldMarginAvailable) > val.marginAvailable) {
        tag = '<i class="fas fa-caret-down"></i>';
        color = "danger";
      }
    }
    $("#marginAvailableIndi").html(tag);
    $("#marginAvailableIndi").removeClass();
    $("#marginAvailableIndi").addClass("description-percentage");
    $("#marginAvailableIndi").addClass("text-" + color);
  },
  render: function (traderCnt, balanceSum, marginUsedSum, marginAvailSum) {
    $("#traderCnt").html(traderCnt);
    $("#balanceSum").html(balanceSum);
    $("#marginUsedSum").html(marginUsedSum);
    $("#marginAvailSum").html(marginAvailSum);

    if (typeof window.fiac.ranking == "undefined" || window.fiac.ranking.length == 0) return;

    if (window.fiac.ranking.length < 4) {
      for (let i = 0; i < 4; i++) {
        $("#lnkAccountId" + i).html("");
        $("#plBalance" + i).html("<b></b> / ");

        let performance = 100;

        $("#performance" + i).css("width", performance + "%");
      }
    }

    for (let i in window.fiac.ranking) {
      let ranking = window.fiac.ranking[i];
      $("#lnkAccountId" + i).html(ranking.accountId);
      $("#plBalance" + i).html("<b>" + ranking.totalPl + "</b> / " + ranking.balance);

      let performance = 100;

      if (ranking.totalPl >= 0) {
        performance = ranking.totalPl / ranking.balance * 100;
        if (performance > 100) performance = 100;
        $("#performance" + i).removeClass();
        $("#performance" + i).addClass("progress-bar");
        $("#performance" + i).addClass("bg-success");
      } else if (ranking.totalPl < 0) {
        performance = - ranking.totalPl / ranking.balance * 100;
        if (performance < 30) {
          $("#performance" + i).removeClass();
          $("#performance" + i).addClass("progress-bar");
          $("#performance" + i).addClass("bg-warning");
        } else {
          $("#performance" + i).removeClass();
          $("#performance" + i).addClass("progress-bar");
          $("#performance" + i).addClass("bg-danger");
        }
      }

      $("#performance" + i).css("width", performance + "%");
    }

    let totalPl = null;
    let data = window.fiac.info.accounts.data;
    let colIndex = window.fiac.info.accounts.colIndex

    if (window.fiac.highlight == null) {
      for (let i in data) {
        let account = data[i];

        if (window.fiac.ranking[0].accountId == account[colIndex.accountId]) {
          window.fiac.highlight = account[colIndex.accountId];
          totalPl = (Math.round((account[colIndex.equity] - account[colIndex.balance]) * account[colIndex.toFixed]) / account[colIndex.toFixed]);

          this.refreshRankedDetails({
            totalPl: totalPl,
            equity: account[colIndex.equity],
            marginUsed: account[colIndex.marginUsed],
            marginAvailable: account[colIndex.marginAvailable]
          });

          break;
        }
      }
    } else {
      for (let i in data) {
        let account = data[i];

        if (window.fiac.highlight == account[colIndex.accountId]) {
          totalPl = (Math.round((account[colIndex.equity] - account[colIndex.balance]) * account[colIndex.toFixed]) / account[colIndex.toFixed]);

          this.refreshRankedDetails({
            totalPl: totalPl,
            equity: account[colIndex.equity],
            marginUsed: account[colIndex.marginUsed],
            marginAvailable: account[colIndex.marginAvailable]
          });

          break;
        }
      }
    }

    if (window.fiac.highlight != null) {
      let time = new Date().toLocaleTimeString();

      if (this.plChart.data.labels.length >= 10) {
        this.removeChartData();
      }
      this.addChartData(time, totalPl);
    }
  },
  addChartData: function (label, val) {
    this.plChart.data.labels.push(label);
    this.plChart.data.datasets[0].data.push(val);
    this.plChart.update();
  },
  removeChartData: function () {
    this.plChart.data.labels.splice(0, 1);
    this.plChart.data.datasets.forEach((dataset) => {
      dataset.data.splice(0, 1);
    });
    this.plChart.update();
  },
  show: function () {
    $("#summarySection").show();
  },
  hide: function () {
    $("#summarySection").hide();
  }
};

// statistics component
window.fiui.stats = {
  renderBr: function () {
    if (typeof window.fiac.brRanking == "undefined" || window.fiac.brRanking.length == 0) return;

    let html1 = `
    <div class="content-header">
    <div class="container-fluid">
    <div class="row mb-2">
    <div class="col-sm-6">
    <h1 class="m-0">Statistics</h1>
    </div>
    <div class="col-sm-6">
    <ol class="breadcrumb float-sm-right">
    <li class="breadcrumb-item"><a href="javascript:window.fiui.sidebar.showSummary()">Home</a></li>
    <li class="breadcrumb-item active">Statistics</li>
    </ol>
    </div>
    </div>
    </div>
    </div>
    <section class="content">
    <div class="container-fluid">
    <div class="row">
    <div class="col-md-12">
    <div class="card">
    <div class="card-header">
    <h5 class="card-title">Performance of Brokers</h5>
    <div class="card-tools">
    <button type="button" class="btn btn-tool" data-card-widget="collapse">
    <i class="fas fa-minus"></i>
    </button>
    <button type="button" class="btn btn-tool" data-card-widget="remove">
    <i class="fas fa-times"></i>
    </button>
    </div>
    </div>
    <div class="card-body">
    <div class="row">
    <div class="col-md-8">
    <p class="text-center">
    <strong>Latest PL</strong>
    </p>
    <div class="chart">
    <canvas id="brokerPlChart" height="180" style="height: 180px;"></canvas>
    </div>
    </div>
    <div class="col-md-4">
    <p class="text-center">
    <strong>PL / Balance</strong>
    </p>`;

    let html2 = '';
    for (let i in window.fiac.brRanking) {
      let tmp =
      `<div class="progress-group">` +
      `<span class="progress-text">Name: <a href="#" id="lnkBrokerName${i}"></a></span>` +
      `<span class="float-right" id="brokerPlBalance${i}"><b>0</b> / 0</span>` +
      `<div class="progress progress-sm">` +
      `<div class="progress-bar bg-success" style="width: 100%" id="brPerformance${i}"></div>` +
      `</div>` +
      `</div>`;

      html2 += tmp;
    }

    let html3 = `
    </div>
    </div>
    </div>
    <div class="card-footer">
    </div>
    </div>
    </div>
    </div>
    </div>
    </section>`;

    $("#statsSection").html(html1 + html2 + html3);

    let that = this;

    for (let i in window.fiac.brRanking) {
      (function (j) {
        $("#lnkBrokerName" + j).on("click", function () {
          window.fiac.brHighlight = $("#lnkBrokerName" + j).html();
          that.refreshBr();
        });
      })(i);

      let ranking = window.fiac.brRanking[i];
      $("#lnkBrokerName" + i).html(ranking.brokerName);
      $("#brokerPlBalance" + i).html("<b>" + ranking.aPl + "</b> / " + ranking.brBalance);

      let performance = 100;

      if (ranking.aPl >= 0) {
        performance = ranking.aPl / ranking.balance * 100;
        if (performance > 100) performance = 100;
        $("#brPerformance" + i).removeClass();
        $("#brPerformance" + i).addClass("progress-bar");
        $("#brPerformance" + i).addClass("bg-success");
      } else if (ranking.aPl < 0) {
        performance = - ranking.aPl / ranking.balance * 100;
        if (performance < 30) {
          $("#brPerformance" + i).removeClass();
          $("#brPerformance" + i).addClass("progress-bar");
          $("#brPerformance" + i).addClass("bg-warning");
        } else {
          $("#brPerformance" + i).removeClass();
          $("#brPerformance" + i).addClass("progress-bar");
          $("#brPerformance" + i).addClass("bg-danger");
        }
      }

      $("#brPerformance" + i).css("width", performance + "%");
    }

    window.fiac.brHighlight = $("#lnkBrokerName0").html();
    this.refreshBr();
  },
  refreshBr: function () {
    let brRanking = null;

    for (let i in window.fiac.brRanking) {
      brRanking = window.fiac.brRanking[i];
      if (brRanking.brokerName == window.fiac.brHighlight) {
        break;
      }
    }

    if (typeof this.brokerPlChart == "undefined") {
      let plChartCanvas = $("#brokerPlChart").get(0).getContext("2d")
      let plChartData = {
        labels: [],
        datasets: []
      };
      plChartData.datasets.push({
        label: "Broker",
        backgroundColor: "rgba(60,141,188,0.9)",
        borderColor: "rgba(60,141,188,0.8)",
        pointRadius: false,
        pointColor: "#3b8bba",
        pointStrokeColor: "rgba(60,141,188,1)",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(60,141,188,1)",
        data: []
      })
      let plChartOptions = {
        maintainAspectRatio: false,
        responsive: true,
        legend: {
          display: false
        },
        scales: {
          xAxes: [{
            gridLines: {
              display: false
            }
          }],
          yAxes: [{
            gridLines: {
              display: false
            }
          }]
        }
      };
      this.brokerPlChart = new Chart(plChartCanvas, {
        type: "line",
        data: plChartData,
        options: plChartOptions
      });
    }

    this.removeBrokerChartData();
    this.addBrokerChartData(brRanking);
  },
  addBrokerChartData: function (brRanking) {
    for (let i in brRanking.time) {
      this.brokerPlChart.data.labels.push(brRanking.time[i]);
      this.brokerPlChart.data.datasets[0].data.push(brRanking.aPl[i]);
    }

    this.brokerPlChart.update();
  },
  removeBrokerChartData: function () {
    while (this.brokerPlChart.data.labels.length > 0) {
      this.brokerPlChart.data.labels.splice(0, 1);
      this.brokerPlChart.data.datasets.forEach((dataset) => {
        dataset.data.splice(0, 1);
      });
    }

    this.brokerPlChart.update();
  },
  show: function () {
    $("#statsSection").show();
  },
  hide: function () {
    $("#statsSection").hide();
  }
};

// copytrade list component
window.fiui.copyTradeList = {
  pro: [],
  init: function () {
    let that = this;

    let copyTradeListHtml =
    `<div class="content-header">
    <div class="container-fluid">
    <div class="row mb-2">
    <div class="col-sm-6">
    <h1 class="m-0">Copy Trades</h1>
    </div>
    <div class="col-sm-6">
    <ol class="breadcrumb float-sm-right">
    <li class="breadcrumb-item"><a href="javascript:window.fiui.sidebar.showSummary()">Home</a></li>
    <li class="breadcrumb-item active">Copy Trades</li>
    </ol>
    </div>
    </div>
    </div>
    </div>
    <section class="content">
    <div class="container-fluid">
    <p style="color:#ff5500">Please use accounts registered on the Fintechee Demo server to try out copy trading. We are currently testing additional hubs.</p>
    <div id="proList">
    </div>
    <div class="row">
    <div class="col-12">
    <div class="card">
    <div class="card-header">
    <h3 class="card-title">Copy Trade List</h3>
    </div>
    <div class="card-body">
    <table id="copyTradeList" class="table table-bordered table-striped">
    </table>
    </div>
    <div class="card-footer">
    <button type="button" class="btn btn-primary" id="btnShowCopyTrade">Add</button>
    </div>
    </div>
    </div>
    </div>
    </div>
    </section>`;

    $("#copyTradeSection").html(copyTradeListHtml);

    fetch("https://s3.eu-central-1.amazonaws.com/fintechee.net/trades2/shared.json")
    .then(response => response.json())
    .then(data => {
      let sortedData = data.sort((a, b) => {
        return parseFloat(b.pl) - parseFloat(a.pl);
      })
      let cardsHtml = '<div class="row">';

      for (let i in sortedData) {
        let account = sortedData[i];

        if (account.tradeNum > 0) {
          that.pro[account.brokerName + ":" + account.accountId] = account;
          cardsHtml += '<div>';
          cardsHtml += `<div class="custom-card my-3">
            <div class="username text-center">${account.accountId}</div>
            <div class="rounded-label mx-5" id="ct_${account.brokerName}_${account.accountId}">Copy</div>
            <div class="graph">
              <img class="img-fluid" src="https://s3.eu-central-1.amazonaws.com/fintechee.net/trades2/${account.brokerName}-${account.accountId}.png" alt="">
            </div>
          </div>`;
          cardsHtml += '</div>';
        }
      }
      $("#proList").html(cardsHtml)

      $("#proList .rounded-label").click(function() {
        let buttonId = $(this).attr("id");
        let pro = buttonId.split("_");

        that.showCopyTradingDlg(pro);
      });
    })

    let copyTradeDlgHtml = `
    <div class="modal fade" id="copyTradeDlg">
    <div class="modal-dialog">
    <div class="modal-content bg-info">
    <div class="modal-header">
    <h4 class="modal-title">Copy Trade</h4>
    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
    <span aria-hidden="true">&times;</span>
    </button>
    </div>
    <div class="modal-body">
    <div class="login-box" style="width:auto">
    <div class="card">
    <div class="card-body login-card-body" style="border:none;background-color:#17a2b8">
    <p class="login-box-msg">Please propose to copy trade an account.</p>
    <div class="row text-center text-secondary" style="color:#fff!important;font-size:12px">
        <div class="col-6 col-md-3 border-right">
          <div class="row">
              <div class="col-12 py-3">ProfitFactor
                  <p class="h5" id="profitFactorCt" style="font-size:12px"></p>
              </div>
          </div>
          <div class="row">
              <div class="col-12 py-3">WinRate
                  <p class="h5" id="winRateCt" style="font-size:12px"></p>
              </div>
          </div>
          <div class="row">
              <div class="col-12 py-3">AverageTrade
                  <p class="h5" id="averageTradeCt" style="font-size:12px"></p>
              </div>
          </div>
          <div class="row">
              <div class="col-12 py-3">LargestWin
                  <p class="h5" id="largestWinCt" style="font-size:12px"></p>
              </div>
          </div>
        </div>
        <div class="col-6 col-md-3 border-right">
          <div class="row">
              <div class="col-12 py-3">TradeCount
                  <p class="h5" id="tradeCountCt" style="font-size:12px"></p>
              </div>
          </div>
          <div class="row">
              <div class="col-12 py-3">AverageWin
                  <p class="h5" id="averageWinCt" style="font-size:12px"></p>
              </div>
          </div>
          <div class="row">
              <div class="col-12 py-3">AverageLoss
                  <p class="h5" id="averageLossCt" style="font-size:12px"></p>
              </div>
          </div>
          <div class="row">
              <div class="col-12 py-3">WinLossRatio
                  <p class="h5" id="winLossRatioCt" style="font-size:12px"></p>
              </div>
          </div>
        </div>
        <div class="col-6 col-md-3 border-right">
          <div class="row">
              <div class="col-12 py-3">MaxDrawdown
                  <p class="h5" id="maxDrawdownCt" style="font-size:12px"></p>
              </div>
          </div>
          <div class="row">
              <div class="col-12 py-3">Expectancy
                  <p class="h5" id="expectancyCt" style="font-size:12px"></p>
              </div>
          </div>
          <div class="row">
              <div class="col-12 py-3">SharpeRatio
                  <p class="h5" id="sharpeRatioCt" style="font-size:12px"></p>
              </div>
          </div>
          <div class="row">
              <div class="col-12 py-3">ZScore
                  <p class="h5" id="zScoreCt" style="font-size:12px"></p>
              </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="row">
              <div class="col-12 py-3">MaxConsecWins
                  <p class="h5" id="maxConsecutiveWinsCt" style="font-size:12px"></p>
              </div>
          </div>
          <div class="row">
              <div class="col-12 py-3">MaxConsecLoss
                  <p class="h5" id="maxConsecutiveLossesCt" style="font-size:12px"></p>
              </div>
          </div>
          <div class="row">
              <div class="col-12 py-3">MaxConsecProfit
                  <p class="h5" id="maxConsecutiveProfitCt" style="font-size:12px"></p>
              </div>
          </div>
          <div class="row">
              <div class="col-12 py-3">MaxConsecLoss
                  <p class="h5" id="maxConsecutiveLossCt" style="font-size:12px"></p>
              </div>
          </div>
        </div>
    </div>

    <form id="copyTradeForm">
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Pro" style="color:#000;background:#eee" id="commentCt">
    </div>
    <div class="input-group mb-3">
    <div class="icheck-primary">
    <input type="checkbox" id="chkReverseCt">
    <label for="chkReverseCt">
    Reverse
    </label>
    </div>
    </div>
    <div class="input-group mb-3">
    <div class="form-group">
    <div class="form-check">
    <input class="form-check-input" type="radio" name="modeCt" value="Lots" checked>
    <label class="form-check-label">Lots</label>
    </div>
    <div class="form-check">
    <input class="form-check-input" type="radio" name="modeCt" value="Multiplier">
    <label class="form-check-label">Multiplier</label>
    </div>
    </div>
    </div>
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Lots or Multiplier" style="color:#000;background:#eee" id="multiplierCt">
    </div>
    <div class="row">
    <div class="col-12" style="text-align:center">
    <div class="btn-group">
    <button type="button" class="btn btn-default" data-dismiss="modal" aria-label="Close">Cancel</button>
    <button type="button" class="btn btn-primary" id="btnProposeCopyTrade">Propose</button>
    </div>
    </div>
    </div>
    </form>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>`;

    $("#copyTradeDlgSection").html(copyTradeDlgHtml);

    fisdk.subscribeToNotification("copytrade_added", function (res) {
      console.log("copytrade_added");
      console.log(res);
      if (typeof res.message != "undefined" && res.message != "") {
        toastr.info(res.message);
      }
      if (typeof window.fiui.copyTradeList != "undefined" && typeof window.fiui.copyTradeList.copyTradeTable != "undefined") {
        window.fiui.copyTradeList.copyTradeTable.row.add(res.newCopyTrade).draw(false);
      }
    });

    fisdk.subscribeToNotification("copytrade_updated", function (res) {
      console.log("copytrade_updated");
      console.log(res);
      if (typeof res.message != "undefined" && res.message != "") {
        toastr.info(res.message);
      }

      if (typeof that.copyTradeDataTable != "undefined") {
        that.copyTradeDataTable.fnUpdate(res.val, res.rowId, res.colId, false, false);
      }
    });

    fisdk.subscribeToNotification("copytrade_removed", function (res) {
      console.log("copytrade_removed");
      console.log(res);
      if (typeof res.message != "undefined" && res.message != "") {
        toastr.info(res.message);
      }
      if (typeof that.copyTradeDataTable != "undefined") {
        that.copyTradeDataTable.fnDeleteRow(res.rowId);
      }
    });

    fisdk.subscribeToNotification("failed_to_propose_copytrade", function (res) {
      console.error("failed_to_propose_copytrade");
      if (typeof res.message != "undefined" && res.message != "") {
        console.error(res.message);
        toastr.error(res.message);
      }
    });

    fisdk.subscribeToNotification("failed_to_approve_copytrade", function (res) {
      console.error("failed_to_approve_copytrade");
      if (typeof res.message != "undefined" && res.message != "") {
        console.error(res.message);
        toastr.error(res.message);
      }
    });

    fisdk.subscribeToNotification("failed_to_disable_copytrade", function (res) {
      console.error("failed_to_disable_copytrade");
      if (typeof res.message != "undefined" && res.message != "") {
        console.error(res.message);
        toastr.error(res.message);
      }
    });

    $("#btnShowCopyTrade").on("click", function () {
      that.showDlg();
    });

    $("#btnProposeCopyTrade").on("click", function () {
      that.hideDlg();

      if (window.fiac.tradeToken != null) {
        if (!window.fiac.info.bManager) {
          let copyTraded = null;
          let bReverse = null;
          let mode = null;
          let multiplier = null;
          let comment = null;

          try {
            let brokerId = window.fiac.info.brokers.data[0][window.fiac.info.brokers.colIndex.brokerId];
            if (typeof window.fiac.copyTradingPlatformId[brokerId] == "undefined") {
              throw new Error("The copy trading hub of your broker is not supported yet.");
            }
            copyTraded = window.fiac.copyTradingPlatformId[brokerId];
            bReverse = $("#chkReverseCt").prop("checked");
            mode = $('input[name="modeCt"]:checked', '#copyTradeForm').val();
            multiplier = $("#multiplierCt").val();
            if (multiplier == "") {
              throw new Error("The multiplier is required.");
            }
            multiplier = parseFloat(multiplier);
            comment = $("#commentCt").val();
            if (comment == "") {
              comment = null;
            }
          } catch (e) {
            toastr.error(e.message);
          }

          fisdk.proposeCopyTrade(window.fiac.brokerName, window.fiac.accountId, window.fiac.tradeToken, copyTraded, bReverse, mode, multiplier, comment);
        } else {
          toastr.error("The managers can't propose to copy trade an account.");
        }
      } else {
        if (window.fiac.investorPassword != null) {
          toastr.error("You can't propose to copy trade an account in the investor mode.");
        } else {
          toastr.error("Please login.");
        }
      }
    });
  },
  render: function (res) {
    let copyTradeTable = null;

    if ($.fn.dataTable.isDataTable("#copyTradeList")) {
      copyTradeTable = $("#copyTradeList").DataTable();
      if (copyTradeTable.data().count() > 0) {
        copyTradeTable.clear().draw();
      }
      copyTradeTable.destroy();
      $("#copyTradeList").empty();
    }

    if (window.fiac.tradeToken != null) {
      if (res.bManager) {
        res.copyTrades.columns.splice(res.copyTrades.columns.length - 1, 1);
        copyTradeTable = $("#copyTradeList").DataTable({
          "responsive": false, "lengthChange": false, "autoWidth": false,
          "buttons": ["copy", "csv", "print", "colvis"],
          "columns": res.copyTrades.columns
        });
      } else {
        res.copyTrades.columns[0].title = "Platform";
        res.copyTrades.columns[5].title = "Pro";
        copyTradeTable = $("#copyTradeList").DataTable({
          "responsive": false, "lengthChange": false, "autoWidth": false,
          "buttons": ["copy", "csv", "print", "colvis"],
          "columns": res.copyTrades.columns,
          "columnDefs": [
            {targets: -1, data: null,
            defaultContent:
            '<div class="btn-group">' +
            '<button class="btn btn-sm" id="btnApproveCopyTrade" title="Approve"><i class="fas fa-check nav-icon"></i></button>' +
            '<button class="btn btn-sm" id="btnDisableCopyTrade" title="Disable"><i class="fas fa-eraser nav-icon"></i></button>' +
            '</div>'}
          ]
        });
      }

      copyTradeTable.buttons().container().appendTo("#copyTradeList_wrapper .col-md-6:eq(0)");
      this.copyTradeTable = copyTradeTable;
      this.copyTradeDataTable = $("#copyTradeList").dataTable();

      $("#copyTradeList tbody").on("click", "[id*=btnApproveCopyTrade]", function () {
        if (copyTradeTable != null) {
          let data = copyTradeTable.row($(this).parents("tr")).data();

          window.fiui.confirmDlg.nextProcessTarget = {
            copyTrading: data[res.copyTrades.colIndex.copyTrading],
            comment: data[res.copyTrades.colIndex.comment]
          };
          window.fiui.confirmDlg.nextProcessCallback = function () {
            fisdk.approveCopyTrade(window.fiac.brokerName, window.fiac.accountId, window.fiac.tradeToken,
              window.fiui.confirmDlg.nextProcessTarget.copyTrading, window.fiui.confirmDlg.nextProcessTarget.comment);
          }

          window.fiui.confirmDlg.show();
        }
      });

      $("#copyTradeList tbody").on("click", "[id*=btnDisableCopyTrade]", function () {
        if (copyTradeTable != null) {
          let data = copyTradeTable.row($(this).parents("tr")).data();

          window.fiui.confirmDlg.nextProcessTarget = {
            copyTraded: data[res.copyTrades.colIndex.copyTraded],
            copyTrading: data[res.copyTrades.colIndex.copyTrading],
            comment: data[res.copyTrades.colIndex.comment]
          };
          window.fiui.confirmDlg.nextProcessCallback = function () {
            fisdk.disableCopyTrade(window.fiac.brokerName, window.fiac.accountId, window.fiac.tradeToken,
              window.fiui.confirmDlg.nextProcessTarget.copyTraded, window.fiui.confirmDlg.nextProcessTarget.copyTrading, window.fiui.confirmDlg.nextProcessTarget.comment);
          }

          window.fiui.confirmDlg.show();
        }
      });

      for (let i in res.copyTrades.data) {
        copyTradeTable.row.add(res.copyTrades.data[i]).draw(false);
      }
    }
  },
  show: function () {
    $("#copyTradeSection").show();
  },
  hide: function () {
    $("#copyTradeSection").hide();
  },
  showCopyTradingDlg : function (pro) {
    $("#profitFactorCt").text("");
    $("#winRateCt").text("");
    $("#averageTradeCt").text("");
    $("#largestWinCt").text("");
    $("#tradeCountCt").text("");
    $("#averageWinCt").text("");
    $("#averageLossCt").text("");
    $("#winLossRatioCt").text("");
    $("#maxDrawdownCt").text("");
    $("#expectancyCt").text("");
    $("#sharpeRatioCt").text("");
    $("#zScoreCt").text("");
    $("#maxConsecutiveWinsCt").text("");
    $("#maxConsecutiveLossesCt").text("");
    $("#maxConsecutiveProfitCt").text("");
    $("#maxConsecutiveLossCt").text("");

    fetch(`https://s3.eu-central-1.amazonaws.com/fintechee.net/trades2/${pro[1]}-${pro[2]}.json`)
    .then(response => response.json())
    .then(data => {
      const trades = data;

      $("#profitFactorCt").text(window.fiac.calculateProfitFactor(trades).toFixed(2));
      $("#winRateCt").text(window.fiac.calculateWinRate(trades).toFixed(2));
      $("#averageTradeCt").text(window.fiac.calculateAverageTrade(trades).toFixed(2));
      $("#largestWinCt").text(window.fiac.calculateLargestWin(trades).toFixed(2));
      $("#tradeCountCt").text(window.fiac.calculateTradeCount(trades));
      $("#averageWinCt").text(window.fiac.calculateAverageWin(trades).toFixed(2));
      $("#averageLossCt").text(window.fiac.calculateAverageLoss(trades).toFixed(2));
      $("#winLossRatioCt").text(window.fiac.calculateWinLossRatio(trades).toFixed(2));
      $("#maxDrawdownCt").text(window.fiac.calculateMaxDrawdown(trades).toFixed(2));
      $("#expectancyCt").text(window.fiac.calculateExpectancy(trades).toFixed(2));
      $("#sharpeRatioCt").text(window.fiac.calculateSharpeRatio(trades, 0.02));
      $("#zScoreCt").text(window.fiac.calculateZScore(trades).toFixed(2));
      $("#maxConsecutiveWinsCt").text(window.fiac.calculateMaxConsecutiveWins(trades).toFixed(2));
      $("#maxConsecutiveLossesCt").text(window.fiac.calculateMaxConsecutiveLosses(trades).toFixed(2));
      $("#maxConsecutiveProfitCt").text(window.fiac.calculateMaxConsecutiveProfit(trades).toFixed(2));
      $("#maxConsecutiveLossCt").text(window.fiac.calculateMaxConsecutiveLoss(trades).toFixed(2));
    });

    $("#commentCt").val(pro[1] + ":" + pro[2]);
    this.showDlg();
  },
  showDlg: function () {
    $("#copyTradeDlg").modal("show");
  },
  hideDlg: function () {
    $("#copyTradeDlg").modal("hide");
  },
  adjustCol: function () {
    if ($.fn.dataTable.isDataTable("#copyTradeList")) {
      $("#copyTradeList").DataTable().columns.adjust();
    }
  }
};

// privilege list component
window.fiui.privilegeList = {
  init: function () {
    let privilegeListHtml =
    `<div class="content-header">
    <div class="container-fluid">
    <div class="row mb-2">
    <div class="col-sm-6">
    <h1 class="m-0">Privileges</h1>
    </div>
    <div class="col-sm-6">
    <ol class="breadcrumb float-sm-right">
    <li class="breadcrumb-item"><a href="javascript:window.fiui.sidebar.showSummary()">Home</a></li>
    <li class="breadcrumb-item active">Privileges</li>
    </ol>
    </div>
    </div>
    </div>
    </div>
    <section class="content">
    <div class="container-fluid">
    <div class="row">
    <div class="col-12">
    <div class="card">
    <div class="card-header">
    <h3 class="card-title">Privilege List</h3>
    </div>
    <div class="card-body">
    <table id="privilegeList" class="table table-bordered table-striped">
    </table>
    </div>
    <div class="card-footer">
    <button type="button" class="btn btn-primary" id="btnShowPrivilege">Add</button>
    </div>
    </div>
    </div>
    </div>
    </div>
    </section>`;

    $("#privilegeSection").html(privilegeListHtml);

    let privilegeDlgHtml =
    `<div class="modal fade" id="privilegeDlg">
    <div class="modal-dialog">
    <div class="modal-content bg-info">
    <div class="modal-header">
    <h4 class="modal-title">Privilege</h4>
    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
    <span aria-hidden="true">&times;</span>
    </button>
    </div>
    <div class="modal-body">
    <div class="login-box" style="width:auto">
    <div class="card">
    <div class="card-body login-card-body" style="border:none;background-color:#17a2b8">
    <p class="login-box-msg">Please grant the privilege.</p>
    <form id="privilegeForm">
    <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Account ID" style="color:#000;background:#eee" id="accountIdPv">
    </div>
    <div class="input-group mb-3">
    <select class="form-control" style="color:#000;background:#eee" id="privilegePv">
    <option>Copy Trading</option>
  	<option>Copy Traded</option>
    </select>
    </div>
    <div class="row">
    <div class="col-12" style="text-align:center">
    <div class="btn-group">
    <button type="button" class="btn btn-default" data-dismiss="modal" aria-label="Close">Cancel</button>
    <button type="button" class="btn btn-primary" id="btnGrantPrivilege">Propose</button>
    </div>
    </div>
    </div>
    </form>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>`;

    $("#privilegeDlgSection").html(privilegeDlgHtml);

    let that = this;

    fisdk.subscribeToNotification("privilege_added", function (res) {
      console.log("privilege_added");
      console.log(res);
      if (typeof res.message != "undefined" && res.message != "") {
        toastr.info(res.message);
      }
      if (typeof window.fiui.privilegeList != "undefined" && typeof window.fiui.privilegeList.privilegeTable != "undefined") {
        window.fiui.privilegeList.privilegeTable.row.add(res.newPrivilege).draw(false);
      }
    });

    fisdk.subscribeToNotification("privilege_removed", function (res) {
      console.log("privilege_removed");
      console.log(res);
      if (typeof res.message != "undefined" && res.message != "") {
        toastr.info(res.message);
      }
      if (typeof that.privilegeDataTable != "undefined") {
        that.privilegeDataTable.fnDeleteRow(res.rowId);
      }
    });

    fisdk.subscribeToNotification("failed_to_grant_privilege", function (res) {
      console.error("failed_to_grant_privilege");
      if (typeof res.message != "undefined" && res.message != "") {
        console.error(res.message);
        toastr.error(res.message);
      }
    });

    fisdk.subscribeToNotification("failed_to_revoke_privilege", function (res) {
      console.error("failed_to_revoke_privilege");
      if (typeof res.message != "undefined" && res.message != "") {
        console.error(res.message);
        toastr.error(res.message);
      }
    });

    $("#btnShowPrivilege").on("click", function () {
      that.showDlg();
    });

    $("#btnGrantPrivilege").on("click", function () {
      that.hideDlg();

      if (window.fiac.info.bManager && window.fiac.tradeToken != null) {
        fisdk.grantPrivilege($("#accountIdPv").val(), $("#privilegePv").val());
      } else {
        if (window.fiac.investorPassword != null) {
          toastr.error("You can't grant the privilege in the investor mode.");
        } else {
          toastr.error("Please login.");
        }
      }
    });
  },
  render: function (res) {
    let privilegeTable = null;

    if ($.fn.dataTable.isDataTable("#privilegeList")) {
      privilegeTable = $("#privilegeList").DataTable();
      if (privilegeTable.data().count() > 0) {
        privilegeTable.clear().draw();
      }
      privilegeTable.destroy();
      $("#privilegeList").empty();
    }

    if (res.bManager && window.fiac.tradeToken != null) {
      privilegeTable = $("#privilegeList").DataTable({
        "responsive": false, "lengthChange": false, "autoWidth": false,
        "buttons": ["copy", "csv", "print", "colvis"],
        "columns": res.privileges.columns,
        "columnDefs": [
          {targets: -1, data: null,
          defaultContent:
          '<div class="btn-group">' +
          '<button class="btn btn-sm" id="btnRevokePrivilege" title="Revoke"><i class="fas fa-eraser nav-icon"></i></button>' +
          '</div>'}
        ]
      });

      privilegeTable.buttons().container().appendTo("#privilegeList_wrapper .col-md-6:eq(0)");
      this.privilegeTable = privilegeTable;
      this.privilegeDataTable = $("#privilegeList").dataTable();

      $("#privilegeList tbody").on("click", "[id*=btnRevokePrivilege]", function () {
        if (privilegeTable != null) {
          let data = privilegeTable.row($(this).parents("tr")).data();

          window.fiui.confirmDlg.nextProcessTarget = {
            accountId: data[res.privileges.colIndex.accountId],
            privilege: data[res.privileges.colIndex.privilege]
          };
          window.fiui.confirmDlg.nextProcessCallback = function () {
            fisdk.revokePrivilege(window.fiui.confirmDlg.nextProcessTarget.accountId, window.fiui.confirmDlg.nextProcessTarget.privilege);
          }

          window.fiui.confirmDlg.show();
        }
      });

      for (let i in res.privileges.data) {
        privilegeTable.row.add(res.privileges.data[i]).draw(false);
      }
    }
  },
  show: function () {
    $("#privilegeSection").show();
  },
  hide: function () {
    $("#privilegeSection").hide();
  },
  showDlg: function () {
    $("#privilegeDlg").modal("show");
  },
  hideDlg: function () {
    $("#privilegeDlg").modal("hide");
  },
  adjustCol: function () {
    if ($.fn.dataTable.isDataTable("#privilegeList")) {
      $("#privilegeList").DataTable().columns.adjust();
    }
  }
};

// championship component
window.fiui.championship = {
  area: "Guide",
  calendar: null,
  championship: null,
  init: function () {
    const pageName = window.location.pathname.split('/').pop();
    let desc = "";

    if (pageName.indexOf("champion-dashboard") != -1) {
      this.area = "Area 1";
      $("a[target='web-trader']").attr("href", "/champion-trader");
    } else if (pageName.indexOf("champion-dashboard2") != -1) {
      this.area = "Area 2";
    } else if (pageName.indexOf("champion-dashboard3") != -1) {
      this.area = "Area 3";
    } else if (pageName.indexOf("champion-dashboard4") != -1) {
      this.area = "Area 4";
    } else if (pageName.indexOf("dashboard") != -1) {
      desc = `
      <ul>
      <li>No real funds except for the prize will be involved(risk-free).</li>
      <li>After entering the respective area, please select the corresponding championship unit to register for the competition account.</li>
      <li>Each championship area consists of three units, with 32 participants in each unit competing in an elimination format to determine the first-place winner, who will receive a $500 cash prize.</li>
      <li>Please do not register with the same email for multiple championship units; any such duplications will result in disqualification.</li>
      <li>Elimination rounds begin one week after the start of the competition, with each week pitting two participants against each other based on their net equity.</li>
      <li>The participant with the higher net equity advances to the next week, while those with equal net equity are randomly drawn to determine the winner.</li>
      <li>The ultimate winner of each unit will be determined over a five-week period. The starting date for each unit's competition will be announced one week before the championship begins.</li>
      </ul>
      <p class="text-warning">Please choose a Championship Area to enter.</p>`;
    }

    let championshipHtml =
    `<div class="content-header">
    <div class="container-fluid">
    <div class="row mb-2">
    <div class="col-sm-6">
    <h1 class="m-0">Championship</h1>
    </div>
    <div class="col-sm-6">
    <ol class="breadcrumb float-sm-right">
    <li class="breadcrumb-item"><a href="javascript:window.fiui.sidebar.showSummary()">Home</a></li>
    <li class="breadcrumb-item active">${this.area}</li>
    </ol>
    </div>
    </div>
    </div>
    </div>
    <section class="content">
    <div class="container-fluid">
    <div class="row">
    <div class="col-12">
    <div class="card">
    <div class="card-header">
    <h3 class="card-title">${this.area}</h3>
    </div>
    <div class="card-body">
    ${desc}
    <div class="row">
    <div class="col-12 col-sm-6 col-md-3" id="championshipArea1" style="cursor:pointer">
    <div class="info-box">
    <span class="info-box-icon bg-info elevation-1"><i class="fas fa-trophy"></i></span>
    <div class="info-box-content">
    <span class="info-box-text">Area 1</span>
    <span class="info-box-number"></span>
    </div>
    </div>
    </div>
    <div class="col-12 col-sm-6 col-md-3" id="championshipArea2">
    <div class="info-box mb-3">
    <span class="info-box-icon bg-danger elevation-1"><i class="fas fa-trophy"></i></span>
    <div class="info-box-content">
    <span class="info-box-text">Area 2(Maintaining)</span>
    <span class="info-box-number"></span>
    </div>
    </div>
    </div>
    <div class="clearfix hidden-md-up"></div>
    <div class="col-12 col-sm-6 col-md-3" id="championshipArea3">
    <div class="info-box mb-3">
    <span class="info-box-icon bg-success elevation-1"><i class="fas fa-trophy"></i></span>
    <div class="info-box-content">
    <span class="info-box-text">Area 3(Maintaining)</span>
    <span class="info-box-number"></span>
    </div>
    </div>
    </div>
    <div class="col-12 col-sm-6 col-md-3" id="championshipArea4">
    <div class="info-box mb-3">
    <span class="info-box-icon bg-warning elevation-1"><i class="fas fa-trophy"></i></span>
    <div class="info-box-content">
    <span class="info-box-text">Area 4(Maintaining)</span>
    <span class="info-box-number"></span>
    </div>
    </div>
    </div>
    </div>
    <div class="row">
    <div class="col-12 col-sm-12 col-md-12">
    <p class="text-warning">Check the match status:</p>
    <div class="btn-group">
    <button class="btn btn-sm btn-success" id="championshipTest">Test</button>
    <button class="btn btn-sm btn-success" id="championshipUnit1">Unit 1</button>
    <button class="btn btn-sm btn-success" id="championshipUnit2">Unit 2</button>
    <button class="btn btn-sm btn-success" id="championshipUnit3">Unit 3</button>
    </div>
    </div>
    </div>
    <br>
    <div id="championshipCalendar"></div>
    <div id="brackets"></div>
    </div>
    <div class="card-footer">
    <button type="button" class="btn btn-success" id="btnJoinChampionship">Join</button>
    <button type="button" class="btn btn-primary" id="btnBackToDashboard">Back to Dashboard</button>
    </div>
    </div>
    </div>
    </div>
    </div>
    </section>`;

    $("#championshipSection").html(championshipHtml);

    let championshipDlgHtml = `
    <div class="modal fade" id="championshipDlg">
    <div class="modal-dialog">
    <div class="modal-content bg-info">
    <div class="modal-header">
    <h4 class="modal-title">Championship</h4>
    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
    <span aria-hidden="true">&times;</span>
    </button>
    </div>
    <div class="modal-body">
    <div class="login-box" style="width:auto">
    <div class="card">
    <div class="card-body login-card-body" style="border:none;background-color:#17a2b8">
    <p class="login-box-msg">Please check the match status between the two participants.</p>

    <div id="participants" class="container-fluid">
    </div>

    <div class="row">
    <div class="col-12" style="text-align:center">
    <div class="btn-group">
    </div>
    </div>
    </div>

    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>`;

    $("#championshipDlgSection").html(championshipDlgHtml);

    if (this.area == "Guide") {
      $("#btnBackToDashboard").hide();
    }

    this.getCalendar();

    let that = this;

    $("#btnJoinChampionship").on("click", function () {
      window.fiui.confirmDlg.nextProcessCallback = function () {
        if (window.fiac.brokerName == null) {
          toastr.error("Please login.");
        } else if (window.fiac.info == null) {
          toastr.error("Please wait for totally loading done.");
        } else {
          let brokerId = window.fiac.info.brokers.data[0][window.fiac.info.brokers.colIndex.brokerId];
          const regex = /^c\d+$/;

          if (!regex.test(brokerId) && brokerId != "fe") {
            toastr.error("Please create an account in one AREA to enter and then join.");
            return;
          }

          $.ajax({
            type: "POST",
            url: "https://nafy6vz88b.execute-api.eu-central-1.amazonaws.com/v1/championship",
            data: JSON.stringify({
              brokerName: brokerId,
              accountId: window.fiac.accountId,
              tradeToken: window.fiac.tradeToken
            }),
            success: function (data) {
              if (data.res == "success") {
                toastr.info("You participated successfully.");
                that.getChampionship(null);
              } else if (data.res == "isFull") {
                toastr.error("The capacity is full.");
              } else if (data.res == "joined") {
                toastr.error("You have already joined.");
              } else if (data.res == "isStarted") {
                toastr.error("The championship has already started.");
              } else {
                toastr.error("Failed to participate.");
              }
            }
          });
        }
      }

      window.fiui.confirmDlg.show();
    });

    $("#btnBackToDashboard").on("click", function () {
      window.location.href = "/dashboard";
    });

    $("#championshipArea1").on("click", function () {
      window.location.href = "/champion-dashboard";
    });

    $("#championshipTest").on("click", function () {
      const unit = "fe";
      that.renderCalendar(unit);
      that.getChampionship(unit);
    });
    $("#championshipUnit1").on("click", function () {
      const unit = "c1";
      that.renderCalendar(unit);
      that.getChampionship(unit);
    });
    $("#championshipUnit2").on("click", function () {
      toastr.error("Maintaining. Will be coming soon.");
    });
    $("#championshipUnit3").on("click", function () {
      toastr.error("Maintaining. Will be coming soon.");
    });
  },
  getCalendar: async function () {
    const response = await fetch(`https://s3.eu-central-1.amazonaws.com/fintechee.net/championship/calendar.json`);
    this.calendar = await response.json();
  },
  getChampionship: async function (unit) {
    if (unit == null && window.fiac.brokerName == null) {
      if (this.area != "Guide") {
        toastr.error("Please login.");
      }
      return;
    }

    if (unit == null && (window.fiac.info == null || window.fiac.info.brokers.data.length == 0)) {
      return;
    }

    let brokerId = unit == null ? window.fiac.info.brokers.data[0][window.fiac.info.brokers.colIndex.brokerId] : unit;
    const regex = /^c\d+$/;

    if (!regex.test(brokerId) && brokerId != "fe") {
      if ($("#championshipSection").css("display") == "block") {
        toastr.error("Please select a hosting server unit for the championship or test in Fintechee Demo server.");
      }
      return;
    }

    window.fiui.loadingDimmer.show();

    const response = await fetch(`https://s3.eu-central-1.amazonaws.com/fintechee.net/championship/${brokerId}.json`);
    const data = await response.json();

    window.fiui.loadingDimmer.hide();

    this.championship = data;

    let that = this;

    $("#brackets").bracket({
      init: this.championship.brackets,
      // teamWidth: 60,
      scoreWidth: 100,
      // matchMargin: 100,
      // roundMargin: 100,
      skipConsolationRound: true,
      onMatchClick: function (data) {
        let cardsHtml = "";
        if (typeof data != "undefined") {
          for (let i in data) {
            if (data[i] != null) {
              cardsHtml += `<div class="custom-card my-3" style="width:50%">
                <div class="username text-center">${data[i]}</div>
                <div class="rounded-label mx-5" id="ct_${that.championship.brokerName}_${data[i]}">Copy</div>
                <div class="graph">
                  <img class="img-fluid" src="https://s3.eu-central-1.amazonaws.com/fintechee.net/trades2/${that.championship.brokerName}-${data[i]}.png" alt="">
                </div>
              </div>`;
            }

            $("#participants").html(cardsHtml);

            $("#participants .rounded-label").click(function() {
              let buttonId = $(this).attr("id");
              let pro = buttonId.split("_");

              that.hideDlg();
              window.fiui.copyTradeList.showCopyTradingDlg(pro);
            });

            that.showDlg();
          }
        }
      }
    });
  },
  render: function () {
    this.getChampionship(null);
  },
  renderCalendar: function (unit) {
    if (this.calendar != null) {
      for (let i in this.calendar) {
        const cal = this.calendar[i];
        if (cal.unit == unit) {
          if (unit == "fe") {
            $("#championshipCalendar").html(
              `<ul>
              <li>${cal.desc}</li>
              <li>Round 1: ${cal.rounds[0]}</li>
              <li>Round 2: ${cal.rounds[1]}</li>
              <li>Round 3: ${cal.rounds[2]}</li>
              <li>Round 4: ${cal.rounds[3]}</li>
              </ul>`
            );
          } else {
            $("#championshipCalendar").html(
              `<ul>
              <li>${cal.desc}</li>
              <li>Round 1: ${cal.rounds[0]}</li>
              <li>Round 2: ${cal.rounds[1]}</li>
              <li>Round 3: ${cal.rounds[2]}</li>
              <li>Round 4: ${cal.rounds[3]}</li>
              <li>Round 5: ${cal.rounds[4]}</li>
              </ul>`
            );
          }
          break;
        }
      }
    }
  },
  show: function () {
    $("#championshipSection").show();
  },
  hide: function () {
    $("#championshipSection").hide();
  },
  showDlg: function () {
    $("#championshipDlg").modal("show");
  },
  hideDlg: function () {
    $("#championshipDlg").modal("hide");
  }
};

function loadDashboard () {
  $("#version").html("Version-" + getFintecheeVersion());

  toastr.options = {
    "closeButton": true,
    "positionClass": 'toast-bottom-right'
  };

  window.fiac.init();

  window.fiui.syncMsg.init();
  window.fiui.asyncMsg.init();
  window.fiui.profile.init();
  window.fiui.sidebar.init();
  window.fiui.confirmDlg.init();
  window.fiui.messageDlg.init();
  window.fiui.signUp.init();
  window.fiui.signIn.init();
  window.fiui.mfa.init();
  window.fiui.resetPw.init();
  window.fiui.changePw.init();
  window.fiui.payment.init();
  window.fiui.fix.init();
  window.fiui.brokerList.init();
  window.fiui.managerList.init();
  window.fiui.accountList.init();
  window.fiui.symbolList.init();
  window.fiui.openPosList.init();
  window.fiui.groupedOpenPosList.init();
  window.fiui.fundingHistory.init();
  window.fiui.execReports.init();
  window.fiui.summary.init();
  window.fiui.copyTradeList.init();
  window.fiui.privilegeList.init();
  window.fiui.championship.init();

  window.fiac.load();
}
