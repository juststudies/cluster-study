const data = require('../resources/data.json');
const cp = require('child_process');
const module_path = `${__dirname}/worker.js`;

(async function main(){
    for(const item of data){
        const worker = cp.fork(module_path, []);
        worker.on("message", msg => console.log('message caught on parent', msg));
        worker.on("error", msg => console.log('errpr caught on parent', msg));

        worker.send(item);
    }
})()