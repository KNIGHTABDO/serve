import { readDir, readTextFile, stat } from '@tauri-apps/plugin-fs';
import { open } from '@tauri-apps/plugin-dialog';

export interface FileData {
    name: string;
    path: string;
    content: string;
}

/**
 * Open a dialog to select a directory and recursively read all text-based files.
 */
export async function ingestDirectory(): Promise<FileData[]> {
    const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Directory for Grounding',
    });

    if (!selected || Array.isArray(selected)) return [];

    const files: FileData[] = [];
    await readRecursive(selected, files);
    return files;
}

/**
 * Open a dialog to select one or more files.
 */
export async function ingestFiles(): Promise<FileData[]> {
    const selected = await open({
        multiple: true,
        title: 'Select Files for Grounding',
    });

    if (!selected) return [];
    
    const paths = Array.isArray(selected) ? selected : [selected];
    const files: FileData[] = [];

    for (const path of paths) {
        try {
            const content = await readTextFile(path);
            const name = path.split(/[\\/]/).pop() || 'untitled';
            files.push({ name, path, content });
        } catch (e) {
            console.error(`Failed to read file ${path}:`, e);
        }
    }

    return files;
}

async function readRecursive(dirPath: string, fileList: FileData[]) {
    try {
        const entries = await readDir(dirPath);

        for (const entry of entries) {
            const fullPath = `${dirPath}/${entry.name}`;
            
            if (entry.isDirectory) {
                // Skip common large/binary directories
                if (['node_modules', '.git', '.next', 'target', 'dist', 'out'].includes(entry.name)) continue;
                await readRecursive(fullPath, fileList);
            } else if (entry.isFile) {
                // Only read text files
                if (isTextFile(entry.name)) {
                    try {
                        const content = await readTextFile(fullPath);
                        fileList.push({ name: entry.name, path: fullPath, content });
                    } catch (e) {
                        // Skip binary or unreadable files
                    }
                }
            }
        }
    } catch (e) {
        console.error(`Failed to read directory ${dirPath}:`, e);
    }
}

function isTextFile(filename: string): boolean {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (!ext) return false;
    return ['ts', 'tsx', 'js', 'jsx', 'json', 'md', 'txt', 'css', 'scss', 'rs', 'py', 'c', 'cpp', 'h', 'html', 'yml', 'yaml', 'toml'].includes(ext);
}
