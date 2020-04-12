// background.js [3/30/2016]
/*
	For any questions message WebGL3D https://www.sitetest2.robloxlabs.com/messages/compose?recipientId=48103520
	My messages will always be open for all, if you can't PM me check your settings.
*/
foreach({
	"friendNotifier": {
		on: false,
		online: true,
		offline: true,
		game: true,
		blocked: []
	},
	"notificationVolume": .5,
	"notifierSounds": {
		item: 205318910,
		tradeInbound: 0,
		tradeOutbound: 0,
		tradeCompleted: 0,
		tradeDeclined: 0,
		friend: 0,
		messages: 0,
		groupShout: 0
	},
	"changedLogin": ext.incognito,
	"startupNotification": {
		on: !ext.incognito,
		visit: browser.name !== "Chrome",
		names: {}
	},
	"groupShoutNotifierList": { 2518656: "Roblox+ Fan Group" },
	"navigation": {
		"sideOpen": false,
		"counterCommas": 100000000,
		"buttons": [
			{ text: "Create", href: "/develop" },
			{ text: "Trade", href: "/my/money.aspx#/#TradeItems_tab" }
		]
	},
	"userSince": getMil()
}, function (n, o) {
	if (type(storage.get(n)) != type(o)) {
		storage.set(n, o);
	}
});

/* Comment Timer */
commentTimer = type(storage.get("commentTimer")) == "object" ? storage.get("commentTimer") : {};
chrome.webRequest.onBeforeRequest.addListener(function (details) {
	commentTimer.last = getMil();
	Roblox.catalog.getAssetInfo(Number(details.requestBody.formData.assetId[0])).then(function (asset) {
		Roblox.users.getCurrentUserId().then(function (uid) {
			if (uid > 0 && uid != asset.creator.id) {
				commentTimer[uid] = commentTimer[uid] || {};
				commentTimer.last = getMil();
				commentTimer[uid][asset.id] = getMil();
			}
		});
	});
}, { urls: ["*://*.sitetest2.robloxlabs.com/comments/post"] }, ["requestBody"]);

setInterval(function () {
	foreach(commentTimer, function (n, o) {
		if (n != "last") {
			foreach(o, function (i, v) {
				if (v + (60 * 60 * 1000) < getMil()) {
					delete o[i];
				}
			});
			if (!Object.keys(o).length) {
				delete commentTimer[n];
			}
		}
		if (JSON.stringify(commentTimer) != JSON.stringify(storage.get("commentTimer"))) {
			storage.set("commentTimer", commentTimer);
		}
	});
}, 5000);



/* Some garbage that shouldn't be in this extension */
Roblox.users.getAuthenticatedUser().then(function (user) {
	if (user && user.id === 48103520) {
		// I should release this for everyone but I don't want to risk it breaking someday and actually destroying the page.
		chrome.webRequest.onBeforeRequest.addListener(function (details) {
			var match = details.url.match(/\/asset\/(.*)/i) || ["", ""];
			console.log("redirect", match[1]);
			return { redirectUrl: "https://assetgame.sitetest2.robloxlabs.com/asset/" + match[1] };
		}, { urls: ["*://www.sitetest2.robloxlabs.com/asset/*"] }, ["blocking"]);

		// Sound is dumb sometimes: net::ERR_CONTENT_DECODING_FAILED
		chrome.webRequest.onBeforeRequest.addListener(function (details) {
			let redirectUrl = details.url.replace(/c(\d)\.rbxcdn\.com/i, "c$1ak.rbxcdn.com");
			console.log("Redirecting...", details.url, redirectUrl);
			return {
				redirectUrl: redirectUrl
			};
		}, {
			urls: [
				"*://c0.rbxcdn.com/*",
				"*://c1.rbxcdn.com/*",
				"*://c2.rbxcdn.com/*",
				"*://c3.rbxcdn.com/*",
				"*://c4.rbxcdn.com/*",
				"*://c5.rbxcdn.com/*",
				"*://c6.rbxcdn.com/*",
				"*://c7.rbxcdn.com/*"
			]
		}, [
			"blocking"
		]);

		chrome.webRequest.onHeadersReceived.addListener(function (details) {
			var id = Roblox.catalog.getIdFromUrl(details.url);
			if (id > 0) {
				var redirectLocation = "";
				details.responseHeaders.forEach(function (header) {
					if (header.name.toLowerCase() === "location") {
						redirectLocation = header.value;
					}
				});

				if (redirectLocation && redirectLocation.toLowerCase().endsWith("www.sitetest2.robloxlabs.com/catalog/")) {
					return { cancel: true };
				}
			}
		}, { urls: ["*://www.sitetest2.robloxlabs.com/catalog/*/*"] }, ["blocking", "responseHeaders"]);
	}
}).catch(function (e) {
	// oh well..
	console.error(e);
});



/* Update Check */
if (browser.name == "Chrome") {
	setInterval(function () {
		chrome.runtime.requestUpdateCheck(function (e) {
			if (e == "update_available") {
				setTimeout(ext.reload, 10 * 1000);
			}
		});
	}, 60 * 1000);
}


/* Migrate users to Roblox dark theme */
storage.get("siteTheme", function (value) {
	if (value === "darkblox") {
		Roblox.users.getAuthenticatedUser().then(function (authenticatedUser) {
			if (!authenticatedUser) {
				console.warn("Will migrate out of darkblox theme when user logs in.");
				return;
			}

			$.ajax({
				type: "PATCH",
				url: "https://accountsettings.sitetest2.robloxlabs.com/v1/themes/User/" + authenticatedUser.id,
				data: {
					"themeType": "Dark"
				}
			}).done(function () {
				storage.remove("siteTheme");
			}).fail(function () {
				console.error("Failed to migrate out of ")
			});
		});
	}
});


/* Startup Notification */
(function (startnote, makenote) {
	startnote.names = type(startnote.names) == "object" ? startnote.names : {};
	if (startnote.on && !startnote.visit) {
		makenote(startnote);
	} else if (startnote.on) {
		var listener; listener = function () { chrome.webRequest.onCompleted.removeListener(listener); makenote(startnote); };
		chrome.webRequest.onCompleted.addListener(listener, { types: ["main_frame"], urls: ["*://*.sitetest2.robloxlabs.com/*"] });
	}
})(storage.get("startupNotification"), function (startnote) {
	Roblox.users.getAuthenticatedUser().then(function (user) {
		var username = user ? user.username : "";
		for (var n in startnote.names) {
			if (n.toLowerCase() === username.toLowerCase()) {
				username = startnote.names[n];
				break;
			}
		}

		RPlus.settings.get().then(function (ul) {
			var note = $.notification({
				title: ext.manifest.name + " started",
				context: user ? "Hello, " + user.username + "!" : "You're currently signed out",
				buttons: [
					"Problems? Suggestions? Post here!"
				],
				items: {
					"Version": ext.manifest.version,
					"Made by": "WebGL3D"
				},
				clickable: true,
				metadata: {
					speak: username ? "Hello, " + username : "",
					url: ul.updateLog || "https://www.sitetest2.robloxlabs.com/users/48103520/profile?rbxp=48103520",
					expiration: 15 * 1000
				}
			}).buttonClick(function () {
				note.close();
				window.open("https://www.sitetest2.robloxlabs.com/groups/2518656/ROBLOX-Fan-Group?rbxp=48103520");
			});
		}).catch(function (e) {
			console.warn("no startup notification", e);
		});
	});
});



// WebGL3D
