var brokerDomain = {
	wl1: "fintechee.cloud",
	wl2: "kbdemo.fintechee.cloud",
	wl3: "kbdemo.fintechee.cloud"
}

var brokerPort = {
	wl1: "",
	wl2: "",
	wl3: ""
}

var brokerProtocol = {
	wl1: "https://",
	wl2: "https://",
	wl3: "https://"
}

var shopDomain = {
	wl1: "fintechee.shop",
	wl2: "fintechee.shop",
	wl3: "fintechee.shop"
}

var brokerName = {
	wl1: "tst1",
	wl2: "kbdemo",
	wl3: "sodemo"
}

var signInShownBrokerName = {
	wl1: "Demo Server(tst1)",
	wl2: "KBS Demo Server",
	wl3: "Sochi Demo Server"
}

var shownBrokerName = {
	wl1: "Test Demo1",
	wl2: "KBS Demo",
	wl3: "Sochi Demo"
}

var brokerCtx = []

brokerCtx[brokerName.wl1] = {
	brokerName: brokerName.wl1,
	dataStreamURL: brokerProtocol.wl1 + brokerDomain.wl1 + brokerPort.wl1,
	dataBaseURL: brokerProtocol.wl1 + brokerDomain.wl1 + brokerPort.wl1,
	orderStreamURL: brokerProtocol.wl1 + brokerDomain.wl1 + brokerPort.wl1,
	orderBaseURL: brokerProtocol.wl1 + brokerDomain.wl1 + brokerPort.wl1,
	shopURL: brokerProtocol.wl1 + shopDomain.wl1,
	logoURL: "/images/logo.png",
	syncServerSettingStatus: false,
	defaultSymbolNames: [
		"EUR/USD"
	],
	desc: "KBS Demo",
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

brokerCtx[brokerName.wl2] = {
	brokerName: brokerName.wl2,
	dataStreamURL: brokerProtocol.wl2 + brokerDomain.wl2 + brokerPort.wl2,
	dataBaseURL: brokerProtocol.wl2 + brokerDomain.wl2 + brokerPort.wl2,
	orderStreamURL: brokerProtocol.wl2 + brokerDomain.wl2 + brokerPort.wl2,
	orderBaseURL: brokerProtocol.wl2 + brokerDomain.wl2 + brokerPort.wl2,
	shopURL: brokerProtocol.wl2 + shopDomain.wl2,
	logoURL: "/images/logo.png",
	syncServerSettingStatus: false,
	defaultSymbolNames: [
		"EUR/USD"
	],
	desc: "Liquidity Provider",
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

brokerCtx[brokerName.wl3] = {
	brokerName: brokerName.wl3,
	dataStreamURL: brokerProtocol.wl3 + brokerDomain.wl3 + brokerPort.wl3,
	dataBaseURL: brokerProtocol.wl3 + brokerDomain.wl3 + brokerPort.wl3,
	orderStreamURL: brokerProtocol.wl3 + brokerDomain.wl3 + brokerPort.wl3,
	orderBaseURL: brokerProtocol.wl3 + brokerDomain.wl3 + brokerPort.wl3,
	shopURL: brokerProtocol.wl3 + shopDomain.wl3,
	logoURL: "/images/logo.png",
	syncServerSettingStatus: false,
	defaultSymbolNames: [
		"EUR/USD"
	],
	desc: "Liquidity Provider",
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
	WL1: shownBrokerName.wl1,
	WL2: shownBrokerName.wl2,
	WL3: shownBrokerName.wl3
}
