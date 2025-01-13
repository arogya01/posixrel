import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});


const commands = ["cd", "ls", "pwd", "exit"];

// Uncomment this block to pass the first stage
rl.question("$ ", (answer: string) => {
  if (!commands.includes(answer)) {
    console.log("Command not found");
  }
  rl.close();
});
