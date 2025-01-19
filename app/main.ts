import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});


const commands = ["cd", "ls", "pwd", "exit"];

// Uncomment this block to pass the first stage
const question = () => {rl.question("$ ", (answer: string) => {

  if(answer === "exit"){
    rl.close();
  }

  if (!commands.includes(answer)) {
    console.log(`${answer}: command not found`);
    question(); 
  }
  
})};

question(); 
