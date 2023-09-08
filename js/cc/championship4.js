var brokerDomain = {
	c10: "kbdemo.fintechee.cloud",
	c11: "kbdemo.fintechee.cloud",
}

var brokerPort = {
	c10: "",
	c11: "",
}

var brokerProtocol = {
	c10: "https://",
	c11: "https://",
}

var shopDomain = {
	c10: "fintechee.shop",
	c11: "fintechee.shop",
}

var brokerName = {
	c10: "c10",
	c11: "c11",
}

var signInShownBrokerName = {
	c10: "Championship Unit 10",
	c11: "Championship Unit 11",
}

var shownBrokerName = {
	c10: "Championship U10",
	c11: "Championship U11",
}

var brokerCtx = []

brokerCtx[brokerName.c10] = {
	brokerName: brokerName.c10,
	dataStreamURL: brokerProtocol.c10 + brokerDomain.c10 + brokerPort.c10,
	dataBaseURL: brokerProtocol.c10 + brokerDomain.c10 + brokerPort.c10,
	orderStreamURL: brokerProtocol.c10 + brokerDomain.c10 + brokerPort.c10,
	orderBaseURL: brokerProtocol.c10 + brokerDomain.c10 + brokerPort.c10,
	shopURL: brokerProtocol.c10 + shopDomain.c10,
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

brokerCtx[brokerName.c11] = {
	brokerName: brokerName.c11,
	dataStreamURL: brokerProtocol.c11 + brokerDomain.c11 + brokerPort.c11,
	dataBaseURL: brokerProtocol.c11 + brokerDomain.c11 + brokerPort.c11,
	orderStreamURL: brokerProtocol.c11 + brokerDomain.c11 + brokerPort.c11,
	orderBaseURL: brokerProtocol.c11 + brokerDomain.c11 + brokerPort.c11,
	shopURL: brokerProtocol.c11 + shopDomain.c11,
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
	C10: shownBrokerName.c10,
	C11: shownBrokerName.c11,
}
