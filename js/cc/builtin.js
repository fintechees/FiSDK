function isNumeric (number) {
	if (typeof number == "undefined" || number == null) return false

	return !isNaN(parseFloat(number)) && isFinite(number);
}

function isInteger (number) {
	return !isNaN(number) &&
		parseInt(Number(number)) == number &&
		!isNaN(parseInt(number, 10))
}

function getHighestOnArray (dataInput, dataOutput, calculatedLength, period) {
	var i = calculatedLength

	if (calculatedLength > 0) {
		i--
	} else {
		for (var j = 0; j < period - 1; j++) {
			dataOutput[j] = 0
		}

		i = period - 1
	}

	var highest = -Number.MAX_VALUE

	for (var j = i - period + 1; j < i; j++) {
		if (dataInput[j] > highest) {
			highest = dataInput[j]
		}
	}

	for (var j = i; j < dataInput.length; j++) {
		if (dataInput[j] > highest) {
			highest = dataInput[j]
		}
		dataOutput[j] = highest
		if (dataInput[j - period + 1] == highest) {
			highest = -Number.MAX_VALUE

			for (var k = j - period + 1 + 1; k <= j; k++) {
				if (dataInput[k] > highest) {
					highest = dataInput[k]
				}
			}
		}
	}
}

function getLowestOnArray (dataInput, dataOutput, calculatedLength, period) {
	var i = calculatedLength

	if (calculatedLength > 0) {
		i--
	} else {
		for (var j = 0; j < period - 1; j++) {
			dataOutput[j] = 0
		}

		i = period - 1
	}

	var lowest = Number.MAX_VALUE

	for (var j = i - period + 1; j < i; j++) {
		if (dataInput[j] < lowest) {
			lowest = dataInput[j]
		}
	}

	for (var j = i; j < dataInput.length; j++) {
		if (dataInput[j] < lowest) {
			lowest = dataInput[j]
		}
		dataOutput[j] = lowest
		if (dataInput[j - period + 1] == lowest) {
			lowest = Number.MAX_VALUE

			for (var k = j - period + 1 + 1; k <= j; k++) {
				if (dataInput[k] < lowest) {
					lowest = dataInput[k]
				}
			}
		}
	}
}

function sumOnArray (dataInput, dataOutput, calculatedLength, period) {
	var i = calculatedLength

	if (calculatedLength > 0) {
		i--
	} else {
		for (var j = 0; j < period - 1; j++) {
			dataOutput[j] = 0
		}

		i = period - 1
	}

	var sum = 0

	for (var j = i - period + 1; j < i; j++) {
		sum += dataInput[j]
	}

	for (var j = i; j < dataInput.length; j++) {
		sum += dataInput[j]
		dataOutput[j] = sum
		sum -= dataInput[j - period + 1]
	}
}

function sma (dataInput, dataOutput, calculatedLength, period) {
	var i = calculatedLength

	if (calculatedLength > 0) {
		i--
	} else {
		for (var j = 0; j < period - 1; j++) {
			dataOutput[j] = 0
		}

		i = period - 1
	}

	var sum = 0

	for (var j = i - period + 1; j < i; j++) {
		sum += dataInput[j]
	}

	for (var j = i; j < dataInput.length; j++) {
		sum += dataInput[j]
		dataOutput[j] = sum / period
		sum -= dataInput[j - period + 1]
	}
}

function ema (dataInput, dataOutput, calculatedLength, period) {
	var i = calculatedLength
	var smthFctr = 2.0 / (period + 1)

	if (i == 0) {
		dataOutput[0] = dataInput[0]
		i++
	} else if (i == 1) {
	} else {
		i--
	}

	while (i < dataInput.length) {
		dataOutput[i] = dataInput[i] * smthFctr + dataOutput[i - 1] * (1 - smthFctr)
		i++
	}
}

function smma (dataInput, dataOutput, calculatedLength, period) {
	var i = calculatedLength
	var sum = 0

	if (i > 0) {
		i--
	} else {
		i = period - 1

		for (var j = 1; j < period; j++) {
			dataOutput[i - j] = 0
			sum += dataInput[i - j]
		}

		sum += dataInput[i]
		dataOutput[i] = sum / period
		i++
	}

	while (i < dataInput.length) {
		sum = dataOutput[i - 1] * period - dataOutput[i - 1] + dataInput[i]
		dataOutput[i] = sum / period
		i++
	}
}

function lwma (dataInput, dataOutput, calculatedLength, period) {
	var i = calculatedLength

	if (i > 0) {
		i--
	} else {
		for (var j = 0; j < period - 1; j++) {
			dataOutput[j] = 0
		}

		i = period - 1
	}

	var sum = 0
	var diffsum = 0
	var weight = 0

	for (var j = 1; j < period; j++) {
		sum += dataInput[i - j] * (period - j)
		diffsum += dataInput[i - j]
		weight += j
	}
	weight += period

	while (i < dataInput.length) {
		sum += dataInput[i] * period
		dataOutput[i] = sum / weight
		diffsum += dataInput[i]
		sum -= diffsum
		diffsum -= dataInput[i - period + 1]
		i++
	}
}

function importBuiltInIndicators () {
	importBuiltInIndicator("volume", "Volume of OHLC(v1.0)", function (context) {
		var dataInput = getDataInput(context, 0)
		var dataOutput = getDataOutput(context, "volume")

		var calculatedLength = getCalculatedLength(context)
		var i = calculatedLength

		if (i != 0) {
			i--
		}

		while (i < dataInput.length) {
			dataOutput[i] = dataInput[i]
			i++
		}
	},[],
	[{
		name: DATA_NAME.VOLUME,
		index: 0
	}],
	[{
		name: "volume",
		visible: true,
		renderType: RENDER_TYPE.HISTOGRAM,
		color: "steelblue"
	}],
	WHERE_TO_RENDER.SEPARATE_WINDOW)

	importBuiltInIndicator("sma", "Simple Moving Average(v1.0)", function (context) {
		var dataInput = getDataInput(context, 0)
		var dataOutput = getDataOutput(context, "sma")
		var period = getIndiParameter(context, "period")
		var shift = getIndiParameter(context, "shift")

		var calculatedLength = getCalculatedLength(context)

		sma(dataInput, dataOutput, calculatedLength, period)

		if (shift != null && calculatedLength == 0) {
			setIndiShift(context, "sma", shift)
		}
	},[{
		name: "period",
		value: 5,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	},{
		name: "shift",
		value: 0,
		required: false,
		type: PARAMETER_TYPE.INTEGER,
		range: [-30, 30]
	}],
	[{
		name: DATA_NAME.CLOSE,
		index: 0
	}],
	[{
		name: "sma",
		visible: true,
		renderType: RENDER_TYPE.LINE,
		color: "steelblue"
	}],
	WHERE_TO_RENDER.CHART_WINDOW)

	importBuiltInIndicatorOnArray("sma_for_mql", "Simple Moving Average for MQL(v1.0)", function (context) {
		var appliedPrice = getIndiParameter(context, "appliedPrice")
		appliedPrice = (appliedPrice < 0 || appliedPrice > 6) ? 0 : appliedPrice
		var dataInput = getDataInput(context, appliedPrice)
		var dataOutput = getDataOutput(context, "sma")
		var period = getIndiParameter(context, "period")
		var shift = getIndiParameter(context, "shift")

		var calculatedLength = getCalculatedLength(context)

		sma(dataInput, dataOutput, calculatedLength, period)

		if (shift != null && calculatedLength == 0) {
			setIndiShift(context, "sma", shift)
		}
	},[{
		name: "period",
		value: 5,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	},{
		name: "shift",
		value: 0,
		required: false,
		type: PARAMETER_TYPE.INTEGER,
		range: [-30, 30]
	},{
		name: "appliedPrice",
		value: 0,
		required: false,
		type: PARAMETER_TYPE.INTEGER,
		range: null
	}],
	[{
		name: DATA_NAME.CLOSE,
		index: 0
	},{
		name: DATA_NAME.OPEN,
		index: 1
	},{
		name: DATA_NAME.HIGH,
		index: 2
	},{
		name: DATA_NAME.LOW,
		index: 3
	},{
		name: DATA_NAME.HL2,
		index: 4
	},{
		name: DATA_NAME.HLC3,
		index: 5
	},{
		name: DATA_NAME.HLCC4,
		index: 6
	}],
	[{
		name: "sma",
		visible: true,
		renderType: RENDER_TYPE.LINE,
		color: "steelblue"
	}],
	WHERE_TO_RENDER.CHART_WINDOW)

	importBuiltInIndicator("ema", "Exponential Moving Average(v1.0)", function (context) {
		var dataInput = getDataInput(context, 0)
		var dataOutput = getDataOutput(context, "ema")
		var period = getIndiParameter(context, "period")
		var shift = getIndiParameter(context, "shift")

		var calculatedLength = getCalculatedLength(context)

		ema(dataInput, dataOutput, calculatedLength, period)

		if (shift != null && calculatedLength == 0) {
			setIndiShift(context, "ema", shift)
		}
	},[{
		name: "period",
		value: 5,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	},{
		name: "shift",
		value: 0,
		required: false,
		type: PARAMETER_TYPE.INTEGER,
		range: [-30, 30]
	}],
	[{
		name: DATA_NAME.CLOSE,
		index: 0
	}],
	[{
		name: "ema",
		visible: true,
		renderType: RENDER_TYPE.LINE,
		color: "steelblue"
	}],
	WHERE_TO_RENDER.CHART_WINDOW)

	importBuiltInIndicatorOnArray("ema_for_mql", "Exponential Moving Average for MQL(v1.0)", function (context) {
		var appliedPrice = getIndiParameter(context, "appliedPrice")
		appliedPrice = (appliedPrice < 0 || appliedPrice > 6) ? 0 : appliedPrice
		var dataInput = getDataInput(context, appliedPrice)
		var dataOutput = getDataOutput(context, "ema")
		var period = getIndiParameter(context, "period")
		var shift = getIndiParameter(context, "shift")

		var calculatedLength = getCalculatedLength(context)

		ema(dataInput, dataOutput, calculatedLength, period)

		if (shift != null && calculatedLength == 0) {
			setIndiShift(context, "ema", shift)
		}
	},[{
		name: "period",
		value: 5,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	},{
		name: "shift",
		value: 0,
		required: false,
		type: PARAMETER_TYPE.INTEGER,
		range: [-30, 30]
	},{
		name: "appliedPrice",
		value: 0,
		required: false,
		type: PARAMETER_TYPE.INTEGER,
		range: null
	}],
	[{
		name: DATA_NAME.CLOSE,
		index: 0
	},{
		name: DATA_NAME.OPEN,
		index: 1
	},{
		name: DATA_NAME.HIGH,
		index: 2
	},{
		name: DATA_NAME.LOW,
		index: 3
	},{
		name: DATA_NAME.HL2,
		index: 4
	},{
		name: DATA_NAME.HLC3,
		index: 5
	},{
		name: DATA_NAME.HLCC4,
		index: 6
	}],
	[{
		name: "ema",
		visible: true,
		renderType: RENDER_TYPE.LINE,
		color: "steelblue"
	}],
	WHERE_TO_RENDER.CHART_WINDOW)

	importBuiltInIndicator("smma", "Smoothed Moving Average(v1.0)", function (context) {
		var dataInput = getDataInput(context, 0)
		var dataOutput = getDataOutput(context, "smma")
		var period = getIndiParameter(context, "period")
		var shift = getIndiParameter(context, "shift")

		var calculatedLength = getCalculatedLength(context)

		smma(dataInput, dataOutput, calculatedLength, period)

		if (shift != null && calculatedLength == 0) {
			setIndiShift(context, "smma", shift)
		}
	},[{
		name: "period",
		value: 5,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	},{
		name: "shift",
		value: 0,
		required: false,
		type: PARAMETER_TYPE.INTEGER,
		range: [-30, 30]
	}],
	[{
		name: DATA_NAME.CLOSE,
		index: 0
	}],
	[{
		name: "smma",
		visible: true,
		renderType: RENDER_TYPE.LINE,
		color: "steelblue"
	}],
	WHERE_TO_RENDER.CHART_WINDOW)

	importBuiltInIndicatorOnArray("smma_for_mql", "Smoothed Moving Average for MQL(v1.0)", function (context) {
		var appliedPrice = getIndiParameter(context, "appliedPrice")
		appliedPrice = (appliedPrice < 0 || appliedPrice > 6) ? 0 : appliedPrice
		var dataInput = getDataInput(context, appliedPrice)
		var dataOutput = getDataOutput(context, "smma")
		var period = getIndiParameter(context, "period")
		var shift = getIndiParameter(context, "shift")

		var calculatedLength = getCalculatedLength(context)

		smma(dataInput, dataOutput, calculatedLength, period)

		if (shift != null && calculatedLength == 0) {
			setIndiShift(context, "smma", shift)
		}
	},[{
		name: "period",
		value: 5,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	},{
		name: "shift",
		value: 0,
		required: false,
		type: PARAMETER_TYPE.INTEGER,
		range: [-30, 30]
	},{
		name: "appliedPrice",
		value: 0,
		required: false,
		type: PARAMETER_TYPE.INTEGER,
		range: null
	}],
	[{
		name: DATA_NAME.CLOSE,
		index: 0
	},{
		name: DATA_NAME.OPEN,
		index: 1
	},{
		name: DATA_NAME.HIGH,
		index: 2
	},{
		name: DATA_NAME.LOW,
		index: 3
	},{
		name: DATA_NAME.HL2,
		index: 4
	},{
		name: DATA_NAME.HLC3,
		index: 5
	},{
		name: DATA_NAME.HLCC4,
		index: 6
	}],
	[{
		name: "smma",
		visible: true,
		renderType: RENDER_TYPE.LINE,
		color: "steelblue"
	}],
	WHERE_TO_RENDER.CHART_WINDOW)

	importBuiltInIndicator("lwma", "Linear Weighted Moving Average(v1.0)", function (context) {
		var dataInput = getDataInput(context, 0)
		var dataOutput = getDataOutput(context, "lwma")
		var period = getIndiParameter(context, "period")
		var shift = getIndiParameter(context, "shift")

		var calculatedLength = getCalculatedLength(context)

		lwma(dataInput, dataOutput, calculatedLength, period)

		if (shift != null && calculatedLength == 0) {
			setIndiShift(context, "lwma", shift)
		}
	},[{
		name: "period",
		value: 5,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	},{
		name: "shift",
		value: 0,
		required: false,
		type: PARAMETER_TYPE.INTEGER,
		range: [-30, 30]
	}],
	[{
		name: DATA_NAME.CLOSE,
		index: 0
	}],
	[{
		name: "lwma",
		visible: true,
		renderType: RENDER_TYPE.LINE,
		color: "steelblue"
	}],
	WHERE_TO_RENDER.CHART_WINDOW)

	importBuiltInIndicatorOnArray("lwma_for_mql", "Linear Weighted Moving Average for MQL(v1.0)", function (context) {
		var appliedPrice = getIndiParameter(context, "appliedPrice")
		appliedPrice = (appliedPrice < 0 || appliedPrice > 6) ? 0 : appliedPrice
		var dataInput = getDataInput(context, appliedPrice)
		var dataOutput = getDataOutput(context, "lwma")
		var period = getIndiParameter(context, "period")
		var shift = getIndiParameter(context, "shift")

		var calculatedLength = getCalculatedLength(context)

		lwma(dataInput, dataOutput, calculatedLength, period)

		if (shift != null && calculatedLength == 0) {
			setIndiShift(context, "lwma", shift)
		}
	},[{
		name: "period",
		value: 5,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	},{
		name: "shift",
		value: 0,
		required: false,
		type: PARAMETER_TYPE.INTEGER,
		range: [-30, 30]
	},{
		name: "appliedPrice",
		value: 0,
		required: false,
		type: PARAMETER_TYPE.INTEGER,
		range: null
	}],
	[{
		name: DATA_NAME.CLOSE,
		index: 0
	},{
		name: DATA_NAME.OPEN,
		index: 1
	},{
		name: DATA_NAME.HIGH,
		index: 2
	},{
		name: DATA_NAME.LOW,
		index: 3
	},{
		name: DATA_NAME.HL2,
		index: 4
	},{
		name: DATA_NAME.HLC3,
		index: 5
	},{
		name: DATA_NAME.HLCC4,
		index: 6
	}],
	[{
		name: "lwma",
		visible: true,
		renderType: RENDER_TYPE.LINE,
		color: "steelblue"
	}],
	WHERE_TO_RENDER.CHART_WINDOW)

	importBuiltInIndicator("macd", "MACD(v1.01)", function (context) {
		var dataInput = getDataInput(context, 0)
		var dataFEMA = getDataOutput(context, "fastEMA")
		var dataSEMA = getDataOutput(context, "slowEMA")
		var dataOutputMain = getDataOutput(context, "main")
		var dataOutputSignal = getDataOutput(context, "signal")

		var fEMA = getIndiParameter(context, "fastEMA")
		var sEMA = getIndiParameter(context, "slowEMA")
		var sgnlSMA = getIndiParameter(context, "signalSMA")

		var calculatedLength = getCalculatedLength(context)
		var i = calculatedLength

		if (i == 0) {
			dataFEMA[0] = dataInput[0]
			dataSEMA[0] = dataInput[0]
			dataOutputMain[0] = 0
			i++
		} else if (i == 1) {
		} else {
			i--
		}

		ema(dataInput, dataFEMA, calculatedLength, fEMA)
		ema(dataInput, dataSEMA, calculatedLength, sEMA)

		while (i < dataInput.length) {
			dataOutputMain[i] = dataFEMA[i] - dataSEMA[i]
			i++
		}

		sma(dataOutputMain, dataOutputSignal, calculatedLength, sgnlSMA)
	},[{
		name: "fastEMA",
		value: 12,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	},{
		name: "slowEMA",
		value: 26,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	},{
		name: "signalSMA",
		value: 9,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	}],
	[{
		name: DATA_NAME.CLOSE,
		index: 0
	}],
	[{
        name: "main",
        visible: true,
        renderType: RENDER_TYPE.HISTOGRAM,
        color: "#4EC2B4"
    },{
        name: "signal",
        visible: true,
        renderType: RENDER_TYPE.LINE,
        color: "#CCCCCC"
    },{
		name: "fastEMA",
		visible: false
	},{
		name: "slowEMA",
		visible: false
	}],
	WHERE_TO_RENDER.SEPARATE_WINDOW)

	importBuiltInIndicatorOnArray("macd_for_mql", "MACD for MQL(v1.01)", function (context) {
		var appliedPrice = getIndiParameter(context, "appliedPrice")
		appliedPrice = (appliedPrice < 0 || appliedPrice > 6) ? 0 : appliedPrice
		var dataInput = getDataInput(context, appliedPrice)
		var dataFEMA = getDataOutput(context, "fastEMA")
		var dataSEMA = getDataOutput(context, "slowEMA")
		var dataOutputMain = getDataOutput(context, "main")
		var dataOutputSignal = getDataOutput(context, "signal")

		var fEMA = getIndiParameter(context, "fastEMA")
		var sEMA = getIndiParameter(context, "slowEMA")
		var sgnlSMA = getIndiParameter(context, "signalSMA")

		var calculatedLength = getCalculatedLength(context)
		var i = calculatedLength

		if (i == 0) {
			dataFEMA[0] = dataInput[0]
			dataSEMA[0] = dataInput[0]
			dataOutputMain[0] = 0
			i++
		} else if (i == 1) {
		} else {
			i--
		}

		ema(dataInput, dataFEMA, calculatedLength, fEMA)
		ema(dataInput, dataSEMA, calculatedLength, sEMA)

		while (i < dataInput.length) {
			dataOutputMain[i] = dataFEMA[i] - dataSEMA[i]
			i++
		}

		sma(dataOutputMain, dataOutputSignal, calculatedLength, sgnlSMA)
	},[{
		name: "fastEMA",
		value: 12,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	},{
		name: "slowEMA",
		value: 26,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	},{
		name: "signalSMA",
		value: 9,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	},{
		name: "appliedPrice",
		value: 0,
		required: false,
		type: PARAMETER_TYPE.INTEGER,
		range: null
	}],
	[{
		name: DATA_NAME.CLOSE,
		index: 0
	},{
		name: DATA_NAME.OPEN,
		index: 1
	},{
		name: DATA_NAME.HIGH,
		index: 2
	},{
		name: DATA_NAME.LOW,
		index: 3
	},{
		name: DATA_NAME.HL2,
		index: 4
	},{
		name: DATA_NAME.HLC3,
		index: 5
	},{
		name: DATA_NAME.HLCC4,
		index: 6
	}],
	[{
        name: "main",
        visible: true,
        renderType: RENDER_TYPE.HISTOGRAM,
        color: "#4EC2B4"
    },{
        name: "signal",
        visible: true,
        renderType: RENDER_TYPE.LINE,
        color: "#CCCCCC"
    },{
		name: "fastEMA",
		visible: false
	},{
		name: "slowEMA",
		visible: false
	}],
	WHERE_TO_RENDER.SEPARATE_WINDOW)

	importBuiltInIndicator("rsi", "Relative Strength Index(v1.01)", function (context) {
		var dataInput = getDataInput(context, 0)
		var dataOutput = getDataOutput(context, "rsi")
		var dataOutputHL = getDataOutput(context, "rsiHighLevel")
		var dataOutputLL = getDataOutput(context, "rsiLowLevel")
		var gainTmp = getDataOutput(context, "gainTmp")
		var lossTmp = getDataOutput(context, "lossTmp")

		var period = getIndiParameter(context, "period")
		var highLevel = getIndiParameter(context, "highLevel")
		var lowLevel = getIndiParameter(context, "lowLevel")

		var calculatedLength = getCalculatedLength(context)

		var ptr = null
		var ptr2 = null

		var diff = null
		var gain = null
		var loss = null
		var gainSum = 0
		var lossSum = 0

		if (calculatedLength > 0) {
			ptr = calculatedLength - 1
			ptr2 = calculatedLength - period
		} else {
			for (var i = 0; i < period; i++) {
				dataOutput[i] = 0
				dataOutputHL[i] = highLevel
				dataOutputLL[i] = lowLevel
			}

			ptr = period
			ptr2 = 1

			while (ptr2 <= ptr) {
				diff = dataInput[ptr2] - dataInput[ptr2 - 1]
				if (0 < diff) {
					gainSum += diff
				} else {
					lossSum -= diff
				}
				ptr2++
			}
			gain = gainSum / period
			loss = lossSum / period
			if (0 == (gain + loss)) {
				dataOutput[ptr] = 0
			} else {
				dataOutput[ptr] = 100 * gain / (gain + loss)
			}
			dataOutputHL[ptr] = highLevel
			dataOutputLL[ptr] = lowLevel
			gainTmp[ptr] = gain
			lossTmp[ptr] = loss
			ptr++
		}

		while (ptr < dataInput.length) {
			gain = gainTmp[ptr - 1] * (period - 1)
			loss = lossTmp[ptr - 1] * (period - 1)

			diff = dataInput[ptr] - dataInput[ptr - 1]
			if (0 < diff) {
				gain += diff
			} else {
				loss -= diff
			}
			gain = gain / period
			loss = loss / period

			if (0 == (gain + loss)) {
				dataOutput[ptr] = 0
			} else {
				dataOutput[ptr] = 100 * gain / (gain + loss)
			}
			dataOutputHL[ptr] = highLevel
			dataOutputLL[ptr] = lowLevel
			gainTmp[ptr] = gain
			lossTmp[ptr] = loss
			ptr++
		}
	},[{
		name: "period",
		value: 14,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	},{
		name: "highLevel",
		value: 70,
		required: false,
		type: PARAMETER_TYPE.NUMBER,
		range: [1, 100]
	},{
		name: "lowLevel",
		value: 30,
		required: false,
		type: PARAMETER_TYPE.NUMBER,
		range: [1, 100]
	}],
	[{
		name: DATA_NAME.CLOSE,
		index: 0
	}],
	[{
		name: "rsi",
		visible: true,
		renderType: RENDER_TYPE.LINE,
		color: "steelblue"
	},{
		name: "rsiHighLevel",
		visible: true,
		renderType: RENDER_TYPE.DASHARRAY,
		color: "#AAAAAA"
	},{
		name: "rsiLowLevel",
		visible: true,
		renderType: RENDER_TYPE.DASHARRAY,
		color: "#AAAAAA"
	},{
        name: "gainTmp",
        visible: false
    },{
        name: "lossTmp",
        visible: false
    }],
	WHERE_TO_RENDER.SEPARATE_WINDOW)

	importBuiltInIndicatorOnArray("rsi_for_mql", "Relative Strength Index for MQL(v1.0)", function (context) {
		var appliedPrice = getIndiParameter(context, "appliedPrice")
		appliedPrice = (appliedPrice < 0 || appliedPrice > 6) ? 0 : appliedPrice
		var dataInput = getDataInput(context, appliedPrice)
		var dataOutput = getDataOutput(context, "rsi")
		var dataOutputHL = getDataOutput(context, "rsiHighLevel")
		var dataOutputLL = getDataOutput(context, "rsiLowLevel")
		var gainTmp = getDataOutput(context, "gainTmp")
		var lossTmp = getDataOutput(context, "lossTmp")

		var period = getIndiParameter(context, "period")
		var highLevel = getIndiParameter(context, "highLevel")
		var lowLevel = getIndiParameter(context, "lowLevel")

		var calculatedLength = getCalculatedLength(context)

		var ptr = null
		var ptr2 = null

		var diff = null
		var gain = null
		var loss = null
		var gainSum = 0
		var lossSum = 0

		if (calculatedLength > 0) {
			ptr = calculatedLength - 1
			ptr2 = calculatedLength - period
		} else {
			for (var i = 0; i < period; i++) {
				dataOutput[i] = 0
				dataOutputHL[i] = highLevel
				dataOutputLL[i] = lowLevel
			}

			ptr = period
			ptr2 = 1

			while (ptr2 <= ptr) {
				diff = dataInput[ptr2] - dataInput[ptr2 - 1]
				if (0 < diff) {
					gainSum += diff
				} else {
					lossSum -= diff
				}
				ptr2++
			}
			gain = gainSum / period
			loss = lossSum / period
			if (0 == (gain + loss)) {
				dataOutput[ptr] = 0
			} else {
				dataOutput[ptr] = 100 * gain / (gain + loss)
			}
			dataOutputHL[ptr] = highLevel
			dataOutputLL[ptr] = lowLevel
			gainTmp[ptr] = gain
			lossTmp[ptr] = loss
			ptr++
		}

		while (ptr < dataInput.length) {
			gain = gainTmp[ptr - 1] * (period - 1)
			loss = lossTmp[ptr - 1] * (period - 1)

			diff = dataInput[ptr] - dataInput[ptr - 1]
			if (0 < diff) {
				gain += diff
			} else {
				loss -= diff
			}
			gain = gain / period
			loss = loss / period

			if (0 == (gain + loss)) {
				dataOutput[ptr] = 0
			} else {
				dataOutput[ptr] = 100 * gain / (gain + loss)
			}
			dataOutputHL[ptr] = highLevel
			dataOutputLL[ptr] = lowLevel
			gainTmp[ptr] = gain
			lossTmp[ptr] = loss
			ptr++
		}
	},[{
		name: "period",
		value: 14,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	},{
		name: "highLevel",
		value: 70,
		required: false,
		type: PARAMETER_TYPE.NUMBER,
		range: [1, 100]
	},{
		name: "lowLevel",
		value: 30,
		required: false,
		type: PARAMETER_TYPE.NUMBER,
		range: [1, 100]
	},{
		name: "appliedPrice",
		value: 0,
		required: false,
		type: PARAMETER_TYPE.INTEGER,
		range: null
	}],
	[{
		name: DATA_NAME.CLOSE,
		index: 0
	},{
		name: DATA_NAME.OPEN,
		index: 1
	},{
		name: DATA_NAME.HIGH,
		index: 2
	},{
		name: DATA_NAME.LOW,
		index: 3
	},{
		name: DATA_NAME.HL2,
		index: 4
	},{
		name: DATA_NAME.HLC3,
		index: 5
	},{
		name: DATA_NAME.HLCC4,
		index: 6
	}],
	[{
		name: "rsi",
		visible: true,
		renderType: RENDER_TYPE.LINE,
		color: "steelblue"
	},{
		name: "rsiHighLevel",
		visible: true,
		renderType: RENDER_TYPE.DASHARRAY,
		color: "#AAAAAA"
	},{
		name: "rsiLowLevel",
		visible: true,
		renderType: RENDER_TYPE.DASHARRAY,
		color: "#AAAAAA"
	},{
        name: "gainTmp",
        visible: false
    },{
        name: "lossTmp",
        visible: false
    }],
	WHERE_TO_RENDER.SEPARATE_WINDOW)

	importBuiltInIndicator("atr", "Average True Range(v1.0)", function (context) {
		var dataInputClose = getDataInput(context, 0)
		var dataInputHigh = getDataInput(context, 1)
		var dataInputLow = getDataInput(context, 2)
		var tmpLine = getDataOutput(context, "tmp")
		var dataOutput = getDataOutput(context, "atr")

		var period = getIndiParameter(context, "period")

		var calculatedLength = getCalculatedLength(context)
		var i = calculatedLength
		var high = null
		var low = null
		var prevClose = null

		if (i > 0) {
			i--
		} else {
			tmpLine[i] = 0
			i = 1
		}

		while (i < dataInputClose.length) {
			high = dataInputHigh[i]
			low = dataInputLow[i]
			prevClose = dataInputClose[i - 1]

			tmpLine[i] = Math.max(high, prevClose) - Math.min(low, prevClose)

			i++
		}

		sma(tmpLine, dataOutput, calculatedLength, period)
	},[{
		name: "period",
		value: 14,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	}],
	[{
		name: DATA_NAME.CLOSE,
		index: 0
	},{
		name: DATA_NAME.HIGH,
		index: 1
	},{
		name: DATA_NAME.LOW,
		index: 2
	}],
	[{
        name: "tmp",
        visible: false
    },{
        name: "atr",
        visible: true,
        renderType: RENDER_TYPE.LINE,
        color: "steelblue"
    }],
	WHERE_TO_RENDER.SEPARATE_WINDOW)

	importBuiltInIndicator("adx", "Average Directional Index(v1.0)", function (context) {
		var dataInputClose = getDataInput(context, 0)
		var dataInputHigh = getDataInput(context, 1)
		var dataInputLow = getDataInput(context, 2)

		var tmpLine = getDataOutput(context, "tmp")
		var plusSdiTmp = getDataOutput(context, "plusSdiTmp")
		var minusSdiTmp = getDataOutput(context, "minusSdiTmp")

		var dataOutputAdx = getDataOutput(context, "adx")
		var dataOutputPlusDi = getDataOutput(context, "plusDi")
		var dataOutputMinusDi = getDataOutput(context, "minusDi")

		var period = getIndiParameter(context, "period")

		var calculatedLength = getCalculatedLength(context)
		var i = calculatedLength

		if (i > 0) {
			i--
		} else {
			plusSdiTmp[i] = 0
			minusSdiTmp[i] = 0
			i = 1
		}

		var plusDM = null
		var minusDM = null
		var trueRange = null
		var currH = null
		var currL = null
		var prevH = null
		var prevL = null
		var prevC = null

		while (i < dataInputClose.length) {
			currH = dataInputHigh[i]
			currL = dataInputLow[i]
			prevH = dataInputHigh[i - 1]
			prevL = dataInputLow[i - 1]
			prevC = dataInputClose[i - 1]

			plusDM = currH - prevH
			minusDM = prevL - currL
			if (0 > plusDM) {
				plusDM = 0
			}
			if (0 > minusDM) {
				minusDM = 0
			}
			if (plusDM == minusDM) {
				plusDM = 0
				minusDM = 0
			} else if (plusDM < minusDM) {
				plusDM = 0
			} else if (plusDM > minusDM) {
				minusDM = 0
			}

			trueRange = Math.max(Math.abs(currH - currL), Math.abs(currH - prevC))
			trueRange = Math.max(trueRange, Math.abs(currL - prevC))

			if (0 == trueRange) {
				plusSdiTmp[i] = 0
				minusSdiTmp[i] = 0
			}else{
				plusSdiTmp[i] = 100 * plusDM / trueRange
				minusSdiTmp[i] = 100 * minusDM / trueRange
			}

			i++
		}

		ema(plusSdiTmp, dataOutputPlusDi, calculatedLength, period)
		ema(minusSdiTmp, dataOutputMinusDi, calculatedLength, period)

		i = calculatedLength
		if (i > 0) {
			i--
		}

		while (i < dataInputClose.length) {
			var tmp = Math.abs(dataOutputPlusDi[i] + dataOutputMinusDi[i])

			if (0 == tmp) {
				tmpLine[i] = 0
			} else {
				tmpLine[i] = 100 * (Math.abs(dataOutputPlusDi[i] - dataOutputMinusDi[i]) / tmp)
			}

			i++
		}

		ema(tmpLine, dataOutputAdx, calculatedLength, period)
	},[{
		name: "period",
		value: 14,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	}],
	[{
		name: DATA_NAME.CLOSE,
		index: 0
	},{
		name: DATA_NAME.HIGH,
		index: 1
	},{
		name: DATA_NAME.LOW,
		index: 2
	}],
	[{
        name: "adx",
        visible: true,
        renderType: RENDER_TYPE.LINE,
        color: "#CCCCCC"
    },{
        name: "plusDi",
        visible: true,
        renderType: RENDER_TYPE.DASHARRAY,
        color: "#4EC2B4"
    },{
        name: "minusDi",
        visible: true,
        renderType: RENDER_TYPE.DASHARRAY,
        color: "#DE5029"
    },{
        name: "tmp",
        visible: false
    },{
        name: "plusSdiTmp",
        visible: false
    },{
        name: "minusSdiTmp",
        visible: false
    }],
	WHERE_TO_RENDER.SEPARATE_WINDOW)

	importBuiltInIndicatorOnArray("adx_for_mql", "Average Directional Index for MQL(v1.0)", function (context) {
		var appliedPrice = getIndiParameter(context, "appliedPrice")
		appliedPrice = (appliedPrice < 0 || appliedPrice > 6) ? 0 : appliedPrice
		var dataInputClose = getDataInput(context, appliedPrice)
		var dataInputHigh = getDataInput(context, 2)
		var dataInputLow = getDataInput(context, 3)

		var tmpLine = getDataOutput(context, "tmp")
		var plusSdiTmp = getDataOutput(context, "plusSdiTmp")
		var minusSdiTmp = getDataOutput(context, "minusSdiTmp")

		var dataOutputAdx = getDataOutput(context, "main")
		var dataOutputPlusDi = getDataOutput(context, "plusDi")
		var dataOutputMinusDi = getDataOutput(context, "minusDi")

		var period = getIndiParameter(context, "period")

		var calculatedLength = getCalculatedLength(context)
		var i = calculatedLength

		if (i > 0) {
			i--
		} else {
			plusSdiTmp[i] = 0
			minusSdiTmp[i] = 0
			i = 1
		}

		var plusDM = null
		var minusDM = null
		var trueRange = null
		var currH = null
		var currL = null
		var prevH = null
		var prevL = null
		var prevC = null

		while (i < dataInputClose.length) {
			currH = dataInputHigh[i]
			currL = dataInputLow[i]
			prevH = dataInputHigh[i - 1]
			prevL = dataInputLow[i - 1]
			prevC = dataInputClose[i - 1]

			plusDM = currH - prevH
			minusDM = prevL - currL
			if (0 > plusDM) {
				plusDM = 0
			}
			if (0 > minusDM) {
				minusDM = 0
			}
			if (plusDM == minusDM) {
				plusDM = 0
				minusDM = 0
			} else if (plusDM < minusDM) {
				plusDM = 0
			} else if (plusDM > minusDM) {
				minusDM = 0
			}

			trueRange = Math.max(Math.abs(currH - currL), Math.abs(currH - prevC))
			trueRange = Math.max(trueRange, Math.abs(currL - prevC))

			if (0 == trueRange) {
				plusSdiTmp[i] = 0
				minusSdiTmp[i] = 0
			}else{
				plusSdiTmp[i] = 100 * plusDM / trueRange
				minusSdiTmp[i] = 100 * minusDM / trueRange
			}

			i++
		}

		ema(plusSdiTmp, dataOutputPlusDi, calculatedLength, period)
		ema(minusSdiTmp, dataOutputMinusDi, calculatedLength, period)

		i = calculatedLength
		if (i > 0) {
			i--
		}

		while (i < dataInputClose.length) {
			var tmp = Math.abs(dataOutputPlusDi[i] + dataOutputMinusDi[i])

			if (0 == tmp) {
				tmpLine[i] = 0
			} else {
				tmpLine[i] = 100 * (Math.abs(dataOutputPlusDi[i] - dataOutputMinusDi[i]) / tmp)
			}

			i++
		}

		ema(tmpLine, dataOutputAdx, calculatedLength, period)
	},[{
		name: "period",
		value: 14,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	},{
		name: "appliedPrice",
		value: 0,
		required: false,
		type: PARAMETER_TYPE.INTEGER,
		range: null
	}],
	[{
		name: DATA_NAME.CLOSE,
		index: 0
	},{
		name: DATA_NAME.OPEN,
		index: 1
	},{
		name: DATA_NAME.HIGH,
		index: 2
	},{
		name: DATA_NAME.LOW,
		index: 3
	},{
		name: DATA_NAME.HL2,
		index: 4
	},{
		name: DATA_NAME.HLC3,
		index: 5
	},{
		name: DATA_NAME.HLCC4,
		index: 6
	}],
	[{
        name: "main",
        visible: true,
        renderType: RENDER_TYPE.LINE,
        color: "#CCCCCC"
    },{
        name: "plusDi",
        visible: true,
        renderType: RENDER_TYPE.DASHARRAY,
        color: "#4EC2B4"
    },{
        name: "minusDi",
        visible: true,
        renderType: RENDER_TYPE.DASHARRAY,
        color: "#DE5029"
    },{
        name: "tmp",
        visible: false
    },{
        name: "plusSdiTmp",
        visible: false
    },{
        name: "minusSdiTmp",
        visible: false
    }],
	WHERE_TO_RENDER.SEPARATE_WINDOW)

	importBuiltInIndicator("sar", "Parabolic SAR(v1.01)", function (context) {
		var dataInputHigh = getDataInput(context, 0)
		var dataInputLow = getDataInput(context, 1)

		var dataOutput = getDataOutput(context, "sar")
		var dataOutputIsLong = getDataOutput(context, "isLong")
		var dataOutputAf = getDataOutput(context, "af")
		var dataOutputEp = getDataOutput(context, "ep")

		var acceleration = getIndiParameter(context, "acceleration")
		var afMax = getIndiParameter(context, "afMax")

		var calculatedLength = getCalculatedLength(context)
		var i = calculatedLength

		var prevH = null
		var prevL = null
		var currH = null
		var currL = null
		var sar = null
		var isLong = null
		var af = acceleration
		var ep = null

		if (i > 0) {
			i -= 2
			prevH = dataInputHigh[i - 1]
			prevL = dataInputLow[i - 1]
			isLong = dataOutputIsLong[i]
			sar = dataOutput[i]
			af = dataOutputAf[i]
			ep = dataOutputEp[i]
		} else {
			dataOutput[i] = 0
			dataOutputIsLong[i] = true
			dataOutputAf[i] = af
			dataOutputEp[i] = 0

			i = 1

			prevH = dataInputHigh[i - 1]
			prevL = dataInputLow[i - 1]
			isLong = true
			sar = prevL
			ep = prevH
		}

		while (i < dataInputHigh.length) {
			currH = dataInputHigh[i]
			currL = dataInputLow[i]

			if (isLong) {
				if (currL <= sar) {
					isLong = false
					sar = Math.max(ep, currH, prevH)

					dataOutput[i] = sar

					af = acceleration
					ep = currL
					sar = sar + af * (ep - sar)
					sar = Math.max(sar, currH, prevH)
				} else {
					dataOutput[i] = sar

					if (currH > ep) {
						ep = currH
						if (af - dataOutputAf[i - 1] <= 0) {
							af += acceleration
						}
						if (af > afMax) {
							af = afMax
						}
					}
					sar = sar + af * (ep - sar)
					sar = Math.min(sar, currL, prevL)
				}
			} else {
				if (currH >= sar) {
					isLong = true
					sar = Math.min(ep, currL, prevL)

					dataOutput[i] = sar

					af = acceleration
					ep = currH
					sar = sar + af * (ep - sar)
					sar = Math.min(sar, currL, prevL)
				} else {
					dataOutput[i] = sar

					if (currL < ep) {
						ep = currL
						if (af - dataOutputAf[i - 1] <= 0) {
							af += acceleration
						}
						if (af > afMax) {
							af = afMax
						}
					}
					sar = sar + af * (ep - sar)
					sar = Math.max(sar, currH, prevH)
				}
			}

			dataOutputIsLong[i] = isLong
			dataOutputAf[i] = af
			dataOutputEp[i] = ep

			i++

			prevH = currH
			prevL = currL
		}
	},[{
		name: "acceleration",
		value: 0.02,
		required: true,
		type: PARAMETER_TYPE.NUMBER,
		range: [0.01, 0.1]
	},{
		name: "afMax",
		value: 0.2,
		required: true,
		type: PARAMETER_TYPE.NUMBER,
		range: [0.1, 1]
	}],
	[{
		name: DATA_NAME.HIGH,
		index: 0
	},{
		name: DATA_NAME.LOW,
		index: 1
	}],
	[{
		name: "sar",
		visible: true,
		renderType: RENDER_TYPE.ROUND,
		color: "steelblue"
	},{
		name: "isLong",
		visible: false
	},{
		name: "af",
		visible: false
	},{
		name: "ep",
		visible: false
	}],
	WHERE_TO_RENDER.CHART_WINDOW)

	importBuiltInIndicator("stochastic", "Stochastic Ocillator(v1.01)", function (context) {
		var dataInputClose = getDataInput(context, 0)
		var dataInputHigh = getDataInput(context, 1)
		var dataInputLow = getDataInput(context, 2)

		var highestTmp = getDataOutput(context, "highestTmp")
		var lowestTmp = getDataOutput(context, "lowestTmp")

		var dataOutputMain = getDataOutput(context, "main")
		var dataOutputSignal = getDataOutput(context, "signal")

		var kP = getIndiParameter(context, "KPeriod")
		var slowing = getIndiParameter(context, "slowing")
		var dP = getIndiParameter(context, "DPeriod")
		var method = getIndiParameter(context, "method")

		var calculatedLength = getCalculatedLength(context)
		var ptr = calculatedLength
		var maxParam = Math.max(kP + slowing - 1, dP)

		if (ptr > 0) {
			ptr--
		} else {
			ptr = maxParam - 1

			for (var i = 1; i < maxParam; i++) {
				dataOutputMain[ptr - i] = 0
				highestTmp[ptr - i] = 0
				lowestTmp[ptr - i] = 0
			}
		}

		while (ptr < dataInputClose.length) {
			var tmp = null
			var highest = -Number.MAX_VALUE
			var lowest = Number.MAX_VALUE

			for (var ptr2 = (ptr - kP + 1); ptr2 <= ptr; ptr2++){
				tmp = dataInputHigh[ptr2]
				if (highest < tmp) {
					highest = tmp
				}

				tmp = dataInputLow[ptr2]
				if (lowest > tmp) {
					lowest = tmp
				}
			}

			highestTmp[ptr] = highest
			lowestTmp[ptr] = lowest

			ptr++
		}

		ptr = calculatedLength

		if (ptr > 0) {
			ptr--
		} else {
			ptr = maxParam - 1
		}

		while (ptr < dataInputClose.length) {
			var highestSum = 0
			var lowestSum = 0

			for (var ptr2 = ptr - slowing + 1; ptr2 <= ptr; ptr2++) {
				highestSum += highestTmp[ptr2] - lowestTmp[ptr2]
				lowestSum += dataInputClose[ptr2] - lowestTmp[ptr2]
			}

			if (0 == highestSum) {
				dataOutputMain[ptr] = 100
			}else{
				dataOutputMain[ptr] = lowestSum / highestSum * 100
			}

			ptr++
		}

		if ("sma" == method) {
			sma(dataOutputMain, dataOutputSignal, calculatedLength, dP)
		} else if ("ema" == method) {
			ema(dataOutputMain, dataOutputSignal, calculatedLength, dP)
		} else if ("smma" == method) {
			smma(dataOutputMain, dataOutputSignal, calculatedLength, dP)
		} else {
			lwma(dataOutputMain, dataOutputSignal, calculatedLength, dP)
		}
	},[{
		name: "KPeriod",
		value: 5,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	},{
		name: "slowing",
		value: 3,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	},{
		name: "DPeriod",
		value: 3,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	},{
		name: "method",
		value: "sma",
		required: true,
		type: PARAMETER_TYPE.STRING
	}],
	[{
		name: DATA_NAME.CLOSE,
		index: 0
	},{
		name: DATA_NAME.HIGH,
		index: 1
	},{
		name: DATA_NAME.LOW,
		index: 2
	}],
	[{
        name: "main",
        visible: true,
        renderType: RENDER_TYPE.LINE,
        color: "#DE5029"
    },{
        name: "signal",
        visible: true,
        renderType: RENDER_TYPE.DASHARRAY,
        color: "#4EC2B4"
    },{
        name: "highestTmp",
        visible: false
    },{
        name: "lowestTmp",
        visible: false
    }],
	WHERE_TO_RENDER.SEPARATE_WINDOW)

	importBuiltInIndicator("alligator", "A series of Bill Williams' indicators(v1.02)", function (context) {
		var dataInput = getDataInput(context, 0)
		var dataOutputJaws = getDataOutput(context, "jaws")
		var dataOutputTeeth = getDataOutput(context, "teeth")
		var dataOutputLips = getDataOutput(context, "lips")

		var method = getIndiParameter(context, "method")
		var jawsPeriod = getIndiParameter(context, "jawsPeriod")
		var jawsShift = getIndiParameter(context, "jawsShift")
		var teethPeriod = getIndiParameter(context, "teethPeriod")
		var teethShift = getIndiParameter(context, "teethShift")
		var lipsPeriod = getIndiParameter(context, "lipsPeriod")
		var lipsShift = getIndiParameter(context, "lipsShift")

		var calculatedLength = getCalculatedLength(context)

		if ("smma" == method) {
			smma(dataInput, dataOutputJaws, calculatedLength, jawsPeriod)
			smma(dataInput, dataOutputTeeth, calculatedLength, teethPeriod)
			smma(dataInput, dataOutputLips, calculatedLength, lipsPeriod)
		} else if ("sma" == method) {
			sma(dataInput, dataOutputJaws, calculatedLength, jawsPeriod)
			sma(dataInput, dataOutputTeeth, calculatedLength, teethPeriod)
			sma(dataInput, dataOutputLips, calculatedLength, lipsPeriod)
		} else if("ema" == method) {
			ema(dataInput, dataOutputJaws, calculatedLength, jawsPeriod)
			ema(dataInput, dataOutputTeeth, calculatedLength, teethPeriod)
			ema(dataInput, dataOutputLips, calculatedLength, lipsPeriod)
		} else {
			lwma(dataInput, dataOutputJaws, calculatedLength, jawsPeriod)
			lwma(dataInput, dataOutputTeeth, calculatedLength, teethPeriod)
			lwma(dataInput, dataOutputLips, calculatedLength, lipsPeriod)
		}

		if (calculatedLength == 0) {
			setIndiShift(context, "jaws", jawsShift)
			setIndiShift(context, "teeth", teethShift)
			setIndiShift(context, "lips", lipsShift)
		}
	},[{
		name: "jawsPeriod",
		value: 13,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	},{
		name: "jawsShift",
		value: 8,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [-30, 30]
	},{
		name: "teethPeriod",
		value: 8,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	},{
		name: "teethShift",
		value: 5,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [-30, 30]
	},{
		name: "lipsPeriod",
		value: 5,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	},{
		name: "lipsShift",
		value: 3,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [-30, 30]
	},{
		name: "method",
		value: "smma",
		required: true,
		type: PARAMETER_TYPE.STRING
	}],
	[{
		name: DATA_NAME.HL2,
		index: 0
	}],
	[{
		name: "jaws",
		visible: true,
		renderType: RENDER_TYPE.LINE,
		color: "steelblue"
	},{
		name: "teeth",
		visible: true,
		renderType: RENDER_TYPE.LINE,
		color: "#DE5029"
	},{
		name: "lips",
		visible: true,
		renderType: RENDER_TYPE.LINE,
		color: "#4EC2B4"
	}],
	WHERE_TO_RENDER.CHART_WINDOW)

	importBuiltInIndicatorOnArray("alligator_for_mql", "A series of Bill Williams' indicators for MQL(v1.01)", function (context) {
		var appliedPrice = getIndiParameter(context, "appliedPrice")
		appliedPrice = (appliedPrice < 0 || appliedPrice > 6) ? 0 : appliedPrice
		var dataInput = getDataInput(context, appliedPrice)
		var dataOutputJaws = getDataOutput(context, "jaws")
		var dataOutputTeeth = getDataOutput(context, "teeth")
		var dataOutputLips = getDataOutput(context, "lips")

		var method = getIndiParameter(context, "method")
		var jawsPeriod = getIndiParameter(context, "jawsPeriod")
		var jawsShift = getIndiParameter(context, "jawsShift")
		var teethPeriod = getIndiParameter(context, "teethPeriod")
		var teethShift = getIndiParameter(context, "teethShift")
		var lipsPeriod = getIndiParameter(context, "lipsPeriod")
		var lipsShift = getIndiParameter(context, "lipsShift")

		var calculatedLength = getCalculatedLength(context)

		if ("smma" == method) {
			smma(dataInput, dataOutputJaws, calculatedLength, jawsPeriod)
			smma(dataInput, dataOutputTeeth, calculatedLength, teethPeriod)
			smma(dataInput, dataOutputLips, calculatedLength, lipsPeriod)
		} else if ("sma" == method) {
			sma(dataInput, dataOutputJaws, calculatedLength, jawsPeriod)
			sma(dataInput, dataOutputTeeth, calculatedLength, teethPeriod)
			sma(dataInput, dataOutputLips, calculatedLength, lipsPeriod)
		} else if("ema" == method) {
			ema(dataInput, dataOutputJaws, calculatedLength, jawsPeriod)
			ema(dataInput, dataOutputTeeth, calculatedLength, teethPeriod)
			ema(dataInput, dataOutputLips, calculatedLength, lipsPeriod)
		} else {
			lwma(dataInput, dataOutputJaws, calculatedLength, jawsPeriod)
			lwma(dataInput, dataOutputTeeth, calculatedLength, teethPeriod)
			lwma(dataInput, dataOutputLips, calculatedLength, lipsPeriod)
		}

		if (calculatedLength == 0) {
			setIndiShift(context, "jaws", jawsShift)
			setIndiShift(context, "teeth", teethShift)
			setIndiShift(context, "lips", lipsShift)
		}
	},[{
		name: "jawsPeriod",
		value: 13,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	},{
		name: "jawsShift",
		value: 8,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [-30, 30]
	},{
		name: "teethPeriod",
		value: 8,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	},{
		name: "teethShift",
		value: 5,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [-30, 30]
	},{
		name: "lipsPeriod",
		value: 5,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	},{
		name: "lipsShift",
		value: 3,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [-30, 30]
	},{
		name: "method",
		value: "smma",
		required: true,
		type: PARAMETER_TYPE.STRING
	},{
		name: "appliedPrice",
		value: 4,
		required: false,
		type: PARAMETER_TYPE.INTEGER,
		range: null
	}],
	[{
		name: DATA_NAME.CLOSE,
		index: 0
	},{
		name: DATA_NAME.OPEN,
		index: 1
	},{
		name: DATA_NAME.HIGH,
		index: 2
	},{
		name: DATA_NAME.LOW,
		index: 3
	},{
		name: DATA_NAME.HL2,
		index: 4
	},{
		name: DATA_NAME.HLC3,
		index: 5
	},{
		name: DATA_NAME.HLCC4,
		index: 6
	}],
	[{
		name: "jaws",
		visible: true,
		renderType: RENDER_TYPE.LINE,
		color: "steelblue"
	},{
		name: "teeth",
		visible: true,
		renderType: RENDER_TYPE.LINE,
		color: "#DE5029"
	},{
		name: "lips",
		visible: true,
		renderType: RENDER_TYPE.LINE,
		color: "#4EC2B4"
	}],
	WHERE_TO_RENDER.CHART_WINDOW)

	importBuiltInIndicator("fractals", "Fractals(v1.02)", function (context) {
	    var dataInputHigh = getDataInput(context, 0)
	    var dataInputLow = getDataInput(context, 1)
	    var dataOutputUp = getDataOutput(context, "fractalsUp")
	    var dataOutputDown = getDataOutput(context, "fractalsDown")

	    var calculatedLength = getCalculatedLength(context)

	    var ptr = null

	    if (calculatedLength > 0) {
	        ptr = calculatedLength - 3
	    } else {
	        for (var i = 0; i < dataInputHigh.length; i++) {
	            dataOutputUp[i] = 0
	            dataOutputDown[i] = 0
	        }

	        ptr = 2
	    }

	    var bHFound = false
			var bLFound = false
	    var highest = null
	    var lowest = null

	    while (ptr < dataInputHigh.length - 2) {
	        bHFound = false
	        highest = dataInputHigh[ptr]

	        if (highest > dataInputHigh[ptr - 1] && highest > dataInputHigh[ptr - 2] && highest > dataInputHigh[ptr + 1] && highest > dataInputHigh[ptr + 2]) {
	            bHFound = true
	            dataOutputUp[ptr] = highest
	        }

	        bLFound = false
	        lowest = dataInputLow[ptr]

	        if (lowest < dataInputLow[ptr - 1] && lowest < dataInputLow[ptr - 2] && lowest < dataInputLow[ptr + 1] && lowest < dataInputLow[ptr + 2]) {
	            bLFound = true
	            dataOutputDown[ptr] = lowest
	        }

	        ptr++
	    }

			if (!bHFound) {
				dataOutputUp[dataInputHigh.length - 3] = 0
			}
			if (!bLFound) {
				dataOutputDown[dataInputLow.length - 3] = 0
			}
	},[],
	[{
	    name: DATA_NAME.HIGH,
	    index: 0
	},{
	    name: DATA_NAME.LOW,
	    index: 1
	}],
	[{
	    name: "fractalsUp",
	    visible: true,
	    renderType: RENDER_TYPE.ROUND,
	    color: "green"
	},{
	    name: "fractalsDown",
	    visible: true,
	    renderType: RENDER_TYPE.ROUND,
	    color: "red"
	}],
	WHERE_TO_RENDER.CHART_WINDOW)

	importBuiltInIndicator("bands", "Bollinger Bands(v1.0)", function (context) {
	    var dataInput = getDataInput(context, 0)
	    var dataOutput = getDataOutput(context, "ma")
	    var dataOutputUpper = getDataOutput(context, "upper")
	    var dataOutputLower = getDataOutput(context, "lower")

	    var method = getIndiParameter(context, "method")
	    var period = getIndiParameter(context, "period")
	    var deviations = getIndiParameter(context, "deviations")
	    var shift = getIndiParameter(context, "shift")

	    var calculatedLength = getCalculatedLength(context)

	    if ("smma" == method) {
	        smma(dataInput, dataOutput, calculatedLength, period)
	    } else if("ema" == method) {
	        ema(dataInput, dataOutput, calculatedLength, period)
	    } else if ("lwma" == method) {
	        lwma(dataInput, dataOutput, calculatedLength, period)
	    } else {
	        sma(dataInput, dataOutput, calculatedLength, period)
	    }

	    var ptr = null
	    var ptr2 = null

	    if (calculatedLength > 0) {
	        ptr = calculatedLength - 1
	    } else {
	        for (var i = 0; i < period - 1; i++) {
	            dataOutputUpper[i] = 0
	            dataOutputLower[i] = 0
	        }

			ptr = period - 1
	    }

	    var devVal, sum, midVal, tmp

		while (ptr < dataInput.length) {
			sum = 0
			ptr2 = ptr - period + 1
			midVal = dataOutput[ptr]
			while (ptr2 <= ptr) {
				tmp = dataInput[ptr2] - midVal
				sum += tmp * tmp
				ptr2++
			}
			devVal = deviations * Math.sqrt(sum / period)
			dataOutputUpper[ptr] = midVal + devVal
			dataOutputLower[ptr] = midVal - devVal

			ptr++
		}

	    if (calculatedLength == 0) {
	        setIndiShift(context, "ma", shift)
	        setIndiShift(context, "upper", shift)
	        setIndiShift(context, "lower", shift)
	    }
	},[{
	    name: "period",
	    value: 5,
	    required: true,
	    type: PARAMETER_TYPE.INTEGER,
	    range: [1, 100]
	},{
	    name: "deviations",
	    value: 2.0,
	    required: true,
	    type: PARAMETER_TYPE.NUMBER,
	    range: [0, 10]
	},{
	    name: "shift",
	    value: 0,
	    required: true,
	    type: PARAMETER_TYPE.INTEGER,
	    range: [-30, 30]
	},{
	    name: "method",
	    value: "sma",
	    required: true,
	    type: PARAMETER_TYPE.STRING
	}],
	[{
	    name: DATA_NAME.CLOSE,
	    index: 0
	}],
	[{
	    name: "ma",
	    visible: true,
	    renderType: RENDER_TYPE.LINE,
	    color: "steelblue"
	},{
	    name: "upper",
	    visible: true,
	    renderType: RENDER_TYPE.DASHARRAY,
	    color: "steelblue"
	},{
	    name: "lower",
	    visible: true,
	    renderType: RENDER_TYPE.DASHARRAY,
	    color: "steelblue"
	}],
	WHERE_TO_RENDER.CHART_WINDOW)

	importBuiltInIndicatorOnArray("bands_for_mql", "Bollinger Bands for MQL(v1.0)", function (context) {
			var appliedPrice = getIndiParameter(context, "appliedPrice")
			appliedPrice = (appliedPrice < 0 || appliedPrice > 6) ? 0 : appliedPrice
			var dataInput = getDataInput(context, appliedPrice)
	    var dataOutput = getDataOutput(context, "main")
	    var dataOutputUpper = getDataOutput(context, "upper")
	    var dataOutputLower = getDataOutput(context, "lower")

	    var method = getIndiParameter(context, "method")
	    var period = getIndiParameter(context, "period")
	    var deviations = getIndiParameter(context, "deviations")
	    var shift = getIndiParameter(context, "shift")

	    var calculatedLength = getCalculatedLength(context)

	    if ("smma" == method) {
	        smma(dataInput, dataOutput, calculatedLength, period)
	    } else if("ema" == method) {
	        ema(dataInput, dataOutput, calculatedLength, period)
	    } else if ("lwma" == method) {
	        lwma(dataInput, dataOutput, calculatedLength, period)
	    } else {
	        sma(dataInput, dataOutput, calculatedLength, period)
	    }

	    var ptr = null
	    var ptr2 = null

	    if (calculatedLength > 0) {
	        ptr = calculatedLength - 1
	    } else {
	        for (var i = 0; i < period - 1; i++) {
	            dataOutputUpper[i] = 0
	            dataOutputLower[i] = 0
	        }

			ptr = period - 1
	    }

	    var devVal, sum, midVal, tmp

		while (ptr < dataInput.length) {
			sum = 0
			ptr2 = ptr - period + 1
			midVal = dataOutput[ptr]
			while (ptr2 <= ptr) {
				tmp = dataInput[ptr2] - midVal
				sum += tmp * tmp
				ptr2++
			}
			devVal = deviations * Math.sqrt(sum / period)
			dataOutputUpper[ptr] = midVal + devVal
			dataOutputLower[ptr] = midVal - devVal

			ptr++
		}

	    if (calculatedLength == 0) {
	        setIndiShift(context, "ma", shift)
	        setIndiShift(context, "upper", shift)
	        setIndiShift(context, "lower", shift)
	    }
	},[{
	    name: "period",
	    value: 5,
	    required: true,
	    type: PARAMETER_TYPE.INTEGER,
	    range: [1, 100]
	},{
	    name: "deviations",
	    value: 2.0,
	    required: true,
	    type: PARAMETER_TYPE.NUMBER,
	    range: [0, 10]
	},{
	    name: "shift",
	    value: 0,
	    required: true,
	    type: PARAMETER_TYPE.INTEGER,
	    range: [-30, 30]
	},{
	    name: "method",
	    value: "sma",
	    required: true,
	    type: PARAMETER_TYPE.STRING
	},{
		name: "appliedPrice",
		value: 0,
		required: false,
		type: PARAMETER_TYPE.INTEGER,
		range: null
	}],
	[{
		name: DATA_NAME.CLOSE,
		index: 0
	},{
		name: DATA_NAME.OPEN,
		index: 1
	},{
		name: DATA_NAME.HIGH,
		index: 2
	},{
		name: DATA_NAME.LOW,
		index: 3
	},{
		name: DATA_NAME.HL2,
		index: 4
	},{
		name: DATA_NAME.HLC3,
		index: 5
	},{
		name: DATA_NAME.HLCC4,
		index: 6
	}],
	[{
	    name: "main",
	    visible: true,
	    renderType: RENDER_TYPE.LINE,
	    color: "steelblue"
	},{
	    name: "upper",
	    visible: true,
	    renderType: RENDER_TYPE.DASHARRAY,
	    color: "steelblue"
	},{
	    name: "lower",
	    visible: true,
	    renderType: RENDER_TYPE.DASHARRAY,
	    color: "steelblue"
	}],
	WHERE_TO_RENDER.CHART_WINDOW)

	importBuiltInIndicator("envelopes", "Envelopes(v1.0)", function (context) {
	    var dataInput = getDataInput(context, 0)
	    var dataOutput = getDataOutput(context, "ma")
	    var dataOutputUpper = getDataOutput(context, "upper")
	    var dataOutputLower = getDataOutput(context, "lower")

	    var method = getIndiParameter(context, "method")
	    var period = getIndiParameter(context, "period")
	    var deviations = getIndiParameter(context, "deviations")
	    var shift = getIndiParameter(context, "shift")

	    var calculatedLength = getCalculatedLength(context)

	    if ("smma" == method) {
	        smma(dataInput, dataOutput, calculatedLength, period)
	    } else if("ema" == method) {
	        ema(dataInput, dataOutput, calculatedLength, period)
	    } else if ("lwma" == method) {
	        lwma(dataInput, dataOutput, calculatedLength, period)
	    } else {
	        sma(dataInput, dataOutput, calculatedLength, period)
	    }

	    var ptr = null

	    if (calculatedLength > 0) {
	        ptr = calculatedLength - 1
	    } else {
	        for (var i = 0; i < period - 1; i++) {
	            dataOutputUpper[i] = 0
	            dataOutputLower[i] = 0
	        }

	        ptr = period - 1
	    }

	    while (ptr < dataInput.length) {
	        dataOutputUpper[ptr] = (1 + deviations / 100) * dataOutput[ptr]
			dataOutputLower[ptr] = (1 - deviations / 100) * dataOutput[ptr]

	        ptr++
	    }

	    if (calculatedLength == 0) {
	        setIndiShift(context, "ma", shift)
	        setIndiShift(context, "upper", shift)
	        setIndiShift(context, "lower", shift)
	    }
	},[{
	    name: "period",
	    value: 5,
	    required: true,
	    type: PARAMETER_TYPE.INTEGER,
	    range: [1, 100]
	},{
	    name: "deviations",
	    value: 0.05,
	    required: true,
	    type: PARAMETER_TYPE.NUMBER,
	    range: [0, 10]
	},{
	    name: "shift",
	    value: 0,
	    required: true,
	    type: PARAMETER_TYPE.INTEGER,
	    range: [-30, 30]
	},{
	    name: "method",
	    value: "sma",
	    required: true,
	    type: PARAMETER_TYPE.STRING
	}],
	[{
	    name: DATA_NAME.CLOSE,
	    index: 0
	}],
	[{
	    name: "ma",
	    visible: true,
	    renderType: RENDER_TYPE.LINE,
	    color: "steelblue"
	},{
	    name: "upper",
	    visible: true,
	    renderType: RENDER_TYPE.DASHARRAY,
	    color: "steelblue"
	},{
	    name: "lower",
	    visible: true,
	    renderType: RENDER_TYPE.DASHARRAY,
	    color: "steelblue"
	}],
	WHERE_TO_RENDER.CHART_WINDOW)

	importBuiltInIndicatorOnArray("envelopes_for_mql", "Envelopes for MQL(v1.0)", function (context) {
			var appliedPrice = getIndiParameter(context, "appliedPrice")
			appliedPrice = (appliedPrice < 0 || appliedPrice > 6) ? 0 : appliedPrice
			var dataInput = getDataInput(context, appliedPrice)
	    var dataOutput = getDataOutput(context, "main")
	    var dataOutputUpper = getDataOutput(context, "upper")
	    var dataOutputLower = getDataOutput(context, "lower")

	    var method = getIndiParameter(context, "method")
	    var period = getIndiParameter(context, "period")
	    var deviations = getIndiParameter(context, "deviations")
	    var shift = getIndiParameter(context, "shift")

	    var calculatedLength = getCalculatedLength(context)

	    if ("smma" == method) {
	        smma(dataInput, dataOutput, calculatedLength, period)
	    } else if("ema" == method) {
	        ema(dataInput, dataOutput, calculatedLength, period)
	    } else if ("lwma" == method) {
	        lwma(dataInput, dataOutput, calculatedLength, period)
	    } else {
	        sma(dataInput, dataOutput, calculatedLength, period)
	    }

	    var ptr = null

	    if (calculatedLength > 0) {
	        ptr = calculatedLength - 1
	    } else {
	        for (var i = 0; i < period - 1; i++) {
	            dataOutputUpper[i] = 0
	            dataOutputLower[i] = 0
	        }

	        ptr = period - 1
	    }

	    while (ptr < dataInput.length) {
	        dataOutputUpper[ptr] = (1 + deviations / 100) * dataOutput[ptr]
			dataOutputLower[ptr] = (1 - deviations / 100) * dataOutput[ptr]

	        ptr++
	    }

	    if (calculatedLength == 0) {
	        setIndiShift(context, "ma", shift)
	        setIndiShift(context, "upper", shift)
	        setIndiShift(context, "lower", shift)
	    }
	},[{
	    name: "period",
	    value: 5,
	    required: true,
	    type: PARAMETER_TYPE.INTEGER,
	    range: [1, 100]
	},{
	    name: "deviations",
	    value: 0.05,
	    required: true,
	    type: PARAMETER_TYPE.NUMBER,
	    range: [0, 10]
	},{
	    name: "shift",
	    value: 0,
	    required: true,
	    type: PARAMETER_TYPE.INTEGER,
	    range: [-30, 30]
	},{
	    name: "method",
	    value: "sma",
	    required: true,
	    type: PARAMETER_TYPE.STRING
	},{
		name: "appliedPrice",
		value: 0,
		required: false,
		type: PARAMETER_TYPE.INTEGER,
		range: null
	}],
	[{
		name: DATA_NAME.CLOSE,
		index: 0
	},{
		name: DATA_NAME.OPEN,
		index: 1
	},{
		name: DATA_NAME.HIGH,
		index: 2
	},{
		name: DATA_NAME.LOW,
		index: 3
	},{
		name: DATA_NAME.HL2,
		index: 4
	},{
		name: DATA_NAME.HLC3,
		index: 5
	},{
		name: DATA_NAME.HLCC4,
		index: 6
	}],
	[{
	    name: "main",
	    visible: true,
	    renderType: RENDER_TYPE.LINE,
	    color: "steelblue"
	},{
	    name: "upper",
	    visible: true,
	    renderType: RENDER_TYPE.DASHARRAY,
	    color: "steelblue"
	},{
	    name: "lower",
	    visible: true,
	    renderType: RENDER_TYPE.DASHARRAY,
	    color: "steelblue"
	}],
	WHERE_TO_RENDER.CHART_WINDOW)

	importBuiltInIndicator("ac", "Accelerator Oscillator(v1.0)", function (context) {
		var dataInput = getDataInput(context, 0)
		var dataUp = getDataOutput(context, "up")
		var dataDown = getDataOutput(context, "down")
		var dataFSMA = getDataOutput(context, "fastSMA")
		var dataSSMA = getDataOutput(context, "slowSMA")
		var dataOutputMain = getDataOutput(context, "main")
		var dataOutputSignal = getDataOutput(context, "signal")

		var fSMA = 5
		var sSMA = 34
		var sgnlSMA = 5

		var calculatedLength = getCalculatedLength(context)
		var i = calculatedLength

		if (i == 0) {
			dataFSMA[0] = dataInput[0]
			dataSSMA[0] = dataInput[0]
			dataOutputMain[0] = 0
			i++
		} else if (i == 1) {
		} else {
			i--
		}

		sma(dataInput, dataFSMA, calculatedLength, fSMA)
		sma(dataInput, dataSSMA, calculatedLength, sSMA)

		while (i < dataInput.length) {
			dataOutputMain[i] = dataFSMA[i] - dataSSMA[i]
			i++
		}

		sma(dataOutputMain, dataOutputSignal, calculatedLength, sgnlSMA)

		i = calculatedLength

		if (i == 0) {
			i++
		} else if (i == 1) {
		} else {
			i--
		}

		var prev, curr

		while (i < dataInput.length) {
			prev = dataOutputMain[i - 1] - dataOutputSignal[i - 1]
			curr = dataOutputMain[i] - dataOutputSignal[i]

			if (prev <= curr) {
				dataUp[i] = curr
				dataDown[i] = 0
			} else {
				dataUp[i] = 0
				dataDown[i] = curr
			}

			i++
		}
	},[],
	[{
		name: DATA_NAME.HL2,
		index: 0
	}],
	[{
        name: "up",
        visible: true,
        renderType: RENDER_TYPE.HISTOGRAM,
        color: "#6CBA81"
    },{
        name: "down",
        visible: true,
        renderType: RENDER_TYPE.HISTOGRAM,
        color: "#ECAE93"
    },{
		name: "fastSMA",
		visible: false
	},{
		name: "slowSMA",
		visible: false
	},{
        name: "main",
        visible: false
    },{
        name: "signal",
        visible: false
    }],
	WHERE_TO_RENDER.SEPARATE_WINDOW)

    importBuiltInIndicator("ao", "Awesome Oscillator(v1.0)", function (context) {
		var dataInput = getDataInput(context, 0)
		var dataUp = getDataOutput(context, "up")
		var dataDown = getDataOutput(context, "down")
		var dataFSMA = getDataOutput(context, "fastSMA")
		var dataSSMA = getDataOutput(context, "slowSMA")

		var fSMA = 5
		var sSMA = 34
		var sgnlSMA = 5

		var calculatedLength = getCalculatedLength(context)
		var i = calculatedLength

		if (i == 0) {
			dataFSMA[0] = dataInput[0]
			dataSSMA[0] = dataInput[0]
			i++
		} else if (i == 1) {
		} else {
			i--
		}

		sma(dataInput, dataFSMA, calculatedLength, fSMA)
		sma(dataInput, dataSSMA, calculatedLength, sSMA)

		var prev, curr

		while (i < dataInput.length) {
			prev = dataFSMA[i - 1] - dataSSMA[i - 1]
			curr = dataFSMA[i] - dataSSMA[i]

			if (prev <= curr) {
				dataUp[i] = curr
				dataDown[i] = 0
			} else {
				dataUp[i] = 0
				dataDown[i] = curr
			}

			i++
		}
	},[],
	[{
		name: DATA_NAME.HL2,
		index: 0
	}],
	[{
        name: "up",
        visible: true,
        renderType: RENDER_TYPE.HISTOGRAM,
        color: "#6CBA81"
    },{
        name: "down",
        visible: true,
        renderType: RENDER_TYPE.HISTOGRAM,
        color: "#ECAE93"
    },{
		name: "fastSMA",
		visible: false
	},{
		name: "slowSMA",
		visible: false
    }],
	WHERE_TO_RENDER.SEPARATE_WINDOW)

	importBuiltInIndicator("ichimoku", "Ichimoku Kinko Hyo(v1.0)", function (context) {
	    var dataInputHigh = getDataInput(context, 0)
	    var dataInputLow = getDataInput(context, 1)
	    var dataInputClose = getDataInput(context, 2)
	    var dataOutputTenkan = getDataOutput(context, "tenkan")
	    var dataOutputKijun = getDataOutput(context, "kijun")
	    var dataOutputChikou = getDataOutput(context, "chikou")
	    var dataOutputSpanA = getDataOutput(context, "spana")
	    var dataOutputSpanB = getDataOutput(context, "spanb")

	    var tenkan = getIndiParameter(context, "tenkan")
	    var kijun = getIndiParameter(context, "kijun")
	    var senkou = getIndiParameter(context, "senkou")
		var spanA;
		if (kijun < tenkan) {
			spanA = tenkan;
		}else{
			spanA = kijun;
		}

	    var calculatedLength = getCalculatedLength(context)
	    var ptr = calculatedLength
	    var maxParam = Math.max(tenkan, kijun, spanA, senkou)

	    if (ptr > 0) {
	        ptr--
	    } else {
	        ptr = maxParam - 1

	        for (var i = 1; i < maxParam; i++) {
				dataOutputTenkan[ptr - i] = 0
				dataOutputKijun[ptr - i] = 0
				dataOutputChikou[ptr - i] = 0
				dataOutputSpanA[ptr - i] = 0
				dataOutputSpanB[ptr - i] = 0
			}
	    }

		var ptr2, tmp, highest, lowest

		while (ptr < dataInputHigh.length) {
	        tmp = null
	        highest = -Number.MAX_VALUE
	        lowest = Number.MAX_VALUE

			ptr2 = ptr - tenkan + 1

			while (ptr2 <= ptr) {
				tmp = dataInputHigh[ptr2]
				if (highest < tmp) {
					highest = tmp
				}

				tmp = dataInputLow[ptr2]
				if (lowest > tmp) {
					lowest = tmp
				}

				ptr2++
			}

			dataOutputTenkan[ptr] = (highest + lowest) / 2

	        tmp = null
	        highest = -Number.MAX_VALUE
	        lowest = Number.MAX_VALUE

			ptr2 = ptr - kijun + 1

			while (ptr2 <= ptr) {
	            tmp = dataInputHigh[ptr2]
				if (highest < tmp) {
					highest = tmp
				}

				tmp = dataInputLow[ptr2]
				if (lowest > tmp) {
					lowest = tmp
				}

				ptr2++
			}

			dataOutputKijun[ptr] = (highest + lowest) / 2

			dataOutputSpanA[ptr] = (dataOutputTenkan[ptr] + dataOutputKijun[ptr]) / 2

	        tmp = null
	        highest = -Number.MAX_VALUE
	        lowest = Number.MAX_VALUE

			ptr2 = ptr - senkou + 1

	        while (ptr2 <= ptr) {
	            tmp = dataInputHigh[ptr2]
				if (highest < tmp) {
					highest = tmp
				}

				tmp = dataInputLow[ptr2]
				if (lowest > tmp) {
					lowest = tmp
				}

				ptr2++
			}

			dataOutputSpanB[ptr] = (highest + lowest) / 2

			dataOutputChikou[ptr] = dataInputClose[ptr]

			ptr++
		}

	    if (calculatedLength == 0) {
	        setIndiShift(context, "chikou", -kijun)
	        setIndiShift(context, "spana", kijun)
	        setIndiShift(context, "spanb", kijun)
	    }
	},[{
	    name: "tenkan",
	    value: 9,
	    required: true,
	    type: PARAMETER_TYPE.INTEGER,
	    range: [1, 100]
	},{
	    name: "kijun",
	    value: 26,
	    required: true,
	    type: PARAMETER_TYPE.INTEGER,
	    range: [1, 100]
	},{
	    name: "senkou",
	    value: 52,
	    required: true,
	    type: PARAMETER_TYPE.INTEGER,
	    range: [1, 100]
	}],
	[{
	    name: DATA_NAME.HIGH,
	    index: 0
	},{
	    name: DATA_NAME.LOW,
	    index: 1
	},{
	    name: DATA_NAME.CLOSE,
	    index: 2
	}],
	[{
	    name: "tenkan",
	    visible: true,
	    renderType: RENDER_TYPE.LINE,
	    color: "#DE5029"
	},{
	    name: "kijun",
	    visible: true,
	    renderType: RENDER_TYPE.LINE,
	    color: "steelblue"
	},{
	    name: "chikou",
	    visible: true,
	    renderType: RENDER_TYPE.DASHARRAY,
	    color: "#4EC2B4"
	},{
	    name: "spana",
	    visible: true,
	    renderType: RENDER_TYPE.ROUND,
	    color: "steelblue"
	},{
	    name: "spanb",
	    visible: true,
	    renderType: RENDER_TYPE.ROUND,
	    color: "#CCCCCC"
	}],
	WHERE_TO_RENDER.CHART_WINDOW)

	importBuiltInIndicator("bears", "Bears Power(v1.0)", function (context) {
	    var dataInput = getDataInput(context, 0)
	    var dataInputLow = getDataInput(context, 1)
	    var dataOutput = getDataOutput(context, "bears")
	    var dataOutputEma = getDataOutput(context, "ema")
	    var period = getIndiParameter(context, "period")

	    var calculatedLength = getCalculatedLength(context)

	    var ptr = calculatedLength

	    if (ptr > 0) {
	        ptr--
	    } else {
	        ptr = period - 1

	        for (var i = 0; i < period - 1; i++) {
	            dataOutput[i] = 0
	        }
	    }

	    ema(dataInput, dataOutputEma, calculatedLength, period)

	    while (ptr < dataInput.length) {
	        dataOutput[ptr] = dataInputLow[ptr] - dataOutputEma[ptr]
	        ptr++
	    }
	},[{
	    name: "period",
	    value: 14,
	    required: true,
	    type: PARAMETER_TYPE.INTEGER,
	    range: [1, 100]
	}],
	[{
	    name: DATA_NAME.CLOSE,
	    index: 0
	},{
	    name: DATA_NAME.LOW,
	    index: 1
	}],
	[{
	    name: "bears",
	    visible: true,
	    renderType: RENDER_TYPE.HISTOGRAM,
	    color: "steelblue"
	},{
	    name: "ema",
	    visible: false
	}],
	WHERE_TO_RENDER.SEPARATE_WINDOW)

	importBuiltInIndicatorOnArray("bears_for_mql", "Bears Power for MQL(v1.0)", function (context) {
			var appliedPrice = getIndiParameter(context, "appliedPrice")
			appliedPrice = (appliedPrice < 0 || appliedPrice > 6) ? 0 : appliedPrice
			var dataInput = getDataInput(context, appliedPrice)
	    var dataInputLow = getDataInput(context, 3)
	    var dataOutput = getDataOutput(context, "bears")
	    var dataOutputEma = getDataOutput(context, "ema")
	    var period = getIndiParameter(context, "period")

	    var calculatedLength = getCalculatedLength(context)

	    var ptr = calculatedLength

	    if (ptr > 0) {
	        ptr--
	    } else {
	        ptr = period - 1

	        for (var i = 0; i < period - 1; i++) {
	            dataOutput[i] = 0
	        }
	    }

	    ema(dataInput, dataOutputEma, calculatedLength, period)

	    while (ptr < dataInput.length) {
	        dataOutput[ptr] = dataInputLow[ptr] - dataOutputEma[ptr]
	        ptr++
	    }
	},[{
	    name: "period",
	    value: 14,
	    required: true,
	    type: PARAMETER_TYPE.INTEGER,
	    range: [1, 100]
	},{
		name: "appliedPrice",
		value: 0,
		required: false,
		type: PARAMETER_TYPE.INTEGER,
		range: null
	}],
	[{
		name: DATA_NAME.CLOSE,
		index: 0
	},{
		name: DATA_NAME.OPEN,
		index: 1
	},{
		name: DATA_NAME.HIGH,
		index: 2
	},{
		name: DATA_NAME.LOW,
		index: 3
	},{
		name: DATA_NAME.HL2,
		index: 4
	},{
		name: DATA_NAME.HLC3,
		index: 5
	},{
		name: DATA_NAME.HLCC4,
		index: 6
	}],
	[{
	    name: "bears",
	    visible: true,
	    renderType: RENDER_TYPE.HISTOGRAM,
	    color: "steelblue"
	},{
	    name: "ema",
	    visible: false
	}],
	WHERE_TO_RENDER.SEPARATE_WINDOW)

	importBuiltInIndicator("bulls", "Bulls Power(v1.0)", function (context) {
	    var dataInput = getDataInput(context, 0)
	    var dataInputHigh = getDataInput(context, 1)
	    var dataOutput = getDataOutput(context, "bulls")
	    var dataOutputEma = getDataOutput(context, "ema")
	    var period = getIndiParameter(context, "period")

	    var calculatedLength = getCalculatedLength(context)

	    var ptr = calculatedLength

	    if (ptr > 0) {
	        ptr--
	    } else {
	        ptr = period - 1

	        for (var i = 0; i < period - 1; i++) {
	            dataOutput[i] = 0
	        }
	    }

	    ema(dataInput, dataOutputEma, calculatedLength, period)

	    while (ptr < dataInput.length) {
	        dataOutput[ptr] = dataInputHigh[ptr] - dataOutputEma[ptr]
	        ptr++
	    }
	},[{
	    name: "period",
	    value: 14,
	    required: true,
	    type: PARAMETER_TYPE.INTEGER,
	    range: [1, 100]
	}],
	[{
	    name: DATA_NAME.CLOSE,
	    index: 0
	},{
	    name: DATA_NAME.HIGH,
	    index: 1
	}],
	[{
	    name: "bulls",
	    visible: true,
	    renderType: RENDER_TYPE.HISTOGRAM,
	    color: "steelblue"
	},{
	    name: "ema",
	    visible: false
	}],
	WHERE_TO_RENDER.SEPARATE_WINDOW)

	importBuiltInIndicatorOnArray("bulls_for_mql", "Bulls Power for MQL(v1.0)", function (context) {
			var appliedPrice = getIndiParameter(context, "appliedPrice")
			appliedPrice = (appliedPrice < 0 || appliedPrice > 6) ? 0 : appliedPrice
			var dataInput = getDataInput(context, appliedPrice)
	    var dataInputHigh = getDataInput(context, 2)
	    var dataOutput = getDataOutput(context, "bulls")
	    var dataOutputEma = getDataOutput(context, "ema")
	    var period = getIndiParameter(context, "period")

	    var calculatedLength = getCalculatedLength(context)

	    var ptr = calculatedLength

	    if (ptr > 0) {
	        ptr--
	    } else {
	        ptr = period - 1

	        for (var i = 0; i < period - 1; i++) {
	            dataOutput[i] = 0
	        }
	    }

	    ema(dataInput, dataOutputEma, calculatedLength, period)

	    while (ptr < dataInput.length) {
	        dataOutput[ptr] = dataInputHigh[ptr] - dataOutputEma[ptr]
	        ptr++
	    }
	},[{
	    name: "period",
	    value: 14,
	    required: true,
	    type: PARAMETER_TYPE.INTEGER,
	    range: [1, 100]
	},{
		name: "appliedPrice",
		value: 0,
		required: false,
		type: PARAMETER_TYPE.INTEGER,
		range: null
	}],
	[{
		name: DATA_NAME.CLOSE,
		index: 0
	},{
		name: DATA_NAME.OPEN,
		index: 1
	},{
		name: DATA_NAME.HIGH,
		index: 2
	},{
		name: DATA_NAME.LOW,
		index: 3
	},{
		name: DATA_NAME.HL2,
		index: 4
	},{
		name: DATA_NAME.HLC3,
		index: 5
	},{
		name: DATA_NAME.HLCC4,
		index: 6
	}],
	[{
	    name: "bulls",
	    visible: true,
	    renderType: RENDER_TYPE.HISTOGRAM,
	    color: "steelblue"
	},{
	    name: "ema",
	    visible: false
	}],
	WHERE_TO_RENDER.SEPARATE_WINDOW)

	importBuiltInIndicator("momentum", "Momentum(v1.0)", function (context) {
	    var dataInput = getDataInput(context, 0)
	    var dataOutput = getDataOutput(context, "momentum")
	    var period = getIndiParameter(context, "period")

	    var calculatedLength = getCalculatedLength(context)

	    var ptr = calculatedLength

	    if (ptr > 0) {
	        ptr--
	    } else {
	        ptr = period - 1

	        for (var i = 0; i < period - 1; i++) {
	            dataOutput[i] = 0
	        }
	    }

	    while (ptr < dataInput.length) {
	        dataOutput[ptr] = dataInput[ptr] * 100 / dataInput[ptr - period]
	        ptr++
	    }
	},[{
	    name: "period",
	    value: 14,
	    required: true,
	    type: PARAMETER_TYPE.INTEGER,
	    range: [1, 100]
	}],
	[{
	    name: DATA_NAME.CLOSE,
	    index: 0
	}],
	[{
	    name: "momentum",
	    visible: true,
	    renderType: RENDER_TYPE.LINE,
	    color: "steelblue"
	}],
	WHERE_TO_RENDER.SEPARATE_WINDOW)

	importBuiltInIndicatorOnArray("momentum_for_mql", "Momentum for MQL(v1.0)", function (context) {
			var appliedPrice = getIndiParameter(context, "appliedPrice")
			appliedPrice = (appliedPrice < 0 || appliedPrice > 6) ? 0 : appliedPrice
			var dataInput = getDataInput(context, appliedPrice)
	    var dataOutput = getDataOutput(context, "momentum")
	    var period = getIndiParameter(context, "period")

	    var calculatedLength = getCalculatedLength(context)

	    var ptr = calculatedLength

	    if (ptr > 0) {
	        ptr--
	    } else {
	        ptr = period - 1

	        for (var i = 0; i < period - 1; i++) {
	            dataOutput[i] = 0
	        }
	    }

	    while (ptr < dataInput.length) {
	        dataOutput[ptr] = dataInput[ptr] * 100 / dataInput[ptr - period]
	        ptr++
	    }
	},[{
	    name: "period",
	    value: 14,
	    required: true,
	    type: PARAMETER_TYPE.INTEGER,
	    range: [1, 100]
	},{
		name: "appliedPrice",
		value: 0,
		required: false,
		type: PARAMETER_TYPE.INTEGER,
		range: null
	}],
	[{
		name: DATA_NAME.CLOSE,
		index: 0
	},{
		name: DATA_NAME.OPEN,
		index: 1
	},{
		name: DATA_NAME.HIGH,
		index: 2
	},{
		name: DATA_NAME.LOW,
		index: 3
	},{
		name: DATA_NAME.HL2,
		index: 4
	},{
		name: DATA_NAME.HLC3,
		index: 5
	},{
		name: DATA_NAME.HLCC4,
		index: 6
	}],
	[{
	    name: "momentum",
	    visible: true,
	    renderType: RENDER_TYPE.LINE,
	    color: "steelblue"
	}],
	WHERE_TO_RENDER.SEPARATE_WINDOW)

	importBuiltInIndicator("cci", "Commodity Channel Index(v1.0)", function (context) {
	    var dataInput = getDataInput(context, 0)
	    var dataOutput = getDataOutput(context, "cci")
	    var dataOutputHL = getDataOutput(context, "cciHighLevel")
	    var dataOutputLL = getDataOutput(context, "cciLowLevel")
	    var dataOutputSma = getDataOutput(context, "sma")
	    var highLevel = getIndiParameter(context, "highLevel")
	    var lowLevel = getIndiParameter(context, "lowLevel")
	    var period = getIndiParameter(context, "period")
	    var cciFactor = 0.015 / period;

	    var calculatedLength = getCalculatedLength(context)

	    var ptr = calculatedLength

	    if (ptr > 0) {
	        ptr--
	    } else {
	        ptr = period - 1

	        for (var i = 0; i < period - 1; i++) {
	            dataOutput[i] = 0
	            dataOutputHL[i] = highLevel
	            dataOutputLL[i] = lowLevel
	        }
	    }

	    sma(dataInput, dataOutputSma, calculatedLength, period)

	    var sum, tmp, ptr2

	    while (ptr < dataInput.length) {
	        sum = 0
			ptr2 = ptr - period + 1
			while (ptr2 <= ptr) {
				sum += Math.abs(dataInput[ptr2] - dataOutputSma[ptr])
				ptr2++
			}
			tmp = sum * cciFactor

			if (0 == tmp) {
				dataOutput[ptr] = 0
			} else {
				dataOutput[ptr] = (dataInput[ptr] - dataOutputSma[ptr]) / tmp
			}

	        dataOutputHL[ptr] = highLevel
	        dataOutputLL[ptr] = lowLevel

	        ptr++
	    }
	},[{
	    name: "period",
	    value: 14,
	    required: true,
	    type: PARAMETER_TYPE.INTEGER,
	    range: [1, 100]
	},{
	    name: "highLevel",
	    value: 100,
	    required: false,
	    type: PARAMETER_TYPE.NUMBER,
	    range: [1, 200]
	},{
	    name: "lowLevel",
	    value: -100,
	    required: false,
	    type: PARAMETER_TYPE.NUMBER,
	    range: [-200, -1]
	}],
	[{
	    name: DATA_NAME.HLC3,
	    index: 0
	}],
	[{
	    name: "cci",
	    visible: true,
	    renderType: RENDER_TYPE.LINE,
	    color: "steelblue"
	},{
	    name: "cciHighLevel",
	    visible: true,
	    renderType: RENDER_TYPE.DASHARRAY,
	    color: "#AAAAAA"
	},{
	    name: "cciLowLevel",
	    visible: true,
	    renderType: RENDER_TYPE.DASHARRAY,
	    color: "#AAAAAA"
	},{
	    name: "sma",
	    visible: false
	}],
	WHERE_TO_RENDER.SEPARATE_WINDOW)

	importBuiltInIndicatorOnArray("cci_for_mql", "Commodity Channel Index for MQL(v1.0)", function (context) {
			var appliedPrice = getIndiParameter(context, "appliedPrice")
			appliedPrice = (appliedPrice < 0 || appliedPrice > 6) ? 0 : appliedPrice
			var dataInput = getDataInput(context, appliedPrice)
	    var dataOutput = getDataOutput(context, "cci")
	    var dataOutputHL = getDataOutput(context, "cciHighLevel")
	    var dataOutputLL = getDataOutput(context, "cciLowLevel")
	    var dataOutputSma = getDataOutput(context, "sma")
	    var highLevel = getIndiParameter(context, "highLevel")
	    var lowLevel = getIndiParameter(context, "lowLevel")
	    var period = getIndiParameter(context, "period")
	    var cciFactor = 0.015 / period;

	    var calculatedLength = getCalculatedLength(context)

	    var ptr = calculatedLength

	    if (ptr > 0) {
	        ptr--
	    } else {
	        ptr = period - 1

	        for (var i = 0; i < period - 1; i++) {
	            dataOutput[i] = 0
	            dataOutputHL[i] = highLevel
	            dataOutputLL[i] = lowLevel
	        }
	    }

	    sma(dataInput, dataOutputSma, calculatedLength, period)

	    var sum, tmp, ptr2

	    while (ptr < dataInput.length) {
	        sum = 0
			ptr2 = ptr - period + 1
			while (ptr2 <= ptr) {
				sum += Math.abs(dataInput[ptr2] - dataOutputSma[ptr])
				ptr2++
			}
			tmp = sum * cciFactor

			if (0 == tmp) {
				dataOutput[ptr] = 0
			} else {
				dataOutput[ptr] = (dataInput[ptr] - dataOutputSma[ptr]) / tmp
			}

	        dataOutputHL[ptr] = highLevel
	        dataOutputLL[ptr] = lowLevel

	        ptr++
	    }
	},[{
	    name: "period",
	    value: 14,
	    required: true,
	    type: PARAMETER_TYPE.INTEGER,
	    range: [1, 100]
	},{
	    name: "highLevel",
	    value: 100,
	    required: false,
	    type: PARAMETER_TYPE.NUMBER,
	    range: [1, 200]
	},{
	    name: "lowLevel",
	    value: -100,
	    required: false,
	    type: PARAMETER_TYPE.NUMBER,
	    range: [-200, -1]
	},{
		name: "appliedPrice",
		value: 5,
		required: false,
		type: PARAMETER_TYPE.INTEGER,
		range: null
	}],
	[{
		name: DATA_NAME.CLOSE,
		index: 0
	},{
		name: DATA_NAME.OPEN,
		index: 1
	},{
		name: DATA_NAME.HIGH,
		index: 2
	},{
		name: DATA_NAME.LOW,
		index: 3
	},{
		name: DATA_NAME.HL2,
		index: 4
	},{
		name: DATA_NAME.HLC3,
		index: 5
	},{
		name: DATA_NAME.HLCC4,
		index: 6
	}],
	[{
	    name: "cci",
	    visible: true,
	    renderType: RENDER_TYPE.LINE,
	    color: "steelblue"
	},{
	    name: "cciHighLevel",
	    visible: true,
	    renderType: RENDER_TYPE.DASHARRAY,
	    color: "#AAAAAA"
	},{
	    name: "cciLowLevel",
	    visible: true,
	    renderType: RENDER_TYPE.DASHARRAY,
	    color: "#AAAAAA"
	},{
	    name: "sma",
	    visible: false
	}],
	WHERE_TO_RENDER.SEPARATE_WINDOW)

	importBuiltInIndicator("demarker", "DeMarker(v1.0)", function (context) {
	    var dataInputHigh = getDataInput(context, 0)
	    var dataInputLow = getDataInput(context, 1)
	    var dataOutput = getDataOutput(context, "demarker")
	    var dataOutputHL = getDataOutput(context, "highLevel")
	    var dataOutputLL = getDataOutput(context, "lowLevel")
	    var dataOutputMax = getDataOutput(context, "max")
	    var dataOutputMin = getDataOutput(context, "min")
	    var dataOutputMaMax = getDataOutput(context, "maMax")
	    var dataOutputMaMin = getDataOutput(context, "maMin")
	    var highLevel = getIndiParameter(context, "highLevel")
	    var lowLevel = getIndiParameter(context, "lowLevel")
	    var period = getIndiParameter(context, "period")

	    var calculatedLength = getCalculatedLength(context)

	    var ptr = calculatedLength

	    if (ptr > 0) {
	        ptr--
	    } else {
	        ptr = 1

	        dataOutputMax[0] = 0;
			dataOutputMin[0] = 0;
	    }

	    var tmp = 0

	    while (ptr < dataInputHigh.length) {
			tmp = dataInputHigh[ptr] - dataInputHigh[ptr - 1]
			if (0 > tmp) {
				tmp = 0
			}
			dataOutputMax[ptr] = tmp

			tmp = dataInputLow[ptr - 1] - dataInputLow[ptr]
			if (0 > tmp) {
				tmp = 0
			}
			dataOutputMin[ptr] = tmp

			ptr++
		}

	    sma(dataOutputMax, dataOutputMaMax, calculatedLength, period)
	    sma(dataOutputMin, dataOutputMaMin, calculatedLength, period)

	    ptr = calculatedLength

	    if (ptr > 0) {
	        ptr--
	    } else {
	        ptr = period - 1

	        for (var i = 0; i < period - 1; i++) {
	            dataOutput[i] = 0
	            dataOutputHL[i] = highLevel
	            dataOutputLL[i] = lowLevel
	        }
	    }

	    while (ptr < dataInputHigh.length) {
	        tmp = dataOutputMaMax[ptr] + dataOutputMaMin[ptr]

			if (0 == tmp) {
				dataOutput[ptr] = 0
			} else {
				dataOutput[ptr] = dataOutputMaMax[ptr] / tmp
			}

	        dataOutputHL[ptr] = highLevel
	        dataOutputLL[ptr] = lowLevel

	        ptr++
	    }
	},[{
	    name: "period",
	    value: 14,
	    required: true,
	    type: PARAMETER_TYPE.INTEGER,
	    range: [1, 100]
	},{
	    name: "highLevel",
	    value: 0.7,
	    required: false,
	    type: PARAMETER_TYPE.NUMBER,
	    range: [0, 1]
	},{
	    name: "lowLevel",
	    value: 0.3,
	    required: false,
	    type: PARAMETER_TYPE.NUMBER,
	    range: [0, 1]
	}],
	[{
	    name: DATA_NAME.HIGH,
	    index: 0
	},{
	    name: DATA_NAME.LOW,
	    index: 1
	}],
	[{
	    name: "demarker",
	    visible: true,
	    renderType: RENDER_TYPE.LINE,
	    color: "steelblue"
	},{
	    name: "highLevel",
	    visible: true,
	    renderType: RENDER_TYPE.DASHARRAY,
	    color: "#AAAAAA"
	},{
	    name: "lowLevel",
	    visible: true,
	    renderType: RENDER_TYPE.DASHARRAY,
	    color: "#AAAAAA"
	},{
	    name: "max",
	    visible: false
	},{
	    name: "min",
	    visible: false
	},{
	    name: "maMax",
	    visible: false
	},{
	    name: "maMin",
	    visible: false
	}],
	WHERE_TO_RENDER.SEPARATE_WINDOW)

	importBuiltInIndicator("wpr", "Williams' Percent Range(v1.0)", function (context) {
	    var dataInputClose = getDataInput(context, 0)
	    var dataInputHigh = getDataInput(context, 1)
	    var dataInputLow = getDataInput(context, 2)
	    var dataOutput = getDataOutput(context, "wpr")
	    var dataOutputHL = getDataOutput(context, "wprHighLevel")
	    var dataOutputLL = getDataOutput(context, "wprLowLevel")
	    var highLevel = getIndiParameter(context, "highLevel")
	    var lowLevel = getIndiParameter(context, "lowLevel")
	    var period = getIndiParameter(context, "period")

	    var calculatedLength = getCalculatedLength(context)

	    var ptr = calculatedLength

	    if (ptr > 0) {
	        ptr--
	    } else {
	        ptr = period - 1

	        for (var i = 0; i < period - 1; i++) {
	            dataOutput[i] = 0
	            dataOutputHL[i] = highLevel
	            dataOutputLL[i] = lowLevel
	        }
	    }

	    while (ptr < dataInputClose.length) {
	        var maxArr = []

			for (var i = 0; i < period; i++) {
				maxArr.push(dataInputHigh[ptr - i])
			}

			var highest = Math.max.apply(null, maxArr)

			var minArr = []
			for (var i = 0; i < period; i++) {
				minArr.push(dataInputLow[ptr - i])
			}

			var lowest = Math.min.apply(null, minArr)

			if (0 == highest - lowest) {
				dataOutput[ptr] = 0
			} else {
				dataOutput[ptr] = -100 * (highest - dataInputClose[ptr]) / (highest - lowest)
			}

	        dataOutputHL[ptr] = highLevel
	        dataOutputLL[ptr] = lowLevel

	        ptr++
	    }
	},[{
	    name: "period",
	    value: 14,
	    required: true,
	    type: PARAMETER_TYPE.INTEGER,
	    range: [1, 100]
	},{
	    name: "highLevel",
	    value: -20,
	    required: false,
	    type: PARAMETER_TYPE.NUMBER,
	    range: [-100, 0]
	},{
	    name: "lowLevel",
	    value: -80,
	    required: false,
	    type: PARAMETER_TYPE.NUMBER,
	    range: [-100, 0]
	}],
	[{
	    name: DATA_NAME.CLOSE,
	    index: 0
	},{
	    name: DATA_NAME.HIGH,
	    index: 1
	},{
	    name: DATA_NAME.LOW,
	    index: 2
	}],
	[{
	    name: "wpr",
	    visible: true,
	    renderType: RENDER_TYPE.LINE,
	    color: "steelblue"
	},{
	    name: "wprHighLevel",
	    visible: true,
	    renderType: RENDER_TYPE.DASHARRAY,
	    color: "#AAAAAA"
	},{
	    name: "wprLowLevel",
	    visible: true,
	    renderType: RENDER_TYPE.DASHARRAY,
	    color: "#AAAAAA"
	}],
	WHERE_TO_RENDER.SEPARATE_WINDOW)

	importBuiltInIndicator("rvi", "Relative Vigor Index(v1.0)", function (context) {
	    var dataInputOpen = getDataInput(context, 0)
	    var dataInputHigh = getDataInput(context, 1)
	    var dataInputLow = getDataInput(context, 2)
	    var dataInputClose = getDataInput(context, 3)
	    var dataOutputMain = getDataOutput(context, "main")
	    var dataOutputSignal = getDataOutput(context, "signal")
	    var period = getIndiParameter(context, "period")

	    var calculatedLength = getCalculatedLength(context)

	    var ptr = calculatedLength

	    if (ptr > 0) {
	        ptr--
	    } else {
	        ptr = period + 2

	        for (var i = 0; i < period + 2; i++) {
	            dataOutputMain[i] = 0
	            dataOutputSignal[i] = 0
	        }
	    }

	    var upTmp, downTmp, tmp, dTmp

	    while (ptr < dataInputOpen.length) {
	        tmp = 0
			dTmp = 0

			for (var i = ptr; i > ptr - period; i--) {
				upTmp = ((dataInputClose[i] - dataInputOpen[i]) + 2 * (dataInputClose[i - 1] - dataInputOpen[i - 1]) + 2 * (dataInputClose[i - 2] - dataInputOpen[i - 2]) + (dataInputClose[i - 3] - dataInputOpen[i - 3])) / 6
				downTmp = ((dataInputHigh[i] - dataInputLow[i]) + 2 * (dataInputHigh[i - 1] - dataInputLow[i - 1]) + 2 * (dataInputHigh[i - 2] - dataInputLow[i - 2]) + (dataInputHigh[i - 3] - dataInputLow[i - 3])) / 6

				tmp += upTmp
				dTmp += downTmp
			}

			if (0 == dTmp) {
				dataOutputMain[ptr] = tmp
			} else {
				dataOutputMain[ptr] = tmp / dTmp
			}

	        ptr++
	    }

	    ptr = calculatedLength

	    if (ptr > 0) {
	        ptr--
	    } else {
	        ptr = period + 2
	    }

	    while (ptr < dataInputOpen.length) {
	        dataOutputSignal[ptr] = (dataOutputMain[ptr] + 2 * dataOutputMain[ptr - 1] + 2 * dataOutputMain[ptr - 2] + dataOutputMain[ptr - 3]) / 6

	        ptr++
	    }
	},[{
	    name: "period",
	    value: 14,
	    required: true,
	    type: PARAMETER_TYPE.INTEGER,
	    range: [1, 100]
	}],
	[{
	    name: DATA_NAME.OPEN,
	    index: 0
	},{
	    name: DATA_NAME.HIGH,
	    index: 1
	},{
	    name: DATA_NAME.LOW,
	    index: 2
	},{
	    name: DATA_NAME.CLOSE,
	    index: 3
	}],
	[{
	    name: "main",
	    visible: true,
	    renderType: RENDER_TYPE.LINE,
	    color: "#6CBA81"
	},{
	    name: "signal",
	    visible: true,
	    renderType: RENDER_TYPE.LINE,
	    color: "#ECAE93"
	}],
	WHERE_TO_RENDER.SEPARATE_WINDOW)

	importBuiltInIndicator("mfi", "Market Facilitation Index(v1.01)", function (context) {
		var dataInputHigh = getDataInput(context, 0)
		var dataInputLow = getDataInput(context, 1)
		var dataInputVol = getDataInput(context, 2)
		var dataOutput = getDataOutput(context, "mfi")
		var dataOutputH = getDataOutput(context, "highestTmp")
		var dataOutputL = getDataOutput(context, "lowestTmp")
		var dataOutputV = getDataOutput(context, "volSumTmp")
		var period = getIndiParameter(context, "period")

		var calculatedLength = getCalculatedLength(context)

		getHighestOnArray(dataInputHigh, dataOutputH, calculatedLength, period)
		getLowestOnArray(dataInputLow, dataOutputL, calculatedLength, period)
		sumOnArray(dataInputVol, dataOutputV, calculatedLength, period)

		var i = calculatedLength

		if (i != 0) {
			i--
		}

		while (i < dataInputVol.length) {
			if (dataOutputV[i] == 0) {
				dataOutput[i] = 0
			} else {
				dataOutput[i] = (dataOutputH[i] - dataOutputL[i]) / dataOutputV[i]
			}

			i++
		}
	},[{
    name: "period",
    value: 1,
    required: false,
    type: PARAMETER_TYPE.INTEGER,
    range: [1, 100]
	}],
	[{
    name: DATA_NAME.HIGH,
    index: 0
	},{
    name: DATA_NAME.LOW,
    index: 1
	},{
		name: DATA_NAME.VOLUME,
		index: 2
	}],
	[{
		name: "mfi",
		visible: true,
		renderType: RENDER_TYPE.HISTOGRAM,
		color: "steelblue"
	},{
		name: "highestTmp",
		visible: false
	},{
		name: "lowestTmp",
		visible: false
	},{
		name: "volSumTmp",
		visible: false
	}],
	WHERE_TO_RENDER.SEPARATE_WINDOW)

	importBuiltInIndicator("zigzag", "ZigZag based on SAR(v1.03)", function (context) {
	  var dataInputHigh = getDataInput(context, 0)
	  var dataInputLow = getDataInput(context, 1)

	  var dataOutputZZLine = getDataOutput(context, "zigzagLine")
	  var dataOutputZZ = getDataOutput(context, "zigzag")
	  var dataOutput = getDataOutput(context, "sar")
	  var dataOutputIsLong = getDataOutput(context, "isLong")
	  var dataOutputAf = getDataOutput(context, "af")
	  var dataOutputEp = getDataOutput(context, "ep")

	  var acceleration = getIndiParameter(context, "acceleration")
	  var afMax = getIndiParameter(context, "afMax")

	  var arrLen = dataInputHigh.length
	  var calculatedLength = getCalculatedLength(context)
	  var i = calculatedLength

	  var prevH = null
	  var prevL = null
	  var currH = null
	  var currL = null
	  var sar = null
	  var isLong = null
	  var af = acceleration
	  var ep = null

	  if (i > 0) {
	    i -= 2
	    prevH = dataInputHigh[i - 1]
	    prevL = dataInputLow[i - 1]
	    isLong = dataOutputIsLong[i]
	    sar = dataOutput[i]
	    af = dataOutputAf[i]
	    ep = dataOutputEp[i]
	  } else {
	    dataOutput[i] = 0
	    dataOutputIsLong[i] = true
	    dataOutputAf[i] = af
	    dataOutputEp[i] = 0

	    i = 1

	    prevH = dataInputHigh[i - 1]
	    prevL = dataInputLow[i - 1]
	    isLong = true
	    sar = prevL
	    ep = prevH
	  }

	  while (i < arrLen) {
	    currH = dataInputHigh[i]
	    currL = dataInputLow[i]

	    if (isLong) {
	      if (currL <= sar) {
	        isLong = false
	        sar = Math.max(ep, currH, prevH)

	        dataOutput[i] = sar

	        af = acceleration
	        ep = currL
	        sar = sar + af * (ep - sar)
	        sar = Math.max(sar, currH, prevH)
	      } else {
	        dataOutput[i] = sar

	        if (currH > ep) {
	          ep = currH
	          if (af - dataOutputAf[i - 1] <= 0) {
	            af += acceleration
	          }
	          if (af > afMax) {
	            af = afMax
	          }
	        }
	        sar = sar + af * (ep - sar)
	        sar = Math.min(sar, currL, prevL)
	      }
	    } else {
	      if (currH >= sar) {
	        isLong = true
	        sar = Math.min(ep, currL, prevL)

	        dataOutput[i] = sar

	        af = acceleration
	        ep = currH
	        sar = sar + af * (ep - sar)
	        sar = Math.min(sar, currL, prevL)
	      } else {
	        dataOutput[i] = sar

	        if (currL < ep) {
	          ep = currL
	          if (af - dataOutputAf[i - 1] <= 0) {
	            af += acceleration
	          }
	          if (af > afMax) {
	            af = afMax
	          }
	        }
	        sar = sar + af * (ep - sar)
	        sar = Math.max(sar, currH, prevH)
	      }
	    }

	    dataOutputIsLong[i] = isLong
	    dataOutputAf[i] = af
	    dataOutputEp[i] = ep

	    i++

	    prevH = currH
	    prevL = currL
	  }

	  var zigzag = []
	  var latestZZ = null
	  var latestZZIdx = -1

	  if (calculatedLength > 0) {
	    dataOutputZZ[calculatedLength - 1] = 0
	    dataOutputZZLine[calculatedLength - 1] = 0

	    for (i = arrLen - 1; i >= 0; i--) {
	      if (dataOutputZZ[i] != 0) {
	        latestZZ = {
	          value: dataOutputZZ[i],
	          index: i
	        }

	        latestZZIdx = i

	        break
	      }
	    }
	  } else {
	    dataOutputZZ[0] = (dataInputHigh[0] + dataInputLow[0]) / 2
	    dataOutputZZLine[0] = dataOutputZZ[0]

	    for (i = 1; i < arrLen; i++) {
	      dataOutputZZ[i] = 0
	    }

	    latestZZ = {
	      value: dataOutputZZ[0],
	      index: 0
	    }

	    latestZZIdx = 0
	  }

	  i = arrLen - 1

	  var foundIdx = -1
	  var lowestZZ = Number.MAX_VALUE
	  var highestZZ = -Number.MAX_VALUE

	  var bNextLong = dataOutputIsLong[i]

	  while (i >= 0 && i >= latestZZIdx) {
	    if (dataOutputIsLong[i]) {
	      if (bNextLong && i != 0) {
	        if (dataInputHigh[i] > highestZZ) {
	          foundIdx = i
	          highestZZ = dataInputHigh[i]
	        }
	      } else {
	        if (foundIdx != -1) {
	          zigzag.splice(0, 0, {
	            value: lowestZZ,
	            index: foundIdx
	          })
	        }

	        foundIdx = i
	        lowestZZ = Number.MAX_VALUE
	        highestZZ = dataInputHigh[i]

	        bNextLong = true
	      }
	    } else {
	      if (!bNextLong && i != 0) {
	        if (dataInputLow[i] < lowestZZ) {
	          foundIdx = i
	          lowestZZ = dataInputLow[i]
	        }
	      } else {
	        if (foundIdx != -1) {
	          zigzag.splice(0, 0, {
	            value: highestZZ,
	            index: foundIdx
	          })
	        }

	        foundIdx = i
	        lowestZZ = dataInputLow[i]
	        highestZZ = -Number.MAX_VALUE

	        bNextLong = false
	      }
	    }

	    i--
	  }

	  zigzag.splice(0, 0, latestZZ)

	  var zzLen = zigzag.length > 1 ? (zigzag.length - 1) : 1

	  for (i = 0; i < zzLen; i++) {
	    dataOutputZZ[zigzag[i].index] = zigzag[i].value
	  }

	  if (arrLen - 1 > zigzag[zigzag.length - 1].index) {
	    zigzag.push({
	      value: (dataInputHigh[arrLen - 1] + dataInputLow[arrLen - 1]) / 2,
	      index: arrLen - 1
	    })
	  }

	  for (i = 1; i < zigzag.length; i++) {
	    var step = (zigzag[i].value - zigzag[i - 1].value) / (zigzag[i].index - zigzag[i - 1].index)
	    var nextIdx = zigzag[i].index
	    var startValue = zigzag[i - 1].value
	    var startIdx = zigzag[i - 1].index

	    for (var j = zigzag[i - 1].index; j < nextIdx; j++) {
	      dataOutputZZLine[j] = startValue + step * (j - startIdx)
	    }
	  }

	  dataOutputZZLine[arrLen - 1] = zigzag[zigzag.length - 1].value
	},[{
	  name: "acceleration",
	  value: 0.01,
	  required: true,
	  type: PARAMETER_TYPE.NUMBER,
	  range: [0.001, 0.1]
	},{
	  name: "afMax",
	  value: 0.05,
	  required: true,
	  type: PARAMETER_TYPE.NUMBER,
	  range: [0.01, 1]
	}],
	[{
	  name: DATA_NAME.HIGH,
	  index: 0
	},{
	  name: DATA_NAME.LOW,
	  index: 1
	}],
	[{
	  name: "zigzagLine",
	  visible: true,
	  renderType: RENDER_TYPE.LINE,
	  color: "orange"
	},{
	  name: "zigzag",
	  visible: false
	},{
	  name: "sar",
	  visible: false
	},{
	  name: "isLong",
	  visible: false
	},{
	  name: "af",
	  visible: false
	},{
	  name: "ep",
	  visible: false
	}],
	WHERE_TO_RENDER.CHART_WINDOW)

	importBuiltInIndicator("bidask", "Bid and Ask(v1.01)", function (context) {
		var dataInput = getDataInput(context, 0)
		if (dataInput.length == 0) return
		var dataOutputBid = getDataOutput(context, "bid")
		var dataOutputAsk = getDataOutput(context, "ask")
		var spread = getIndiParameter(context, "spread")

		var currPrice = dataInput[dataInput.length - 1]
		var bid = currPrice - spread / 2
		var ask = currPrice + spread / 2
		var dataLen = dataInput.length
		var barNum = typeof context.barNum == "undefined" ? dataInput.length : context.barNum

		for (var i = dataLen - 1; i >= dataLen - 1 - barNum; i--) {
			dataOutputBid[i] = bid
			dataOutputAsk[i] = ask
		}
	},[{
		name: "spread",
		value: 0.0001,
		required: true,
		type: PARAMETER_TYPE.NUMBER,
		range: [0, 0.1]
	}],
	[{
		name: DATA_NAME.CLOSE,
		index: 0
	}],
	[{
		name: "bid",
		visible: true,
		renderType: RENDER_TYPE.DASHARRAY,
		color: "red"
	},{
		name: "ask",
		visible: true,
		renderType: RENDER_TYPE.DASHARRAY,
		color: "green"
	}],
	WHERE_TO_RENDER.CHART_WINDOW,
	function (context) { // Init()
	},
	function (context) { // Deinit()
	},
	function (context) { // Render()
	  context.barNum = getBarNum(context)
	})

	importBuiltInIndicator("heikin-ashi", "Heikin-Ashi(v1.01)", function (context) {
	  var dataInputO = getDataInput(context, 0)
	  var dataInputH = getDataInput(context, 1)
	  var dataInputL = getDataInput(context, 2)
	  var dataInputC = getDataInput(context, 3)
	  var dataOutputO = getDataOutput(context, "ha_open")
	  var dataOutputH = getDataOutput(context, "ha_high")
	  var dataOutputL = getDataOutput(context, "ha_low")
	  var dataOutputC = getDataOutput(context, "ha_close")

	  var calculatedLength = getCalculatedLength(context)

	  var i = calculatedLength

	  if (i > 0) {
	    i--
	  } else {
	    dataOutputC[i] = (dataInputO[i] + dataInputH[i] + dataInputL[i] + dataInputC[i]) / 4
	    dataOutputO[i] = (dataInputO[i] + dataInputC[i]) / 2
	    dataOutputH[i] = Math.max(dataInputH[i], dataOutputO[i], dataOutputC[i])
	    dataOutputL[i] = Math.max(dataInputL[i], dataOutputO[i], dataOutputC[i])
	    i = 1
	  }

	  while (i < dataInputC.length) {
	    dataOutputC[i] = (dataInputO[i] + dataInputH[i] + dataInputL[i] + dataInputC[i]) / 4
	    dataOutputO[i] = (dataOutputO[i - 1] + dataOutputC[i - 1]) / 2
	    dataOutputH[i] = Math.max(dataInputH[i], dataOutputO[i], dataOutputC[i])
	    dataOutputL[i] = Math.max(dataInputL[i], dataOutputO[i], dataOutputC[i])

	    i++
	  }
	},[{
	  name: "colorLong",
	  value: "green",
	  required: true,
	  type: PARAMETER_TYPE.STRING,
	  range: null
	}, {
	  name: "colorShort",
	  value: "red",
	  required: true,
	  type: PARAMETER_TYPE.STRING,
	  range: null
	}],
	[{
		name: DATA_NAME.OPEN,
		index: 0
	}, {
		name: DATA_NAME.HIGH,
		index: 1
	}, {
		name: DATA_NAME.LOW,
		index: 2
	}, {
		name: DATA_NAME.CLOSE,
		index: 3
	}],
	[{
	  name: "ha_open",
	  visible: false
	}, {
	  name: "ha_high",
	  visible: false
	}, {
	  name: "ha_low",
	  visible: false
	}, {
	  name: "ha_close",
	  visible: false
	}],
	WHERE_TO_RENDER.CHART_WINDOW,
	function (context) { // Init()
	  var colorLong = getIndiParameter(context, "colorLong")
	  var colorShort = getIndiParameter(context, "colorShort")
	  var chartHandle = getChartHandleByContext(context)

	  context.heikinAshi = {
	    colorLong: colorLong,
	    colorShort: colorShort,
	    canvas: getSvgCanvas(chartHandle)
	  }
	},
	function (context) { // Deinit()
	  var chartHandle = getChartHandleByContext(context)
	  var canvas = context.heikinAshi.canvas

	  canvas.selectAll(".haHL").select(function() { return this.parentNode; }).select(function() { return this.parentNode; }).each(function (d, i) {
	    if (i == 0) {
	      d3.select(this).selectAll(".cc_k_c_oc").attr("opacity", 1)
	      d3.select(this).selectAll(".cc_k_c_hl").attr("opacity", 1)
	    }
	  })
		canvas.selectAll(".haHL").data([]).exit().remove()
	  canvas.selectAll(".haOC").data([]).exit().remove()
	},
	function (context) { // Render()
	  var dataOutputO = getDataOutput(context, "ha_open")
	  var dataOutputH = getDataOutput(context, "ha_high")
	  var dataOutputL = getDataOutput(context, "ha_low")
	  var dataOutputC = getDataOutput(context, "ha_close")
	  var barNum = getBarNum(context)
	  var cursor = getCursor(context)
	  var width = getCanvasWidth(context)
	  var height = getCanvasHeight(context)
	  var xScale = getXScale(context)
	  var yScale = getYScale(context)

	  var ha = []
	  var cursor2 = Math.min(cursor + barNum, dataOutputC.length)

	  for (var i = cursor; i < cursor2; i++) {
	    ha.push({
	      o: dataOutputO[i],
	      h: dataOutputH[i],
	      l: dataOutputL[i],
	      c: dataOutputC[i]
	    })
	  }

	  var colorLong = context.heikinAshi.colorLong
	  var colorShort = context.heikinAshi.colorShort
		var canvas = context.heikinAshi.canvas

	  var haHL = canvas.selectAll(".haHL").data(ha)

	  haHL.attr("x1", function (d, i) {
	      return xScale(i)
	    })
	    .attr("x2", function (d, i) {
	      return xScale(i)
	    })
	    .attr("y1", function (d) {
	      return yScale(d.h)
	    })
	    .attr("y2", function (d) {
	      return yScale(d.l)
	    })
	    .attr("stroke", function (d) {
	      return d.o > d.c ? colorShort : colorLong
	    })

	  haHL.enter().append("line")
	    .attr("class", "haHL")
	    .attr("x1", function (d, i) {
	      return xScale(i)
	    })
	    .attr("x2", function (d, i) {
	      return xScale(i)
	    })
	    .attr("y1", function (d) {
	      return yScale(d.h)
	    })
	    .attr("y2", function (d) {
	      return yScale(d.l)
	    })
	    .attr("stroke", function (d) {
	      return d.o > d.c ? colorShort : colorLong
	    })

	  haHL.exit().remove()

	  var barWidth = Math.floor(0.8 * width / barNum)
	  var halfWidth = barWidth / 2

	  var haOC = canvas.selectAll(".haOC").data(ha)

	  haOC.attr("x", function (d, i) {
	      return xScale(i) - halfWidth
	    })
	    .attr("y", function (d) {
	      return yScale(Math.max(d.o, d.c))
	    })
	    .attr("width", barWidth)
	    .attr("height", function (d) {
	      return d.o == d.c ? 1 :
	        (yScale(Math.min(d.o, d.c)) - yScale(Math.max(d.o, d.c)))
	    })
	    .attr("fill", function (d) {
	      if (d.o == d.c)
	        return "black"
	      else
	        return d.o > d.c ? colorShort : colorLong
	    })
	    .attr("stroke", function (d) {
	      if (d.o == d.c)
	        return "black"
	      else
	        return d.o > d.c ? colorShort : colorLong
	    })

	  haOC.enter().append("rect")
	    .attr("class", "haOC")
	    .attr("x", function (d, i) {
	      return xScale(i) - halfWidth
	    })
	    .attr("y", function (d) {
	      return yScale(Math.max(d.o, d.c))
	    })
	    .attr("width", barWidth)
	    .attr("height", function (d) {
	      return d.o == d.c ? 1 :
	        (yScale(Math.min(d.o, d.c)) - yScale(Math.max(d.o, d.c)))
	    })
	    .attr("fill", function (d) {
	      if (d.o == d.c)
	        return "black"
	      else
	        return d.o > d.c ? colorShort : colorLong
	    })
	    .attr("stroke", function (d) {
	      if (d.o == d.c)
	        return "black"
	      else
	        return d.o > d.c ? colorShort : colorLong
	    })
	    .attr("strokeWidth", 2)

	  haOC.exit().remove()

	  canvas.selectAll(".haHL").select(function() { return this.parentNode; }).select(function() { return this.parentNode; }).each(function (d, i) {
	    if (i == 0) {
	      d3.select(this).selectAll(".cc_k_c_oc").attr("opacity", 0)
	      d3.select(this).selectAll(".cc_k_c_hl").attr("opacity", 0)
	    }
	  })
	})
}

function importBuiltInEAs () {
	importBuiltInEA(
		"sample_using_sma",
		"A test EA based on sma(v1.04)",
		[{ // parameters
			name: "period",
			value: 20,
			required: true,
			type: PARAMETER_TYPE.INTEGER,
			range: [1, 100]
		}],
		function (context) { // Init()
			var account = getAccount(context, 0)
			var brokerName = getBrokerNameOfAccount(account)
			var accountId = getAccountIdOfAccount(account)
			var symbolName = "EUR/USD"

			getQuotes (context, brokerName, accountId, symbolName)
			context.chartHandle = getChartHandle(context, brokerName, accountId, symbolName, TIME_FRAME.M1)
			var period = getEAParameter(context, "period")
			context.indiHandle = getIndicatorHandle(context, brokerName, accountId, symbolName, TIME_FRAME.M1, "sma", [{
				name: "period",
				value: period
			}])
		},
		function (context) { // Deinit()
		},
		function (context) { // OnTick()
			var arrTime = getData(context, context.chartHandle, DATA_NAME.TIME)
			if (typeof context.currTime == "undefined") {
				context.currTime = arrTime[arrTime.length - 1]
			} else if (context.currTime != arrTime[arrTime.length - 1]) {
				context.currTime = arrTime[arrTime.length - 1]
			} else {
				return
			}

			var account = getAccount(context, 0)
			var brokerName = getBrokerNameOfAccount(account)
			var accountId = getAccountIdOfAccount(account)
			var symbolName = "EUR/USD"

			var arrClose = getData(context, context.chartHandle, DATA_NAME.CLOSE)
			var arrSma = getData(context, context.indiHandle, "sma")

			var ask = null
			var bid = null
			try {
				ask = getAsk(context, brokerName, accountId, symbolName)
				bid = getBid(context, brokerName, accountId, symbolName)
			} catch (e) {
				// This try-catch is used to bypass the "error throw" when you start the EA too early to call getAsk or getBid(at that time, bid or ask may be not ready yet.)
				printErrorMessage(e.message)
				return
			}

			var limitPrice = 0.0003
			var stopPrice = 0.0003
			var volume = 0.01

			if (arrClose[arrClose.length - 3] < arrSma[arrSma.length - 3] && arrClose[arrClose.length - 2] > arrSma[arrSma.length - 2]) {
				sendOrder(brokerName, accountId, symbolName, ORDER_TYPE.OP_BUYLIMIT, ask-limitPrice, 0, volume, ask+limitPrice, bid-3*stopPrice, "", 0, 0)
			} else if (arrClose[arrClose.length - 3] > arrSma[arrSma.length - 3] && arrClose[arrClose.length - 2] < arrSma[arrSma.length - 2]) {
				sendOrder(brokerName, accountId, symbolName, ORDER_TYPE.OP_SELLLIMIT, bid+limitPrice, 0, volume, bid-limitPrice, ask+3*stopPrice, "", 0, 0)
			}
		}
	)

	importBuiltInEA(
		"sample_using_rsi",
		"A test EA based on rsi(v1.01)",
		[{ // parameters
			name: "period",
			value: 20,
			required: true,
			type: PARAMETER_TYPE.INTEGER,
			range: [1, 100]
		}],
		function (context) { // Init()
			var account = getAccount(context, 0)
			var brokerName = getBrokerNameOfAccount(account)
			var accountId = getAccountIdOfAccount(account)
			var symbolName = "EUR/USD"

			getQuotes (context, brokerName, accountId, symbolName)
			context.chartHandle = getChartHandle(context, brokerName, accountId, symbolName, TIME_FRAME.M1)
			var period = getEAParameter(context, "period")
			context.indiHandle = getIndicatorHandle(context, brokerName, accountId, symbolName, TIME_FRAME.M1, "rsi", [{
				name: "period",
				value: period
			}])
		},
		function (context) { // Deinit()
		},
		function (context) { // OnTick()
			var arrTime = getData(context, context.chartHandle, DATA_NAME.TIME)
			if (typeof context.currTime == "undefined") {
				context.currTime = arrTime[arrTime.length - 1]
			} else if (context.currTime != arrTime[arrTime.length - 1]) {
				context.currTime = arrTime[arrTime.length - 1]
			} else {
				return
			}

			var account = getAccount(context, 0)
			var brokerName = getBrokerNameOfAccount(account)
			var accountId = getAccountIdOfAccount(account)
			var symbolName = "EUR/USD"

			var arrRsi = getData(context, context.indiHandle, "rsi")

			var ask = null
			var bid = null
			try {
				ask = getAsk(context, brokerName, accountId, symbolName)
				bid = getBid(context, brokerName, accountId, symbolName)
			} catch (e) {
				// This try-catch is used to bypass the "error throw" when you start the EA too early to call getAsk or getBid(at that time, bid or ask may be not ready yet.)
				printErrorMessage(e.message)
				return
			}

			var limitPrice = 0.0003
			var stopPrice = 0.0003
			var volume = 0.01

			if (30 < arrRsi[arrRsi.length - 3] && 30 > arrRsi[arrRsi.length - 2]) {
				sendOrder(brokerName, accountId, symbolName, ORDER_TYPE.OP_BUYLIMIT, ask-limitPrice, 0, volume, ask+limitPrice, bid-3*stopPrice, "", 0, 0)
			} else if (70 > arrRsi[arrRsi.length - 3] && 70 < arrRsi[arrRsi.length - 2]) {
				sendOrder(brokerName, accountId, symbolName, ORDER_TYPE.OP_SELLLIMIT, bid+limitPrice, 0, volume, bid-limitPrice, ask+3*stopPrice, "", 0, 0)
			}
		}
	)
}

function Perceptron (input, hidden, output) {
	// create the layers
	var inputLayer = new synaptic.Layer(input)
	var hiddenLayer = new synaptic.Layer(hidden)
	var outputLayer = new synaptic.Layer(output)

	// connect the layers
	inputLayer.project(hiddenLayer)
	hiddenLayer.project(outputLayer)

	// set the layers
	this.set({
		input: inputLayer,
		hidden: [hiddenLayer],
		output: outputLayer
	})
}

function initDefaultIndicators () {
	// setDefaultIndicator("fintechee_crypto_loader", false)
}
