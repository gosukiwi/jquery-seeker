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
			url: null,				// If specified will make a POST request to the given URL to get the source as JSON
			method: 'POST',			// POST by default, can be GET, used for the AJAX request if the URL is set
			onSelected: undefined,	// Callback function for when an item is selected
			visibleFields: [],		// Used to specify what fields of the object are visible in the seeker, if empty, all are shown
			order: 'ASC',			// null if no order wanted, ASC for sort the source by seekField ASCENDING, DESC for descending order
			peerSeeker: null,		// The peer seeker, if specified, it will update the index of the peer seeker every time this one changes
			width: 200,				// The width of the seeker textbox
			autocompleteInterval: 1500	// Ammounts of seconds to wait before trying to autocomplete the seeker, set to 0 to disable it
		}, options);
		this.id = this.attr('id');
		this.source = [];
		this.filteredSource = [];

		// Pubic methods
		this.setSelectedIndex = function(item) {
			var index, result;

			index = this.source.indexOf(item);
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

				table.hide();
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

		for(i = 0; i < this.settings.source.length; i++) { 
			// Copy manually, arrays are passed by reference, and if I share a variable to instantate several seekers it will break
			this.source.push(this.settings.source[i]);
		}

		// Check if I have to sort
		if(this.settings.order !== null) {
			seekField = this.settings.seekField;
			isDesc = this.settings.order === 'DESC';

			this.source.sort(function(a, b){
				if(a[seekField] === b[seekField]) {
					return 0;
				} else if((isDesc && a[seekField] > b[seekField]) || (!isDesc && a[seekField] < b[seekField])) {
					return -1;
				} else {
					return 1;
				}
			});
		}

		id = this.id;

		global_seeker = this;	// Used to access this from callback functions

		// Markup setup
		this.addClass('seeker-text');
		this.wrap('<div class="seeker-container" />');
		this.after('<table class="seeker-outter" id="' + id + '-table"></table>');
		this.after('<input type="hidden" id="' + id + '-selected-index" value="" />');

		table = $('#' + id + '-table');

		this.css('width', this.settings.width);
		
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

	if (!Array.prototype.indexOf)
	{
		Array.prototype.indexOf = function(elt /*, from*/)
		{
			var len = this.length;
			var from = Number(arguments[1]) || 0;
			from = (from < 0) ? Math.ceil(from) : Math.floor(from);

			if (from < 0) {
				from += len;
			}

			while (from < len)
			{
				if (from in this && this[from] === elt) {
					return from;
				}

				from++;
			}

			return -1;
		};
	}
})(jQuery);