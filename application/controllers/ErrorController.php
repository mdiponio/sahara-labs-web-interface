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
 * @date 17th March 2010
 */

/**
 * Error controller.
 */
class ErrorController extends Zend_Controller_Action
{
    /** Puesdo role when an error occurs. */
    const PUESDO_ROLE_ERROR = 'ERROR';

    /**
     * Error action.
     */
    public function errorAction()
    {
        $this->view->headTitle('Remote Labs - Error Occurred', Zend_View_Helper_Placeholder_Container_Abstract::SET);

        /* Information that should have been populated by the action
         * pre-dispatch hook, but because this is an error fallback,
         * we assume nothing. */
        $this->view->userRole = self::PUESDO_ROLE_ERROR;
        $this->view->controller = 'index';
        $this->view->action = 'index';

        $errors = $this->_getParam('error_handler');

        switch ($errors->type)
        {
            case Zend_Controller_Plugin_ErrorHandler::EXCEPTION_NO_ROUTE:
            case Zend_Controller_Plugin_ErrorHandler::EXCEPTION_NO_CONTROLLER:
            case Zend_Controller_Plugin_ErrorHandler::EXCEPTION_NO_ACTION:
                /*---- 404 error -- controller or action not found. ---------*/
                $this->getResponse()->setHttpResponseCode(404);
                $this->view->code = 404;
                $this->view->message = 'Page not found';
                break;
            default:
                /*---- Application error. -----------------------------------*/
                /* Clear the authentication information. */
                $auth = Zend_Auth::getInstance()->clearIdentity();
                $this->getResponse()->setHttpResponseCode(500);
                $this->view->code = 500;
                $this->view->message = 'Application error';
                break;
        }

        if (($log = Sahara_Logger::getInstance()) &&
                ($this->view->code != 404 || APPLICATION_ENV == 'development'))
        {
            $log->fatal($this->view->message .': ' . $errors->exception);
        }

        $this->view->exception = $errors->exception;
        $this->view->request = $errors->request;
    }
}

