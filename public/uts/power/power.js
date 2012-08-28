/**
 * Power Systems Lab interface.
 */

function PowerLab(id)
{
	this.$canvas = $("#" + id);
	this.$spinner = $("#backing-working");
	
	this.mode = undefined;	
	this.widgets = [];
	
	this.data = {};
	this.working = undefined;
}

PowerLab.prototype.init = function() {
	/* We won't display anything until we know what mode is running. */
	var m = new ModeLoading(this);
	m.init();
	
	this.widgets.push(m);
	
	/* Start data retrieval. */
	this.requestData();
};

PowerLab.prototype.setMode = function(mode) {
	var o;
	
	/* Clear up previous mode. */
	this.$canvas.removeClass("lab0 lab1 lab2");
	while (o = this.widgets.pop()) o.destroy();
	
	/* Setup the elements in the new mode. */
	switch (this.mode = parseInt(mode))
	{
	case 0: // Lab selection
		this.setTitle("Power System Lab");
		this.widgets.push(new SwitchMode(this));
		break;
	
	case 1: // Lab 1 mode
		this.setTitle("Isolated Single Generator Operation");
		this.widgets.push(new BackButton(this));
		
		/* --- Controls --------------------------------------------------------------------------------------- */
		this.widgets.push(new Button(this, "g-button",      "G",      "circ-button"));
		this.widgets.push(new Button(this, "cb1-button",    "CB1"));
		this.widgets.push(new Button(this, "gcb-button",    "GCB"));
		this.widgets.push(new Button(this, "load-r-button", "R Load", "load-button"));
		this.widgets.push(new Button(this, "load-l-button", "L Load", "load-button"));
		this.widgets.push(new Button(this, "load-c-button", "C Load", "load-button"));
		this.widgets.push(new ExclusiveButton(this, "trans-model", {
			1: "Trans. Model 1",
			2: "Trans. Model 2"
		}));
		
		/* --- Meters ---------------------------------------------------------------------------------------- */
		this.widgets.push(new LCDWidget(this, "active-power",     "Active Power",   "W",   2, "teal-color"));
		this.widgets.push(new LCDWidget(this, "apparent-power",   "Apparent Power", "VA",  2, "green-color"));
		this.widgets.push(new LCDWidget(this, "ln-voltage",       "L - N Voltage",  "V",   1, "teal-color"));
		this.widgets.push(new LCDWidget(this, "set-voltage",      "Set Voltage",    "V",   1, "yellow-color"));
		this.widgets.push(new LCDWidget(this, "reactive-power",   "Reactive Power", "Var", 1, "red-color"));
		this.widgets.push(new LCDWidget(this, "active-factor",    "Active Factor",  "%",   2, "yellow-color"));
		this.widgets.push(new LCDWidget(this, "line-frequency",   "Line Frequency", "Hz",  1, "red-color"));
		this.widgets.push(new LCDWidget(this, "set-frequency",    "Set Frequency",  "Hz",  2, "teal-color"));
		this.widgets.push(new LCDWidget(this, "line-current",     "Line Current",   "A",   3, "yellow-color"));
		this.widgets.push(new LCDWidget(this, "active-power-2",   "Active Power",   "W",   2, "teal-color"));
		this.widgets.push(new LCDWidget(this, "apparent-power-2", "Apparent Power", "VA",  2, "green-color"));
		this.widgets.push(new LCDWidget(this, "ln-voltage-2",     "L - N Voltage",  "V",   0, "teal-color"));
		this.widgets.push(new LCDWidget(this, "reactive-power-2", "Reactive Power", "Var", 2, "red-color"));
		this.widgets.push(new LCDWidget(this, "active-factor-2",  "Active Factor",  "%",   3, "yellow-color"));
		this.widgets.push(new LCDWidget(this, "line-current-2",   "Line Current",   "A",   3, "red-color"));
		
		/* --- Miscellaneous things on the page. */
		this.widgets.push(new Graphics(this));
		break;
		
	case 2:
		this.setTitle("Generator / Mains Parallel Operation");
		this.widgets.push(new BackButton(this));
		break;
		
	default:
		throw "Unknown power lab mode " + mode;
		break;
	}
	
	/* Tell each widget to render. */
	this.$canvas.addClass("lab" + this.mode);
	for (o in this.widgets) this.widgets[o].init();
	
	this.setWorking(false);
};

PowerLab.prototype.post = function(action, data, callback) {
	$.post(
			"/primitive/json/pc/PowerController/pa/" + action,
			data,
			function() { if (callback) callback(data); }
	);
};

PowerLab.prototype.setWorking = function(working) {
	/* No need to set the same state we are already in. */
	if (this.working == working) return;
	
	var i = 0;
	
	if (this.working = working)
	{
		this.$spinner.show();
	}
	else
	{
		this.$spinner.hide();
	}
	
	for (i in this.widgets) this.widgets[i].enable(!working);
};

PowerLab.prototype.requestData = function() {
	var thiz = this;
	$.ajax({
		url: "/primitive/json/pc/PowerController/pa/data",
		cache: false,
		success: function(packet) {
			if (typeof packet!= "object") 
			{
				/* User is probably logged out. */
				window.location.reload();
				return;
			}
			
			var data = {}, i = 0;
			
			/* Key the variables into a hash table. */
			for (i in packet) data[packet[i].name] = packet[i].value;
			
			/* If the mode is not the displayed mode, switch it. */
			if (data['mode'] != thiz.mode) thiz.setMode(data['mode']);

			/* Provide data to each of the versions. */
			this.data = data;
			for (i in thiz.widgets) thiz.widgets[i].update(data);
			
			setTimeout(function() { thiz.requestData(); }, 1000);
		},
		error: function() {
			setTimeout(function() { thiz.requestData(); }, 5000);
		}
	});
};

PowerLab.prototype.isWorking = function() {
	return this.working;
};

PowerLab.prototype.setTitle = function(title) {
	this.$canvas.find("backing-title").empty().append(title);
};

/** --------------------------------------------------------------------------- 
 *  -- Base widget                                                           -- 
 *  --------------------------------------------------------------------------- */
function Widget(control) 
{
	this.id = null;
	this.title = null;
	this.$w = null;

	this.control = control;
}

/**
 * Adds the widget to the page.
 */
Widget.prototype.init = function() {
	throw "Widget init not defined.";
};

/**
 * Receives data from the server. 
 *
 * @param data data object
 */
Widget.prototype.update = function(data) { };

/**
 * Enables / Disables the widget.
 * 
 * @param enable whether the widget should be enabled or disabled
 */
Widget.prototype.enable = function(enable) { };

/**
 * Removes the widget from the page.
 */
Widget.prototype.destroy = function() {
	if (this.$w) this.$w.remove();
};

Widget.prototype.addMessage = function(message, type, left, top, pos) {
	var $box, i, aniIn, bs = 1, up = true, html = 
		"<div class='message-box message-box-" + type + " message-box-in1' style='left:" + left + "px; top:" + top + "px'>" +
			"<div class='message-box-text'>" + message + "</div>" +
			"<div class='message-box-arrow message-box-arrow-" + pos + "'>";
	
	for (i = 0; i < 8; i++)
	{
		html += "<div class='message-box-arrow-line message-box-arrow-line" + i + "'></div>";
	}
	
	html += "</div>" +
		"</div>";
	
	$box = this.$w.after(html).next();
		
	/* Throb box shadow around message box. */
	aniIn = setInterval(function() {
		if (bs == 0 || bs == 12) up = !up;
		$box.css("box-shadow", "0 0 " + (up ? bs++ : bs--) + "px #EEEEEE");
	}, 120);
	
	/* Remove box on click. */
	$box.click(function() {
		clearInterval(aniIn);
		$box.remove();
	});
};

/** ---------------------------------------------------------------------------
 *  -- Widget for loading between modes.                                     --
 *  --------------------------------------------------------------------------- */
function ModeLoading(control) 
{
	Widget.call(this, control);
}

ModeLoading.prototype = new Widget;

ModeLoading.prototype.init = function() {
	this.control.$canvas.append("<div id='mode-loading'.>Please wait...</div>");
	this.$w = $("#mode-loading");
};

/** ---------------------------------------------------------------------------
 *  -- Widget for switching modes                                            --
 *  --------------------------------------------------------------------------- */
function SwitchMode(control) 
{
	Widget.call(this, control);
}

SwitchMode.prototype = new Widget;

SwitchMode.prototype.init = function() {
	this.control.$canvas.append(
		"<ul id='lab-selection'>" +
			"<li id='lab-select-1' class='button green-color'>Lab 1: Isolated Single Generator Operation</li>" +
			"<li id='lab-select-2' class='button green-color'>Lab 2: Generator / Mains Parallel Operation</li>" +
		"</ul>"
	);
	
	this.$w = $("#lab-selection");
	
	var thiz = this;
	this.$w.children("li").click(function() { thiz.clicked(this); });
};

SwitchMode.prototype.clicked = function(n) {
	/* Stop duplicate button clicks when an operation is running. */
	if (this.control.isWorking()) return;
	this.control.setWorking(true);
	
	/* Give the appearance of not being able to be clicked. */
	$(n).toggleClass("green-color red-color");
	
	this.control.post("setMode", { 
		'new-mode': $(n).attr('id') == 'lab-select-1' ? 1 : 2
	});
};

SwitchMode.prototype.enable = function(enable) {
	if (enable)
	{
		this.$w.children("li").removeClass("button-disabled");
	}
	else
	{
		this.$w.children("li").addClass("button-disabled");
	}
	
};

/** ---------------------------------------------------------------------------
 *  -- LCD Widget                                                            --
 *  --------------------------------------------------------------------------- */
function LCDWidget(control, id, title, units, scale, cclass) 
{
	Widget.call(this, control);
	
	this.id = id;
	this.title = title;
	this.units = units;
	this.scale = scale;
	this.cclass = cclass;
	
	this.value = undefined;
	this.digits = [ undefined, undefined, undefined, undefined ];
}

LCDWidget.prototype = new Widget;

LCDWidget.prototype.init = function() {
	this.control.$canvas.append(
		"<div id='" + this.id + "' class='lcd-box'>" +
			"<div class='lcd-title " + this.cclass + "'>" + this.title + "</div>" +
			"<div class='lcd-value'>" +
				"<div class='ssd-digit ssd-digit-5'>" +
					"<div class='ssd-seg ssd-horz-seg ssd-seg-1'></div>" +
					"<div class='ssd-seg ssd-vert-seg ssd-seg-2'></div>" +
					"<div class='ssd-seg ssd-vert-seg ssd-seg-3'></div>" +
					"<div class='ssd-seg ssd-horz-seg ssd-seg-4'></div>" +
					"<div class='ssd-seg ssd-vert-seg ssd-seg-5'></div>" +
					"<div class='ssd-seg ssd-vert-seg ssd-seg-6'></div>" +
					"<div class='ssd-seg ssd-horz-seg ssd-seg-7'></div>" +
				"</div>" +
				(this.scale == 4 ? "<div class='ssd-dot'></div>" : '') + 
				"<div class='ssd-digit ssd-digit-4'>" +
					"<div class='ssd-seg ssd-horz-seg ssd-seg-1'></div>" +
					"<div class='ssd-seg ssd-vert-seg ssd-seg-2'></div>" +
					"<div class='ssd-seg ssd-vert-seg ssd-seg-3'></div>" +
					"<div class='ssd-seg ssd-horz-seg ssd-seg-4'></div>" +
					"<div class='ssd-seg ssd-vert-seg ssd-seg-5'></div>" +
					"<div class='ssd-seg ssd-vert-seg ssd-seg-6'></div>" +
					"<div class='ssd-seg ssd-horz-seg ssd-seg-7'></div>" +
				"</div>" +
				(this.scale == 3 ? "<div class='ssd-dot'></div>" : '') +
				"<div class='ssd-digit ssd-digit-3'>" +
					"<div class='ssd-seg ssd-horz-seg ssd-seg-1'></div>" +
					"<div class='ssd-seg ssd-vert-seg ssd-seg-2'></div>" +
					"<div class='ssd-seg ssd-vert-seg ssd-seg-3'></div>" +
					"<div class='ssd-seg ssd-horz-seg ssd-seg-4'></div>" +
					"<div class='ssd-seg ssd-vert-seg ssd-seg-5'></div>" +
					"<div class='ssd-seg ssd-vert-seg ssd-seg-6'></div>" +
					"<div class='ssd-seg ssd-horz-seg ssd-seg-7'></div>" +
				"</div>" +
				(this.scale == 2 ? "<div class='ssd-dot'></div>" : '') +
				"<div class='ssd-digit ssd-digit-2'>" +
					"<div class='ssd-seg ssd-horz-seg ssd-seg-1'></div>" +
					"<div class='ssd-seg ssd-vert-seg ssd-seg-2'></div>" +
					"<div class='ssd-seg ssd-vert-seg ssd-seg-3'></div>" +
					"<div class='ssd-seg ssd-horz-seg ssd-seg-4'></div>" +
					"<div class='ssd-seg ssd-vert-seg ssd-seg-5'></div>" +
					"<div class='ssd-seg ssd-vert-seg ssd-seg-6'></div>" +
					"<div class='ssd-seg ssd-horz-seg ssd-seg-7'></div>" +
				"</div>" +
				(this.scale == 1 ? "<div class='ssd-dot'></div>" : '') +
				"<div class='ssd-digit ssd-digit-1'>" +
					"<div class='ssd-seg ssd-horz-seg ssd-seg-1'></div>" +
					"<div class='ssd-seg ssd-vert-seg ssd-seg-2'></div>" +
					"<div class='ssd-seg ssd-vert-seg ssd-seg-3'></div>" +
					"<div class='ssd-seg ssd-horz-seg ssd-seg-4'></div>" +
					"<div class='ssd-seg ssd-vert-seg ssd-seg-5'></div>" +
					"<div class='ssd-seg ssd-vert-seg ssd-seg-6'></div>" +
					"<div class='ssd-seg ssd-horz-seg ssd-seg-7'></div>" +
				"</div>" +
				(this.scale == 0 ? "<div class='ssd-dot'></div>" : '') +
			"</div>" +
			"<div class='lcd-unit'>" + this.units + "</div>" +
		"</div>"
	);

	this.$w = $("#" + this.id);
	this.setValue(0);
};

LCDWidget.prototype.update = function(data) {
	if (data[this.id] != undefined)
	{
		this.setValue(parseFloat(data[this.id]));
	}
};

LCDWidget.prototype.setValue = function(num) {
	/* We don't need to change the value to an identical value. */
	if (num == this.value) return;
	this.value = num;
	
	var i, clearDigit = 6, isNegative = false;
	num = Math.floor(num * Math.pow(10, this.scale));
	
	/* Handle negative values. */
	if (num < 0)
	{
		isNegative = true;
		num = Math.abs(num);
	}
	
	for (i = 1; i <= 5; i++)
	{
		if (i - 1 > this.scale && num == 0)
		{
			/* Clear the SSD. */
			this.setDigit(i, 10);
			
			/* We want to store the first clear digit in case we have to add
			 * a negative value symbol. */
			if (i < clearDigit) clearDigit = i;
		}
		else
		{
			this.setDigit(i, num > 0 ? num % 10 : 0);
		}
		
		num = Math.floor(num / 10);
	}
	
	if (isNegative)
	{
		if (clearDigit < 6)
		{
			/* Negative symbol fits. */
			this.setDigit(clearDigit, -1);
		}
		else if (this.scale > 0)
		{
			/* The negative symbol does not fit, so we will reduce the 
			 * scale to make the number fit. */
			this.$w.find(".ssd-dot").remove();
			this.$w.find(".ssd-digit-" + this.scale).after("<div class='ssd-dot'></div>");
			this.scale--;
			
			num = this.value;
			this.value = 0;			
			this.setValue(num);
		}
		else
		{
			/* Unable to fit negative symbol, error out. */
			throw "Unable to add negative symbol of value of " + this.title + ", value: " + this.value + 
					", scale: " + this.scale;
		}
	}
};

LCDWidget.prototype.setDigit = function(digit, val) {
	if (this.digits[digit] == val) return;
		
	this.digits[digit] = val;
	var mask, i = 0, $n;
	
	switch (val)
	{
	case -1:
		mask = [false, false, false, false, false, false, true];
		break;
	case 0:
		mask = [true,  true,  true,  true,  true,  true,  false];
		break;
	case 1:
		mask = [false, true,  true,  false, false, false, false];
		break;
	case 2:
		mask = [true,  true,  false, true,  true,  false, true];
		break;
	case 3:
		mask = [true,  true,  true,  true,  false, false, true];
		break;
	case 4:
		mask = [false, true,  true,  false, false, true,  true];
		break;
	case 5:
		mask = [true,  false, true,  true,  false, true,  true];
		break;
	case 6:
		mask = [true, false, true,  true,  true,  true,  true];
		break;
	case 7: 
		mask = [true,  true,  true,  false, false, false, false];
		break;
	case 8:
		mask = [true,  true,  true,  true,  true,  true,  true];
		break;
	case 9:
		mask = [true,  true,  true,  false, false, true,  true];
		break;
	case 10:
		mask = [false, false, false, false, false, false, false];
		break;
	default:
		throw "Invalid SSD digit " + val;
	}
	
	for (i = 0; i < 7; i++)
	{
		$n = this.$w.find('.ssd-digit-' + digit + " .ssd-seg-" + (i + 1));
		if (mask[i])
		{
			if (!$n.hasClass("ssd-seg-on")) $n.addClass("ssd-seg-on");
		}
		else
		{
			$n.removeClass("ssd-seg-on");
		}
	}
};

/** ---------------------------------------------------------------------------
 *  -- Button Widget                                                         --
 *  --------------------------------------------------------------------------- */
function Button(control, id, text, cclass) 
{
	Widget.call(this, control);
	
	this.id = id;
	this.text = text;
	this.isOn = undefined;
	this.isActive = false;
	this.cclass = cclass ? cclass : '';
}

Button.prototype = new Widget;

Button.prototype.init = function() {
	this.control.$canvas.append(
		"<div id='" + this.id + "' class='button button-unknown-state " + this.cclass + "'>" +
			this.text + " &nbsp;&nbsp;&nbsp;" +
		"</div>" 
	);
	
	var thiz = this;
	this.$w = $("#" + this.id)
				.click(function() { thiz.clicked(); });
	
	this.setOn(false);
};

Button.prototype.clicked = function() {
	// TODO
	alert(this.id + " clicked");
};

Button.prototype.setValue = function(val) {
	// TODO
};

Button.prototype.setOn = function(on) {
	if (this.isOn === on) return;
	
	if (this.isOn = on)
	{
		this.$w.removeClass("button-unknown-state button-off-state").addClass("button-on-state");
		this.$w.empty().append(this.text + " On&nbsp;");
	}
	else 
	{
		this.$w.removeClass("button-unknown-state button-on-state").addClass("button-off-state");
		this.$w.empty().append(this.text + " Off");
	}
};

Button.prototype.enable = function(enabled) {
	if (enabled)
	{
		this.$w.removeClass("button-disabled");
	}
	else
	{
		this.$w.addClass("button-disabled");
	}
};

/** ---------------------------------------------------------------------------
 *  -- Exclusive Button Widget                                               --
 *  --------------------------------------------------------------------------- */
function ExclusiveButton(control, id, buttons)
{
	Widget.call(this, control);
	
	this.id = id;
	this.buttons = buttons;
	
	this.currentVal = undefined;
}

ExclusiveButton.prototype = new Widget;

ExclusiveButton.prototype.init = function() {
	var i = 0, thiz = this, html = 
		"<div id='" + this.id + "' class='exclusive-button'>";
	
	for (i in this.buttons) 
	{
		html += 
			"<div id='" + this.id + "-button-" + i + "' class='button button-unknown-state'>" +
				this.buttons[i] + " &nbsp;&nbsp;&nbsp;" +
			"</div>";
	}
	
	html += "</div>";
	
	this.control.$canvas.append(html);
	this.$w = $("#" + this.id);
	
	this.$w.children(".button").click(function() { thiz.clicked($(this).attr("id")); });
	
	this.setOn(0);
};

ExclusiveButton.prototype.clicked = function(id) {
	// TODO
	alert(id + " clicked");
};

ExclusiveButton.prototype.setOn = function(val) {
	if (this.currentVal === val) return;
	
	this.currentVal = val;
	var $ch = this.$w.children(".button").removeClass("button-unknown-state button-on-state button-off-state"),
		$n = $("#" + this.id + "-button-" + val),
		t;

	
	if ($n.length != 0)
	{
		$ch = $n.sibling();
		
		t = $n.text();
		$n.addClass("button-on-state")
		  .text(t.substr(0, t.length - 3) + "On&nbsp;");
	}
	
	$ch.each(function() {
		t = $(this).text();
		$(this).addClass("button-off-state")
			   .text(t.substr(0, t.length - 3) + "Off");
	});
};

ExclusiveButton.prototype.enable = function (enable) {
	if (enable)
	{
		this.$w.children(".button").removeClass("button-disabled");
	}
	else
	{
		this.$w.children(".button").addClass("button-disabled");
	}
};

/** ---------------------------------------------------------------------------
 *  -- Back Button                                                           --
 *  --------------------------------------------------------------------------- */
function BackButton(control)
{
	Widget.call(this, control);
}

BackButton.prototype = new Widget;

BackButton.prototype.init = function() {
	this.control.$canvas.append(
			"<div id='back-button' class='button'>" +
				"<span class='ui-icon ui-icon ui-icon-arrowthick-1-w'></span>" +
				"Back" + 
			"</div>" 
	);
	
	this.$w = $("#back-button");
	
	var thiz = this;
	this.$w.click(function() { thiz.clicked(); });
};

BackButton.prototype.clicked = function() {
	if (this.control.isWorking()) return;
	
	/* Interlock validation. */
	if (true) //this.control.data['g-on'] == 'true')
	{
		this.addMessage("The generator must be turned off before changing labs.", 'info', 57, 92, 'left');
	}
	else
	{
		this.control.setWorking(true);
		this.control.post("setMode", { 'new-mode': 0 });
	}
};

BackButton.prototype.enable = function(enable) {
	if (enable)
	{
		this.$w.removeClass("button-disabled");
	}
	else
	{
		this.$w.addClass("button-disabled");
	}
};


/** ---------------------------------------------------------------------------
 * -- Graphics                                                               --
 * ---------------------------------------------------------------------------- */
function Graphics(control)
{
	Widget.call(this, control);
}

Graphics.prototype = new Widget;

Graphics.prototype.init = function()  {
	this.control.$canvas.append(
		"<div id='graphics-pm1' class='graphics label-box label-head'>Power Meter 1</div>" +
		"<div id='graphics-pm1-line-t' class='graphics h-line'></div>" +	
		"<div id='graphics-pm1-line-t-to-b' class='graphics v-line'></div>" +	
		"<div id='graphics-pm1-line-b' class='graphics h-line'></div>" +	
		"<div id='graphics-g-to-cb1' class='graphics h-line'></div>" +
		"<div id='graphics-g-to-pm1' class='graphics v-line'></div>" +
		
		"<div id='graphics-pm2' class='graphics label-box label-head'>Power Meter 2</div>" +
		"<div id='graphics-pm2-line' class='graphics h-line'></div>" +
		
		"<div id='graphics-cb1-to-transformer' class='graphics h-line'></div>" +
		"<div id='graphics-transformer' class='graphics-nobg'></div>" +
		"<div id='graphics-transformer-to-bus1' class='graphics h-line'></div>" +		
		
		"<div id='graphics-bus1-l' class='graphics v-line'></div>" +
		"<div id='graphics-bus1-r' class='graphics v-line'></div>" +
		"<div id='graphics-bus1' class='graphics label-box'>BUS 1</div>" +
		
		"<div id='graphics-bus1-to-trans1' class='graphics h-line'></div>" +
		"<div id='graphics-bus1-to-trans2' class='graphics h-line'></div>" +
		"<div id='graphics-trans1-to-bus2' class='graphics h-line'></div>" +
		"<div id='graphics-trans2-to-bus2' class='graphics h-line'></div>" +
		
		"<div id='graphics-bus2-l' class='graphics v-line'></div>" +
		"<div id='graphics-bus2-r' class='graphics v-line'></div>" +
		"<div id='graphics-bus2-to-gcb' class='graphics h-line'></div>" +
		"<div id='graphics-bus2' class='graphics label-box'>BUS 2</div>" +
		
		"<div id='graphics-gcb-to-load-bus' class='graphics h-line'></div>" +
		"<div id='graphics-load-l' class='graphics v-line'></div>" +
		"<div id='graphics-load-r' class='graphics v-line'></div>" +
		"<div id='graphics-load-bus-load1' class='graphics h-line'></div>" +
		"<div id='graphics-load-bus-load2' class='graphics h-line'></div>" +
		"<div id='graphics-load-bus-load3' class='graphics h-line'></div>" +
		
		"<div id='graphics-set-voltage-line' class='graphics h-line'></div>" + 
		"<div id='graphics-set-voltage-to-lcd' class='graphics v-line'></div>" +
		"<div id='graphics-set-freq-line' class='graphics h-line'></div>" + 
		"<div id='graphics-set-freq-to-lcd' class='graphics v-line'></div>" +
		
		"<div id='graphics-default-settings' class='graphics h-line'></div>" +
		"<div id='graphics-default-set-voltage' class='graphics v-line'></div>" +
		"<div id='graphics-default-set-voltage-arrow' class='graphics-nobg arrow-head'></div>" +
		"<div id='graphics-default-set-freq' class='graphics v-line'></div>" +
		"<div id='graphics-default-set-freq-arrow' class='graphics-nobg arrow-head'></div>" +
		"<div id='graphics-default-to-button' class='graphics v-line'></div>"
	);
};

Graphics.prototype.destroy = function() {
	this.control.$canvas.children(".graphics, .graphics-nobg").remove();
};