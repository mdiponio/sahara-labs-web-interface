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
 * Renders remote desktop information. The rig client needs the property:
 * <ul>
 * 	<li><tt>Remote_Desktop_IP</tt> - IP address for the remote desktop.
 * </ul>
 * An option array can be given as a constructor parameter to customise
 * the behaviour of this class. The options are:
 * <ul>
 * 	<li>domain => [true|false] - Whether to provide a domain selection
 *  help step. The default is true. <strong>NOTE:</strong> If a domain
 *  is to be displayed, the property <tt>remotedesktop.domain</tt> should
 *  be set with the domain name.</li>
 * </ul>
 */
class Sahara_Session_Element_RemoteDesktop extends Sahara_Session_Element
{
    /** @var String The RDP file generation controller. */
    const RDP_Controller = "au.edu.labshare.rigclient.primitive.RDPConfigurationController";

    /** @var String IP address to the remote desktop. */
    protected $_ip;

    /** @var boolean Whether a domain should be given in the instructions. */
    protected $_useDomain = true;

    /** @var boolean Whether to request RDP file generation from the rigclient. */
    protected $_generateRDP = false;

    /** @var String Name of RDP file. */
    protected $_rdpFileName;

    public function __construct($rig, $options = array())
    {
        parent::__construct($rig);

        if (!is_array($options)) return;
        foreach ($options as $o => $v)
        {
            switch ($o)
            {
                case 'domain':
                    $this->_useDomain = $v;
                    break;
                case 'generaterdp':
                    $this->_generateRDP = $v;
                    break;
                case 'rdpfile':
                    $this->_rdpFileName = $v;
                    break;
            }
        }
    }

    /**
     * Sets up the information for rendering.
     */
    protected function init()
    {
        $this->_ip = $this->_getRigAttribute('Remote_Desktop_Host');
        if (!$this->_ip)
        {
            $this->_logger->warn('Unable to render Remote Desktop information because the remote desktop IP' .
                    ' was not found (Remote_Desktop_Host rig client property).');
        }

        if ($this->_rdpFileName)
        {
            if (!strrpos($this->_rdpFileName, '.rdp'))
            {
                $this->_rdpFileName .= '.rdp';
            }
        }
        else
        {
            $this->_rdpFileName = 'remotelabs.rdp';
        }
    }

    public function render()
    {
        $this->init();

        if ($this->_useDomain) $this->_view->domain = $this->_config->remotedesktop->domain;
        if ($this->_generateRDP)
        {
            $this->_view->rdpFile = $this->_view->baseUrl(
                '/primitive/file' .
                '/pc/' . self::RDP_Controller .
                '/pa/getRDPFile' .
                '/mime/application-x-rdp' .
                '/filename/' . $this->_rdpFileName
           	);
        }
        $this->_view->ip = $this->_ip;
        return $this->_view->render('RemoteDesktop/_remoteDesktop.phtml');
    }
}
