﻿/*
	roblox/avatar.js [03/23/2017]
*/
var Roblox = Roblox || {};

Roblox.trades = (function () {
	var tradeTypes = ["inbound", "outbound", "completed", "inactive"];

	return {
		getTradeWindowUrl: function (userId, counterTradeId) {
			return "https://www.sitetest2.robloxlabs.com/Trade/TradeWindow.aspx?TradePartnerID=" + userId + (counterTradeId ? "&TradeSessionId=" + counterTradeId : "");
		},

		decline: $.promise.cache(function (resolve, reject, tradeId) {
			if (typeof (tradeId) != "number" || tradeId <= 0) {
				reject([{
					code: 0,
					message: "Invalid tradeId"
				}]);
				return;
			}

			$.post(`https://trades.sitetest2.robloxlabs.com/v1/trades/${tradeId}/decline`).done(function() {
				resolve();
			}).fail(function (jxhr, errors) {
				reject(errors);
			});
		}, {
			resolveExpiry: 5 * 60 * 1000,
			queued: true
		}),

		get: $.promise.cache(function (resolve, reject, tradeId) {
			if (typeof (tradeId) != "number" || tradeId <= 0) {
				reject([{
					code: 0,
					message: "Invalid tradeId"
				}]);
				return;
			}

			Roblox.users.getAuthenticatedUser().then(function(authenticatedUser) {
				if (!authenticatedUser) {
					reject([{
						code: 0,
						message: "Unauthorized"
					}]);
					return;
				}

				$.get("https://trades.sitetest2.robloxlabs.com/v1/trades/" + tradeId).done(function(r) {
					let trade = {
						id: r.id,
						status: r.status == "Open" ? (r.offers[0].user.id === authenticatedUser.id ? "Outbound" : "Inbound") : r.status,
						offers: [],
						authenticatedUserOffer: {},
						tradePartnerOffer: {}
					};

					r.offers.forEach(function(offerData) {
						let offer = {
							user: {
								id: offerData.user.id,
								username: offerData.user.name
							},
							robux: offerData.robux,
							assetValue: 0,
							totalValue: offerData.robux,
							userAssets: []
						};

						offerData.userAssets.forEach(function(userAsset) {
							let value = userAsset.recentAveragePrice || 0;
							if (isNaN(value)) {
								value = 0;
							}

							offer.assetValue += value;
							offer.totalValue += value;

							offer.userAssets.push({
								userAssetId: userAsset.id,
								assetId: userAsset.assetId,
								name: userAsset.name,
								serialNumber: Number(userAsset.serialNumber) || null,
								assetStock: Number(userAsset.assetStock) || null,
								recentAveragePrice: value
							});
						});

						if (offer.user.id === authenticatedUser.id) {
							trade.authenticatedUserOffer = offer;
						} else {
							trade.tradePartnerOffer = offer;
						}

						trade.offers.push(offer);
					});

					resolve(trade);
				}).catch(function(jxhr, errors) {
					reject(errors);
				});
			}).catch(reject);
		}, {
			queued: true
		}),

		getTradesPaged: $.promise.cache(function (resolve, reject, tradeType, cursor) {
			if (typeof (tradeType) != "string" || !tradeTypes.includes(tradeType)) {
				reject([{
					code: 0,
					message: "Invalid tradeType"
				}]);
				return;
			}

			$.get("https://trades.sitetest2.robloxlabs.com/v1/trades/" + tradeType, {
				sortOrder: "Desc",
				limit: 100,
				cursor: cursor || ""
			}).done(function(r) {
				resolve({
					nextPageCursor: r.nextPageCursor,
					data: r.data.map(function(trade) {
						return {
							id: trade.id,
							status: trade.status,
							partner: {
								id: trade.user.id,
								username: trade.user.name
							},
							created: new Date(trade.created).getTime()
						};
					})
				});
			}).catch(function(jxhr, errors) { 
				reject(errors);
			});
		}, {
			queued: true,
			resolveExpiry: 10 * 1000
		}),

		openTradeTab: $.promise.cache(function (resolve, reject, userId, counterTradeId) {
			if (typeof (userId) != "number" || userId <= 0) {
				reject([{
					code: 0,
					message: "Invalid userId"
				}]);
				return;
			}

			window.open(this.getTradeWindowUrl(userId, counterTradeId));
			resolve();
		}, {
			queued: true,
			resolveExpiry: 1000
		}),

		canTradeWithUser: $.promise.cache(function (resolve, reject, userId) {
			if (typeof (userId) !== "number" || userId <= 0) {
				reject([{
					code: 0,
					message: "Invalid userId"
				}]);
				return;
			}

			Roblox.users.getCurrentUserId().then(function (authenticatedUserId) {
				if (authenticatedUserId <= 0) {
					resolve(false);
					return;
				}

				$.get(Roblox.trades.getTradeWindowUrl(userId)).done(function (r) {
					temp1 = r;
					var tradePartnerId = Number((temp1.match(/<form[^>]+action="\/Trade\/TradeWindow.aspx\?TradePartnerID=(\d+)"/i) || ["", 0])[1]);
					resolve(tradePartnerId === userId);
				}).fail(function () {
					reject([{
						code: 0,
						message: "HTTP request failed"
					}]);
				});
			}).catch(reject);
		}, {
			queued: true,
			resolveExpiry: 15 * 1000,
			rejectExpiry: 15 * 1000
		}),

		getTradeCount: $.promise.cache(function (resolve, reject, tradeType) {
			$.get("https://trades.sitetest2.robloxlabs.com/v1/trades/" + tradeType + "/count").done(function (r) {
				resolve(r.count);
			}).fail(function () {
				reject([{
					code: 0,
					message: "HTTP request failed"
				}]);
			});
		}, {
			queued: true,
			resolveExpiry: 15 * 1000,
			rejectExpiry: 15 * 1000
		})
	};
})();

Roblox.trades = $.addTrigger($.promise.background("Roblox.trades", Roblox.trades));

Roblox.trades.openSettingBasedTradeWindow = function (userId, counterTradeId) {
	return new Promise(function (resolve, reject) {
		Roblox.trades.openTradeTab(userId).then(resolve, reject);
	});
};

// WebGL3D
