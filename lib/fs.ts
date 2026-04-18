/**
 * SERVE File System Service — Browser-native file input
 * Replaces Tauri plugin-fs + plugin-dialog
 */

export interface FileData {
    name: string;
    path: string;
    content: string;
}

/**
 * Open a browser file picker to select a directory and read all text-based files.
 * Uses the webkitdirectory attribute for directory selection.
 */
export async function ingestDirectory(): Promise<FileData[]> {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.setAttribute('webkitdirectory', '');
        input.multiple = true;

        input.onchange = async () => {
            const fileList = input.files;
            if (!fileList || fileList.length === 0) {
                resolve([]);
                return;
            }

            const files: FileData[] = [];
            for (let i = 0; i < fileList.length; i++) {
                const file = fileList[i];
                const relativePath = (file as any).webkitRelativePath || file.name;

                // Skip common large/binary directories
                if (/\/(node_modules|\.git|\.next|target|dist|out)\//.test(relativePath)) continue;

                // Only read text files
                if (!isTextFile(file.name)) continue;

                try {
                    const content = await readFileAsText(file);
                    files.push({
                        name: file.name,
                        path: relativePath,
                        content,
                    });
                } catch {
                    // Skip unreadable files
                }
            }

            resolve(files);
        };

        input.oncancel = () => resolve([]);
        input.click();
    });
}

/**
 * Open a browser file picker to select one or more files.
 */
export async function ingestFiles(): Promise<FileData[]> {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;

        input.onchange = async () => {
            const fileList = input.files;
            if (!fileList || fileList.length === 0) {
                resolve([]);
                return;
            }

            const files: FileData[] = [];
            for (let i = 0; i < fileList.length; i++) {
                const file = fileList[i];
                try {
                    const content = await readFileAsText(file);
                    files.push({
                        name: file.name,
                        path: file.name,
                        content,
                    });
                } catch (e) {
                    console.error(`Failed to read file ${file.name}:`, e);
                }
            }

            resolve(files);
        };

        input.oncancel = () => resolve([]);
        input.click();
    });
}

function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}

function isTextFile(filename: string): boolean {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (!ext) return false;
    return ['ts', 'tsx', 'js', 'jsx', 'json', 'md', 'txt', 'css', 'scss', 'rs', 'py', 'c', 'cpp', 'h', 'html', 'yml', 'yaml', 'toml'].includes(ext);
}
