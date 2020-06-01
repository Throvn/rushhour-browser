const path = require('path')

module.exports = {
    context: path.resolve(__dirname),
    mode: 'production',
    output: {
        filename: 'main.js',
        publicPath: './'
    }
}