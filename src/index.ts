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

import config from 'config';

import app from "./configs/app.config";
import Logger from "./middleware/logger";
import fs from "fs";
import http from "http";

global.__basedir = __dirname;
if (fs.existsSync('./src')) { // src only exists in development
    global.__basedir = require('path').resolve(global.__basedir, '..')
}

const appName: string = config.get('App.name') || "IWA-Express";
const appPort: number = config.get('App.port') || 8000;
const apiUrl: string = config.get('App.apiConfig.url') || "http://localhost:3000/api-docs/";

app.listen(appPort, () => {
    Logger.debug(`Running in directory: ${global.__basedir}`);
    Logger.info(`${appName} API is online at ${apiUrl}`);
});

/*http.createServer(app).listen(appPort, () => {
    Logger.debug(`Running in directory: ${global.__basedir}`);
    Logger.info(`${appName} is online at ${apiUrl}`);
});*/

