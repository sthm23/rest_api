import * as path from "path";
import * as fs from 'fs';

export class FileHelper {

    static writeFile(fileName: string, buffer: string | NodeJS.ArrayBufferView) {
        const outputDir = path.join(process.cwd(), 'uploads');
        fs.mkdirSync(outputDir, { recursive: true });
        const filePath = path.join(outputDir, fileName);
        fs.writeFileSync(filePath, buffer)
    }
}