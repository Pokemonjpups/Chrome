chrome.browserAction.setTitle({ title: ext.manifest.name + " " + ext.manifest.version });
chrome.browserAction.onClicked.addListener(function () {
	chrome.tabs.query({
		active: true,
		currentWindow: true,
		url: ["*://www.sitetest2.robloxlabs.com/*", "*://web.sitetest2.robloxlabs.com/*"],
		status: "complete"
	}, function (tabs) {
		if (tabs.length === 1) {
			ipc.send("rplus:showNotifications", {}, function () { }, tabs[0].id);
		} else {
			window.open(ext.manifest.homepage_url);
		}
	});
});
