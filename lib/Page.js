var Entities = require('html-entities').XmlEntities;
var glob = require('glob');
var path = require('path');
var colors = require('colors');
var absurd = require('absurd')();
var path = require('path');
var fs = require("fs");
var marked = require('marked');

var entities = new Entities();

var Page = function() {

    var api = {
        root: '',
        theme: '',
        themeDir: '',
        info: {},
        title: 'Techy',
        layout: 'layouts/empty'
    };
    api.set = function(key, value) {
        this[key] = value;
        return this;
    };
    api.get = function(key) {
        return this[key];
    };
    api.build = function() {
        api.registerMethods();
        return this.template(this.get('layout'), this);
    };
    api.registerMethods = function() {
        var techyFiles = glob.sync(this.root + '/**/*.techy.js');
        for(var i=0; i<techyFiles.length; i++) {
            var f = require(techyFiles[i]);
            var name = path.basename(techyFiles[i]).replace('.techy.js', '');
            this[name] = f;
        }
        return this;
    };
    api.parser = function(content) {
        api.registerMethods();
        content = marked(content);
        content = content.replace(/<code>/g, '<code class="language-javascript">');
        var re = /@?techy\.(.+);/gm, str = content;
        while(match = re.exec(content)) {
            var code = match[0], src = match[0], result = '';
            code = code.replace('<p>', '').replace('</p>', '').replace('@techy', 'techy');
            code = entities.decode(code);
            code = 'var techy = this;return ' + code + ';';
            code = code.replace(/(\t|\r|\n|  )/g, '');
            try {
                var codeResult = new Function(code).apply(this);
                result = typeof codeResult === 'string' || typeof codeResult === 'number' ? codeResult : '';
            } catch(e) {
                result = src;
            }
            str = str.replace('<p>' + src + '</p>', result || '').replace(src, result || '');
        }
        // console.log('\n\n', page.build(str));
        this.set('content', str);
        return this;
    }

    return api;
}

module.exports = Page;