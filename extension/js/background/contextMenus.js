/* background/contextMenus.js [06/10/2017] */
chrome.contextMenus.create({
	id: "mainContext",
	documentUrlPatterns: ["*://*.sitetest2.robloxlabs.com/*"],
	title: ext.manifest.name,
	contexts: ["link"],
	targetUrlPatterns: ["*://*.sitetest2.robloxlabs.com/users/*/profile*"]
});

chrome.contextMenus.create({
	id: "sendTrade",
	title: "Trade",
	contexts: ["link"],
	targetUrlPatterns: ["*://*.sitetest2.robloxlabs.com/users/*/profile*"],
	documentUrlPatterns: ["*://*.sitetest2.robloxlabs.com/*"],
	parentId: "mainContext",
	onclick: function (e) {
		var userId = Roblox.users.getIdFromUrl(e.linkUrl);
		Roblox.trades.canTradeWithUser(userId).then(function (canTrade) {
			if (canTrade) {
				Roblox.trades.openSettingBasedTradeWindow(userId);
			}
		}).catch(function (e) {
			console.error(e);
		});
	}
});


// WebGL3D
