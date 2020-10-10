const { fork } = require('child_process');

const worker = forkProcess("Worker","./worker.js");
const server = forkProcess("Server","./server.js");
const client = forkProcess("Client","./client.js");

function forkProcess(name, path){
    const childProcess = fork(path, {stdio : ["ignore","ignore", process.stderr, "ipc"]});
    childProcess.on('message', data => console.log(`${name}: ${data}`));
    return childProcess;
}