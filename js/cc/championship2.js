var ibAccIdRequiredMode = false
var blankPageMode = false
var brokerDomain = {
	c4: "kbdemo.fintechee.cloud",
	c5: "kbdemo.fintechee.cloud",
	c6: "kbdemo.fintechee.cloud",
}

var brokerPort = {
	c4: "",
	c5: "",
	c6: "",
}

var brokerProtocol = {
	c4: "https://",
	c5: "https://",
	c6: "https://",
}

var shopDomain = {
	c4: "fintechee.shop",
	c5: "fintechee.shop",
	c6: "fintechee.shop",
}

var brokerName = {
	c4: "c4",
	c5: "c5",
	c6: "c6",
}

var signInShownBrokerName = {
	c4: "Championship Unit 4",
	c5: "Championship Unit 5",
	c6: "Championship Unit 6",
}

var shownBrokerName = {
	c4: "Championship U4",
	c5: "Championship U5",
	c6: "Championship U6",
}

var brokerCtx = []

brokerCtx[brokerName.c4] = {
	brokerName: brokerName.c4,
	dataStreamURL: brokerProtocol.c4 + brokerDomain.c4 + brokerPort.c4,
	dataBaseURL: brokerProtocol.c4 + brokerDomain.c4 + brokerPort.c4,
	orderStreamURL: brokerProtocol.c4 + brokerDomain.c4 + brokerPort.c4,
	orderBaseURL: brokerProtocol.c4 + brokerDomain.c4 + brokerPort.c4,
	shopURL: brokerProtocol.c4 + shopDomain.c4,
	logoURL: "/images/logo.png",
	syncServerSettingStatus: false,
	defaultSymbolNames: [
		"EUR/USD"
	],
	desc: "Championship Unit",
	startEndHour: 22,
	swapCalcHour: 22,
	pendingOdrsOpenTrdsNumLimit: 100,
	demoMode: true,
	currency: "USD",
	lotsUnit: 100000,
	toFixed: 100,
	commentLengthLimit: 50,
	lotsPerOrder: 0.01,
	externalData: false,
	externalURL: null,
	externalTk: null,
	externalMode: 0,
	spreadBetting: false,
	brokerless: false,
	creditsOnboard: false
}

brokerCtx[brokerName.c5] = {
	brokerName: brokerName.c5,
	dataStreamURL: brokerProtocol.c5 + brokerDomain.c5 + brokerPort.c5,
	dataBaseURL: brokerProtocol.c5 + brokerDomain.c5 + brokerPort.c5,
	orderStreamURL: brokerProtocol.c5 + brokerDomain.c5 + brokerPort.c5,
	orderBaseURL: brokerProtocol.c5 + brokerDomain.c5 + brokerPort.c5,
	shopURL: brokerProtocol.c5 + shopDomain.c5,
	logoURL: "/images/logo.png",
	syncServerSettingStatus: false,
	defaultSymbolNames: [
		"EUR/USD"
	],
	desc: "Championship Unit",
	startEndHour: 22,
	swapCalcHour: 22,
	pendingOdrsOpenTrdsNumLimit: 100,
	demoMode: true,
	currency: "USD",
	lotsUnit: 100000,
	toFixed: 100,
	commentLengthLimit: 50,
	lotsPerOrder: 0.01,
	externalData: false,
	externalURL: null,
	externalTk: null,
	externalMode: 0,
	spreadBetting: false,
	brokerless: false,
	creditsOnboard: false
}

brokerCtx[brokerName.c6] = {
	brokerName: brokerName.c6,
	dataStreamURL: brokerProtocol.c6 + brokerDomain.c6 + brokerPort.c6,
	dataBaseURL: brokerProtocol.c6 + brokerDomain.c6 + brokerPort.c6,
	orderStreamURL: brokerProtocol.c6 + brokerDomain.c6 + brokerPort.c6,
	orderBaseURL: brokerProtocol.c6 + brokerDomain.c6 + brokerPort.c6,
	shopURL: brokerProtocol.c6 + shopDomain.c6,
	logoURL: "/images/logo.png",
	syncServerSettingStatus: false,
	defaultSymbolNames: [
		"EUR/USD"
	],
	desc: "Championship Unit",
	startEndHour: 22,
	swapCalcHour: 22,
	pendingOdrsOpenTrdsNumLimit: 100,
	demoMode: true,
	currency: "USD",
	lotsUnit: 100000,
	toFixed: 100,
	commentLengthLimit: 50,
	lotsPerOrder: 0.01,
	externalData: false,
	externalURL: null,
	externalTk: null,
	externalMode: 0,
	spreadBetting: false,
	brokerless: false,
	creditsOnboard: false
}

var BROKER_NAME = {
  DEMO: "Fintechee Demo",
	FINTECHEE_DEMO: "Fintechee Demo",
	C4: shownBrokerName.c4,
	C5: shownBrokerName.c5,
	C6: shownBrokerName.c6,
}
