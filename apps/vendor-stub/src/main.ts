import { createVendorServer } from './server';

const port = Number(process.env.PORT ?? 4010);
createVendorServer().listen(port, '127.0.0.1', () => {
  console.log(`vendor-stub listening on http://127.0.0.1:${port}`);
});
