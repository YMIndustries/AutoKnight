if(window.location.pathname.toLowerCase() == "/r/thebutton/") {
	function injectScript(file, node) {
		var th = document.getElementsByTagName(node)[0];
		var s = document.createElement('script');
		s.setAttribute('type', 'text/javascript');
		s.setAttribute('src', file);
		th.appendChild(s);
	}
	injectScript( chrome.extension.getURL('/pagescript.js'), 'body');
	
	
	document.addEventListener('AutoKnight_storageGet', function(e) {
		chrome.storage.sync.get(e.detail, function(items) {
			document.dispatchEvent(new CustomEvent('AutoKnight_storageReceive', {
				detail: items
			}));
		});
	});
	
	document.addEventListener('AutoKnight_storageSet', function(e) {
		chrome.storage.sync.set(e.detail);
	});
}