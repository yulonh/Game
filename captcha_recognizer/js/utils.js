define(function(require, exports, module) {
	var doc = document;
	return {
		debug: false,
		img2SpriteSheet: function(image) {
			var canvas = doc.createElement("canvas");
			canvas.width = image.width;
			canvas.height = image.height;
			context = canvas.getContext('2d');
			context.drawImage(image, 0, 0);
			context.font = "2px Georgia"

			var imgData = context.getImageData(0, 0, canvas.width, canvas.height);
			var data = imgData.data;

			var bgColor = [data[0], data[1], data[2], data[3]];
			var frames = [],
				anims = {},
				startFrame = 0;

			var lineBgPointCount = 0,
				findBgLine = false,
				w = canvas.width,
				h = canvas.height,
				yStart = 0,
				xEnd = null,
				xStart = null,
				animIndex = 0,
				curAnimFrames = [];

			for (var y = 0; y < h; y++) { // 竖向扫描
				lineBgPointCount = 0; // 找到的背景颜色点数
				for (var x = 0; x < w; x++) {
					var i = (y * w + x) * 4;
					var isBgPoint = (data[i] === bgColor[0] && data[i + 1] === bgColor[1] && data[i + 2] === bgColor[2] && data[i + 3] === bgColor[3]);
					if (yStart) { // 已找到开始y坐标，找结束y坐标
						if (isBgPoint) {
							lineBgPointCount++;
						} else {
							break;
						}
					} else if (!isBgPoint) { //找到开始坐标
						yStart = y;
					}
				}

				if (yStart && lineBgPointCount == w) { //找到结束y坐标
					xStart = null, xEnd = null;
					var _height = y - yStart;
					for (var x = 0; x < w; x++) {
						lineBgPointCount = 0;

						for (var y1 = yStart; y1 < y; y1++) {
							var i = (y1 * w + x) * 4;
							var isBgPoint = (data[i] === bgColor[0] && data[i + 1] === bgColor[1] && data[i + 2] === bgColor[2] && data[i + 3] === bgColor[3]);


							if (xStart !== null) { // 已找到开始x坐标，找结束x坐标
								if (isBgPoint) {
									lineBgPointCount++;
									data[i + 3] = 0 // 使背景色透明
								}
							} else if (!isBgPoint) { //找到开始x坐标
								xStart = x + 1;
								x--;
								break;
							}
						};

						if (xStart && lineBgPointCount == _height) { //找到结束x坐标
							xEnd = x;
							var _width = xEnd - xStart;
							if (_width > 30 && _height > 30) {
								frames.push([xStart, yStart, _width, _height, 0, _width / 2]);
								//context.fillText(frames.length - 1, xStart, yStart - 5);
								//context.putImageData(imgData, 0, 0, xStart - 1, yStart, _width, _height);
							}
							xStart = null;
						}
					};
					// add a named animation using the frame index:
					anims["anim_" + animIndex] = [startFrame, frames.length - 1, 'anim_3'];
					startFrame = frames.length;
					animIndex++;
					yStart = 0;
				}
			}

			context.putImageData(imgData, 0, 0);

			return {
				images: [canvas],
				frames: frames,
				animations: anims
			};
		},
		chaceImage: function() {
			// var url = canvas.toDataURL();
			// var newImg = document.createElement("img");
			// newImg.src = url;
			// $('html').html(newImg);

			// var image = canvas.toDataURL("image/png");
			// var w = window.open('about:blank', 'image from canvas');
			// w.document.write("<img src='" + image + "' alt='from canvas'/>");

			// here is the most important part because if you dont replace you will get a DOM 18 exception. 
			var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream;Content-Disposition:attachment;filename=foobar.png");
			//var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
			//location.href = image; // it will save locally 
			//$('html').html();
			$('#download').attr('href', image);
		},
		createCanvas: function(width, height) {
			var canvas = doc.createElement('canvas');
			canvas.width = width || 200;
			canvas.height = height || 200;
			return canvas;
		},
		createTemplate: function(width, height, string, fontFamily) {
			string = string || '0123456789';
			fontFamily = fontFamily || '微软雅黑';
			var size = string.length;
			var tplString = [].join.apply(string, [' ']);

			var rawWidth = 40 * size,
				rawHeight = 50,
				fontSize = 30;

			var cache = this.createCanvas(rawWidth, rawHeight),
				tplCanvas = this.createCanvas(width * 10, height);
			var ctx = cache.getContext('2d'),
				tplCtx = tplCanvas.getContext('2d');

			ctx.fillStyle = "#CCCCCC";
			ctx.fillRect(0, 0, rawWidth, rawHeight);

			ctx.font = '30px ' + fontFamily;
			ctx.textBaseline = 'top';
			ctx.fillStyle = "#333333";
			ctx.fillText(tplString, 5, 0);
			//this.debug && document.body.appendChild(cache);
			this.debug && document.body.appendChild(tplCanvas);
			//灰度处理
			this.processToGrayImage(cache);
			//二值化
			this.OTSUAlgorithm(cache);
			//
			var rects = this.dividedImage(cache);
			var len = rects.length;
			for (var i = 0; i < len; i++) {
				var rect = rects[i];
				tplCtx.drawImage(cache, rect[0], rect[1], rect[2], rect[3], width * i, 0, width, height);
			};

			return tplCanvas;
		},
		textRecognizer: function(image, range, minWidth, minHeight, fontFamily) {
			var doc = document;
			var canvas = doc.createElement('canvas');
			canvas.height = image.height;
			canvas.width = image.width;
			doc.body.appendChild(canvas);
			var context = canvas.getContext('2d');
			context.drawImage(image, 0, 0);
			//灰度处理
			this.processToGrayImage(canvas);
			//二值化
			this.OTSUAlgorithm(canvas);
			//切割
			var fontRects = this.dividedImage(canvas, minWidth, minHeight);
			var len = fontRects.length,
				imgData = null,
				result = '';

			for (var i = 0; i < len; i++) {
				rect = fontRects[i];
				imgData = context.getImageData(rect[0], rect[1], rect[2], rect[3]);
				result += this.oneRecognizer(imgData, range);
			};

			return result;
		},
		oneRecognizer: function(imgData, range) {
			range = range || '0123456789';
			//获取模版
			var w = imgData.width,
				h = imgData.height,
				data = imgData.data,
				i = 0,
				max = 0,
				similar = 0,
				result = 0
				len = range.length;
			var tpl = this.createTemplate(imgData.width, imgData.height, range);
			var tplCtx = tpl.getContext('2d');
			//计算相似值
			for (var n = 0; n < len; n++) {
				similar = 0;
				tplData = tplCtx.getImageData(w * n, 0, w, h).data;
				for (var x = 0; x < w; x++) {
					for (var y = 0; y < h; y++) {
						i = (y * w + x) * 4;
						if (data[i] === tplData[i]) {
							similar++;
						}
					};
				};
				if (similar > max) {
					max = similar;
					result = n;
				}
			};
			//console.log(result);
			return range[result];
		},
		calculateGrayValue: function(rValue, gValue, bValue) {
			return parseInt(rValue * 0.299 + gValue * 0.587 + bValue * 0.114);
		},
		//彩色图像灰度化
		processToGrayImage: function(canvas) {
			var ctx = canvas.getContext('2d');
			//取得图像数据
			var canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			//这个循环是取得图像的每一个点，在计算灰度后将灰度设置给原图像
			for (var x = 0; x < canvasData.width; x++) {
				for (var y = 0; y < canvasData.height; y++) {
					// Index of the pixel in the array
					var idx = (x + y * canvas.width) * 4;
					// The RGB values
					var r = canvasData.data[idx + 0];
					var g = canvasData.data[idx + 1];
					var b = canvasData.data[idx + 2];
					//更新图像数据
					var gray = this.calculateGrayValue(r, g, b);
					canvasData.data[idx + 0] = gray;
					canvasData.data[idx + 1] = gray;
					canvasData.data[idx + 2] = gray;
					canvasData.data[idx + 3] = 255;
				}
			}
			ctx.putImageData(canvasData, 0, 0);

			return canvas;
		},
		//一维OTSU图像处理算法
		OTSUAlgorithm: function(canvas) {
			var context = canvas.getContext('2d');
			var m_pFstdHistogram = new Array(); //表示灰度值的分布点概率
			var m_pFGrayAccu = new Array(); //其中每一个值等于m_pFstdHistogram中从0到当前下标值的和
			var m_pFGrayAve = new Array(); //其中每一值等于m_pFstdHistogram中从0到当前指定下标值*对应的下标之和
			var m_pAverage = 0; //值为m_pFstdHistogram【256】中每一点的分布概率*当前下标之和
			var m_pHistogram = new Array(); //灰度直方图
			var i, j;
			var temp = 0,
				fMax = 0; //定义一个临时变量和一个最大类间方差的值
			var nThresh = 0; //最优阀值

			//初始化各项参数
			for (i = 0; i < 256; i++) {
				m_pFstdHistogram[i] = 0;
				m_pFGrayAccu[i] = 0;
				m_pFGrayAve[i] = 0;
				m_pHistogram[i] = 0;
			}
			//获取图像信息
			var canvasData = context.getImageData(0, 0, canvas.width, canvas.height);
			//获取图像的像素
			var pixels = canvasData.data;
			//下面统计图像的灰度分布信息
			for (i = 0; i < pixels.length; i += 4) {
				//获取r的像素值，因为灰度图像，r=g=b，所以取第一个即可
				var r = pixels[i];
				m_pHistogram[r]++;
			}
			//下面计算每一个灰度点在图像中出现的概率
			var size = canvasData.width * canvasData.height;
			for (i = 0; i < 256; i++) {
				m_pFstdHistogram[i] = m_pHistogram[i] / size;
			}
			//下面开始计算m_pFGrayAccu和m_pFGrayAve和m_pAverage的值
			for (i = 0; i < 256; i++) {
				for (j = 0; j <= i; j++) {
					//计算m_pFGaryAccu[256]
					m_pFGrayAccu[i] += m_pFstdHistogram[j];
					//计算m_pFGrayAve[256]
					m_pFGrayAve[i] += j * m_pFstdHistogram[j];
				}
				//计算平均值
				m_pAverage += i * m_pFstdHistogram[i];
			}
			//下面开始就算OSTU的值，从0-255个值中分别计算ostu并寻找出最大值作为分割阀值
			for (i = 0; i < 256; i++) {
				temp = (m_pAverage * m_pFGrayAccu[i] - m_pFGrayAve[i]) * (m_pAverage * m_pFGrayAccu[i] - m_pFGrayAve[i]) / (m_pFGrayAccu[i] * (1 - m_pFGrayAccu[i]));
				if (temp > fMax) {
					fMax = temp;
					nThresh = i;
				}
			}
			//下面执行二值化过程 
			for (i = 0; i < canvasData.width; i++) {
				for (j = 0; j < canvasData.height; j++) {
					//取得每一点的位置
					var ids = (i + j * canvasData.width) * 4;
					//取得像素的R分量的值
					var r = canvasData.data[ids];
					//与阀值进行比较，如果小于阀值，那么将改点置为0，否则置为255
					var gray = r > nThresh ? 255 : 0;
					canvasData.data[ids + 0] = gray;
					canvasData.data[ids + 1] = gray;
					canvasData.data[ids + 2] = gray;
					//canvasData.data[ids + 3] = 255;
				}
			}
			//显示二值化图像
			context.putImageData(canvasData, 0, 0);
		},
		//下面对灰度图像进行处理，将目标信息分割出来
		dividedImage: function(canvas, minWidth, minHeight) {
			minWidth = minWidth || 0;
			minHeight = minHeight || 0;
			context = canvas.getContext('2d');

			var imgData = context.getImageData(0, 0, canvas.width, canvas.height);
			var data = imgData.data;

			var bgColor = [data[0], data[1], data[2], data[3]];

			var frames = [],
				anims = {},
				startFrame = 0;

			var lineBgPointCount = 0,
				findBgLine = false,
				w = canvas.width,
				h = canvas.height,
				yStart = 0,
				xEnd = null,
				xStart = null;

			for (var y = 0; y < h; y++) { // 竖向扫描
				lineBgPointCount = 0; // 找到的背景颜色点数
				for (var x = 0; x < w; x++) {
					var i = (y * w + x) * 4;
					var isBgPoint = (data[i] === bgColor[0] && data[i + 1] === bgColor[1] && data[i + 2] === bgColor[2]);
					if (yStart) { // 已找到开始y坐标，找结束y坐标
						if (isBgPoint) {
							lineBgPointCount++;
						} else {
							break;
						}
					} else if (!isBgPoint) { //找到开始坐标
						yStart = y;
					}
				}

				if (yStart && lineBgPointCount == w) { //找到结束y坐标
					xStart = null, xEnd = null;
					var _height = y - yStart;
					for (var x = 0; x < w; x++) {
						lineBgPointCount = 0;

						for (var y1 = yStart; y1 < y; y1++) {
							var i = (y1 * w + x) * 4;
							var isBgPoint = (data[i] === bgColor[0] && data[i + 1] === bgColor[1] && data[i + 2] === bgColor[2]);


							if (xStart !== null) { // 已找到开始x坐标，找结束x坐标
								if (isBgPoint) {
									lineBgPointCount++;
									//data[i + 3] = 0 // 使背景色透明
								}
							} else if (!isBgPoint) { //找到开始x坐标
								xStart = x;
								//x--;
								break;
							}
						};

						if (xStart && lineBgPointCount == _height) { //找到结束x坐标
							xEnd = x;
							var _width = xEnd - xStart;
							if (_width > minWidth && _height > minHeight) {
								frames.push([xStart, yStart, _width, _height, 0, _width / 2]);
							}
							xStart = null;
						}
					};
					yStart = 0;
				}
			}
			context.putImageData(imgData, 0, 0);
			//console.log(frames);
			return frames;
		}
	};
});