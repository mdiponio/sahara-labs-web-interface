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
 * @date 8th July 2010
 */

/**
 * Sets up access to the WI database. The following fields must be set up
 * in configuration:
 * <ul>
 * 	<li>database.adapter - Database server adapter
 * (See http://framework.zend.com/manual/en/zend.db.adapter.html).</li>
 *  <li>database.params.host - Database server address.</li>
 *  <li>database.params.dbname - Database name.</li>
 *  <li>database.params.username - Database username.<li>
 *  <li>database.params.password - Password corresponding to the username.</li>
 * </ul>
 */
class Sahara_Database
{
    /**
     * Gets an instance of the Sahara_Database.
     *
     * @return Zend_Db instance
     * @throws Exception - 100 - Database not configured
     */
    public static function getDatabase()
    {
        if (!Zend_Registry::isRegistered('db'))
        {
            $dbconfig = Zend_Registry::get('config')->database;

            if (!$dbconfig)
            {
                throw new Exception('Database not configured.', 100);
            }

            $db =  Zend_Db::factory($dbconfig);
            Zend_Db_Table::setDefaultAdapter($db);
            Zend_Registry::set('db', $db);
        }

        return Zend_Registry::get('db');
    }
}
