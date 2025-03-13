import { createInterface } from "readline";
import fs from "fs"; 
import { execSync } from "child_process"; 
import os  from "os";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});


// Tests
// The tester will execute your program like this:

// ./your_program.sh
// It'll then send a command that you need to execute:

// $ custom_exe_1234 alice
// Program was passed 2 args (including program name).
// Arg #0 (program name): custom_exe_1234
// Arg #1: alice
// Program Signature: 5998595441

const validCommands = ["type", "echo", "exit", "pwd", "cd", "ls"];
const paths = (process.env.PATH as string).split(":") ?? [];

function cdCommand(args: string[]){
  const path = args[0];
  if(args.length === 0){
    process.chdir(os.homedir());
    return;
  }

  
  if(args.length  === 1){
    const targetPath = args[0]; 
    if(targetPath.startsWith("~")){
      process.chdir(os.homedir());
      return;
    }
    else if(targetPath.startsWith("~/")){
      process.chdir(os.homedir() + args[0].slice(1));
    }

    try{
      process.chdir(path);
      return;
    }
    catch(error){
      const err = error as NodeJS.ErrnoException; // Type assertion for Node.js error
        switch (err.code) {
            case 'ENOENT':
                console.log(`cd: '${targetPath}': No such file or directory`);
                break;
            case 'EACCES':
                console.log(`cd: '${targetPath}': Permission denied`);
                break;
            case 'ENOTDIR':
                console.log(`cd: '${targetPath}': Not a directory`);
                break;
            case 'EINVAL':
                console.log(`cd: '${targetPath}': Invalid path`);
                break;
            case 'EPERM':
                console.log(`cd: '${targetPath}': Operation not permitted`);
                break;
            case 'ENAMETOOLONG':
                console.log(`cd: '${targetPath}': Path name too long`);
                break;
            default:
                console.log(`cd: An unexpected error occurred: ${err.message}`);
                break;
        }
    }

  }
  else{
    console.log('cd: Too many arguments');
  }

  
  

}

const question = () => {
  rl.question("$ ", (answer: string) => {
    if (answer === "exit 0") {
      process.exit(0);
    }

    const [cmd, ...args] = answer.split(" "); 
    if (cmd === "type") {
      const output = args.join(" ") || "";
      if (validCommands.includes(output)) {
        console.log(`${output} is a shell builtin`);
      } else {
        let found = false; 
        paths?.forEach((path)=> {
          try{
            const cmds = fs.readdirSync(path).filter((cmd) => cmd === output); 
            if(cmds.length > 0 && !found){
              found= true; 
              console.log(`${output} is ${path}/${output}`); 
            }
          }
          catch(error){
           // console.log(error); 
          }
        })

        if(!found){
          console.log(`${output}: not found`);
        }
      }
    } else if (cmd === "echo") {
      const output = args.join(" ") || "";
      console.log(output);
    } 
    else if(cmd === "pwd"){
      console.log(process.cwd());
    }
    else if(cmd === "cd"){
      cdCommand(args);
    }
    else if (!validCommands.includes(cmd)) {
      let found = false; 
      for(const path of paths){
        try{
          const foundCommand = fs.readdirSync(path).find((file) => file === cmd);
          if(foundCommand){
            found = true;             
            process.chdir(path);
            const result = execSync(`${foundCommand} ${args.join(" ")}`).toString().trim();
            console.log(result);
            break;
          }
        }
        catch(error){          
          continue; 
        }
      }
      if(!found){
        console.log(`${cmd}: command not found`);
      }
    }
    question();
  });
};

question();
