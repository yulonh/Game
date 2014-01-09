define(function(require, exports, module) {
    var Stage = createjs.Stage,
        SpriteSheet = createjs.SpriteSheet,
        Sprite = createjs.Sprite,
        Ticker = createjs.Ticker;

    var utils = require('./utils/utils');
    var $ = require('../bootstrap/js/bootstrap');
    var jqueryUI = require('../jquery-ui/js/jquery-ui-1.10.3.custom.min');
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
        getSelectedFrameIndex: function() {
            var selectedIndexArray = [];
            $('#canvas_wrap a.active').each(function() {
                selectedIndexArray.push($(this).attr('data-i'));
            });
            return selectedIndexArray;
        },
        bindEvent: function() {
            jqueryUI('#canvas_wrap').selectable({
                stop: function() {
                    $(".ui-selected", this).each(function() {
                        var index = $("#selectable li").index(this);
                    });
                }
            });

            //添加动画
            $('#add_anim').click($.proxy(function(e) {
                e.preventDefault();
                var animName = $('#anim_name').val().trim();
                if (!animName) {
                    return;
                }

                if (this.animations[animName]) {
                    return;
                }

                this.animations[animName] = {
                    frames: []
                };

                var collapse = this.createCollapse(animName, 'anim_accordion');
                this.animWrap.append(collapse);

                this.updateAnimSelect();
            }, this));

            //添加动画帧
            $('#anim_accordion').delegate('div.panel-default', 'click', $.proxy(function(e) {
                e.preventDefault();
                var animPanel = $(e.currentTarget);
                var btn = $(e.target);
                var animName = animPanel.find('input[name="name"]').val();

                console.log(e.target);

                var action = btn.attr('action'),
                    selectedIndexs;

                if (!action) {
                    return;
                }

                switch (action) {
                    case 'add_frame':
                        selectedIndexs = this.getSelectedFrameIndex();
                        this.animations[animName].frames = selectedIndexs;
                        animPanel.find('input[name="frames"]').val(this.animations[animName].frames.join(','));
                        break;
                    case 'preview':
                        var stageCanvas = utils.createCanvas(200, 200);
                        var previewPanel = $(btn.attr('href'));
                        previewPanel.html(stageCanvas);
                        this.createPreview(animName, stageCanvas)
                        break;
                }
            }, this));
        },
        updateAnimSelect: function() {
            var options = [];
            for (var anim in this.animations) {
                if (this.animations.hasOwnProperty(anim)) {
                    options.push('<option>' + anim + '</option>');
                }
            };
            $('select[name="next"]').html(options.join('\n'));
        },
        createPreview: function(animName, canvas) {
            //var stageCanvas = utils.createCanvas(290, 290);
            this.spriteSheetData.animations = this.animations;
            var stage = new Stage(canvas);
            var spriteSheet = new SpriteSheet(this.spriteSheetData);
            var sprite = new Sprite(spriteSheet, animName);
            sprite.x = 50;
            sprite.y = 200;
            stage.addChild(sprite);
            Ticker.addEventListener('tick', stage);
        },
        onLoad: function(imgs) {
            //return;
            this.spriteSheetData = utils.img2SpriteSheet(imgs.player, function(i, rect, rawCanvas) {
                var one = utils.createCanvas(rect[2], rect[3]);
                var oneCtx = one.getContext('2d');
                oneCtx.drawImage(rawCanvas, rect[0], rect[1], rect[2], rect[3], 0, 0, rect[2], rect[3]);
                var oneWrap = $('<a class="btn btn-default"></a>').attr('data-i', i);
                oneWrap.append(one);
                this.canvasWrap.append(oneWrap);
            }, {
                minWidth: 40,
                minHeight: 40,
                context: this
            });
        }
    };

    return editor;
});