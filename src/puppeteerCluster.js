const data = require('../resources/data.json');
const querystring = require('querystring');
const { join } = require('path');
const { v1 } = require('uuid');

const { Cluster } = require('puppeteer-cluster');
const { sep, basename } = require('path');
const BASE_URL = "https://erickwendel.github.io/business-card-template/index.html";

function createQueryStringFromObject(data){
    const separator = null;
    const keyDelimiter = null;
    const options = {
        encodeURIComponent: querystring.unescape
    }

    
    const qs = querystring.stringify(
        data,
        separator,
        keyDelimiter,
        options
    );

    return qs;
}

async function render({page, data:{finalURI, name}}){
    const output = join(__dirname, `../output/${name}-${v1()}.pdf`);
    
    await page.goto(finalURI, { waitUntil:'networkidle2' });

    await page.pdf({
        path: output,
        format: 'A4',
        landscape: true,
        printBackground: true
    });

    console.log('ended', output)
}

async function main(){
    const pid = process.pid;

    try {
        const cluster = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_CONTEXT,
            maxConcurrency: 10
        });

        await cluster.task(render);

        for(const item of data){
            const qs = createQueryStringFromObject(item);
            const finalURI = `${BASE_URL}?${qs}`;
            await cluster.queue({ finalURI, name:item.name});
        }

        await cluster.idle()
        await cluster.close()

    } catch (error) {
        console.error(`${pid} has broken! ${error.stack}`)
    }
}

main()