#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var colors = require('colors');
var gulp = require('gulp');
var absurd = require('gulp-absurd');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var argv = require('minimist')(process.argv.slice(2));
var ncp = require('ncp').ncp;
var through2 = require('through2');
var GulpEnd = require('./GulpEnd');
var queue = require('./helpers/queue');
var less = require('gulp-less');
var sass = require('gulp-sass');

ncp.limit = 16;

var Techy = function(r, t, callback, noLogging) {

	var root = r || process.cwd();
	var rootTechy = __dirname;
	var theme = t || argv.theme || 'default';
	var overwrite = argv.forceUpdate;

	var api = {
		noLogging: noLogging,
		root: root,
		publicDir: '',
		rootTechy: rootTechy,
		theme: theme,
		themeDir: '',
		pages: [],
		init: function(cb) {
			// theme folder
			var copyThemeFolder = function() {
				this.copyFolder(this.rootTechy + '/themes', this.root + '/themes', function() {
					if(fs.existsSync(this.root + '/themes/' + theme)) {
						api.themeDir = this.root + '/themes/' + theme;
					} else if(fs.existsSync(this.rootTechy + '/themes/' + theme)) {
						this.themeDir = this.rootTechy + '/themes/' + theme;
					} else {
						throw new Error('Techy: there is no theme with name \'' + theme + '\'!');
						return;
					}
					this.publicDir = this.themeDir + '/public';
					cb();
				}.bind(this));
			}
			copyThemeFolder.apply(this);
			return this;
		},
		copyFolder: function(source, destination, cb) {
			if(fs.existsSync(destination) && !overwrite) {
				cb();
				return;
			}
			var self = this;
			ncp(source, destination, function (err) {
	            if(err === null) {
	            	cb.apply(self);
	        	} else {
	        		throw new Error('Techy: I can\'t copy ' + source + ' folder!');
	        	}
	        });
		},
		compilePages: function(cb) {
			gulp.src(root + '/**/*.md').pipe(Factory.gulp()).pipe(GulpEnd(cb));
			return this;
		},
		compilePage: function(src, cb) {
			gulp.src(src).pipe(Factory.gulp()).pipe(GulpEnd(cb));
			return this;
		},
		compileCSS: function(cb) {

			var preprocessor = 'absurd', index = this.themeDir + '/css/styles.js';
			if(api.masterConfig.css) {
				preprocessor = api.masterConfig.css.preprocessor || preprocessor;
				index = api.masterConfig.css.index ? this.root + '/' + api.masterConfig.css.index : index;
			}

			switch(preprocessor) {
				case 'less':
					gulp.src(index)
				    .pipe(less({
						paths: [ path.join(__dirname, 'less', 'includes') ]
					}))
				    .pipe(gulp.dest(this.publicDir))
				    .pipe(GulpEnd(cb));
				break;
				case 'sass':
					gulp.src(index)
				    .pipe(sass())
				    .pipe(gulp.dest(this.publicDir))
				    .pipe(GulpEnd(cb));
				break;
				case 'absurd':
					gulp.src(index)
				    .pipe(absurd({
				        minify: true,
				        combineSelectors: false
				    }))
				    .pipe(gulp.dest(this.publicDir))
				    .pipe(GulpEnd(cb));
				break;
				case 'none':
					gulp.src(index)
				    .pipe(concat('styles.css'))
				    .pipe(gulp.dest(this.publicDir))
				    .pipe(GulpEnd(cb));
				break;
			}

		    !noLogging ? console.log('+ ' + 'CSS'.green + ' compiled') : null;
		    return this;
		},
		compileJS: function(cb) {
			gulp.src(this.themeDir + '/js/**/*.js')
			// .pipe(uglify())
			.pipe(concat('scripts.js'))
			// .pipe(jshint())
			// .pipe(jshint.reporter('default'))
			.pipe(gulp.dest(this.publicDir))
			.pipe(GulpEnd(cb));
			!noLogging ? console.log('+ ' + 'JavaScript'.green + ' compiled') : null;
		    return this;
		},
		watchFiles: function() {
			gulp.watch([root + '/**/*.md'], function(event) {
				this.compilePage(event.path);
			}.bind(this));
			gulp.watch([this.themeDir + '/css/**/*.js'], function(event) {
				this.compileCSS();
			}.bind(this));
			gulp.watch([this.themeDir + '/js/**/*.js'], function(event) {
				this.compileJS();
			}.bind(this));
			gulp.watch([this.themeDir + '/tpl/**/*.html'], function(event) {
				this.compilePages();
			}.bind(this));
			console.log('Techy is listening for changes!'.green);
			return this;
		}
	}

	// setting master config
	if(fs.existsSync(root + '/Techy.js')) {
		api.masterConfig = require(root + '/Techy.js')();
	} else if(fs.existsSync(root + '/TechyFile.js')) {
		api.masterConfig = require(root + '/TechyFile.js')();
	} else {
		api.masterConfig = {};
	}

	var Factory = require('./Factory')(api);

	queue([
		api.init,
		api.compileCSS,
		api.compileJS,
		api.compilePages,
		callback || function() {}
	], api);
	
	return api;
}

module.exports = Techy;

if(!module.parent) {
	Techy(false, false, function() {
		this.watchFiles();
	});
}