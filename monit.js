/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   monit.js                                           :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2021/11/11 19:23:05 by fbes          #+#    #+#                 */
/*   Updated: 2021/11/11 22:26:06 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

function reducer(prevVal, curVal) {
	return (prevVal + curVal);
}

var monit = {
	requirements: {
		almost: 1080,
		min: 1440,
		achievement1: 3000,
		achievement2: 4800
	},
	bhContainer: null,
	logTimes: [],
	logTimesTotal: 0,

	retrySoon: function() {
		setTimeout(function() {
			monit.getProgress();
		}, 100);
		return (false);
	},

	getCoalitionColor: function() {
		return (document.getElementsByClassName("coalition-span")[0].style.color);
	},

	parseLogTime: function(logTimeText) {
		var logTimeSplit = logTimeText.split("h");
		var logTime = 0;

		if (logTimeSplit.length != 2)
			return (0);
		logTime += parseInt(logTimeSplit[0]) * 60;
		logTime += parseInt(logTimeSplit[1]);
		return (logTime);
	},

	logTimeToString: function(logTime) {
		return (Math.floor(logTime / 60) + "h" + (logTime % 60).toLocaleString(undefined, {minimumIntegerDigits: 2}));
	},

	getLogTimes: function() {
		this.logTimes = [];
		var dayOfWeek = new Date().getDay() - 1;
		if (dayOfWeek < 0) {
			dayOfWeek = 7;
		}
		var ltSvg = document.getElementById("user-locations");
		if (!ltSvg) {
			return (monit.retrySoon());
		}
		var ltDays = ltSvg.getElementsByTagName("g");
		var ltDay = null;

		for (var i = 0; i <= dayOfWeek; i++) {
			ltDay = ltDays[ltDays.length - i - 1];
			if (!ltDay) {
				return (monit.retrySoon());
			}
			this.logTimes.push(this.parseLogTime(ltDay.getAttribute("data-original-title")));
		}
		this.logTimesTotal = this.logTimes.reduce(reducer);
		console.log("Logtimes", this.logTimes);
		console.log("Total minutes", this.logTimesTotal);
		return (true);
	},

	getProgress: function() {
		if (window.location.pathname.indexOf("/users/") == 0) {
			var iconLocation = document.getElementsByClassName("icon-location");
			if (iconLocation.length == 0) {
				return;
			}
			if (document.getElementsByClassName("icon-location")[0].nextSibling.nextSibling.textContent != "Amsterdam") {
				return;
			}
		}
		this.bhContainer = document.getElementById("goals_container");
		if (!this.bhContainer) {
			return;
		}
		for (var i = 0; i < this.bhContainer.children.length; i++) {
			this.bhContainer.children[i].style.display = "none";
		}
		if (this.getLogTimes()) {
			this.writeProgress();
			// force show black hole container
			this.bhContainer.className = this.bhContainer.className.replace("hidden", "");
		}
	},

	addTooltip: function() {
		// add bootstrap tooltip to holder
		var actualCode = '$("#lt-holder").tooltip();';
		var script = document.createElement('script');
		script.appendChild(document.createTextNode(actualCode));
		(document.head || document.documentElement).appendChild(script);
		script.parentNode.removeChild(script);
	},

	writeProgress: function() {
		var progressNode = document.createElement("div");
		progressNode.setAttribute("id", "monit-progress");

		var progressTitle = document.createElement("div");
		progressTitle.setAttribute("class", "mb-1");
		progressTitle.innerHTML = '<span class="coalition-span" style="color: '+this.getCoalitionColor()+';">Monitoring System progress</span>';
		progressNode.appendChild(progressTitle);

		var progressText = document.createElement("div");
		progressText.setAttribute("id", "monit-progress-text");

		var emoteHolder = document.createElement("div");
		emoteHolder.setAttribute("id", "lt-holder");
		emoteHolder.setAttribute("class", "emote-lt");
		emoteHolder.setAttribute("data-toggle", "tooltip");
		emoteHolder.setAttribute("data-original-title", "Logtime this week: " + this.logTimeToString(this.logTimesTotal));
		emoteHolder.setAttribute("title", "");

		var smiley = document.createElement("span");
		smiley.setAttribute("id", "lt-emote");
		var progressPerc = document.createElement("span");
		progressPerc.innerHTML = Math.floor(this.logTimesTotal / 1440 * 100) + "% complete";
		if (this.logTimesTotal < this.requirements.almost) {
			smiley.setAttribute("class", "icon-smiley-sad-1");
			smiley.setAttribute("style", "color: rgb(238, 97, 115);");
			progressPerc.setAttribute("style", "color: rgb(238, 97, 115);");
		}
		else if (this.logTimesTotal < this.requirements.min) {
			smiley.setAttribute("class", "icon-smiley-relax");
			smiley.setAttribute("style", "color: rgb(223, 149, 57);");
			progressPerc.setAttribute("style", "color: rgb(223, 149, 57);");
		}
		else if (this.logTimesTotal < this.requirements.achievement1) {
			smiley.setAttribute("class", "icon-smiley-happy-5");
			smiley.setAttribute("style", "color: rgb(83, 210, 122);");
			progressPerc.setAttribute("style", "color: rgb(83, 210, 122);");
		}
		else if (this.logTimesTotal < this.requirements.achievement2) {
			smiley.setAttribute("class", "icon-smiley-happy-1");
			smiley.setAttribute("style", "color: rgb(83, 210, 122);");
			progressPerc.setAttribute("style", "color: rgb(83, 210, 122);");
		}
		else {
			smiley.setAttribute("class", "icon-smiley-surprise");
			smiley.setAttribute("style", "color: rgb(83, 210, 122);");
			progressPerc.setAttribute("style", "color: rgb(83, 210, 122);");
		}
		emoteHolder.appendChild(smiley);
		emoteHolder.appendChild(progressPerc);

		progressText.appendChild(emoteHolder);

		progressNode.appendChild(progressText);

		this.bhContainer.appendChild(progressNode);
		this.addTooltip();
	}
};

monit.getProgress();
