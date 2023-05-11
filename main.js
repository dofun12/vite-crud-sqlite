const container = document.querySelector('.worker');
const button = document.getElementsByTagName('button');


const logHtml = (cssClass, ...args) => {
    const div = document.createElement('div');
    if (cssClass) div.classList.add(cssClass);
    div.append(document.createTextNode(args.join(' ')));
    container.append(div);
};
const _worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });

_worker.addEventListener('message', ({ data }) => {
    switch (data.type) {
        case 'log':
            logHtml(data.payload.cssClass, ...data.payload.args);
            break;
        default:
            logHtml('error', 'Unhandled message:', data.type);
    }
});


button[0].addEventListener('click', function (){
    _worker.postMessage({cmd: 'listar'});
});
