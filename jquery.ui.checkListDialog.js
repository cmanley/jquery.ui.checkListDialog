﻿/*
jQuery-ui checkListDialog plugin

Copyright © 2013 Craig Manley
http://www.craigmanley.com/

Licensed under MIT
http://www.opensource.org/licenses/mit-license.php

TODO: If possible, use CSS classes from jquery-ui for styling group headers, highlighted option, etc.

Id: jquery.ui.checkListDialog.js,v 1.4 2013/10/24 19:42:32 cmanley Exp
*/

(function($) {
	$.fn.checkListDialog = function(options) {
		$.each(['pairs', 'callbacks'], function(i, name) {
			if (!options[name]) {
				throw "Mandatory option '" + name + "' is missing!";
			}
		});
		if (!$.isPlainObject(options['pairs'])) {
			throw "Option 'pairs' must be a plain object of key => value pairs!";
		}
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
		var opts = $.extend(true,
			{
				dialog: {
					maxHeight: $(window).height(),
					maxWidth: $(window).width()
				}
			},
			$.fn.checkListDialog.defaults,
			options
		);

		// Dynamically create content for use in dialog.
		var d = document.createElement('div');
		d.className = opts.class;
		var checked = {}; // map of checked value => true pairs
		$.each(opts.checked, function(i,v) {
			checked[v] = true;
		});

		// Toggle all on/off option
		if (opts.toggle_all) {
			var label = document.createElement('label');
			label.className = 'cldlg_toggle_all';
			var cb = document.createElement('input');
			$(cb)
			.attr({
				type: 'checkbox',
				value: ''
			})
			.click(function() {
				var nodes = d.querySelectorAll('input[type=checkbox]' + (this.checked ? ':not(:checked)' : ':checked')); // jQuery doesn't work on dynamically create DOM.
				for (var i = 0; i < nodes.length; ++i) {
					nodes[i].checked = this.checked;
				}
			});
			label.appendChild(cb);
			if (opts.toggle_all_text) {
				label.appendChild(document.createTextNode(opts.toggle_all_text));
			}
			d.appendChild(label);
		}

		$.each(opts.pairs, function(k, v) {
			if ($.isPlainObject(v)) { // group
				var group = document.createElement('div');
				group.className = 'cldlg_group';
				var header = document.createElement('div');
				header.className = 'cldlg_group_header';
				header.appendChild(document.createTextNode(k));
				group.appendChild(header);
				$.each(v, function(kk, vv) {
					var label = document.createElement('label');
					label.className = 'cldlg_option';
					var cb = document.createElement('input');
					if (kk in checked) {
						cb.defaultChecked = true;
					}
					$(cb).attr({
						type: 'checkbox',
						value: kk
					});
					label.appendChild(cb);
					label.appendChild(document.createTextNode(vv));
					group.appendChild(label);
				});
				d.appendChild(group);
			}
			else {
				var label = document.createElement('label');
				label.className = 'cldlg_option';
				var cb = document.createElement('input');
				if (k in checked) {
					cb.defaultChecked = true;
				}
				$(cb).attr({
					type: 'checkbox',
					value: k
				});
				label.appendChild(cb);
				label.appendChild(document.createTextNode(v));
				d.appendChild(label);
			}
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
					for (var i=0; i < nodes.length; ++i) {
						if (opts.toggle_all && (nodes[i].parentNode.className == 'cldlg_toggle_all')) { // don't use toggle checkbox in results
							continue;
						}
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

	// Default options
	$.fn.checkListDialog.defaults = {
		callbacks: {
			ok: null,
			cancel: null
		},
		class: 'cldlg',
		dialog: {
			//maxHeight:
			//maxWidth:
			modal: true,
			position: {
				of: this
			}
		},
		enter_is_ok: true,
		pairs: null,
		checked: [],
		toggle_all: false,
		toggle_all_text: 'toggle all'
	};
})(jQuery);
