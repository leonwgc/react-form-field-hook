// eslint-disable-next-line @typescript-eslint/no-var-requires
const { run } = require('packrs');

run({
  index: `./demo/index`,
  outDir: './.dev',
  port: 9008,
  rsConfig: {
    html: {
      title: 'use-form-field Demo',
    },
    server: {
      open: true,
    },
  },
});
