/* 
jQuery Seeker Plugin
Author: Federico Ramirez <fedra.arg@gmail.com>
Copyright: Paradigma Del Sur - http://paradigma.com.ar
*/
(function($) {
	"use strict"; // JSHint

	$.fn.seeker = function(options) {	// Constructor
		var i, table, row, id, button, hasFocus, hasCursor, tableDown,
		global_seeker, seekField, isDesc, autocompleteInterval;

		// Public attributes
		this.settings = $.extend({	// Default options
			source: [],				// The source is an array of objects
			seekField: null,		// The field of the object used to seek
			url: undefined,			// If specified will make a POST request to the given URL to get the source as JSON
			method: 'POST',			// POST by default, can be GET, used for the AJAX request if the URL is set
			onSelected: undefined,	// Callback function for when an item is selected
			visibleFields: [],		// Used to specify what fields of the object are visible in the seeker, if empty, all are shown
			order: 'ASC',			// null if no order wanted, ASC for sort the source by seekField ASCENDING, DESC for descending order
			peerSeeker: null,		// The peer seeker, if specified, it will update the index of the peer seeker every time this one changes
			width: 200,				// The width of the seeker textbox
			autocompleteInterval: 2000,	// Ammounts of milliseconds to wait before trying to autocomplete the seeker, set to 0 to disable it
			orderBy: undefined		// If you want to sort by a field that's not the seekField
		}, options);
		this.id = this.attr('id');
		this.source = [];
		this.filteredSource = [];

		// Pubic methods
		this.indexOf = function(item, arr) {
			var i;

			for(i = 0; i < arr.length; i++) {
				if(this.deepEqual(arr[i], item)) {
					return i;
				}
			}

			return -1;
		};

		this.deepEqual = function (x, y) {
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
					if (!this.deepEqual(x[p], y[p])) { return false; }
				}
			}

			for (p in y) {
				// allows x[ p ] to be set to undefined
				if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) { return false; }
			}

			return true;
		};

		this.setSelectedIndex = function(item) {
			var index, result;

			index = this.indexOf(item, this.source); // Deep comparison

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
			}

			table = $('#' + this.id + '-table').hide();
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

		this._buildTable = function(data) {
			var row, obj, i, j, item, table, field;

			table = $('#' + this.id + '-table');
			table.empty();

			for(i = 0; i < data.length; i++) {
				row = '<tr id="' + id + '-' + i + '">';
				obj = data[i];

				if(this.settings.visibleFields.length > 0) {
					j = 1;
					for(field in this.settings.visibleFields) {
						if(obj[this.settings.visibleFields[field]]) {
							row += '<td class="col-' + j + '">' + obj[this.settings.visibleFields[field]] + '</td>';
							j++;
						}
					}
				} else {
					row += '<td class="col-1">' + obj[this.settings.seekField] + '</td>';
					j = 1;
					for(item in obj) {
						if(obj[item] && item !== this.settings.seekField) {
							row += '<td class="col-' + j + '">' + obj[item] + '</td>';
							j++;
						}
					}
				}

				row += '</tr>';
				table.append(row);
			}

			table.css('width', this.width() - 20);

			$('#' + id + '-table tr').bind('click', function(e) {
				var index = this.id.split('-')[1],
				item = global_seeker.filteredSource.length > 0 ? global_seeker.filteredSource[index] : global_seeker.source[index];
				global_seeker.setSelectedIndex(item);

				if(global_seeker.settings.peerSeeker) {
					global_seeker.settings.peerSeeker.setSelectedIndex(item);
				}
			});
		};

		this._checkForAutocomplete = function() {
			var i, item, result,
			text = global_seeker.val();

			for(i = 0; i < global_seeker.source.length; i++) {
				item = global_seeker.source[i][global_seeker.settings.seekField].toString().toLowerCase();
				if(item.indexOf(text) === 0) {
					result = global_seeker.source[i];
					global_seeker.setSelectedIndex(result);

					if(global_seeker.settings.peerSeeker) {
						global_seeker.settings.peerSeeker.setSelectedIndex(result);
					}

					table.hide();

					return;
				}
			}
		};

		id = this.id;
		global_seeker = this;	// Used to access this from callback functions

		// If we have to make an AJAX request, let's do that now
		if(this.settings.url) {
			$.ajax({
				type: this.settings.method,
				contentType: "application/json; charset=utf-8",
				url: this.settings.url,
				dataType: "json",
				async: false,
				success: function (data) {
					global_seeker.settings.source = data;
					global_seeker.source = data;
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
		this.after('<div class="seeker-table-container" id="seeker-table-container-' + id + '"><table class="seeker-outter" id="' + id + '-table"></table></div>');
		this.css('width', this.settings.width);

		table = $('#' + id + '-table');
		
		this._buildTable(this.source);

		// Add button
		hasFocus = false;
		hasCursor = false;
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
			if(global_seeker.filteredSource.length > 0) {
				global_seeker.filteredSource = [];
				global_seeker._buildTable(global_seeker.source);
			}

			table.show();
			tableDown = true;
		});

		table.bind('mouseleave', function() {
			if(!hasFocus && !hasCursor) {
				table.hide();
			}
		});

		this.bind('keyup', function(e){
			global_seeker._filterSource($(this).val());
			table.show();

			if(global_seeker.settings.autocompleteInterval > 0) {
				if(autocompleteInterval) {
					clearInterval(autocompleteInterval);
				}

				autocompleteInterval = setInterval(global_seeker._checkForAutocomplete, global_seeker.settings.autocompleteInterval);
			}
		});

		return this;
	};
})(jQuery);