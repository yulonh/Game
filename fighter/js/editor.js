define(function(require, exports, module) {
    var utils = require('./utils/utils');
    var $ = require('../bootstrap/js/bootstrap');
    var editor = {
        canvasWrap: $('#canvas_wrap'),
        animWrap: $('#anim_wrap'),
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
        createAnim: function(name, frames) {
            var collapse = $('<div><canvas></div>');
            collapse.collapse({
                toggle: true
            });
            this.animWrap.append(collapse);
        },
        bindEvent: function() {
            this.canvasWrap.delegate('canvas', 'click', function(e) {
                $(this).toggleClass('select');
            });
            $('#add_anim').click($.proxy(function(e) {
                console.log();
                e.preventDefault();
                this.createAnim();
            }, this));
            $('#collapse').collapse({
                toggle: true
            });
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