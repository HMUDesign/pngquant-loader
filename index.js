var assign = require('object-assign');
var loaderUtils = require('loader-utils');
var fs = require('fs');
var path = require('path');

var ExecBuffer = require('exec-buffer');
var pngquant = require('pngquant-bin');

module.exports = function(content) {
	this.cacheable && this.cacheable();
	
	var options = assign({
		optimizationLevel: 2,
		name: '[hash].[ext]',
	}, this.options.pngcompress, loaderUtils.parseQuery(this.query));
	
	var url = loaderUtils.interpolateName(this, options.name, {
		context: options.context,
		content: content,
		regExp: options.regExp,
	});
	
	var callback = this.async();
	
	fs.stat(path.join(this.options.output.path, url), function(err, stats) {
		if (!err && stats && stats.isFile()) {
			return callback(null, 'module.exports = __webpack_public_path__ + ' + JSON.stringify(url) + ';');
		}
		
		var execBuffer = new ExecBuffer();
		var args = [  ];
		
		execBuffer
			.use(pngquant, args.concat([ '--output', execBuffer.dest(), '--', execBuffer.src() ]))
			.run(content, function(err, content) {
				if (err) {
					return callback(err);
				}
				
				this.emitFile(url, content);
				
				return callback(null, 'module.exports = __webpack_public_path__ + ' + JSON.stringify(url) + ';');
			}.bind(this))
		;
	}.bind(this));
};

module.exports.raw = true;
