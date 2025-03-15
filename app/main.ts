import fs from "fs";
import { execSync } from "child_process";
import cdCommand from "./cd";
import { findStringWithSubstr } from "../utils";


const validCommands = ["type", "echo", "exit", "pwd", "cd", "ls"] as const;
type ValidCommand = typeof validCommands[number];

// Type guard function to check if a string is a valid command
function isValidCommand(cmd: string): cmd is ValidCommand {
  return validCommands.includes(cmd as ValidCommand);
}

const paths = (process.env.PATH || "").split(":");
let currentInput = "";
const prompt = "$ "; // Define the prompt as a constant

// Function to refresh the display, including the prompt
function updateDisplay() {
    process.stdout.write("\r\x1b[2K" + prompt + currentInput); // Clear line, write prompt + input
}

const terminalCmdMapper = {
    type: (args:string[]) => {
        const output = args.join(" ") || "";
        if (isValidCommand(output)) {
            console.log(`${output} is a shell builtin`);
        } else {
            let found = false;
            paths?.forEach((path) => {
                try {
                    const cmds = fs.readdirSync(path).filter((cmd) => cmd === output);
                    if (cmds.length > 0 && !found) {
                        found = true;
                        console.log(`${output} is ${path}/${output}`);
                    }
                } catch (error) {
                    // Ignore errors for individual paths
                }
            });
            if (!found) {
                console.log(`${output}: not found`);
            }
        }
    }, 
    echo: (args:string[]) => {
        const output = args.join(" ") || "";
        console.log(output);
    },
    cd: (args:string[]) => cdCommand(args), 
    pwd: (args:string[]) => console.log(process.cwd()),
    exit: (args:string[]) => {
        // Already handled earlier for "exit 0", but add for completeness
        process.exit(parseInt(args[0]) || 0);
    },
    ls: (args:string[]) => {
        try {
            const targetDir = args[0] || '.';
            const files = fs.readdirSync(targetDir);
            console.log(files.join('  '));
        } catch (error: any) {
            console.error(`ls: ${error.message}`);
        }
    }
}

// Function to process the entered command
function processCommand() {
    console.log(); // Move to a new line
    const input = currentInput.trim();
    if (input === "exit 0") {
        process.exit(0);
    }

    const [cmd, ...args] = input.split(" ");

    if(isValidCommand(cmd)){
        terminalCmdMapper[cmd](args);
    }
    
    if (!isValidCommand(cmd)) {
        let found = false;
        for (const path of paths) {
            try {
                const foundCommand = fs.readdirSync(path).find((file) => file === cmd);
                if (foundCommand) {
                    found = true;
                    process.chdir(path);
                    const result = execSync(`${foundCommand} ${args.join(" ")}`)
                        .toString()
                        .trim();
                    console.log(result);
                    break;
                }
            } catch (error) {
                continue;
            }
        }
        if (!found) {
            console.log(`${cmd}: command not found`);
        }
    }
    currentInput = "";
    process.stdout.write(prompt); // Show prompt again for next input
}


// Set up raw mode input handling
process.stdin.setRawMode(true);
process.stdin.on("data", (data) => {
    const key = data[0];

    if (key >= 32 && key <= 126) {
        // Printable character
        currentInput += String.fromCharCode(key);
        updateDisplay();
    } else if (key === 8 || key === 127) {
        // Backspace
        if (currentInput.length > 0) {
            currentInput = currentInput.slice(0, -1);
            updateDisplay();
        }
    } else if (key === 13) {
        // Enter
        processCommand();
    } else if (key === 9) {
        // Tab: Auto-complete "ech" to "echo"
        if(findStringWithSubstr(currentInput, [...validCommands]) !== undefined){
            currentInput = findStringWithSubstr(currentInput, [...validCommands]) ?? ""; 
            updateDisplay()
        }
        if (currentInput === "ech") {
            currentInput = "echo";
            updateDisplay();
        }
        // Add more auto-completion logic here if needed
    }
});

// Display initial prompt
process.stdout.write(prompt);