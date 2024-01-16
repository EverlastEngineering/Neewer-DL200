/*
 * Usage:
 *   Simply include this file in your html and
 *   <svg src="your-svg-file.svg"></svg>
 *
 * See also:
 *   https://bugs.webkit.org/show_bug.cgi?id=12499
 */
;(function(){
	'use strict';
  
	document.addEventListener('DOMContentLoaded', (function() {
  
	  var attr = 'src';
  
	  // Iterate all elements.
	  function each_tag(t, c){
		var svg = document.getElementsByTagName(t);
		for(var i = 0; i < svg.length; i++)
		  c.apply(svg, [svg[i]]);
	  }
  
	  // Load sources.
	  function load(o, complete){
		var XHR = (window.XMLHttpRequest)
		  ? (new XMLHttpRequest)
		  : (new ActiveXObject("Microsoft.XMLHTTP"));
  
		XHR.onreadystatechange = function(){
		  (XHR.readyState==4 && XHR.status==200)
			&& complete.apply(XHR, [XHR]);
		}
  
		XHR.open((o.type || 'GET'), o.url, true);
		XHR.send();
	  }
  
	  return function(){
		each_tag('svg', function(svg){
		  var src = svg.getAttribute(attr);
		  (src)
			&& load({ url: src }, function(XHR){
			svg.parentNode.insertAdjacentHTML('afterbegin', XHR.responseText);
			svg.remove();
			});
		});
	  }
  
	})());
  
  })();