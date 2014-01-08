define(function(require, exports, module) {
	var utils = require('./utils/utils');
	var $ = require('../bootstrap/js/bootstrap');
	var editor = {
		canvasWrap: $('#canvas_wrap'),
		animWrap: $('#anim_accordion'),
		animations: {},
		collapseTemplate: $('#anim_template').html(),
		init: function() {
			utils.loadImg([{
				src: "img/player3.png",
				id: "player"
			}, {
				src: "img/sky.png",
				id: "sky"
			}, {
				src: "img/ground.png",
				id: "ground"
			}, {
				src: "img/parallaxHill1.png",
				id: "hill"
			}, {
				src: "img/parallaxHill2.png",
				id: "hill1"
			}], this.onLoad, this);
			this.bindEvent();
		},
		format: function(str, data) {
			if (typeof str === 'string') {
				return str.replace(/\${(\w+)}/g, function(word, key, i, str) {
					return data[key];
				});
			}
		},
		createCollapse: function(title, parent) {
			var uid = 'collapse_' + new Date().getTime();
			var collapseHTML = this.format(this.collapseTemplate, {
				title: title || '',
				parent: parent || '',
				id: uid
			});
			var collapse = $(collapseHTML);
			return collapse;
		},
		bindEvent: function() {
			this.canvasWrap.delegate('canvas', 'click', function(e) {
				$(this).toggleClass('select');
			});
			$('#add_anim').click($.proxy(function(e) {
				console.log();
				e.preventDefault();
				var animName = $('#anim_name').val().trim();
				if (!animName) {
					return;
				}

				if (this.animations[animName]) {
					return;
				}
				this.animations[animName] = {};

				var collapse = this.createCollapse(animName, 'anim_accordion');
				this.animWrap.append(collapse);
			}, this));
		},
		onLoad: function(imgs) {
			return;
			var canvas = utils.img2Canvas(imgs.player);
			utils.dividedImage(canvas, function(i, rect, rawCanvas) {
				var one = utils.createCanvas(rect[2], rect[3]);
				$(one).attr('data-i', i);
				var oneCtx = one.getContext('2d');
				oneCtx.drawImage(rawCanvas, rect[0], rect[1], rect[2], rect[3], 0, 0, rect[2], rect[3]);
				this.canvasWrap.append(one);
			}, {
				minWidth: 40,
				context: this
			});
		}
	};

	return editor;
});