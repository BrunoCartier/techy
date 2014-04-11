var Techy = require('../lib/index');
var fs = require('fs');
var expect = require('expect.js');

var deleteFolderRecursive = function(path) {
	if(fs.existsSync(path)) {
		fs.readdirSync(path).forEach(function(file,index){
			var curPath = path + "/" + file;
			if(fs.lstatSync(curPath).isDirectory()) { // recurse
				deleteFolderRecursive(curPath);
			} else { // delete file
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
};

var compare = function(root, desc, asserts) {
	it(desc, function(done) {
		deleteFolderRecursive(root + '/public');
		deleteFolderRecursive(root + '/themes');
		Techy(root, 'empty', function() {
			var exprected = fs.readFileSync(root + '/expected.html').toString('utf8').replace(/(\r|\n)/g, '');
			var actual = fs.readFileSync(root + '/page.html').toString('utf8').replace(/(\r|\n)/g, '');
			expect(exprected).to.be(actual);
			if(asserts) {
				asserts(done);
			} else {
				done();
			}
		}, {noLogging: true});
		// done();
	});
	it("should have js and css compiled", function(done) {
		expect(fs.existsSync(root + '/themes/empty/public/scripts.js')).to.be.equal(true);
		expect(fs.existsSync(root + '/themes/empty/public/styles.css')).to.be.equal(true);
		done();
	});
}

describe("Techy testing", function() {
	compare(__dirname + "/md-to-html", "should compile markdown file to HTML");
	compare(__dirname + "/with-layout", "should use layout");
	compare(__dirname + "/set-get", "should use get and set");
	compare(__dirname + "/custom-templates", "should use custom templates");
	compare(__dirname + "/custom-layout", "should use custom layout");
	compare(__dirname + "/custom-method", "should use a custom method");
	compare(__dirname + "/num-of-pages", "should use numofpages method");
	compare(__dirname + "/using-path", "should use path method");
	compare(__dirname + "/access-page-by-name", "should get a page by name");
	compare(__dirname + "/master-config", "should use a master config");
	compare(__dirname + "/html-usage", "should use html");
	compare(__dirname + "/skip-node_modules", "should skip node_modules");
	compare(__dirname + "/linkto", "should use linkto");
	compare(__dirname + "/css_absurd", "should use Absurd", function(done) {
		var exprectedCSS = fs.readFileSync(__dirname + '/css_absurd/expected_styles.css').toString('utf8').replace(/(\r|\n)/g, '');
		var actualCSS = fs.readFileSync(__dirname + '/css_absurd/themes/empty/public/styles.css').toString('utf8').replace(/(\r|\n)/g, '');
		expect(exprectedCSS).to.be(actualCSS);
		done();
	});
	compare(__dirname + "/css_less", "should use LESS", function(done) {
		var exprectedCSS = fs.readFileSync(__dirname + '/css_less/expected_styles.css').toString('utf8').replace(/(\r|\n)/g, '');
		var actualCSS = fs.readFileSync(__dirname + '/css_less/themes/empty/public/styling.css').toString('utf8').replace(/(\r|\n)/g, '');
		expect(exprectedCSS).to.be(actualCSS);
		done();
	});
	compare(__dirname + "/css_sass", "should use SASS", function(done) {
		var exprectedCSS = fs.readFileSync(__dirname + '/css_sass/expected_styles.css').toString('utf8').replace(/(\r|\n)/g, '');
		var actualCSS = fs.readFileSync(__dirname + '/css_sass/themes/empty/public/styling.css').toString('utf8').replace(/(\r|\n)/g, '');
		expect(exprectedCSS).to.be(actualCSS);
		done();
	});
	compare(__dirname + "/css_css", "should use plain css", function(done) {
		var exprectedCSS = fs.readFileSync(__dirname + '/css_css/expected_styles.css').toString('utf8').replace(/(\r|\n)/g, '');
		var actualCSS = fs.readFileSync(__dirname + '/css_css/themes/empty/public/styles.css').toString('utf8').replace(/(\r|\n)/g, '');
		expect(exprectedCSS).to.be(actualCSS);
		done();
	});
	compare(__dirname + "/master-config-TechyFile.js", "should use a master config with TechyFile.js");
	compare(__dirname + "/using-yaml", "should use yaml");
});