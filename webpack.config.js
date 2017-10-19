module.exports = {
    entry: {
        "folproof.verifiers": './dist/verifier/Verifiers.js',
        "folproof.parsers": "./dist/parsers/Parsers.js"
    },
    output: {
        filename: './dist/modules/[name].es5.js',
        sourceMapFilename: './dist/modules/[name].es5.js.map'
    },
    resolve: {
        extensions: ['.js']
    },
    node: {
        fs: "empty"
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                options: {
                    configFileName: 'tsconfig.json'
                }
            }
        ]
    }
};