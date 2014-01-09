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
			jqueryUI(collapse.find('input[name="speed"]')[0]).spinner({
				max: 100,
				min: 1,
				create: function(e, ui) {
					$(e.target).attr('data-anim', title).val(1);
				},
				change: $.proxy(function(e, ui) {
					var input = $(e.target);
					var anim = input.attr('data-anim');
					this.animations[anim].speed = parseInt(input.val());
				}, this)
			});

			collapse.find('select[name="next"]').attr('data-anim', title).change($.proxy(function(e) {
				var input = $(e.target);
				var anim = input.attr('data-anim');
				this.animations[anim].next = input.val()
			}, this));

			return collapse;
		},
		getSelectedFrameIndex: function() {
			var selectedIndexArray = [];
			$('#canvas_wrap .ui-selected').each(function() {
				selectedIndexArray.push($(this).attr('data-i'));
			});
			return selectedIndexArray;
		},
		getEditingAnimPanel: function() {
			return this.animWrap.find('.panel-collapse.in').parent();
		},
		bindEvent: function() {
			jqueryUI('#canvas_wrap').selectable({
				start: function(event, ui) {},
				selecting: function(event, ui) {
					$(ui).addClass('btn-primary');
				},
				selected: function(event, ui) {
					$(ui).addClass('active');
				},
				stop: $.proxy(function(e) {
					var selectedArray = [];
					$(".ui-selected", e.target).each(function() {
						selectedArray.push($(this).attr('data-i'));
					});
					var animPanel = this.getEditingAnimPanel();
					if (animPanel.length) {
						var animName = animPanel.find('input[name="name"]').val().trim();
						this.animations[animName].frames = selectedArray;
						animPanel.find('input[name="frames"]').val(selectedArray.join(','));
					}
				}, this)
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
				this.animations[animName] = {};
				var collapse = this.createCollapse(animName, 'anim_accordion');
				this.animWrap.append(collapse);
				this.updateAnimSelect();

				this.animations[animName] = {
					frames: [],
					next: collapse.find('selct[name="next"]').val(),
					speed: collapse.find('input[name="speed"]').val()
				};

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
				$(one).addClass('ui-selectee').attr('data-i', i);
				this.canvasWrap.append(one);
			}, {
				minWidth: 40,
				minHeight: 40,
				context: this
			});
		}
	};

	return editor;
});