/**
 * SAHARA Web Interface
 *
 * User interface to Sahara Remote Laboratory system.
 *
 * @license See LICENSE in the top level directory for complete license terms.
 *
 * Copyright (c) 2010, University of Technology, Sydney
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  * Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *  * Neither the name of the University of Technology, Sydney nor the names
 *    of its contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @author Michael Diponio (mdiponio)
 * @date 13th March 2010
 */

jpegIntervals = new Array();
jpegImages = new Object();
swfTimeout = null;

function changeCameraOption(id, vid, url)
{
	try
	{
		undeploy(id);
		
		setCameraCookie("CamOption-" + id, vid);
		
		/* First make panel visible. */
		if ($("#camerapanel" + id).css("display") == "none" && vid != 'off')
		{
			$("#camerapanel" + id).slideDown("slow", function() {
				setTimeout("resizeFooter()", 100);
			});
		}
		
		switch (vid)
		{
		case 'off':   // Camera panel is removed from the page:
			$("#camerapanel" + id).slideUp("slow");
			break;
		case 'jpeg':  // JPEG frames with a user selectable automatic refresh
			deployJpeg(id, url, 2000);
			break;
		case 'mjpeg': // Motion JPEG, Java plugin for IE, native others
			deployMJpeg(id, url);
			break;
		case 'mms':   // ASF over MMS, WMP or equivalent 
			deployWinMedia(id, url);
			break;
		case 'mmsh':  // ASF over MMSH, VLC forced
			deployVLC(id, url);
			break;
		case 'flv':   // FLV video using FlowPlayer
			deployFLV(id, url);
			break;
		case 'swf':   // Flash movie
			deploySWF(id, url);
			break;
		default:
			/* Fall back to the jQuery media plugin which may be able to detect
			 * the media type and the correct plugin. */
			var cameraDiv = "#camera" + id;
			var html = "<a class='media' href='" + url + "' />";
			$(cameraDiv).html(html);
			$(cameraDiv + " .media").media({
				width: vcameras[id].width,
				height: vcameras[id].height,
				src: url,
				autoplay: true,
				caption: false,
				params: { uiMode: 'none' },
				bgColor: '#606060'
			});
			break;
		}
	}
	catch(e)
	{
		/* Just swallowing the error. */
	}
}

function deployJpeg(id, url, tm)
{
	var cameraDiv = "#camera" + id,
		html = "<div id='jpegframe" + id + "' style='height:" + (vcameras[id].height + 20) + "px'>" +
				"	<img src='" + url + "?" + new Date().getTime() + "'/>" +
				"</div>" +
				"<div class='jpegsliderholder'>" +
				"	<div id='jpegslider" + id + "' class='jpegslider'></div>", i;
	
	for (i = 0; i < 5; i++)
	{
		html += "<div class='jpegtickblock' style='width:" + Math.floor(vcameras[id].width / 5) + "px;'>" +
				"	<span class='ui-icon ui-icon-arrowthick-1-n jpegtickarrow'></span>" +
				"   <span class='jpegtick'>" + (i == 0 ? "Off" : (0.25 * Math.pow(2, i - 1)) + "s") + "</span>" +
				"</div>";
	}	
	html += "</div>"; // jpegsliderholder

	$(cameraDiv).html(html);
	
	var cameraInfo = "#cameraInfo" + id;
	var htmlInfo = "<div class='cameraInfo'>" +
			       "    <div class='text'>* Move this slider to change the refresh interval</div>" +
			       "	<div class='arrow'>" +
                   "    	<div class='line10'></div>" +
                   "		<div class='line9'></div>" +
                   "		<div class='line8'></div>" +
                   "		<div class='line7'></div>" +
                   "		<div class='line6'></div>" +
                   "		<div class='line5'></div>" +
                   "		<div class='line4'></div>" +
                   "		<div class='line3'></div>" +
                   "		<div class='line2'></div>" +
                   "		<div class='line1'></div>" +
                   "	</div>" +
                   "</div>";
	$(cameraInfo).html(htmlInfo);
	$(cameraInfo).css("display", "block");

	
	$("#jpegslider" + id).slider({
		animate: true,
		min: 0,
		max: 30,
		step: 1,
		stop: function(event, ui) {
			var spe = Math.floor(Math.pow(2, (ui.value / 10)) * 250) - 100;
			if (spe < 250)
			{
				if (jpegIntervals[id] != undefined) clearTimeout(jpegIntervals[id]);
			}
			else
			{
				if (jpegIntervals[id] != undefined) clearTimeout(jpegIntervals[id]);
				jpegIntervals[id] = setTimeout("updateJpeg(" + id + ", '" + url + "', " + spe + ")", spe);
				$(cameraInfo).css("display", "none");
				setCameraCookie("CamSlideValue-" + id, ui.value);
				setCameraCookie("CamSlideInterval-" + id, spe);
			}
		}
	});
	
	$("#jpegslider" + id).css('width', vcameras[id].width - 20);
	
	$(cameraDiv).parent().parent().css("height", vcameras[id].height + 90); // Outer camera div
	$(cameraDiv).css("height", vcameras[id].height + 60);
	
	/* Hack so the footer doesn't overlay the camera panel while the background
	 * image is downloading. */
	resizeFooter();
	
	//Check for cookie for slider value and interval, if not set use sent value
	var iOpt = getCameraCookie("CamSlideInterval-" + id);
	var vOpt = getCameraCookie("CamSlideValue-" + id);
	if (iOpt == "" || vOpt == "")
	{
		if (tm > 0)
		{
			try { $("#jpegslider" + id).slider("value", 28); } catch (e) { /* Swallowing. */ }
			jpegIntervals[id] = setTimeout("updateJpeg(" + id + ", '" + url + "' , " + tm + ")", tm);
		}
	}
	else
	{
		try { $("#jpegslider" + id).slider("value", vOpt); } catch (e) { /* Swallowing. */ }
		jpegIntervals[id] = setTimeout("updateJpeg(" + id + ", '" + url + "' , " + iOpt + ")", iOpt);
	}
	
	jpegImages[id] = new Image();
}

function updateJpeg(id, url, tm)
{
	var tUrl = url + "?" + new Date().getTime();
	
	jpegImages[id].onload = function(){
			var i, el = document.getElementById("jpegframe" + id);
			for(i = el.childNodes.length; i > 0 ; i--)
   			{   
      			el.removeChild(el.childNodes[i-1]);
   			}
			el.appendChild(jpegImages[id]);
			jpegIntervals[id] = setTimeout("updateJpeg(" + id + ", '" + url + "' , " + tm + ")", tm);
		};
	jpegImages[id].src = tUrl;
}

function deployMJpeg(id, url)
{
	var cameraDiv = "#camera" + id;

	if ($.browser.msie)
	{
		/* Internet Explorer does not support MJPEG streaming so a Java applet 
		 * is streaming. */
		$(cameraDiv).html(
				'<applet code="com.charliemouse.cambozola.Viewer" archive="/applets/cambozola.jar" ' + 
						'width="' + vcameras[id].width + '" height="' + vcameras[id].height + '">' +
					'<param name="url" value="' + url + '"/>' +
					'<param name="accessories" value="none"/>' +
				'</applet>'
		);
	}
	else
	{
		$(cameraDiv).html(
				"<div id='jpegframe" + id + "' style='height:" + (vcameras[id].height + 20) + "px'>" +
				"	<img src='" + url + "?" + new Date().getTime() + "'/>" +
				"</div>"
		);
	}
}

function deployWinMedia(id, url)
{
	var cameraDiv = "#camera" + id;
	$(cameraDiv).css('background-color', '#606060');
	
	var html = "<object " +
		"	classid='CLSID:22d6f312-b0f6-11d0-94ab-0080c74c7e95' " +
		"	codebase='http://activex.microsoft.com/activex/controls/ mplayer/en/nsmp2inf.cab' " +
		"	standby='Loading Microsoft Windows Media Player...' " +
		"	type='application/x-oleobject' " +
		"	width='" + vcameras[id].width + "' " +
		"	height='" + vcameras[id].height + "' >" +
		"		<param name='fileName' value='" + url + "'>" +
		"		<param name='animationatStart' value='1'>" +
		"		<param name='transparentatStart' value='1'>" +
		"		<param name='autoStart' value='1'>" +
		"		<param name='ShowControls' value='0'>" +
		"		<param name='ShowDisplay' value='0'>" +
		"		<param name='ShowStatusBar' value='0'>" +
		"		<param name='loop' value='0'>" +
		"		<embed type='video/x-ms-asf-plugin' " +
		"			pluginspage='http://microsoft.com/windows/mediaplayer/ en/download/' " +
		"			showcontrols='0' " +
		"			showtracker='1' " +
		"			showdisplay='0' " +
		"			showstatusbar='0' " +
		"			videoborder3d='0' " +
		"			width='" + vcameras[id].width + "' " +
		"			height='" + vcameras[id].height + "' " +
		"			src='" + url + "' " +
		"			autostart='1' " +
		"			loop='0' /> " +
		"</object>";
	
	$(cameraDiv).html(html);
}

function deployVLC(id, url)
{
	var cameraDiv = "#camera" + id;
	$(cameraDiv).css('background-color', '#606060');
	
	var html = "<object " +
		"classid='clsid:9BE31822-FDAD-461B-AD51-BE1D1C159921' " +
		"codebase='http://downloads.videolan.org/pub/videolan/vlc/latest/win32/axvlc.cab'" +
		"width='" + vcameras[id].width + "' " +
		"height='" + vcameras[id].height + "' " +
		"id='vlc" + id + "' events='True'>" +
        "	<param name='Src' value='" + url + "' />" +
        "	<param name='ShowDisplay' value='True' />" +
        "	<param name='AutoLoop' value='no' />" +
        "	<param name='AutoPlay' value='yes' />" +
        "	<embed type='application/x-google-vlc-plugin' " +
        "          name='vlcfirefox' " +
        "          autoplay='yes' " +
        "          loop='no' " +
        "          width='" + vcameras[id].width + "' " +
        "          height='" + vcameras[id].height + "' " +
        "          target='"  + url + "' /> " +
    "</object>";

	$(cameraDiv).html(html);
	
	/* Start VLC playing. */
	var vlc = document.getElementById('vlc' + id);
	if (typeof vlc.playlist != "undefined")
	{
		vlc.playlist.playItem(vlc.playlist.add(url));
	}
}

function deployFLV(id, url)
{
	var player = flowplayer("camera" + id, {
			src: "/swf/flowplayer.swf",
			wmode: 'direct'
		}, 
		{
			autoPlay: true,
			buffering: true,
			playlist: [ 
			    url
			],
			clip: {
				bufferLength: 1
			},
			plugins: {
				controls: null // Disable the control bar
			}
	});

	player.load();
}

function deploySWF(id, url, refresh) 
{
	if (!refresh)
	{	
		$("#camera" + id)
		.css("background-image", "")
		.css("background-color", "#777");
		
		setTimeout(function() {
			deploySWF(id, url, true);
		}, 100);
		return;
	}
	
	if ($.browser.msie)
	{
		$("#camera" + id).html(
				'<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" ' +
						'width="' + vcameras[id].width + '" height="' + vcameras[id].height + '" ' +
						' id="camera' + id + 'movie" align="middle">' +
					'<param name="movie" value="' + url + '" />' +
					'<a href="http://www.adobe.com/go/getflash">' +
						'<img src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif" ' +
								'alt="Get Adobe Flash player"/>' +
					'</a>' +
				'</object>'
		);
	}
	else
	{
		$("#camera" + id).html(
				 '<object type="application/x-shockwave-flash" data="' + url + '" ' +
				 		'width="' +  vcameras[id].width  + '" height="' + vcameras[id].height + '">' +
			        '<param name="movie" value="' + url + '"/>' +
			        '<a href="http://www.adobe.com/go/getflash">' +
		            	'<img src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif" ' +
		            			'alt="Get Adobe Flash player"/>' +
		            '</a>' +
		        '</object>'
		);
	}
	
	/* Flash movies have a 16000 frame limit, so after 7 minutes, the movie
	 * is reloaded so it never hits the limit. */
	swfTimeout = setTimeout(function() {
		swfTimeout = null;
		undeploy(id);
		deploySWF(id, url, true);
	}, 7 * 60 * 1000);
}

function undeploy(id)
{
	if (jpegIntervals[id] !== undefined)
	{
		$("#jpegslider" + id).slider("destroy");
		clearInterval(jpegIntervals[id]);
		jpegIntervals[id] = undefined;
	}
	
	if (swfTimeout) 
	{
		clearTimeout(swfTimeout);
	}

	$("#camera" + id)
		.css("background-image", "")
		.css("background-color", "#FFFFFF")
		.html("<p>Camera off.</p>")
		.css("height", vcameras[id].height)
		.parent().parent().css("height", vcameras[id].height + 30); // Outer camera div
	
	$("#cameraInfo" + id)
		.html("")
		.css("display", "none");
	
	
	resizeFooter();
}

function setCameraCookie(key, value)
{
	var expiry = new Date();
	expiry.setDate(expiry.getDate() + 365);
	var cookie = 'Camera_' + cameraRigType + '-' + key + '=' + value + ';path=/;expires=' + expiry.toUTCString();

	document.cookie = cookie;
}

function getCameraCookie(key)
{
	var cookies = document.cookie.split('; ');
	var fqKey = 'Camera_' + cameraRigType + '-' + key;
	for (i in cookies)
	{
		var c = cookies[i].split('=', 2);
		if (c[0] == fqKey)
		{
			return c[1];
		}
	}
	return "";

}