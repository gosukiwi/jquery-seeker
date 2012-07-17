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

Default configuration

<pre><code>{	
	source: [],				// The source is an array of objects
	seekField: null,		// The field of the object used to seek
	url: undefined,			// If specified will make a POST request to the given URL to get the source as JSON
	method: 'POST',			// POST by default, can be GET, used for the AJAX request if the URL is set
	onSelected: undefined,	// Callback function for when an item is selected
	visibleFields: [],		// Used to specify what fields of the object are visible in the seeker, if empty, all are shown
	order: 'ASC',			// null if no order wanted, ASC for sort the source by seekField ASCENDING, DESC for descending order
	peerSeeker: null,		// The peer seeker, if specified, it will update the index of the peer seeker every time this one changes
	width: 200,				// The width of the seeker textbox
	autocompleteInterval: 1500	// Ammounts of seconds to wait before trying to autocomplete the seeker, set to 0 to disable it
}</code></pre>

# Notes

*	When a seeker's onSelected event is called, it's also called on it's peer seeker, so you only need to handle one event.