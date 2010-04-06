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
 * @date 6th April 2010
 */


function finishSession()
{
	var diagDiv = "div[aria-labelledby=ui-dialog-title-finishsessiondialog]";
	var conDiv = "#finishsessiondialog";
	
	/* Cancel all buttons. */
	$(diagDiv + " div.ui-dialog-buttonpane").css("display", "none");
	$(diagDiv + " div.ui-dialog-titlebar").css("display", "none");
	$(conDiv).dialog({'closeOnEscape': false});
	
	html = "<div style='text-align:center;font-size:1.3em;'>" +
		   "	<img src='/images/ajax-loading.gif' alt='Loading' /><br />" +
		   "	<p>Finishing session...</p>" +
		   "</div>";
	
	$(conDiv).html(html);
	
	$.get(
		"/session/finish",
		{},
		function (r) {
			$(conDiv).html(
					"<div class='dialogcentercontent'>" +
					"	<div class='dialogheader'>" +
					"		<h3 style='display:block;margin-top:20px'>Success, redirecting...</h3>" +
					"   </div>" +
					"<div>"
			);
			window.location.replace("/queue/index");
		}
	);
}