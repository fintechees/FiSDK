var brokerDomain = {
	c1: "kbdemo.fintechee.cloud",
	c2: "kbdemo.fintechee.cloud",
	c3: "kbdemo.fintechee.cloud",
}

var brokerPort = {
	c1: "",
	c2: "",
	c3: "",
}

var brokerProtocol = {
	c1: "https://",
	c2: "https://",
	c3: "https://",
}

var shopDomain = {
	c1: "fintechee.shop",
	c2: "fintechee.shop",
	c3: "fintechee.shop",
}

var brokerName = {
	c1: "c1",
	c2: "c2",
	c3: "c3",
}

var signInShownBrokerName = {
	c1: "Championship Unit 1",
	c2: "Championship Unit 2",
	c3: "Championship Unit 3",
}

var shownBrokerName = {
	c1: "Championship U1",
	c2: "Championship U2",
	c3: "Championship U3",
}

var brokerCtx = []

brokerCtx[brokerName.c1] = {
	brokerName: brokerName.c1,
	dataStreamURL: brokerProtocol.c1 + brokerDomain.c1 + brokerPort.c1,
	dataBaseURL: brokerProtocol.c1 + brokerDomain.c1 + brokerPort.c1,
	orderStreamURL: brokerProtocol.c1 + brokerDomain.c1 + brokerPort.c1,
	orderBaseURL: brokerProtocol.c1 + brokerDomain.c1 + brokerPort.c1,
	shopURL: brokerProtocol.c1 + shopDomain.c1,
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

brokerCtx[brokerName.c2] = {
	brokerName: brokerName.c2,
	dataStreamURL: brokerProtocol.c2 + brokerDomain.c2 + brokerPort.c2,
	dataBaseURL: brokerProtocol.c2 + brokerDomain.c2 + brokerPort.c2,
	orderStreamURL: brokerProtocol.c2 + brokerDomain.c2 + brokerPort.c2,
	orderBaseURL: brokerProtocol.c2 + brokerDomain.c2 + brokerPort.c2,
	shopURL: brokerProtocol.c2 + shopDomain.c2,
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

brokerCtx[brokerName.c3] = {
	brokerName: brokerName.c3,
	dataStreamURL: brokerProtocol.c3 + brokerDomain.c3 + brokerPort.c3,
	dataBaseURL: brokerProtocol.c3 + brokerDomain.c3 + brokerPort.c3,
	orderStreamURL: brokerProtocol.c3 + brokerDomain.c3 + brokerPort.c3,
	orderBaseURL: brokerProtocol.c3 + brokerDomain.c3 + brokerPort.c3,
	shopURL: brokerProtocol.c3 + shopDomain.c3,
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
	C1: shownBrokerName.c1,
	C2: shownBrokerName.c2,
	C3: shownBrokerName.c3,
}
