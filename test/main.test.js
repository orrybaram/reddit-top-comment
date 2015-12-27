describe("RedditTopComment", function() {
	describe("init()", function() {
		RedditTopComment.init();
		
		it("should append a blank popover to the body", function() {
			expect(document.getElementsByClassName("rtc-popover")[0]).to.not.equal(null);
		})	
	})
	describe("_getCommentLinks()", function() {
		it("should return an array of comment links", function() {
			expect(Array.isArray(RedditTopComment._getCommentLinks())).to.equal(true);
		})
	})
})

describe("htmlDecode()", function() {
	it("will take escaped html and return as unescaped html", function() {
		expect(htmlDecode("&lt;div class=&quot;thing&quot;&gt;&lt;/div&gt;")).to.equal('<div class="thing"></div>');	
	})
})

describe("addTargetBlankToLinks()", function() {
	it("will find all links in an element and add a target blank attribute to them", function() {
		$linkTest = document.getElementById("link-test");
		addTargetBlankToLinks($linkTest);
		expect($linkTest.getElementsByTagName('a')[0].getAttribute("target")).to.equal("_blank");
	})
})