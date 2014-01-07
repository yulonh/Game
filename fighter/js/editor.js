define(function(require, exports, module) {
	var utils = require('./utils/utils');
	var $ = require('./jquery/jquery-debug');
	var editor = {
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
		},
		onLoad: function(imgs) {
			var canvas = utils.img2Canvas(imgs.player);
			utils.dividedImage(canvas, function(i, rect, rawCanvas) {
				var one = utils.createCanvas(rect[2], rect[3]);
				var oneCtx = one.getContext('2d');
				oneCtx.drawImage(rawCanvas, rect[0], rect[1], rect[2], rect[3], 0, 0, rect[2], rect[3]);
				document.body.appendChild(one);
			}, {
				minWidth: 40
			});
		}
	};

	return editor;
});