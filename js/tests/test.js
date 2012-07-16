test("Test setup", function(){
	$('#testSeeker').seeker();

	notEqual($('#testSeeker'), [], "Test fixture");
	notEqual($('#testSeeker-table'), [], "Created seeker table");
	notEqual($('.seeker-container'), [], "Created container");
	notEqual($('.seeker-button'), [], "Created button");
})