var init = function() {
	document.addEventListener("AutoKnight_storageReceive", function(e) {
		var items = e.detail || {};
		
		var slowBeepSeconds = items.slowBeepSeconds || 20;
		var fastBeepSeconds = items.fastBeepSeconds || 10;
		var autoClickSeconds = items.autoClickSeconds || 1;
		
		var markup = "<div class='autoKnight' style='float: right; margin-left: 20px;'>\
			<h2>AutoKnight is running</h2>\
			<label for='autoKnightSlow' style='display: inline-block; width: 100px;'>Slow Beep at</label> <input type='numeric' id='autoKnightSlow' style='width: 80px;'> seconds<br>\
			<label for='autoKnightFast' style='display: inline-block; width: 100px;'>Fast Beep at</label> <input type='numeric' id='autoKnightFast' style='width: 80px;'> seconds<br>\
			<label for='autoKnightClick' style='display: inline-block; width: 100px;'>Auto Click at</label> <input type='numeric' id='autoKnightClick' style='width: 80px;'> seconds<br>\
			<button id='autoKnightSave'>Apply changes</button>\
		</div>\
		<style type='text/css'>\
			.thebutton-container.active.disconnected:before {\
				content: 'DISCONNECTED';\
				display: block;\
				text-align: center;\
				\
				cursor: not-allowed;\
				\
				width: 100%;\
				height: 100%;\
				position: absolute;\
				top: 0;\
				left: 0;\
				border-radius: 5px;\
				z-index: 100;\
				transform: translate(0,0) scale(1,1) !important;\
				color: white;\
				background: red !important;\
				opacity: 1;\
				line-height: 60px;\
				font-size: 14px;\
			}\
		</style>";
		
		document.querySelector("form.thebutton-form").insertAdjacentHTML('beforeend', markup);
		
		slowInput = document.getElementById("autoKnightSlow");
		fastInput = document.getElementById("autoKnightFast");
		clickInput = document.getElementById("autoKnightClick");
		applyButton = document.getElementById("autoKnightSave");
		
		slowInput.value = slowBeepSeconds;
		fastInput.value = fastBeepSeconds;
		clickInput.value = autoClickSeconds;
		
		applyButton.addEventListener('click', function(e) {
			slowBeepSeconds = parseInt(slowInput.value) || 0;
			fastBeepSeconds = parseInt(fastInput.value) || 0;
			autoClickSeconds = parseInt(clickInput.value) || 0;
			
			document.dispatchEvent(new CustomEvent("AutoKnight_storageSet", {
				detail: {
					"slowBeepSeconds": slowBeepSeconds,
					"fastBeepSeconds": fastBeepSeconds,
					"autoClickSeconds": autoClickSeconds
				}
			}));
			
			e.preventDefault();
		});
		
		
		var lastTicked = undefined;
		var time = undefined;
		var pageTime = Date.now();
		var beepStage = 0;
		
		var context = new AudioContext();
		var oscillator;
		
		var oldTicking = r.thebutton._onTicking
		var newTicking = function(e) {
			oldTicking.apply(this, arguments);
			
			lastTicked = Date.now();
			
		}
		r.thebutton._websocket.on({"message:ticking": newTicking});
		
		
		var update = function() {
			var timeSinceTick = Date.now() - lastTicked;
		
			time = r.thebutton._msLeft;
			
			if(timeSinceTick < 1250) {
				$('.thebutton-container').removeClass('disconnected');
			}
			else
			{
				$('.thebutton-container').addClass('disconnected');
			}
			
			if(time < fastBeepSeconds * 1000 && timeSinceTick < 1250) {
				beepStage = (beepStage + 1) % 2;
			}
			else if(time < slowBeepSeconds * 1000 && timeSinceTick < 1250) {
				beepStage = (beepStage + 1) % 4;
			}
			else {
				beepStage = -1; // Stop
			}
			
			if(beepStage == 0)
			{
				oscillator = context.createOscillator(); // Use default sine wave
				oscillator.connect(context.destination);
				oscillator.start();
			}
			if(beepStage == 1 || beepStage == -1)
			{
				if(oscillator) {
					oscillator.stop();
					oscillator = undefined;
				}
			}
			
			if(time < autoClickSeconds * 1000 && timeSinceTick < 1250) { // If we're connected and the time falls below 1s
				$("#thebutton").click();
				alert("AutoKnight clicked the button because the timer was less than " + autoClickSeconds + " second(s)!");
			}
		};
		window.setInterval(update, 250); // 4 times per second, because why not?
	});
	document.dispatchEvent(new CustomEvent("AutoKnight_storageGet", {
		detail: ["slowBeepSeconds", "fastBeepSeconds", "autoClickSeconds"]
	}));
};

function checkJquery() {
	if (window.$) {
		init();
	} else {
		window.setTimeout(checkJquery, 100);
	}
}

checkJquery();