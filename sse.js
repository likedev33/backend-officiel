// let connexions = new Set();
// let currentId = 0;
// class ServerSSE {
//     function sse() {
//         return (request, response, next) => {
//             response.initStream = () => {
//                 response.writeHead(200, {
//                     // Configuration des en-têtes SSE
//                     'Cache-Control': 'no-cache',
//                     'Content-Type': 'text/event-stream',
//                     'Connection': 'keep-alive'
//                 });
//                 connexions.add(response);
//                 const intervalId = setInterval(() => {
//                     response.write(':\n\n');
//                     response.flush();
//                 }, 30000);

//                 response.on('close', () => {
//                 clearInterval(intervalId);
//                 response.end();
//                     connexions.delete(response);
//                 })
//             }
//             response.sendSSE = (data, eventName) => {
//                 let dataString = 
//                 `id: ${currentId}\n` +
//                 `data: ${JSON.stringify(data)}\n` + 
//                 (eventName ? `event: ${eventName}\n\n` : '\n');

//                 for(let connexion of connexions) {
//                     connexion.write(dataString);
//                     connexion.flush();
//                 }

//                 currentId++;
//             }

//             next();
//         }
//     }
// }

// module.exports = { ServerSSE }
