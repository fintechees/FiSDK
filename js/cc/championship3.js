var brokerDomain = {
	c7: "kbdemo.fintechee.cloud",
	c8: "kbdemo.fintechee.cloud",
	c9: "kbdemo.fintechee.cloud",
}

var brokerPort = {
	c7: "",
	c8: "",
	c9: "",
}

var brokerProtocol = {
	c7: "https://",
	c8: "https://",
	c9: "https://",
}

var shopDomain = {
	c7: "fintechee.shop",
	c8: "fintechee.shop",
	c9: "fintechee.shop",
}

var brokerName = {
	c7: "c7",
	c8: "c8",
	c9: "c9",
}

var signInShownBrokerName = {
	c7: "Championship Unit 7",
	c8: "Championship Unit 8",
	c9: "Championship Unit 9",
}

var shownBrokerName = {
	c7: "Championship U7",
	c8: "Championship U8",
	c9: "Championship U9",
}

var brokerCtx = []

brokerCtx[brokerName.c7] = {
	brokerName: brokerName.c7,
	dataStreamURL: brokerProtocol.c7 + brokerDomain.c7 + brokerPort.c7,
	dataBaseURL: brokerProtocol.c7 + brokerDomain.c7 + brokerPort.c7,
	orderStreamURL: brokerProtocol.c7 + brokerDomain.c7 + brokerPort.c7,
	orderBaseURL: brokerProtocol.c7 + brokerDomain.c7 + brokerPort.c7,
	shopURL: brokerProtocol.c7 + shopDomain.c7,
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

brokerCtx[brokerName.c8] = {
	brokerName: brokerName.c8,
	dataStreamURL: brokerProtocol.c8 + brokerDomain.c8 + brokerPort.c8,
	dataBaseURL: brokerProtocol.c8 + brokerDomain.c8 + brokerPort.c8,
	orderStreamURL: brokerProtocol.c8 + brokerDomain.c8 + brokerPort.c8,
	orderBaseURL: brokerProtocol.c8 + brokerDomain.c8 + brokerPort.c8,
	shopURL: brokerProtocol.c8 + shopDomain.c8,
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

brokerCtx[brokerName.c9] = {
	brokerName: brokerName.c9,
	dataStreamURL: brokerProtocol.c9 + brokerDomain.c9 + brokerPort.c9,
	dataBaseURL: brokerProtocol.c9 + brokerDomain.c9 + brokerPort.c9,
	orderStreamURL: brokerProtocol.c9 + brokerDomain.c9 + brokerPort.c9,
	orderBaseURL: brokerProtocol.c9 + brokerDomain.c9 + brokerPort.c9,
	shopURL: brokerProtocol.c9 + shopDomain.c9,
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
	C7: shownBrokerName.c7,
	C8: shownBrokerName.c8,
	C9: shownBrokerName.c9,
}
