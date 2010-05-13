<?php
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
 * @date 12th April 2010
 */

/**
 * Renders remote desktop information. THe rig cleint needs the property:
 * <ul>
 * 	<li><tt>Remote_Desktop_IP</tt> - IP address for the remote desktop.
 * </ul>
 */
class Sahara_Session_Element_RemoteDesktopAuthDetails extends Sahara_Session_Element
{
    /**
     * Sets up the information for rendering.
     */
    protected function init()
    {
        $this->_view->ip = $this->_getRigAttribute('Remote_Desktop_Host');
        if (!$this->_view->ip)
        {
            $this->_logger->warn('Unable to render Remote Desktop information because the remote desktop IP' .
                    ' was not found (Remote_Desktop_Host rig client property).');
        }

        $credentials = $this->_performPrimitive(
        		'au.edu.uts.eng.remotelabs.rigclient.action.access.WindowsNewUserController', 'getCredentials');

        $this->_view->username = $credentials['username'];
        $this->_view->password = $credentials['password'];
    }

    public function render()
    {
        $this->init();

        $this->_view->domain = $this->_config->remotedesktop->domain;
        return $this->_view->render('RemoteDesktopAuthDetails/_remoteDesktopAuthDetails.phtml');
    }
}
