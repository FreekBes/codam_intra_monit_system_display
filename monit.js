/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   monit.js                                           :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2021/11/11 19:23:05 by fbes          #+#    #+#                 */
/*   Updated: 2021/11/12 14:26:19 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

function reducer(prevVal, curVal) {
	return (prevVal + curVal);
}

var monit = {
	httpReq: null,
	requirements: {
		almost: 1080,
		min: 1440,
		achievement1: 3000,
		achievement2: 4800
	},
	bhContainer: null,
	logTimes: [],
	logTimesTotal: 0,

	getCoalitionColor: function() {
		return (document.getElementsByClassName("coalition-span")[0].style.color);
	},

	getWeekDates: function() {
		var thisWeek = [];
		var timestamp = new Date().getTime();
		var dayOfWeek = new Date().getDay() - 1;
		if (dayOfWeek < 0) {
			dayOfWeek = 7;
		}
		thisWeek.push((new Date().toISOString().split("T")[0]));
		for (var i = 1; i <= dayOfWeek; i++) {
			thisWeek.push(new Date(timestamp - 86400000 * i).toISOString().split("T")[0]);
		}
		return (thisWeek);
	},

	parseLogTime: function(logTimeText) {
		var logTime = 0;
		var logTimeSplit;

		if (logTimeText.indexOf("h") > -1) {
			logTimeSplit = logTimeText.split("h");
		}
		else {
			logTimeSplit = logTimeText.split(":");
		}
		if (logTimeSplit.length < 2) {
			return (0);
		}
		logTime += parseInt(logTimeSplit[0]) * 60;
		logTime += parseInt(logTimeSplit[1]);
		return (logTime);
	},

	logTimeToString: function(logTime) {
		return (Math.floor(logTime / 60) + "h" + (logTime % 60).toLocaleString(undefined, {minimumIntegerDigits: 2}));
	},

	getLogTimesFallback: function() {
		return (new Promise(function (resolve, reject) {
			monit.logTimes = [];
			var dayOfWeek = new Date().getDay() - 1;
			if (dayOfWeek < 0) {
				dayOfWeek = 7;
			}
			var ltSvg = document.getElementById("user-locations");
			if (!ltSvg) {
				reject("Element #user-locations not found");
			}
			var ltDays = ltSvg.getElementsByTagName("g");
			var ltDay = null;

			for (var i = 0; i <= dayOfWeek; i++) {
				ltDay = ltDays[ltDays.length - i - 1];
				if (!ltDay) {
					reject("Not enough days in logtimes overview SVG");
				}
				monit.logTimes.push(monit.parseLogTime(ltDay.getAttribute("data-original-title")));
			}
			monit.logTimesTotal = monit.logTimes.reduce(reducer);
			resolve();
		}));
	},

	getLogTimes: function(username) {
		return (new Promise(function(resolve, reject) {
			if (monit.httpReq != null) {
				monit.httpReq.abort();
			}
			monit.httpReq = new XMLHttpRequest();
			monit.httpReq.addEventListener("load", function() {
				try {
					var stats = JSON.parse(this.responseText);
					var weekDates = monit.getWeekDates();
					for (var i = 0; i < weekDates.length; i++) {
						if (weekDates[i] in stats) {
							monit.logTimes.push(monit.parseLogTime(stats[weekDates[i]]));
						}
					}
					monit.logTimesTotal = monit.logTimes.reduce(reducer);
					resolve();
				}
				catch (err) {
					reject(err);
				}
			});
			monit.httpReq.addEventListener("error", function(err) {
				reject(err);
			});
			monit.httpReq.open("GET", window.location.origin + "/users/" + username + "/locations_stats.json");
			monit.httpReq.send();
		}));
	},

	getProgress: function() {
		var username = "me";

		if (window.location.pathname.indexOf("/users/") == 0) {
			var iconLocation = document.getElementsByClassName("icon-location");
			if (iconLocation.length == 0) {
				return;
			}
			if (document.getElementsByClassName("icon-location")[0].nextSibling.nextSibling.textContent != "Amsterdam") {
				return;
			}
			if (iconLocation[0].nextSibling.nextSibling.textContent != "Amsterdam") {
				return;
			}
			username = document.querySelector("[data-login]").getAttribute("data-login");
		}
		this.bhContainer = document.getElementById("goals_container");
		if (!this.bhContainer) {
			return;
		}
		for (var i = 0; i < this.bhContainer.children.length; i++) {
			this.bhContainer.children[i].style.display = "none";
		}
		this.getLogTimes(username)
			.then(this.writeProgress)
			.catch(function(err) {
				console.error(err);
				console.warn("Could not retrieve logtimes from locations_stats.json URL. Using fallback...");
				setTimeout(function() {
					monit.getLogTimesFallback()
						.then(monit.writeProgress)
						.catch(function(err) {
							setTimeout(function() {
								monit.getLogTimesFallback().then(monit.writeProgress)
								.catch(function(err) {
									console.error("Could not get logtimes using fallback", err);
								});
							}, 500);
							console.warn("Could not get logtimes using fallback, retrying once in half a second");
							console.error(err);
						});
					}, 250);
			});
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
		console.log("Logtimes", monit.logTimes);
		console.log("Total minutes", monit.logTimesTotal);

		var progressNode = document.createElement("div");
		progressNode.setAttribute("id", "monit-progress");

		var progressTitle = document.createElement("div");
		progressTitle.setAttribute("class", "mb-1");
		progressTitle.innerHTML = '<span class="coalition-span" style="color: '+monit.getCoalitionColor()+';">Monitoring System progress</span>';
		progressNode.appendChild(progressTitle);

		var progressText = document.createElement("div");
		progressText.setAttribute("id", "monit-progress-text");

		var emoteHolder = document.createElement("div");
		emoteHolder.setAttribute("id", "lt-holder");
		emoteHolder.setAttribute("class", "emote-lt");
		emoteHolder.setAttribute("data-toggle", "tooltip");
		emoteHolder.setAttribute("data-original-title", "Logtime this week: " + monit.logTimeToString(monit.logTimesTotal));
		emoteHolder.setAttribute("title", "");

		var smiley = document.createElement("span");
		smiley.setAttribute("id", "lt-emote");
		var progressPerc = document.createElement("span");
		progressPerc.innerHTML = Math.floor(monit.logTimesTotal / 1440 * 100) + "% complete";
		if (monit.logTimesTotal < monit.requirements.almost) {
			smiley.setAttribute("class", "icon-smiley-sad-1");
			smiley.setAttribute("style", "color: rgb(238, 97, 115);");
			progressPerc.setAttribute("style", "color: rgb(238, 97, 115);");
		}
		else if (monit.logTimesTotal < monit.requirements.min) {
			smiley.setAttribute("class", "icon-smiley-relax");
			smiley.setAttribute("style", "color: rgb(223, 149, 57);");
			progressPerc.setAttribute("style", "color: rgb(223, 149, 57);");
		}
		else if (monit.logTimesTotal < monit.requirements.achievement1) {
			smiley.setAttribute("class", "icon-smiley-happy-5");
			smiley.setAttribute("style", "color: rgb(83, 210, 122);");
			progressPerc.setAttribute("style", "color: rgb(83, 210, 122);");
		}
		else if (monit.logTimesTotal < monit.requirements.achievement2) {
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

		monit.bhContainer.appendChild(progressNode);
		monit.bhContainer.className = monit.bhContainer.className.replace("hidden", "");
		monit.addTooltip();
	}
};

monit.getProgress();
