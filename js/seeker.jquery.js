/* 
jQuery Seeker Plugin
Author: Federico Ramirez <fedra.arg@gmail.com>
Copyright: Paradigma Del Sur - http://paradigma.com.ar
*/
(function($) {
	"use strict"; // JSHint

	var Helper = function(){};

	Helper.prototype.indexOf = function(item, arr) {
		var i;

		for(i = 0; i < arr.length; i++) {
			if(Helper.prototype.deepEqual(arr[i], item)) {
				return i;
			}
		}

		return -1;
	};

	Helper.prototype.deepEqual = function (x, y) {
		if (x === y) { return true; }
		if (!(x instanceof Object) || !(y instanceof Object)) { return false; }
		if (x.constructor !== y.constructor) { return false; }

		for (var p in x) {
			// other properties were tested using x.constructor === y.constructor
			if (x.hasOwnProperty(p)) {
				// allows to compare x[ p ] and y[ p ] when set to undefined
				if (!y.hasOwnProperty(p)) { return false; }

				// if they have the same strict value or identity then they are equal
				if (x[p] === y[p]) { continue; }

				// Numbers, Strings, Functions, Booleans must be strictly equal
				if (typeof (x[p]) !== "object") { return false; }

				// Objects and Arrays must be tested recursively
				if (!Helper.prototype.deepEqual(x[p], y[p])) { return false; }
			}
		}

		for (p in y) {
			// allows x[ p ] to be set to undefined
			if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) { return false; }
		}

		return true;
	};

	Helper.prototype.clamp = function(num, min, max) {
		return (num < min) ? min : (num > max) ? max : num;
	};

	Helper.prototype.parseField = function(str, len) {
		return (len === 0 || str.length < len) ? str : str.substring(0, len) + '...';
	};

	$.fn.seeker = function(options) {	// Constructor
		var i, table, row, id, button, hasFocus, hasCursor, tableDown,
		me, seekField, isDesc, autocompleteInterval, scrollable,
		scrollableHasCursor;

		// Configuration
		this.settings = $.extend({		// Default options
			source: [],					// The source is an array of objects
			seekField: null,			// The field of the object used to seek
			url: undefined,				// If specified will make a POST request to the given URL to get the source as JSON
			method: 'POST',				// POST by default, can be GET, used for the AJAX request if the URL is set
			onSelected: undefined,		// Callback function for when an item is selected
			visibleFields: [],			// Used to specify what fields of the object are visible in the seeker, if empty, all are shown
			order: 'ASC',				// null if no order wanted, ASC for sort the source by seekField ASCENDING, DESC for descending order
			peerSeeker: null,			// The peer seeker, if specified, it will update the index of the peer seeker every time this one changes
			width: 200,					// The width of the seeker textbox
			autocompleteInterval: 2000,	// Ammount of milliseconds to wait before trying to autocomplete the seeker, set to 0 to disable it
			orderBy: undefined,			// If you want to sort by a field that's not the seekField
			maxFieldLength: 0,			// If you want to truncate the values, length of characters allowed, 0 to disable
			dropDownSameWidth: true		// If you want to automatically make the drop down the same size as the input. The min width is defined at the css though. You can use this together with maxFieldLength
		}, options);

		// Public attributes
		this.id = this.attr('id');
		this.source = [];
		this.filteredSource = [];
		this.selectedIndex = -1;

		// Validate settings
		if(this.settings.seekField === null) {
			throw "Seek Field not found";
		}

		if(this.settings.source === [] && this.settings.url === undefined) {
			throw "Source not specified";
		}

		// Pubic methods
		this.setSelectedIndex = function(item) {
			var index, result, helper;

			helper = new Helper();

			index = helper.indexOf(item, this.source); // Deep comparison

			if(index > -1) {
				result = this.source[index];
				this.val(result[this.settings.seekField]);
				this._buildTable(this.source);
				this.filteredSource = [];

				if(autocompleteInterval) {
					clearInterval(autocompleteInterval);
				}

				if(this.settings.onSelected) {
					this.settings.onSelected(index, result);
				}

				this.selectedIndex = index;
			}

			// Now I have to set the scrollbar accordingly
			var padding = table.parent().outerHeight() / 2;
			table.parent().scrollTop((table.parent()[0].scrollHeight * (index / this.source.length)) - padding);

			// Rebuild table so the selected item is updated
			table = $('#' + this.id + '-table').hide();
			this._buildTable(this.source);
		};

		this.setPeerSeeker = function(seeker) {
			this.settings.peerSeeker = seeker;
		};

		// Private methods
		this._filterSource = function(text) {
			var i, item;

			this.filteredSource = [];
			text = text.toLowerCase();

			for(i = 0; i < this.source.length; i++) {
				item = this.source[i][this.settings.seekField].toString().toLowerCase();
				if(item.indexOf(text) === 0) {
					this.filteredSource.push(this.source[i]);
				}
			}

			this._buildTable(this.filteredSource);
		};

		this._updateScroll = function(table, index, total) {
			var padding = table.parent().outerHeight() / 2;
			table.parent().scrollTop((table.parent()[0].scrollHeight * (index / total)) - padding);
		};

		this._buildTable = function(data) {
			var row, obj, i, j, item, table, field, helper;

			helper = new Helper();
			table = $('#' + this.id + '-table');
			table.empty();

			for(i = 0; i < data.length; i++) {
				row = '<tr ' + ((this.selectedIndex > -1 && i === this.selectedIndex) ? 'class="seeker-selected"' : '') + ' id="' + id + '-' + i + '">';
				obj = data[i];

				if(this.settings.visibleFields.length > 0) {
					j = 1;
					for(field in this.settings.visibleFields) {
						if(obj[this.settings.visibleFields[field]]) {
							row += '<td class="col-' + j + '">' + helper.parseField(obj[this.settings.visibleFields[field]], this.settings.maxFieldLength) + '</td>';
							j++;
						}
					}
				} else {
					row += '<td class="col-1">' + helper.parseField(obj[this.settings.seekField], this.settings.maxFieldLength) + '</td>';
					j = 1;
					for(item in obj) {
						if(obj[item] && item !== this.settings.seekField) {
							row += '<td class="col-' + j + '">' + helper.parseField(obj[item], this.settings.maxFieldLength) + '</td>';
							j++;
						}
					}
				}

				row += '</tr>';
				table.append(row);
			}

			$('#' + id + '-table tr').bind('click', function(e) {
				var index = this.id.split('-')[1],
				item = me.filteredSource.length > 0 ? me.filteredSource[index] : me.source[index];
				me.setSelectedIndex(item);

				if(me.settings.peerSeeker) {
					me.settings.peerSeeker.setSelectedIndex(item);
				}
			});
		};

		this._checkForAutocomplete = function() {
			var i, item, result,
			text = me.val();

			for(i = 0; i < me.source.length; i++) {
				item = me.source[i][me.settings.seekField].toString().toLowerCase();
				if(item.indexOf(text) === 0) {
					result = me.source[i];
					me.setSelectedIndex(result);

					if(me.settings.peerSeeker) {
						me.settings.peerSeeker.setSelectedIndex(result);
					}

					table.hide();

					return;
				}
			}
		};

		id = this.id;
		me = this;	// Used to access this from callback functions

		// If we have to make an AJAX request, let's do that now
		if(this.settings.url) {
			$.ajax({
				type: this.settings.method,
				contentType: "application/json; charset=utf-8",
				url: this.settings.url,
				dataType: "json",
				async: false,
				success: function (data) {
					me.settings.source = data;
					me.source = data;
				}
			});
		} else {
			for(i = 0; i < this.settings.source.length; i++) { 
				// Copy manually, arrays are passed by reference, and if I share a variable to instantate several seekers it will break
				this.source.push(this.settings.source[i]);
			}
		}

		// Check if I have to sort
		if(this.settings.order !== null) {
			i = this.settings.orderBy || this.settings.seekField;
			isDesc = this.settings.order === 'DESC';

			this.source.sort(function(a, b){
				if(a[i] === b[i]) {
					return 0;
				} else if((isDesc && a[i] > b[i]) || (!isDesc && a[i] < b[i])) {
					return -1;
				} else {
					return 1;
				}
			});
		}

		// Markup setup
		this.addClass('seeker-text');
		this.wrap('<div class="seeker-container" />');
		this.after('<div class="seeker-table-container"><table class="seeker-outter" id="' + id + '-table"></table></div>');
		this.css('width', this.settings.width);

		table = $('#' + id + '-table');
		scrollable = table.parent();

		if(this.settings.dropDownSameWidth) {
			table.width(this.width());
		}
		
		this._buildTable(this.source);

		// Add button
		hasFocus = false;
		hasCursor = false;
		scrollableHasCursor = false;
		tableDown = false;

		this.after('<input type="button" value="" id="' + id + '-button" class="seeker-button" />');
		button = $('#' + id + '-button');

		// Bind events
		this.bind('mouseenter', function(){
			hasCursor = true;
			button.show();
		});

		this.bind('mouseleave', function(){
			hasCursor = false;
			if(!hasFocus) {
				button.hide();
			}

			if(!scrollableHasCursor) {
				table.hide();
			}
		});

		this.bind('focus', function() {
			hasFocus = true;
			button.show();
		});

		this.bind('blur', function() {
			hasFocus = false;
			if(!hasCursor) {
				button.hide();
			}

			if(tableDown) {
				tableDown = false;
				table.hide();
			}
		});

		button.bind('mouseenter', function() {
			hasCursor = true;
			button.show();
		});

		button.bind('mouseleave', function(){
			hasCursor = false;
			if(!hasFocus) {
				button.hide();
			}
		});

		button.bind('click', function() {
			if(me.filteredSource.length > 0) {
				me.filteredSource = [];
				me._buildTable(me.source);
			}

			table.show();
			tableDown = true;
			me._updateScroll(table, me.selectedIndex, me.source.length);
		});

		scrollable.bind('mouseenter', function(){
			scrollableHasCursor = true;
			table.show();
		});

		scrollable.bind('mouseleave', function() {
			scrollableHasCursor = false;

			if(!hasFocus && !hasCursor) {
				table.hide();
			}
		});

		this.bind('keyup', function(e){
			if(e.keyCode === 40 || e.keyCode === 38) {
				// If down or up arrows pressed
				var increment = (e.keyCode === 40 ? 1 : -1),
				index = me.selectedIndex + increment,
				helper = new Helper();

				index = helper.clamp(index, 0, me.source.length - 1);

				me.setSelectedIndex(me.source[index]);
				table.show();
				me._updateScroll(table, me.selectedIndex, me.source.length);

				if(me.settings.peerSeeker) {
					me.settings.peerSeeker.setSelectedIndex(me.source[index]);
				}

				return;
			}

			if(e.keyCode === 13) {
				// If enter key pressed
				table.hide();
				return;
			}

			me._filterSource($(this).val());
			table.show();

			if(me.settings.autocompleteInterval > 0) {
				if(autocompleteInterval) {
					clearInterval(autocompleteInterval);
				}

				autocompleteInterval = setInterval(me._checkForAutocomplete, me.settings.autocompleteInterval);
			}
		});

		return this;
	};
})(jQuery);