jquery-seeker is a jQuery extension designed to display lists of data where the use can select an item in multiple ways.
For example, having an ID, and a NAME, user can choose an item by ID or NAME.

The functionality is pretty similar to an autocomplete.

# Example usage

## HTML

<pre><code>&lt;input id="seekerAge" type="text" /&gt;
&lt;input id="seekerName" type="text" /&gt;</code></pre>

## Javascript

<pre><code>$(document).ready(function() {
	var source = [
		{ name: "Mike", age: "20" },
		{ name: "John", age: "22" },
		{ name: "Amy", age: "21" }
	];

	var ageSeeker = $('#seekerAge').seeker({
		'source': source,
		seekField: 'age',
		width: 100,
		onSelected: function(index, item) {
			// do something
		}
	});

	var nameSeeker = $('#seekerName').seeker({
		'source': source,
		seekField: 'name',
		onSelected: function() {
			// do something
		}
	});

	ageSeeker.setPeerSeeker(nameSeeker);
	nameSeeker.setPeerSeeker(ageSeeker);
});</code></pre>

For more examples, see the examples folder.

# Default configuration

<pre><code>{
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
	dropDownSameWitdh: true 	// If you want to automatically make the drop down the same size as the input. The min width is defined at the css though. You can use this together with maxFieldLength
}</code></pre>

# Notes

*	When a seeker's onSelected event is called, it's also called on it's peer seeker, so you only need to handle one event.