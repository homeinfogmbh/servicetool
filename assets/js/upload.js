class Upload {
	constructor(selector, maximages = null) {
		this.selector = selector;
		this.maximages = maximages;
		this.fileList = [];
		this.blackboardsize = {'A3':{'width':1256,'height':842},'A4':{'width':595,'height':842},'A5':{'width':595,'height':399},'A6':{'width':283,'height':399},'A7':{'width':283,'height':189}};
		this.selector.css({'border': '2px solid #a2a2a2', 'min-height': '100px', 'width':'100%', 'padding': '5px'});
		this.selector.html("<div id='upload_error'></div>Hierher ziehen oder <input type='file' id='input' multiple style='display:none'>" +
		"<button class='btn btn-primary btn_input no_drag'><i class='fa fa-folder-open no_drag'></i> auswählen</button><br><br> " +
		"<ul id='upload_thumbnail' style='list-style-type: none; margin: 0; padding: 0;'></ul>" +
		'<div class="progress" style="height:1px; width:100%; display:none"><div class="progress-bar" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div></div>' +
		"<canvas id='canvas' style='display:none' width='723px'></canvas>");
		this.images = [];
		this.bootboxLoaded = null;
		var thisobject = this;
		this.selector.find('#input').get(0).addEventListener("change", function(evt) {
			evt.stopPropagation();
			evt.preventDefault();
			thisobject.drop(this.files);
		}, false);
		this.selector.get(0).addEventListener('dragover', function(evt) {
			evt.stopPropagation();
			evt.preventDefault();
			evt.dataTransfer.dropEffect = 'copy'; 
			try { thisobject.selector.css({'border': '2px solid green'}); } catch(err) { }
		}, false);
		this.selector.get(0).addEventListener('dragleave', function(evt) {
			evt.stopPropagation();
			evt.preventDefault();
			try { thisobject.selector.css({'border': '2px solid #a2a2a2'}); } catch(err) { }
		}, false);
		this.selector.get(0).addEventListener('drop', function(evt) {
			evt.stopPropagation();
			evt.preventDefault();
			thisobject.drop(evt.dataTransfer.files);
		}, false);
		
		// Prevent browser outside the field from loading a drag-and-dropped file
		window.addEventListener("dragenter", function(e) {
			e.preventDefault();
			e.dataTransfer.effectAllowed = "none";
			e.dataTransfer.dropEffect = "none";
		}, false);
		window.addEventListener("dragover", function(e) {
			e.preventDefault();
			e.dataTransfer.effectAllowed = "none";
			e.dataTransfer.dropEffect = "none";
		});
		window.addEventListener("drop", function(e) {
			e.preventDefault();
			e.dataTransfer.effectAllowed = "none";
			e.dataTransfer.dropEffect = "none";
		});
		window.addEventListener("paste", function(e) {
			$('.progress').hide();
			thisobject.retrieveImageFromClipboardAsBlob(e, function(file) {
				if (file) {
					var canvas = document.getElementById("canvas");
					var ctx = canvas.getContext('2d');
					var img = new Image();
					img.onload = function() {
						canvas.width = this.width;
						canvas.height = this.height;
						ctx.drawImage(img, 0, 0);
						var imgdata = canvas.toDataURL('image/png');
						thisobject.selector.find('#upload_thumbnail').append('<li class="ui-state-default" data-id="' + thisobject.fileList.length + '" style="cursor:move" title="Reihenfolge verändern"><div class="thumb">' +
							'<img src="' + imgdata + '" style="max-width:200px; max-height:150px; border:2px solid transparent;" title="' + file.name + ' (' + (file.size/1024).toFixed(2) + 'kb)">' + 
							'<i class="fa fa-rotate-right btn_rotate pointer" data-id="' + thisobject.fileList.length + '" style="font-size:20px; color:#fff; margin:10px -30px; vertical-align: top; text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black; display:none" title="Bild drehen"></i>' +
							'<i class="fa fa-trash-o btn_delete_image pointer no_drag" data-id="' + thisobject.fileList.length + '" style="font-size:20px; color:#fff; margin:10px 10px; vertical-align: bottom; text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black; display:none" title="Bild löschen"></i>' + 
							//'<i class="fa fa-trash-o btn_delete_image pointer no_drag" data-id="' + thisobject.fileList.length + '" style="font-size:20px; color:#fff; margin:10px -30px; vertical-align: bottom; text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black; display:none" title="Bild löschen"></i>' +
							'<span class="ui-icon ui-icon-arrowthick-2-n-s" title="Reihenfolge verändern"></span>' +
							'</div></li>');
						thisobject.fileList.push({'file': file, 'state':'toAdd', 'format':'A4', 'index':thisobject.fileList.length, 'name':file.name.substr(0, file.name.indexOf('.')), 'img':img});
						thisobject.setButtons();					
					};
					var URLObj = window.URL || window.webkitURL;
					img.src = URLObj.createObjectURL(file);
				}
			});
		}, false);
		this.selector.find($('.btn_input')).click(function() {
			$(this).parent().find("#input").trigger("click");
		});
	}

	drop(fileUploadList) {
		this.fileList = [];
		holdSession();
		$('.progress').hide();
		var thisobject = this;
		thisobject.selector.find('#upload_error').html('');
		try { thisobject.selector.css({'border': '2px solid #a2a2a2'}); } catch(err) { }
		// Permissions
		for (var i = 0, f; f = fileUploadList[i]; i++) {
			if (f.size > 524288000) { // 500mb
				thisobject.selector.find('#upload_error').html('<font style="color:red; font-size:16px">' + f.name + ' ist zu groß (max. 500mb).</font>');
				continue;
/*Charts*/	} else if (typeof _chartType !== 'undefined') {
				if ((!f.type.match('image.*') && !f.type.match('application/pdf') && _chartType !== 'Video') || (!f.type.match('video.*') && _chartType === 'Video') || (f.type.match('application/pdf') && (_chartType === 'RealEstates' || _chartType === 'Weather'))) {
					thisobject.selector.find('#upload_error').html('<font style="color:red; font-size:16px"><b>' + f.name + '</b> ist nicht zulässig.</font>');
					continue;
				} else if (thisobject.fileList.length >= 1 && _chartType === 'Video') {
					var videoCounter = 0;
					for (var count in thisobject.fileList) {
						if (thisobject.fileList[count].state !== "toDelete" && thisobject.fileList[count].state !== "deleted")
							videoCounter++;
					}
					if (videoCounter > 0) {
						thisobject.selector.find('#upload_error').html('<font style="color:red; font-size:16px">Es ist nur <b>ein</b> Video zulässig.</font>');
						continue;
					}
				}
			} else if (!f.type.match('image.*') && !f.type.match('application/pdf') && !f.type.match('application/x-shockwave-flash')) {
				thisobject.selector.find('#upload_error').html('<font style="color:red; font-size:16px"><b>' + f.name + '</b> ist nicht zulässig.</font>');
				continue;
/*conf*/	} else if (thisobject.maximages !== null) {
				var imagescounter = 0;
				for (var file in thisobject.fileList){
					if (thisobject.fileList[file].state !== 'deleted' && thisobject.fileList[file].state !== 'toDelete')
						imagescounter++;
				}
				if (i+imagescounter >= thisobject.maximages) {
					thisobject.selector.find('#upload_error').html('<font style="color:red; font-size:16px"><b>' + f.name + '</b> ist nicht zulässig, da nur <b>ein</b> Bild erlaubt ist.</font>');
					continue;
				}
/*menu*/	} if (typeof _type !== 'undefined' && (_type === 'MENU' || _type === 'CONFIGURATION') && f.type.match('application/pdf')) {
				thisobject.selector.find('#upload_error').html('<font style="color:red; font-size:16px"><b>PDF</b> ist nicht zulässig.</font>');
				continue;
			}
			
			// Create thumbnails
			var reader = new FileReader();
			reader.onload = (function(file) {
				return function(e) {	
					if (file.type.match('video.*')) {
						thisobject.selector.find('#upload_thumbnail').append('<div class="thumb">' +
						((file.size > 104857600 /*100mb*/) ?'<span class="fa fa-file-video-o" style="font-size:120px;" title="Video wird beim erneuten Laden des Charts angezeigt."></span>' :
							'<video src="' + e.target.result + '" height="300" style="max-width:400px; max-height:350px; border:2px solid transparent;" title="' + file.name + ' (' + (file.size/1024).toFixed(2) + 'kb)" preload="metadata" controls muted>Ihr Browser kann dieses Video nicht wiedergeben.<br/></video>') + 
							'<i class="fa fa-trash-o btn_delete_image pointer" data-id="' + thisobject.fileList.length + '" style="font-size:20px; color:#ff0000; margin:10px 5px; vertical-align: top; text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black; display:none" title="Video löschen"></i>' +
						'</div>')
					} else if (file.type.match('image.*')) {
						thisobject.selector.find('#upload_thumbnail').append('<li class="ui-state-default" data-id="' + thisobject.fileList.length + '" style="cursor:move" title="Reihenfolge verändern"><div class="thumb">' +
							'<img src="' + e.target.result + '" style="max-width:200px; max-height:150px; border:2px solid transparent;" title="' + file.name + ' (' + (file.size/1024).toFixed(2) + 'kb)">' + 
							'<i class="fa fa-rotate-right btn_rotate pointer" data-id="' + thisobject.fileList.length + '" style="font-size:20px; color:#fff; margin:10px -30px; vertical-align: top; text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black; display:none" title="Bild drehen"></i>' +
							'<i class="fa fa-trash-o btn_delete_image pointer" data-id="' + thisobject.fileList.length + '" style="font-size:20px; color:#fff; margin:10px 10px; vertical-align: bottom; text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black; display:none" title="Bild löschen"></i>' + 
							'<span class="ui-icon ui-icon-arrowthick-2-n-s" title="Reihenfolge verändern"></span>' + 
						'</div></li>');
					} else if (file.type.match('application/pdf')) {
						try {
							if (typeof _chartType !== 'undefined' && _chartType === 'Blackboard')
								$('#canvas').attr('width', thisobject.blackboardsize['A4'].width + 'px');
							if ($('.appmenuitem[data-menu="documents"]').is(':checked') === true) { // In chart if mobile-menu 'documents' is selected
								thisobject.selector.find('#upload_thumbnail').append('<li class="ui-state-default" data-id="' + thisobject.fileList.length + '" style="cursor:move" title="Reihenfolge verändern"><div class="thumb">' +
									//'<iframe src="' + e.target.result + '" style="max-width:200px; max-height:150px; border:2px solid transparent;" title="' + file.name + ' (' + (file.size/1024).toFixed(2) + 'kb)">PDF-Datei wird geladen</iframe>' +
									'<span class="fa fa-file-pdf-o" style="font-size:120px;" title="' + file.name + ' (' + (file.size/1024).toFixed(2) + 'kb)"></span>' +
									'<i class="fa fa-trash-o btn_delete_image pointer" data-id="' + thisobject.fileList.length + '" style="font-size:20px; color:#fff; margin:10px -30px; vertical-align:bottom; text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black; display:none" title="PDF löschen"></i>' +
									'<span class="ui-icon ui-icon-arrowthick-2-n-s" title="Reihenfolge verändern" style="margin:10px"></span>');
									thisobject.fileList.push({'file': file, 'state':'toAdd', 'format':'A4', 'index':thisobject.fileList.length, 'name':file.name.substr(0, file.name.indexOf('.')), 'img':img});
							} else
								thisobject.convertToImage(reader, file);
						} catch (err) {
							console.log(err)
							thisobject.selector.find('#upload_error').html('<font style="color:red; font-size:16px">Wählen Sie die PDFs bitte nacheinander aus.</font>')
						}
					} else if (file.type.match('application/x-shockwave-flash')) {
						thisobject.selector.find('#upload_thumbnail').append('<div class="thumb"><i class="fa fa-file-video-o" style="font-size:80px"></i></div>')
					}
					if (file.type.match('image.*') || file.type.match('svg')) {
						// Rerender file
						var img = new Image();
						img.onload = function() {
							if (img.width > 1920 || img.height > 1080) {
								var canvas = document.getElementById('canvas');
								var context = canvas.getContext('2d');
								var k = 1920 / 1080;
								if (img.width * k > img.height) // Fill whole stage; "if (img.width * k < img.height)": show whole image
									k = 1920 / img.width;
								else
									k = 1080 / img.height;
								canvas.width = img.width * k;
								canvas.height = img.height * k;
								context.drawImage(img, 0, 0, canvas.width, canvas.height);
								var imgfile = thisobject.dataURLtoFile(canvas.toDataURL('image/png'));
								imgfile.name = file.name.substr(0, file.name.length-4) + '.png';
								thisobject.fileList.push({'file': imgfile, 'state':'toAdd', 'format':'A4', 'index':thisobject.fileList.length, 'name':file.name.substr(0, file.name.indexOf('.')), 'img':img});
								thisobject.selector.find('#upload_error').html('<font style="color:green; font-size:12px">Das Bild <b>' + file.name.substr(0, file.name.indexOf('.')) + '</b> ist zu groß und wird beim Hochladen in der Auflösung verringert.</font>');
							} else 
								thisobject.fileList.push({'file': file, 'state':'toAdd', 'format':'A4', 'index':thisobject.fileList.length, 'name':file.name.substr(0, file.name.indexOf('.')), 'img':img});
							if (typeof _type !== 'undefined' && _type === 'MENU') // Called in menu_edit
								setMenuIconAfterDropLoad(thisobject.selector, e.target.result);
						};
						var URLObj = window.URL || window.webkitURL;
						img.src = URLObj.createObjectURL(file);
					} else if (!file.type.match('application/pdf')) {
						thisobject.fileList.push({'file': file, 'state':'toAdd', 'format':'A4', 'index':thisobject.fileList.length, 'name':file.name.substr(0, file.name.indexOf('.'))});
						if (typeof _type !== 'undefined' && _type === 'MENU') // Called in menu_edit
							setMenuIconAfterDropLoad(thisobject.selector, e.target.result);
					}
					thisobject.setButtons();
				};
			})(f);
			reader.readAsDataURL(f);
		}
	}
	
	convertToImage(fileReader, file) {
		PDFJS.disableWorker = true;
		var thisobject = this;
		PDFJS.getDocument(fileReader.result).then(function getPdfHelloWorld(pdf) {
			thisobject.drawImage(file, 1, pdf);
		}, function(error) {
			console.log(error);
		});
	}
	// For PDF
	drawImage(file, pagenumber, pdf, selectorid = null) {
		var thisobject = this;
		pdf.getPage(pagenumber).then(function(page) {
			$('#canvas').attr('width', '723px');
			var scale = $('#canvas').get(0).width / page.getViewport(1).width;
			var viewport = page.getViewport(scale);
			var canvas = document.getElementById('canvas');
			var context = canvas.getContext('2d');
			canvas.height = viewport.height;
			canvas.width = viewport.width;
			var task = page.render({canvasContext: context, viewport: viewport})
			task.promise.then(function() {
				var img = canvas.toDataURL('image/png');
				var imgfile = thisobject.dataURLtoFile(img);
				imgfile.name = file.name.substr(0, file.name.length-4) + (pdf.numPages > 1 ?' Seite ' + pagenumber :'') + '.png';
				if (selectorid === null) {
					thisobject.selector.find('#upload_thumbnail').append('<li class="ui-state-default" data-id="' + thisobject.fileList.length + '" style="cursor:move" title="Reihenfolge verändern"><div class="thumb">' +
						'<img src="' + img + '" style="max-width:200px; max-height:150px; border:2px solid transparent;" title="' + imgfile.name + ' (' + (imgfile.size/1024).toFixed(2) + 'kb)">' + 
						'<i class="fa fa-trash-o btn_delete_image pointer no_drag" data-id="' + thisobject.fileList.length + '" style="font-size:20px; color:#fff; margin:10px -30px; vertical-align: bottom; text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black; display:none" title="Bild löschen"></i>' +
						'<span class="ui-icon ui-icon-arrowthick-2-n-s" title="Reihenfolge verändern"></span>' + 
						'</div></li>');
					thisobject.fileList.push({'file': imgfile, 'state':'toAdd', 'format':'A4', 'index':thisobject.fileList.length, 'name':imgfile.name.substr(0, imgfile.name.indexOf('.')), 'pdf':{'file':file, 'pagenumber':pagenumber, 'pdf':pdf, 'selectorid':thisobject.fileList.length}});
					if (pagenumber !== pdf.numPages) {
						thisobject.drawImage(file, ++pagenumber, pdf);
					}
					thisobject.setButtons();
				} else {
					thisobject.fileList[selectorid].file = imgfile;
					thisobject.selector.find('#upload_thumbnail').find('li[data-id="' + selectorid + '"]').find('img').attr('src', img);
				}
			});
		});
	}
	dataURLtoFile(dataurl) {
		var bstr = atob(dataurl.split(',')[1]);
		var array = [];
		for(var i = 0; i < bstr.length; i++)
			array.push(bstr.charCodeAt(i));
		return new Blob([new Uint8Array(array)], {type: 'image/png'});
	}
	
	retrieveImageFromClipboardAsBlob(pasteEvent, callback) {
		if (pasteEvent.clipboardData == false) {
			if(typeof(callback) == "function") {
				callback(undefined);
			}
		};
		var items = pasteEvent.clipboardData.items;
		if(items == undefined){
			if(typeof(callback) == "function"){
				callback(undefined);
			}
		};
		for (var i = 0; i < items.length; i++) {
			if (items[i].type.indexOf("image") == -1) continue;
			var blob = items[i].getAsFile();
			if(typeof(callback) == "function"){
				callback(blob);
			}
		}
	}

	deleteAndUploadFiles() {  // Called from chart, configuration and menu_edit
		var promises = [];
		promises.push(this.uploadFiles());
		for (var id in this.fileList) {
			if (this.fileList[id].state === 'toDelete')
				this.fileList[id].state = 'deleted';
		}
		return Promise.all(promises).then(uploadCompleted, uploadError); // Called in chart, configuration and menu_edit
	}
	
	uploadFiles() {
		if (this.fileList.length > 0) {
			var thisobject = this;
			var data = new FormData();
			var json;
			var added = [];
			for (var fileItem in this.fileList) {
				if (this.fileList[fileItem].state === 'toAdd') {
					added.push(fileItem);
					data.append(this.fileList[fileItem].file.name, this.fileList[fileItem].file);
				}
			}
			if (added.length > 0) {
				return $.ajax({
					url: "https://backend.homeinfo.de/hisfs?rename=true&" + localStorage.getItem('customer'),
					type: "POST",
					data: data,
					cache: false,
					contentType: false,
					processData: false,
					success: function (msg) {
						var item;
						for (item in msg.created) {
							if (item !== item.toLowerCase()) {
								msg.created[item.toLowerCase()] = msg.created[item];
								delete msg.created[item];
							}
						}
						for (item in msg.existing) {
							if (item !== item.toLowerCase()) {
								msg.existing[item.toLowerCase()] = msg.existing[item];
								delete msg.existing[item];
							}
						}
						for (item in added) {
							if (msg.created[thisobject.fileList[added[item]].file.name.toLowerCase()] != null) {
								//if (thisobject.fileList[added[item]].file.type.match('application/pdf'))
									//thisobject.fileList[added[item]].state = 'pdf';
								//else 
									thisobject.fileList[added[item]].state = 'saved';
								thisobject.fileList[added[item]].file = msg.created[thisobject.fileList[added[item]].file.name.toLowerCase()];
							} else if (msg.existing[thisobject.fileList[added[item]].file.name.toLowerCase()] != null) {
								//if (thisobject.fileList[added[item]].file.type.match('application/pdf'))
									//thisobject.fileList[added[item]].state = 'pdf';
								//else
									thisobject.fileList[added[item]].state = 'saved';
								thisobject.fileList[added[item]].file = msg.existing[thisobject.fileList[added[item]].file.name.toLowerCase()];
							}
						}
					},
					// Progress bar
					xhr: function() {
						var xhr = new window.XMLHttpRequest();
						//Upload progress
						xhr.upload.addEventListener("progress", function(evt){
							if (evt.lengthComputable) {
								$('.progress').show();
								var percentComplete = (evt.loaded / evt.total) * 100;
								$('.progress').html('<div class="progress-bar" role="progressbar" style="width: ' + percentComplete + '%" aria-valuenow="' + percentComplete + '" aria-valuemin="0" aria-valuemax="100"></div>');
							}
						}, false);
						return xhr;
					},
					error: function (msg) {
						console.log(msg)
					}
				});
			} else
				return 'success';
		} else
			return 'success';
	}
	
	deleteFile(id) {
		var thisobject = this;
		return $.ajax({
			url: 'https://backend.homeinfo.de/hisfs/' + id + "?" + localStorage.getItem('customer'),
			type: 'DELETE',
			success: function (msg) {
				console.log(msg);
			},
			error: function (msg) {
				console.log(msg);
				thisobject.selector.find('#upload_error').html('<font style="color:red; font-size:16px">Leider ist ein Fehler beim Löschen aufgetreten. Bitte informieren Sie uns darüber.</font>');
			}
		});	
	}
	
	setButtons() {
		var thisobject = this;
		thisobject.selector.find('.thumb').unbind().mouseover();
		thisobject.selector.find('.thumb').unbind().mouseout();
		thisobject.selector.find('.btn_image').unbind().click();
		thisobject.selector.find('.btn_download').unbind().click();
		thisobject.selector.find('.btn_delete_image').unbind().click();
		thisobject.selector.find('.format').unbind().change();
		
		thisobject.selector.find('.thumb').mouseover(function() {
			$(this).find('i').fadeIn(0);
			$(this).find('img').css({'border': '2px solid #ff0000'});
			$(this).find('.fa-file-pdf-o').css({'border': '2px solid #ff0000'});
			$(this).find('video').css({'border': '2px solid #ff0000'});
		});
		thisobject.selector.find('.thumb').mouseout(function() {
			$(this).find('i').fadeOut(0);
			$(this).find('img').css({'border': '2px solid transparent'});
			$(this).find('.fa-file-pdf-o').css({'border': '2px solid transparent'});
			$(this).find('video').css({'border': '2px solid transparent'});
		});
		thisobject.selector.find('.btn_image').click(function() {
			holdSession();
			$('.progress').hide();
			thisobject.selector.find('#upload_error').html('');
			window.open($(this).data('imageurl') + "?" + localStorage.getItem('customer'), '_blank');
		});
		thisobject.selector.find('.btn_delete_image').click(function() {
			holdSession();
			$('.progress').hide();
			thisobject.selector.find('#upload_error').html('');
			if (thisobject.fileList[$(this).data('id')].state === 'saved')
				thisobject.fileList[$(this).data('id')].state = 'toDelete';
			else
				thisobject.fileList[$(this).data('id')].state = 'deleted';
			$(this).parent().remove();
			if (typeof _type !== 'undefined' && _type === 'MENU') // Called in menu_edit
				deleteIcon(thisobject.selector);
		});
		thisobject.selector.find('.btn_download').click(function() {
			window.open('https://backend.homeinfo.de/hisfs/' + thisobject.fileList[$(this).data('id')].file + '?named&' + localStorage.getItem('customer'), '_self');
		});
		thisobject.selector.find('.btn_rotate').click(function() {
			var filelist = thisobject.fileList[$(this).data('id')];
			var canvas = document.getElementById('canvas');
			var context = canvas.getContext('2d');
			context.clearRect(0, 0, canvas.width, canvas.height);
			var k = 1920 / 1080;
			if (filelist.img.width * k > filelist.img.height) // Fill whole stage; "if (img.width * k < img.height)": show whole image
				k = 1920 / filelist.img.width;
			else
				k = 1080 / filelist.img.height;
			canvas.width = filelist.img.height * k;
			canvas.height = filelist.img.width * k;
			if (filelist.hasOwnProperty('rotate')) {
				filelist.rotate.push(filelist.rotate.shift());
				if (filelist.rotate[0].degrees === 0) {
					canvas.width = filelist.img.width * k;
					canvas.height = filelist.img.height * k;
					filelist.rotate[0].shiftx = 0;
					filelist.rotate[0].shifty = 0;
					filelist.rotate[0].cvwidth = canvas.width;
					filelist.rotate[0].cvheight = canvas.height;
				} else if (filelist.rotate[0].degrees === 90) {
					filelist.rotate[0].shiftx = canvas.width;
					filelist.rotate[0].shifty = 0;
					filelist.rotate[0].cvwidth = canvas.height;
					filelist.rotate[0].cvheight = canvas.width;
				} else if (filelist.rotate[0].degrees === 180) {
					canvas.width = filelist.img.width * k;
					canvas.height = filelist.img.height * k;
					filelist.rotate[0].shiftx = canvas.width;
					filelist.rotate[0].shifty = canvas.height;
					filelist.rotate[0].cvwidth = canvas.width;
					filelist.rotate[0].cvheight = canvas.height;
				} else if (filelist.rotate[0].degrees === 270) {
					filelist.rotate[0].shiftx = 0;
					filelist.rotate[0].shifty = canvas.height;
					filelist.rotate[0].cvwidth = canvas.height;
					filelist.rotate[0].cvheight = canvas.width;
				}
			} else {
				filelist.rotate = [{'degrees':90,'shiftx':canvas.width, 'shifty':0, 'cvwidth':canvas.height, 'cvheight':canvas.width},
				{'degrees':180,'shiftx':canvas.width, 'shifty':canvas.height, 'cvwidth':canvas.width, 'cvheight':canvas.height},
				{'degrees':270,'shiftx':0, 'shifty':canvas.height, 'cvwidth':canvas.height, 'cvheight':canvas.width},
				{'degrees':0,'shiftx':0, 'shifty':0, 'cvwidth':0, 'cvheight':0}];
			}
			context.setTransform(1, 0, 0, 1, filelist.rotate[0].shiftx, filelist.rotate[0].shifty);
			context.rotate(filelist.rotate[0].degrees * Math.PI/180);
			context.drawImage(filelist.img, 0,  0, filelist.rotate[0].cvwidth, filelist.rotate[0].cvheight);

			var name = filelist.file.name;
			var imgfile = thisobject.dataURLtoFile(canvas.toDataURL('image/png'));
			imgfile.name = name;
			filelist.file = imgfile;
			
			$(this).parent().find('img').css('margin', '80px');
			$(this).parent().find('img').css('transform','rotate(' + thisobject.fileList[$(this).data('id')].rotate[0].degrees + 'deg)'); //transform:translate(20px, 0px) rotate(90deg);
			$(this).parent().find('.fa').css('transform','rotate(0deg)'); 
		});
		thisobject.selector.find('.format').change(function() {
			var filelist = thisobject.fileList[$(this).data('id')];
			filelist.format = $(this).val();
			if (filelist.hasOwnProperty('pdf')) {
				$('#canvas').attr('width', thisobject.blackboardsize[$(this).val()].width + 'px');
				thisobject.drawImage(filelist.pdf.file, filelist.pdf.pagenumber, filelist.pdf.pdf, filelist.pdf.selectorid);
			}
		});
	}
	
	loadFile(id, format, filename) {
		let src = 'https://sysmon.homeinfo.de/newsletter-image/' + id;
		this.selector.find('#upload_thumbnail').append('<li class="ui-state-default" data-id="' + this.fileList.length + '" style="cursor:move" title="Reihenfolge verändern"><div class="thumb ">' +
			(typeof _chartType !== 'undefined' ?this.fileList.length+1 :'') + ' <img src="' + src + '?thumbnail=200x150&' + localStorage.getItem('customer') + '" class="btn_image" style="max-width:200px; max-height:150px; border:2px solid transparent; cursor:zoom-in" data-imageurl="' + src + '" title="' + filename + '">' + 
			'<i class="fa fa-download btn_download pointer" data-id="' + this.fileList.length + '" style="font-size:20px; color:#fff; margin:10px -30px; vertical-align: top; text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black; display:none" title="Bild runterladen"></i>' +
			'<i class="fa fa-trash-o btn_delete_image pointer" data-id="' + this.fileList.length + '" style="font-size:20px; color:#fff; margin:10px 10px; vertical-align: bottom; text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black; display:none" title="Bild löschen">' +
			'<img src="assets/img/trash.png">' + 
			'</i>' + 
			'<span class="ui-icon ui-icon-arrowthick-2-n-s" title="Reihenfolge verändern"></span>' + 
		'</div><div class="loader"></div></li>');
		var selector = this.selector.find('#upload_thumbnail').find('li[data-id="' + this.fileList.length + '"]');
		var tmpImg = new Image() ;
		tmpImg.src = selector.find('img').attr('src');
		tmpImg.onload = function() {
			selector.find('.loader').hide();
		};
		tmpImg.onerror = function() {
			selector.find('.loader').hide();
		};

		//this.fileList.push({'file':id, 'state':'saved', 'format':format, 'name':filename});
		this.setButtons();
	}
}