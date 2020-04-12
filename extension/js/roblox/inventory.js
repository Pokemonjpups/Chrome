﻿/*
	roblox/inventory.js [03/12/2017]
*/
var Roblox = Roblox || {};

Roblox.inventory = (function () {
	function loadUserCollectibleAssets(userId, cursor) {
		return new Promise(function (resolve, reject) {
			$.get("https://inventory.sitetest2.robloxlabs.com/v1/users/" + userId + "/assets/collectibles", { cursor: cursor || "", sortOrder: "Asc", limit: 100 }).done(function (r) {
				if (r.nextPageCursor) {
					loadUserCollectibleAssets(userId, r.nextPageCursor).then(function (extraData) {
						resolve(r.data.concat(extraData));
					}, reject);
				} else {
					resolve(r.data);
				}
			}).fail(function (jxhr, errors) {
				reject(errors);
			});
		});
	}

	return {
		getCollectibles: $.promise.cache(function (resolve, reject, userId) {
			if (typeof (userId) != "number" || userId <= 0) {
				reject([{
					code: 0,
					message: "Invalid userId"
				}]);
				return;
			}
			
			var collectibles = [];
			var combinedValue = 0;
			
			loadUserCollectibleAssets(userId).then(function (data) {
				data.forEach(function (userAsset) {
					combinedValue += userAsset.recentAveragePrice || 0;
				});
				collectibles = collectibles.concat(data);

				collectibles.sort(function (a, b) {
					if (a.assetId === b.assetId) {
						return a.userAssetId - b.userAssetId;
					}

					return a.assetId - b.assetId;
				});

				resolve({
					combinedValue: combinedValue,
					collectibles: collectibles
				});
			}).catch(reject);
		}, {
				rejectExpiry: 10 * 1000,
				resolveExpiry: 5 * 60 * 1000,
				queued: true
			}),

		delete: $.promise.cache(function (resolve, reject, assetId) {
			if (typeof (assetId) != "number" || assetId <= 0) {
				reject([{
					code: 0,
					message: "Invalid assetId"
				}]);
				return;
			}

			$.post("https://assetgame.sitetest2.robloxlabs.com/asset/delete-from-inventory", { assetId: assetId }).done(function () {
				resolve();
			}).fail(function () {
				reject([]);
			});
		}, {
				rejectExpiry: 1000,
				resolveExpiry: 1000
			}),

		getAssetOwners: $.promise.cache(function (resolve, reject, assetId, cursor, sortOrder) {
			if (typeof (assetId) != "number" || assetId <= 0) {
				reject([{
					code: 0,
					message: "Invalid assetId"
				}]);
				return;
			}

			$.get("https://inventory.sitetest2.robloxlabs.com/v2/assets/" + assetId + "/owners", { cursor: cursor || "", sortOrder: sortOrder || "Asc", limit: 100 }).done(function (data) {
				var dcb = -1;
				var fcb = function () {
					if (++dcb === data.data.length) {
						resolve(data);
					}
				};

				data.data.forEach(function (record, index) {
					var translatedRecord = {
						userAssetId: record.id,
						serialNumber: record.serialNumber,
						owner: null,
						created: record.created,
						updated: record.updated
					};

					if (record.owner) {
						Roblox.users.getByUserId(record.owner.id).then(function (user) {
							translatedRecord.owner = {
								userId: user.id,
								username: user.username
							};

							data.data[index] = translatedRecord;
							fcb();
						});
					} else {
						data.data[index] = translatedRecord;
						fcb();
					}
				});

				fcb();
			}).fail(function (jxhr, errors) {
				reject(errors);
			});
		}, {
			queued: true,
			resolveExpiry: 30 * 1000,
			rejectExpiry: 10 * 1000
		}),

		getPlayerBadges: $.promise.cache(function (resolve, reject, userId, cursor) {
			if (typeof (userId) != "number" || userId <= 0) {
				reject([{
					code: 0,
					message: "Invalid userId"
				}]);
				return;
			}

			$.get("https://badges.sitetest2.robloxlabs.com/v1/users/" + userId + "/badges", {
				limit: 100,
				sortOrder: "Desc",
				cursor: cursor || ""
			}).done(function (r) {
				var response = {
					previousPageCursor: r.previousPageCursor,
					nextPageCursor: r.nextPageCursor,
					data: []
				};

				r.data.forEach(function (badge) {
					response.data.push({
						id: badge.id,
						name: badge.name
					});
				});

				resolve(response);
			}).fail(function (jxhr, errors) {
				reject(errors);
			});
		}, {
				resolveExpiry: 15 * 1000,
				rejectExpiry: 15 * 1000,
				queued: true
			})
	};
})();

Roblox.inventory = $.addTrigger($.promise.background("Roblox.inventory", Roblox.inventory));

// WebGL3D
