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
 * @date 8th August 2010
 */

/**
 * Session elements that lists the files in that have been created in session
 * and put in the users home directory.
 */
class Sahara_Session_Element_HomeFile extends Sahara_Session_Element
{
    /** The default refresh time in seconds. */
    const DEFAULT_REFRESH_SEC = 60;

    public function init()
    {
        $response = Sahara_Soap::getSchedServerSessionClient()->getSessionInformation(array(
            'userQName' => Zend_Auth::getInstance()->getIdentity()
        ));

        $home = new Sahara_Home(Sahara_Home::getHomeDirectoryLocation(), time() - $response->time);
        $home->loadContents();
        $this->_view->files = $home->getFlattenedContents();

        $this->view->refreshTime = $this->_config->home->sessionrefresh;
        if (!$this->view->refreshTime)
        {
            $this->view->refreshTime = self::DEFAULT_REFRESH_SEC;
        }
    }

    public function render()
    {
        $this->init();

        return $this->_view->render('HomeFile/_homeFile.phtml');
    }
}