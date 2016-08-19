function initMouseWheelFix() {
	if (window.shypl_mwf) {
		return;
	}
	
	var document = window.document,
		env = (function () {
			var nav = window.navigator,
				ua = nav.userAgent.toLowerCase(),
				pl = nav.platform.toLowerCase();
			
			return {
				win: pl ? /win/.test(pl) : /win/.test(ua),
				mac: pl ? /mac/.test(pl) : /mac/.test(ua),
				chrome: /chrome/.test(ua),
				safari: /webkit/.test(ua) && !/(chrome|stainless)/.test(ua),
				opera: /opera/.test(ua),
				msie: /msie|trident/.test(ua) && !/opera/.test(ua),
				mozilla: /mozilla/.test(ua) && !/(compatible|webkit)/.test(ua)
			}
		})();
	
	function dwr(n, d) {
		return n !== 0 && (n % d) === 0;
	}
	
	function register(id) {
		var i = setInterval(function () {
			var swf = document.getElementById(id);
			if (swf) {
				clearInterval(i);
				bind(swf);
			}
		}, 0);
	}
	
	function bind(swf) {
		var functionName,
			eventName;
		
		if (window.addEventListener) {
			functionName = "addEventListener";
			eventName = "";
		}
		else {
			functionName = "attachEvent";
			eventName = "on";
		}
		
		eventName += ("onwheel" in document.createElement("div"))
			? "wheel"
			: (document.onmousewheel !== undefined ? "mousewheel" : "DOMMouseScroll");
		
		swf[functionName](eventName,
			(env.mac && env.mozilla)
				? creteHandlerForFirefoxMac(swf)
				: creteHandler(swf)
		);
	}
	
	function creteHandler(swf) {
		return function (event) {
			handleWheel(swf, event ? event : window.event);
		}
	}
	
	function creteHandlerForFirefoxMac(swf) {
		return function (event) {
			swf.style.visibility = "hidden";
			if (handleWheel(swf, event)) {
				event.stopPropagation();
			}
			swf.style.visibility = "visible";
		};
	}
	
	function handleWheel(swf, event) {
		
		var deltaX = 0,
			deltaY = 0;
		
		if (event.wheelDeltaY || event.wheelDeltaX) {
			deltaX = event.wheelDeltaX;
			deltaY = event.wheelDeltaY;
		}
		else if (event.deltaY || event.deltaX) {
			deltaX = event.deltaX;
			deltaY = event.deltaY;
		}
		else if (event.wheelDelta) {
			deltaY = event.wheelDelta;
		}
		else if (event.detail) {
			deltaY = event.detail;
			if (event.axis) {
				if (event.axis == event.HORIZONTAL_AXIS) {
					deltaX = deltaY;
					deltaY = 0;
				}
			}
		}
		
		if (env.chrome || env.safari) {
			if (env.mac) {
				deltaX /= 3;
				deltaY /= 3;
			}
			if (dwr(deltaX, 40) || dwr(deltaY, 40)) {
				deltaX /= 40;
				deltaY /= 40;
			}
		}
		else if (env.mozilla) {
			if (env.mac && (dwr(deltaX, 2) || dwr(deltaY, 2))) {
				deltaX /= -2;
				deltaY /= -2;
			}
			else {
				deltaX *= -1;
				deltaY *= -1;
			}
		}
		else if (env.opera) {
			deltaX /= 40;
			deltaY /= 40;
			if (env.mac && (dwr(deltaX, 32) || dwr(deltaY, 32))) {
				deltaX /= 32;
				deltaY /= 32;
			}
		}
		else if (env.msie) {
			deltaX /= 40;
			deltaY /= 40;
		}
		
		if (deltaX === 0 && deltaY === 0) {
			return false;
		}
		
		var stop = swf.shypl_mwf_handleWheel(deltaX, deltaY, event.ctrlKey, event.altKey, event.shiftKey);
		
		if (stop) {
			if (event.preventDefault) {
				event.preventDefault();
			}
			else {
				event.returnValue = false;
			}
		}
		
		return stop;
	}
	
	if (!window.shypl_mwf) {
		window.shypl_mwf = {};
	}
	
	window.shypl_mwf = {
		fix: register,
		initialized: function () {
			return true;
		}
	};
}