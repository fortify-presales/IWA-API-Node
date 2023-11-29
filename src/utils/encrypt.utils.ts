/*
        IWA-Express - Insecure Express JS REST API

        Copyright 2023 Open Text or one of its affiliates.

        This program is free software: you can redistribute it and/or modify
        it under the terms of the GNU General Public License as published by
        the Free Software Foundation, either version 3 of the License, or
        (at your option) any later version.

        This program is distributed in the hope that it will be useful,
        but WITHOUT ANY WARRANTY; without even the implied warranty of
        MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
        GNU General Public License for more details.

        You should have received a copy of the GNU General Public License
        along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var crypto = require('crypto-browserify')

import Logger from "../middleware/logger";

export abstract class EncryptUtils {

    static encryptionKey = "";
    static algorithm = 'aes-256-ctr';

    public static cryptPassword(password: String): String {
        //process.stdout.write("Encrypting password: " + password);
        var cipher = crypto.createCipher(this.algorithm, this.encryptionKey);
        var mystr = cipher.update(password, 'utf8', 'hex');
        mystr += cipher.final('hex');
        //process.stdout.write("Encrypted password:" + mystr);
        return mystr;
    }

    public static decryptPassword(hashPassword: String): String {
        //process.stdout.write("Decrypting password: " + hashPassword);
        var cipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
        var mystr = cipher.update(hashPassword, 'hex', 'utf8');
        mystr += cipher.final('utf8');
        //process.stdout.write("Decrypted password:" + mystr);
        return mystr;
    }

    public static comparePassword(password: String, hashPassword: String): Boolean {
        //process.stdout.write("Encrypted password: " + hashPassword);
        var cipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
        var mystr = cipher.update(hashPassword, 'hex', 'utf8');
        mystr += cipher.final('utf8');
        //process.stdout.write("Comparing passwords: " + mystr + " = " + password);
        return (password == mystr);
    }

}
