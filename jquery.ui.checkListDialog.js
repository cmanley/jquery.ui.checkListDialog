/*
jQuery-ui checkListDialog plugin

Copyright © 2013 Craig Manley
http://www.craigmanley.com/

Licensed under MIT
http://www.opensource.org/licenses/mit-license.php

TODO: Implement key up/down navigation

Id: jquery.ui.checkListDialog.js,v 1.1 2013/10/12 18:24:39 cmanley Exp
*/

(function($) {
	$.fn.checkListDialog = function(options) {
		$.each(['pairs', 'callbacks'], function(i, name) {
			if (!options[name]) {
				throw "Mandatory option '" + name + "' is missing!";
			}
		});
		$.each(['ok'], function(i, name) {
			if (!options.callbacks[name]) {
				throw "Mandatory option callbacks." + name + " is missing!";
			}
		});
		$.each(['ok', 'cancel'], function(i, name) {
			if (options.callbacks[name] && !$.isFunction(options.callbacks[name])) {
				throw "Option callbacks." + name + " must be a function!";
			}
		});
		var opts = $.extend(true, {
			callbacks: {
				ok: null,
				cancel: null
			},
			class: 'CheckListDialog',
			dialog: {
				maxHeight: $(window).height(),
				maxWidth: $(window).width(),
				modal: true,
				position: {
					of: this
				}
			},
			label: {
				mouseout: {
					css: {
						backgroundColor: ''
					}
				},
				mouseover: {
					css: {
						backgroundColor: '#c4e8fd'
					}
				}
			},
			enter_is_ok: true,
			pairs: null,
			checked: []
		}, options);

		// Dynamically create content for use in dialog.
		var d = document.createElement('div');
		d.className = opts.class;
		var checked = {}; // map of checked value => true pairs
		$.each(opts.checked, function(i,v) {
			checked[v] = true;
		});
		$.each(opts.pairs, function(value, text) {
			var label = document.createElement('label');
			label.className = 'cldlg_label';
			$(label).css({display: 'block'})
			.on('mouseover', function() {
				$(this).css(opts.label.mouseover.css);
			})
			.on('mouseout', function() {
				$(this).css(opts.label.mouseout.css);
			})
			var cb = document.createElement('input');
			if (value in checked) {
				cb.defaultChecked = true;
			}
			$(cb).attr({
				type: 'checkbox',
				value: value
			});
			label.appendChild(cb);
			label.appendChild(document.createTextNode(text));
			d.appendChild(label);
		});

		// Show jQuery-ui dialog
		var ok_clicked = false;
		var overridable_dialog_opts = {
			buttons: {
				Cancel: function() {
					$(this).dialog("close");
				}
			}
		};
		var locked_dialog_opts = {
			buttons: {
				Ok: function() {
					ok_clicked = true;
					$(this).dialog("close");
				}
			},
			close: function( event, ui ) {
				var result = [];
				if (ok_clicked) {
					var nodes = this.querySelectorAll('input[type=checkbox]:checked'); // jQuery doesn't work on dynamically create DOM.
					for (var i = 0; i < nodes.length; ++i) {
						result.push(nodes[i].value);
					}
				}
				this.parentNode.removeChild(this);
				if (ok_clicked) {
					opts.callbacks.ok.call(this, result);
				}
				else {
					if (opts.callbacks.cancel) {
						opts.callbacks.cancel.call(this);
					}
				}
			}
		};
		var $d = $(d);
		$d.css({
			display	: 'none',
			height	: '100%',
			width	: '100%',
			overflow: 'auto'
		});
		if (opts.enter_is_ok) {
			$d.keyup(function(e) {
				if (e.keyCode == 13) {
					ok_clicked = true;
					$(this).dialog('close');
				}
			});
		}
		$d.dialog($.extend(true, overridable_dialog_opts, opts.dialog, locked_dialog_opts));

		// Chainable result
		return this;
	};
})(jQuery);
