
import os from "os";
import path from "path";

// Handle cd command errors
function processCDErrors(error: unknown, targetPath:string) {
    const err = error as NodeJS.ErrnoException;
    switch (err.code) {
        case "ENOENT":
            console.log(`cd: ${targetPath}: No such file or directory`);
            break;
        case "EACCES":
            console.log(`cd: ${targetPath}: Permission denied`);
            break;
        case "ENOTDIR":
            console.log(`cd: ${targetPath}: Not a directory`);
            break;
        case "EINVAL":
            console.log(`cd: ${targetPath}: Invalid path`);
            break;
        case "EPERM":
            console.log(`cd: ${targetPath}: Operation not permitted`);
            break;
        case "ENAMETOOLONG":
            console.log(`cd: ${targetPath}: Path name too long`);
            break;
        default:
            console.log(`cd: An unexpected error occurred: ${err.message}`);
            break;
    }
}

// Handle cd command logic
export default function cdCommand(args:string[]) {
    if (args.length === 0) {
        process.chdir(os.homedir());
        return;
    }
    if (args.length > 1) {
        console.log("cd: Too many arguments");
        return;
    }

    const targetPath = args[0];
    try {
        if (targetPath === "~") {
            process.chdir(os.homedir());
            return;
        }
        if (targetPath.startsWith("~/")) {
            const relativePath = targetPath.slice(2);
            const fullPath = path.join(os.homedir(), relativePath);
            process.chdir(fullPath);
            return;
        }
        if (path.isAbsolute(targetPath)) {
            process.chdir(targetPath);
            return;
        }
        const normalizedPath = path.normalize(targetPath);
        const pathSegments = normalizedPath.split(path.sep).filter((segment) => segment !== "");
        pathSegments.forEach((segment) => {
            if (segment === "..") {
                const parentDir = path.dirname(process.cwd());
                process.chdir(parentDir);
            } else if (segment !== ".") {
                process.chdir(segment);
            }
        });
    } catch (error) {
        processCDErrors(error, targetPath);
    }
}