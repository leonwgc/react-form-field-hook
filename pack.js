// eslint-disable-next-line @typescript-eslint/no-var-requires
const { run } = require('packrs');

run({
  index: `./demo/index`,
  outDir: './.dev',
  port: 9008,
  rsConfig: {
    html: {
      title: 'react-form-field-hook Demo',
    },
    server: {
      open: true,
    },
  },
});
