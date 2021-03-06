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
 * @date 17th Janurary 2013
 */

/**
 * Entity for session file records.
 */
class Sahara_Database_Record_SessionFile extends Sahara_Database_Record
{
    /** @var String Name of table. */
    protected $_name = 'session_file';

    /** @var array Relationships with other records. */
    protected $_relationships = array(
        'session' => array(
             'table' => 'session',
             'entity' => 'Session',
             'join' => 'local',
             'foreign_key' => 'session_id'
         )
    );

    /**
     * Checks whether this session file can be downloaded.
     *
     * @return boolean true if the file can be downloaded
     */
    public function isDownloadable()
    {
        return is_readable($this->getAbsolutePath());
    }

    /**
     * Returns the absolute path of the session file. The absolute path includes the
     * mount point and the stored file path.
     *
     * @return string absolute file path
     */
    public function getAbsolutePath()
    {
        return realpath($this->getResearchMountPoint() . $this->path . '/' . $this->name);
    }

    /**
     * Gets the configured directory mount point of the research shared directory.
     *
     * @return string mount point
     */
    private function getResearchMountPoint()
    {
        $conf = Zend_Registry::get('config')->ands;
        if (!$conf) return '/';

        $mount = $conf->mountpoint;
        if (!$mount) return '/';

        return substr($mount, -1) == '/' ? $mount : $mount . '/';
    }
}
