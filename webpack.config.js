const path = require('path');

module.exports = {
    entry: {
        'bundle.js': './src/client/js/app.js',
        'styles.css': './src/client/styles/form.css'
    },
    output: {
        path: path.resolve(__dirname, 'build/public'),
        filename: '[name]'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.css$/,
                use: {
                    loader: 'css-loader',
                    options: {
                        modules: true
                    }
                }
            }
        ]
    }
};
