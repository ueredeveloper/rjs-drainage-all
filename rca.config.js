const path = require('path')

module.exports = {
  // Specify the output directory for diagrams
  outputPath: 'docs/react-diagram.html',

  // Define an alias to resolve "@" to the "src" directory
  alias: [
    {
      find: '@',
      replacement: path.resolve(__dirname, 'src'),
    },
  ],
}
