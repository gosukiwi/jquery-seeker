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
	dropDownSameWidth: true,	// If you want to automatically make the drop down the same size as the input. The min width is defined at the css though. You can use this together with maxFieldLength
	columnsWidth: []			// The width of the table columns
}</code></pre>

## source

This is the source of the seeker, it's an array of objects. All objects should have the same attributes.

## seekField

This is the field the seeker uses to find when the user types, and also the one in displays when an item is selected.

## url

If you want to get the source from an URL which returns JSON, just specify the URL, this is cached, so many seekers can use the same URL (especially the peer seeker)

## method

If an URL is specified, it will use the specified method and make a request to the server, the default is POST, GET is also available.

## onSelected

Whenever an entry is selected, either by typing, autocomplete, pressing enter or selecting by hand, this event is triggered. It's triggered on both, the seeker and it's peer seeker, so you only need to handle this event once, in either seeker.

## visibleFields

If you have objects with way too many attributes, you can specify a list of attributes you want to show, in the order you want them to be shown

## order

If you want to order the source by a field, by default it orders by seekField but you can set the orderBy property to sort by another field.
This can be either 'ASC', 'DESC' or null if you don't want to order.

## peerSeeker

Seekers are normally shown in pairs, peer seekers display the same source, but they have different seekFields, this is useful if you want an user to select an item by many fields, for example, if you have a list of colors, you might want them to select by hexadecimal code, or color name (Red or #FF0000)

## width

The width of the input field of the seeker

## autocompleteInterval

When the user types something on the seeker, the popup will filter the source so the user can select whatever she wants, if the user doesn't select anything for a while, it will autocomplete with the first item in the filtered source.

## orderBy

This is used in conjunction with _order_, you can specify the field to order the source by that field.

## maxFieldLength

If you have a field which is really long but you want to show it anyways, you can set a max field, it will truncate all the fields longer than the specified lenth, and add '...' at the end.

## dropDownSameWidth

If specified, it will force the drop-down to be the same width than the input

## columnsWidth

Sets the width of each column of the table individually. This is an array. For example

<pre><code>{
	...
	columnsWidth: [50, 100, 20] // This is ordered the same as the table columns
}}</code></pre>

# Public Methods

There are some public methods available to add some more utility to the seeker.

## setSelectedItem

Sets the selected item of the seeker. Using the example above, we can set a selected item as follows

<pre><code>ageSeeker.setSelectedItem(source[0]);
// You can also do
ageSeeker.setSelectedItem({ name: "Mike", age: "20" });</code></pre>

Note that you have to pass the full object as parameter, otherwise it won't work, as it does a full deep comparison

## getSelectedItem

Gets the selected item. This method shouldn't be necessary as whenever an item is selected, your callback function will be executed with the selected item itself, but it's included for the sake of completeness. You might want to do some complicated behaviour, in which case, you can use this function.

<pre><code>var item = mySeeker.getSelectedItem();</code></pre>

## setSelectedIndex

Sets the selected index of the seeker, it also updates the peer seeker.

<pre><code>mySeeker.setSelectedIndex(0); // select the first item by default</code></pre>

## getSelectedIndex

Gets the selected index of the seeker

<pre><code>var selectedIndex = mySeeker.getSelectedIndex();</code></pre>

## setSource

This method lets you update the source of the seeker. Remember to update it on the peer seeker too!

<pre><code>mySeeker.setSource([{name:"My name", age:"28"}]);
// or
mySeeker.setSource(myNewSource);</code></pre>

## setPeerSeeker

Used to set a peer seeker. Peer sekers are bound by selected item, this means, everytime you select an item in a seeker, it will also update the selected item on it's peer seeker, and vice versa. Peer seekers must use the same source, as they are different views for the same data, basically. Peer seekers will always have the same value.

# Useful CSS configuration
The seeker is highly dependant of the CSS configuration. You can change almost all the visuals of the seeker modifying this file, but there are some definitions that should be remarked.

## Setting the drop-down's minimum width
By default, width of the drop-down table is the same as the input, but when the input is too small, this might be bad for our table, as each row will be split into several lines. You can fix this by using the maxFieldLength configuration, but this is intended for very long fields, this is when modifying the minimum width of the table is useful.

In the css there's a selector _table.seeker-outter_, this is the table of each seeker, you can modify the min-width property according to your needs, the default value is _180px_.

<pre><code>table.seeker-outter {
	...
	min-width: 180px; /* set the min width here */
}</code></pre>

## Changing the drop-down's position
The drop-down position is defined on the css, assuming the input's css is untouched. If margins, paddings or heights are modified, then there's a chance the drop-down top position won't be correct. To change this, just update the _top_ property of the _div.seeker-table-container_ selector.

<pre><code>div.seeker-table-container {
	...
	top: 24px;
}</code></pre>

# Notes

*	When a seeker's onSelected event is called, it's also called on it's peer seeker, so you only need to handle one event.