import { Server } from './Server';

// init and run the server
new Server()
    .init()
    .then((s) => s.start())
    .catch((e) => console.error(e));
