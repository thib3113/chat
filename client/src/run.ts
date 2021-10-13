import { Client } from './Client';

new Client()
    .init()
    .then((c) => c.start())
    .catch((e) => console.error(e));
