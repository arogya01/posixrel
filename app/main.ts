import { createInterface } from "readline";
import fs from "fs"; 

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const commands = ["cd", "ls", "pwd", "echo"];
const validCommands = ["type", "echo", "exit"];
// Uncomment this block to pass the first stage
const question = () => {
  rl.question("$ ", (answer: string) => {
    if (answer === "exit 0") {
      process.exit(0);
    }

    if (answer.startsWith("type")) {
      const output = answer.split(" ").slice(1).join(" ") || "";
      if (validCommands.includes(output)) {
        console.log(`${output} is a shell builtin`);
      } else {
        let found = false; 
        const paths = process.env.PATH?.split(":") ?? []; 
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
    } else if (answer.startsWith("echo")) {
      const output = answer.split(" ").slice(1).join(" ") || "";
      console.log(output);
    } else if (!commands.includes(answer)) {
      console.log(`${answer}: command not found`);
    }

    question();
  });
};

question();
