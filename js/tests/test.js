test("Test setup", function(){
	var source = [{name:'MIKE'}],
	seeker = $('#testSeeker').seeker({
		seekField: 'name',
		source: source
	});

	notEqual($('#testSeeker'), [], "Test fixture");
	notEqual($('#testSeeker-table'), [], "Created seeker table");
	notEqual($('.seeker-container'), [], "Created container");
	notEqual($('.seeker-button'), [], "Created button");

	equal(seeker.selectedIndex, -1, "Test selected index");
	deepEqual(seeker.source, source, "Test source");
});