var dictM = {
    cDH1: 'Important Operation',
    cDH2: 'Please make sure that you need to perform this process indeed? ' +
        'If you are sure, please press OK to continue.',
    cancel: 'Cancel',
    ok: 'OK',
    cRADH1: 'Remove Account',
    cRADH2: 'Please make sure that you need to perform this process indeed? This account will be removed after this operation. ' +
            'If you are sure, please press OK to continue.',
    cBADH1: 'Bind Account',
    cBADH2: 'Please make sure that you need to perform this process indeed? This account and the identifier will be bound together after this operation. ' +
            'If you are sure, please press OK to continue.',
    cBTDH1: 'Change Book Type',
    cBTDH2: 'Please make sure that you need to perform this process indeed? The book type of this account will be changed after this operation. ' +
            'If you are sure, please press OK to continue.',
    rAS1: 'Symbol',
    rAS2: 'Bid',
    rAS3: 'Swap Long',
    rAS4: 'Swap Short',
    rAS5: 'Minimal Volume',
    rAS6: 'Maximal Volume',
    rAS7: 'Volume Step',
    rAS8: '3-Days Swap',
    rAS9: 'Ask',
    rAS10: 'Operation',
    sSPH1: 'Add Symbols',
    sSPH2: 'Modify Symbol',
    rAL1: 'Account',
    rAL2: 'Email',
    rAL3: 'Balance',
    rAL4: 'PL',
    rAL5: 'Equity',
    rAL6: 'Margin Used',
    rAL7: 'Margin Available',
    rAL8: 'Identifier',
    rAL9: 'Operation',
    rAL10: 'Currency',
    rAL11: 'Book Type',
    rAL12: 'Level',
    rAL13: 'Latest DT',
    rAL14: 'A PL',
    rAL15: 'B PL',
    rAL16: 'Approved',
    rTFRL1: 'Account',
    rTFRL2: 'ID',
    rTFRL3: 'Payment ID',
    rTFRL4: 'Time',
    rTFRL5: 'Deposit(+) / Withdrawal(-)',
    rTFRL6: 'Commission',
    rTFRL7: 'Operation',
    rTFRL8: 'Comment',
    rTFRL9: 'Manager',
    tFEN1: 'Email',
    tFTN1: 'Type',
    tFFN1: 'Amount',
    tFDH1: 'Please Choose',
    tFDH2: 'Credit',
    tFDH3: 'Debit',
    tFCN1: 'Comment',
    bAAIN1: 'Account ID',
    bAIN1: 'Identifier',
    rOPL1: 'Account',
    rOPL2: 'Symbol',
    rOPL3: 'Type',
    rOPL4: 'Average Price',
    rOPL5: 'Lots',
    rOPL6: 'Unrealized PL',
    rOPL7: 'Operation',
    rOPL8: 'Swap',
    rOPL9: 'Commission',
    rGOPL1: 'Symbol',
    rGOPL2: 'Lots',
    rGOPL3: 'Bid',
    rGOPL4: 'Ask',
    rERL1: 'LP',
    rERL2: 'Time',
    rERL3: 'ClOrderID',
    rERL4: 'OrderID',
    rERL5: 'ExecID',
    rERL6: 'Symbol',
    rERL7: 'Side',
    rERL8: 'AvgPx',
    rERL9: 'CumQty',
    rERL10: 'ABook',
    rERL11: 'BrokerID',
    rS1: 'Broker',
    rS2: 'Broker Balance',
    rS3: 'Balance',
    rS4: 'PL',
    rS5: 'A PL',
    rS6: 'B PL',
    rS7: 'Date',
    sTPH1: 'Symbols',
    sTPH2: 'Members',
    sTPH3: 'Winners',
    sTPH4: 'Results',
    m1: "[m1]: Succeeded in starting service.",
    m2: "[m2]: Failed to start service.",
    m3: "[m3]: Service has already started.",
    m4: "[m4]: Succeeded in finishing service.",
    m5: "[m5]: Failed to stop service.",
    m6: "[m6]: On weekdays service may not be stopped.",
    m7: "[m7]: Trade is enabled.",
    m8: "[m8]: Trade is disabled.",
    m9: "[m9]: Failed to get service status.",
    m10: "[m10]: Succeeded in adding symbols.",
    m11: "[m11]: Failed to add symbols.",
    m12: "[m12]: The collection of symbols that you submitted is empty.",
    m13: "[m13]: Failed to get the specific trader.",
    m14: "[m14]: Succeeded in removing the specific account.",
    m15: "[m15]: Failed to complete the operation on the specific account because this account has pending orders.",
    m16: "[m16]: Failed to complete the operation on the specific account because this account has open trades.",
    m17: "[m17]: Failed to remove the specific account.",
    m18: "[m18]: The field of password is empty.",
    m19: "[m19]: The field of type is empty.",
    m20: "[m20]: The field of amount is not correct.",
    m21: "[m21]: Succeeded in transferring funds.",
    m22: "[m22]: Failed to transfer funds.",
    m23: "[m23]: Please be patient while starting or finishing service.",
    m24: "[m24]: Failed to setup brokers because this broker is not found.",
    m25: "[m25]: An account was created.",
    m26: "[m26]: The field of account ID is empty.",
    m27: "[m27]: The field of identifier is empty.",
    m28: "[m28]: Succeeded in binding the specific account.",
    m29: "[m29]: Failed to bind the specific account.",
    m30: "[m30]: Error occurs while getting execution reports.",
    m31: "[m31]: Failed to get the brokers list.",
    m32: "[m32]: Succeeded in adding broker.",
    m33: "[m33]: Failed to add broker.",
    m34: "[m34]: The collection of brokers that you submitted is empty.",
    m35: "[m35]: Failed to upgrade the role.",
    m36: "[m36]: Failed to downgrade the role.",
    m37: "[m37]: The calculation of financing has been done.",
    m38: "[m38]: The level is not supported.",
    m39: "[m39]: The commission to open long is not correct.",
    m40: "[m40]: The commission to close long is not correct.",
    m41: "[m41]: The commission to open short is not correct.",
    m42: "[m42]: The commission to close short is not correct.",
    m43: "[m43]: The mark-up for the Ask price is not correct.",
    m44: "[m44]: The mark-up for the Bid price is not correct.",
    m45: "[m45]: Failed to change the level.",
    m46: "[m46]: Failed to change the book type.",
    m47: "[m47]: Succeeded in changing the book type.",
    m48: "[m48]: Succeeded in modifying the profile of the broker.",
    m49: "[m49]: Failed to modify the profile of the broker.",
    m50: "[m50]: Succeeded in removing the profile of the broker.",
    m51: "[m51]: Failed to remove the profile of the broker.",
    m52: "[m52]: Succeeded in modifying the information of the symbol.",
    m53: "[m53]: Failed to modify the information of the symbol.",
    m54: "[m54]: Succeeded in removing the information of the symbol.",
    m55: "[m55]: Failed to remove the information of the symbol.",
    m56: "[m56]: The profile of the broker has existed.",
    m57: "[m57]: It is not allowed to remove.",
    m58: "[m58]: Succeeded in changing the level.",
    m59: "[m59]: Succeeded in setting FIX.",
    m60: "[m60]: Failed to set FIX.",
    m61: "[m61]: The liquidity provider ID is not correct.",
    m62: "[m62]: The Setting ID is not correct.",
    m63: "[m63]: The account should be changed to B-Book first.",
    m64: "[m64]: Failed to start service due to investor mode.",
    m65: "[m65]: Failed to stop service due to investor mode.",
    m66: "[m66]: Failed to set FIX due to investor mode.",
    m67: "[m67]: Failed to add broker due to investor mode.",
    m68: "[m68]: Failed to modify broker due to investor mode.",
    m69: "[m69]: Failed to remove broker due to investor mode.",
    m70: "[m70]: Failed to add symbols due to investor mode.",
    m71: "[m71]: Failed to modify symbol due to investor mode.",
    m72: "[m72]: Failed to remove symbol due to investor mode.",
    m73: "[m73]: Failed to remove account due to investor mode.",
    m74: "[m74]: Failed to bind account due to investor mode.",
    m75: "[m75]: The field of identifier is not a string type.",
    m76: "[m76]: Failed to upgrade the role due to investor mode.",
    m77: "[m77]: Failed to downgrade the role due to investor mode.",
    m78: "[m78]: Failed to transfer funds due to investor mode.",
    m79: "[m79]: Failed to change the book type due to investor mode.",
    m80: "[m80]: Failed to change the level due to investor mode.",
    m81: "[m81]: The book type is not boolean type.",
    m82: "[m82]: The manager component is missing.",
    m83: "[m83]: Failed to approve qualification.",
    m84: "[m84]: Failed to approve qualification due to investor mode.",
    m85: "[m85]: Failed to get the specific trader due to investor mode.",
    m86: "[m86]: Failed to create an invoice.",
    m87: "[m87]: Failed to create an invoice due to investor mode.",
    m88: "[m88]: Failed to create a payout.",
    m89: "[m89]: Failed to create a payout due to investor mode.",
    m90: "[m90]: The comment is not correct.",
    m91: "[m91]: The xpub is not correct.",
    m92: "[m92]: Succeeded in approving qualification.",
    m93: "[m93]: An account was removed.",
    m94: "[m94]: Succeeded in upgrading the role.",
    m95: "[m95]: Succeeded in downgrading the role.",
    m96: "[m96]: The xpub must be filled.",
    m97: "[m97]: The specific broker doestn't exist.",
    m98: "[m98]: The parameter: enable is not correct.",
    m99: "[m99]: Error occurs while getting statistics.",
    m100: "[m100]: Failed to get the copy trades list.",
    m101: "[m101]: Failed to get the privileges list.",
    m102: "[m102]: A privilege was granted.",
    m103: "[m103]: A privilege was revoked.",
    m104: "[m104]: You proposed to copy trade an account.",
    m105: "[m105]: You disabled copy trading an account.",
    m106: "[m106]: You approved a proposal to copy trade your account.",
    m107: "[m107]: You stopped your account from being copy traded.",
    m108: "[m108]: A proposal to copy trade your account is pending.",
    m109: "[m109]: Copy trading on your account is disabled.",
    m110: "[m110]: Your proposal to copy trade an account has been approved.",
    m111: "[m111]: Copy trading an account has been stopped.",
    m112: "[m112]: The copy trading mode is not correct.",
    m113: "[m113]: The copy trading multiplier is not correct.",
    m114: "[m114]: The targeted broker name is not correct.",
    m115: "[m115]: The targeted account ID is not correct.",
    m116: "[m116]: You can't copy trade your own account.",
    m117: "[m117]: Copy trading the specific account has existed.",
    m118: "[m118]: Copy trading the specific account doesn't exist.",
    m119: "[m119]: You successfully proposed to copy trade an account.",
    m120: "[m120]: You failed to propose to copy trade an account.",
    m121: "[m121]: You successfully approved a proposal to copy trade your account.",
    m122: "[m122]: You failed to approve a proposal to copy trade your account.",
    m123: "[m123]: You successfully disabled copy trading the specific account.",
    m124: "[m124]: You failed disable copy trading the specific account.",
    m125: "[m125]: The privilege is not correct.",
    m126: "[m126]: You successfully granted the privilege.",
    m127: "[m127]: You failed to grant the privilege.",
    m128: "[m128]: You failed to grant the privilege due to investor mode.",
    m129: "[m129]: You successfully revoked the privilege.",
    m130: "[m130]: You failed to revoke the privilege.",
    m131: "[m131]: You failed to revoke the privilege due to investor mode.",
    m132: "[m132]: You successfully liquidate the account.",
    m133: "[m133]: You failed to liquidate the account.",
    m134: "[m134]: You failed to liquidate the account due to investor mode.",
    m135: "[m135]: Error occurs while getting broker log.",
    m136: "[m136]: Succeeded in setting the copy trading profile.",
    m137: "[m137]: The commission rate is not correct.",
    m138: "[m138]: The period is not correct.",
    m139: "[m139]: The name is not correct.",
    m140: "[m140]: You failed to set the copy trading profile because your account has been copy traded.",
    m141: "[m141]: You failed to set the copy trading profile.",
    m142: "[m142]: An account has been bound.",
    m143: "[m143]: The book type of an account has been changed.",
    m144: "[m144]: The level of an account has been changed.",
    m145: "[m145]: The profile of a signal provider has been set.",
    rB1: 'Broker ID',
    rB2: 'Description',
    rB3: 'Currency',
    rB4: 'ToFixed',
    rB5: 'Operation',
    rB6: 'Balance',
    rB7: 'Broker',
    rB8: 'Email',
    bBN1: 'Broker ID',
  	bSBN1: "Broker Name",
  	bEM1: "Email",
  	bBD1: "Description",
  	bBL1: "Balance",
  	bLV1: "Level",
  	bCY1: "Currency",
  	bTF1: "ToFixed",
  	bPL1: "Profit and Loss",
  	bWD1: "Withdrawal Limit",
  	bMC1: "Margin Call Level",
  	bMO1: "Margin Closeout Level",
  	bEQ1: "Equity",
  	bMU1: "Margin Used",
  	bST1: "SMTP",
  	bSP1: "SMTP Port",
  	bEP1: "Email Password",
  	bPW1: "Password",
  	bDWP1: "Domain of WP",
  	bUWP1: "User Name of WP",
  	bPWP1: "Password of WP",
  	bBWP1: "Balance URL for WP",
  	bSWP1: "Sync Balance URL for WP",
  	bCOB1: "Credits Onboard",
  	bCOL1: "Credits Onboard Limit",
    bCPK1: "Payment Gateway API Key",
  	bPGS1: "Payment Gateway Store ID",
    bPGW1: "Payment Gateway Wallet ID",
    bPSR1: "Success Redirect URL",
    aBN1: 'Broker ID',
    aAI1: 'Account ID',
    aUG1: 'Upgrade',
    aDG1: 'Downgrade',
    cLLN1: "Level",
    cLBOC1: "Commission to Open Long",
    cLBCC1: "Commission to Close Long",
    cLSOC1: "Commission to Open Short",
    cLSCC1: "Commission to Close Short",
    cLA1: "Mark-Up for Ask",
    cLB1: "Mark-Up for Bid",
    fID1: "Setting ID",
    fLP1: "Liquidity Provider",
    fUAT1: "UAT",
    fDU1: "Data UserName",
    fDP1: "Data Password",
    fDB1: "Data Brand",
    fDA1: "Data AccountId",
    fDS1: "Data SenderCompID",
    fDT1: "Data TargetCompID",
    fDTS1: "Data TargetSubID",
    fOU1: "Trade UserName",
    fOP1: "Trade Password",
    fOB1: "Trade Brand",
    fOA1: "Trade AccountId",
    fOS1: "Trade SenderCompID",
    fOT1: "Trade TargetCompID",
    fOTS1: "Trade TargetSubID",
    fSL1: "Send Data Request List",
    fFD1: "Settings Done",
    rCT1: "Copy Traded",
    rCT2: "Copy Trading",
    rCT3: "Reverse",
    rCT4: "Mode",
    rCT5: "Multiplier",
    rCT6: "Comment",
    rCT7: "Time",
    rCT8: "State",
    rCT9: "Op",
    rP1: "Account ID",
    rP2: "Privilege",
    rP3: "Op",
    tO1: "Account",
    tO2: "Order ID",
    tO3: "Time",
    tO4: "Symbol",
    tO5: "Type",
    tO6: "Lots"
}
