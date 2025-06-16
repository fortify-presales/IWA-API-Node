/*
        IWA-API - An insecure Node/Express REST API for use in Fortify demonstrations.

        Copyright 2024 Open Text or one of its affiliates.

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

import Logger from "../middleware/logger";

import sharp from 'sharp';

export abstract class ImageUtils {

        public static async convert({ file, width, height, type }: { file: string; width: number; height: number; type: string; }) {
                const outputFile = file.replace(/\.[^/.]+$/, `.${type}`);
                await sharp(file)
                        .resize(width, height)
                        .toFormat(type as keyof sharp.FormatEnum)
                        .toFile(outputFile);
                return { sendStatus: (status: number) => status };
        }

}