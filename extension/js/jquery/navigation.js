RPlus.navigation = RPlus.navigation || (function () {
	let thousand = 1000;
	let million = 1000000;
	let billion = 1000000000;
	let trillion = 1000000000000;
	let suffixes = {};

	suffixes[thousand] = "K";
	suffixes[million] = "M";
	suffixes[billion] = "B";
	suffixes[trillion] = "T";

	let getNavigationSettings = function (callBack) {
		storage.get("navigation", function (navigationSettings) {
			if (navigationSettings && typeof (navigationSettings) === "object") {
				callBack(navigationSettings);
			} else {
				callBack({});
			}
		});
	};

	let getDivider = function(number) {
		if (number >= trillion) {
			return trillion;
		} else if (number >= billion) {
			return billion;
		} else if (number >= million) {
			return million;
		}

		return thousand;
	};

	let getAbbreviationSuffix = function (number) {
		var divider = getDivider(number);
		if (number < divider) {
			return "";
		}

		var suffix = suffixes[divider];
		if (number % divider === 0) {
			return suffix;
		}

		return suffix + "+";
	};

	let abbreviateNumberAt = function (number, roundAt) {
		if (number < roundAt) {
			return global.addCommas(number);
		}

		var divideBy = getDivider(number);
		return global.addCommas(Math.floor(number / divideBy) + getAbbreviationSuffix(number));
	};

	let abbreviateNumber = function (number, callBack) {
		getNavigationSettings(function (navigationSettings) {
			var roundAt = Math.max(thousand, Number(navigationSettings.counterCommas) || thousand);
			callBack(abbreviateNumberAt(number, roundAt));
		});
	};

	let setRobux = function (robux) {
		if (isNaN(robux) || robux < 0) {
			robux = 0;
		}

		abbreviateNumber(robux, function(abbreviatedRobux) {
			$("#nav-robux-balance").attr({
				title: global.addCommas(robux),
				robux: robux
			}).text(abbreviateNumberAt(robux, billion) + " Robux");
			$("#nav-robux-amount").text(abbreviatedRobux);
		});
	};

	let getRobux = function() {
		var balanceTag = $("#nav-robux-balance");
		var robuxAttr = Number(balanceTag.attr("robux"));

		if (!isNaN(robuxAttr)) {
			return robuxAttr;
		}

		var robuxText = balanceTag.text().replace(/\D+/g, "");
		return Number(robuxText);
	};

	let isSideOpen = function() {
		return $("#navigation").is(":visible") && $("#navigation").width() > 0;
	};

	let setSideNavigationOpen = function(open) {
		if (isSideOpen() !== open) {
			$(".rbx-nav-collapse")[0].click();
		}
	};

	let getButtonTextAndLink = function(buttonIndex) {
		var button = $("ul.nav.rbx-navbar").first().find(">li>a")[buttonIndex];
		if (button) {
			return {
				text: $(button).text(),
				href: $(button).attr("href")
			};
		}
	};

	let setButtonTextAndLink = function(buttonIndex, text, link) {
		var buttonTextAndLink = getButtonTextAndLink(buttonIndex);
		if (!buttonTextAndLink || (buttonTextAndLink.text === text && buttonTextAndLink.href === link)) {
			return;
		}

		$("ul.nav.rbx-navbar").each(function () {
			var li = $(this).find(">li>a");
			var button = li[buttonIndex];
			if (button) {
				$(button).text(text).attr("href", link);
			}
		});
	};

	return {
		getRobux: getRobux,
		setRobux: setRobux,
		isSideOpen: isSideOpen,
		setSideNavigationOpen: setSideNavigationOpen,
		setButtonTextAndLink: setButtonTextAndLink,
		getButtonTextAndLink: getButtonTextAndLink,
		getNavigationSettings: getNavigationSettings
	};
})();