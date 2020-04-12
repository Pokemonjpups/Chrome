// content.js [4/4/2016]
/*
	For any questions message WebGL3D https://www.sitetest2.robloxlabs.com/messages/compose?recipientId=48103520
	My messages will always be open for all, if you can't PM me check your settings.
*/
fixCB(({
	"text/html": function (subdomain, upath, list) {
		if (document.querySelector("#navigation .rplus-icon") || (["help", "corp", "developer", "wiki", "devforum", "blog", "api", "m", "bloxcon", "setup", "content", "polls"]).indexOf(subdomain = subdomain[subdomain.length - 3]) >= 0) { return; }
		
		function plusSlider(input) {
			return input.each(function () {
				var max = Number($(this).attr("max")) || 100;
				var v = math.bound(round($(this).val(), $(this).attr("step") || 1), $(this).attr("min") || 0, max);
				var perc = Math.floor((v / max) * 100);
				$(this).attr("title", max > 10 ? perc + "%" : v).css("background", "-webkit-linear-gradient(left, " + plusSlider.activeColor + ", " + plusSlider.activeColor + " " + perc + "%, " + plusSlider.backgroundColor + " " + perc + "%, " + plusSlider.backgroundColor + ")");
			});
		}
		plusSlider.selector = "input.rplusslider[type='range']";
		plusSlider.activeColor = "rgb(31,115,255)";
		plusSlider.backgroundColor = "rgb(175,175,175)";


		soundService.robloxSound.button = function (id, tag) {
			var v2, button, volume, state, connect, sound, stopper;
			if (v2 = !!document.querySelector(".container-main>.content")) {
				button = $("<" + (tag || "div") + " class=\"rplusaudio icon-audio\">");
			} else {
				button = $("<" + (tag || "div") + " class=\"rplusaudio MediaPlayerIcon Play\">");
			}
			button.append(volume = plusSlider($("<input type=\"range\" step=\"1\" min=\"0\" max=\"100\" class=\"rplusslider\">").change(function () {
				var v = (Number($(this).val()) || 0) / 100;
				if (sound) {
					sound.volume(v);
				}
				storage.set("mediaVolume", v);
			}))).click(function (e) {
				e.preventDefault();
				if (sound && e.currentTarget == e.target) {
					if (sound.playing()) {
						state("Play");
					}
					sound.volume((Number(volume.val()) || 0) / 100)[sound.playing() ? "stop" : "play"]();
				}
			});
			state = function (c) { setTimeout(function () { button.attr("class", v2 ? "rplusaudio MediaPlayerIcon icon-" + (c == "Error" ? "brokenpage" : c.toLowerCase()) : "rplusaudio MediaPlayerIcon " + (c == "Audio" ? "Error" : c)); }, 10); };
			var afterSound = function (s) {
				sound = s;
				state("Play");
				s.play(function () {
					state("Pause");
					stopper = setInterval(function () {
						if (!$("body").find(button).length) {
							s.stop();
						}
					}, 500);
				}).stop(function () {
					if (stopper) {
						clearInterval(stopper);
					}
					state("Play");
				}).error(function () {
					state("Error");
				});
			};
			connect = function (i) {
				soundService.robloxSound(i, function (s) {
					if (s) {
						afterSound(s);
					} else {
						state(Number(i) === 0 ? "Audio" : "Error");
					}
				});
			};
			if (type(id) == "string") {
				afterSound(soundService(id, true));
			} else {
				connect(type(id) == "number" ? id : id.change(function () { connect(id.val()); }).val());
			}
			storage.get("mediaVolume", function (v) {
				if (type(v) == "number") {
					plusSlider(volume.val(Math.min(v * 100, 100)));
					if (sound) {
						sound.volume(v);
					}
				}
			});
			return button;
		};

		storage.get("twemoji", function (enabled) {
			if (!enabled) {
				return;
			}

			var emojiSelector = "h2,p,div";
			var addEmojis = function (element) {
				setTimeout(function () {
					twemoji.parse(element);
				}, 500);
			};

			$(emojiSelector).each(function () {
				addEmojis(this);
			});

			var emojiObserver = new MutationObserver(function (records) {
				records.forEach(function (record) {
					record.addedNodes.forEach(function (e) {
						if ($(e).is(emojiSelector)) {
							addEmojis(e);
						}
					});
				});
			});

			emojiObserver.observe(document.body, { childList: true, subtree: true });
		});

		$("body").on("change", "*[storage]", function (s, v) {
			s = $(this).attr("storage"), v = $(this).val();
			if ($(this).attr("type") == "checkbox") {
				storage.set(s, $(this).prop("checked"));
			} else if ($(this).prop("tagName") == "SELECT") {
				storage.set(s, v);
			} else {
				console.warn("Unhandled storage attempt", s, v);
			}
		}).on("input", plusSlider.selector, function () {
			plusSlider($(this));
		}).on("change", plusSlider.selector, function () {
			plusSlider($(this));
		}).on("click", ".friend-status.icon-game", function (e) {
			e.preventDefault();
			var id = Roblox.users.getIdFromUrl($(this).parent().parent().find(">.friend-link").attr("href"));
			if (id) {
				Roblox.games.launch({
					followUserId: id
				});
			}
		}).on("click", ".rplusinventory[userid]", function () {
			RPlus.quickInfo.trigger(Roblox.users.getProfileUrl(Number($(this).attr("userid"))));
		});

		plusSlider($(plusSlider.selector));

		//$(".MediaPlayerIcon[data-mediathumb-url]").each(function () { $(this).replaceWith(soundService.robloxSound.button($(this).attr("data-mediathumb-url"), $(this).prop("tagName"))); });
		$("head").append($("<script>").attr("src", ext.getUrl("/js/jquery/overwrite.js")));
	}
})[document.contentType])(window.location.hostname.split("."), url.send(), []);



// WebGL3D
