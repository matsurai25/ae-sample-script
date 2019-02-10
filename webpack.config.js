// output.pathに絶対パスを指定する必要があるため、pathモジュールを読み込んでおく
const path = require('path')

module.exports = {
  mode: 'development',
  // エントリーポイントの設定
  entry: './src/main.ts',
  // 出力の設定
  output: {
    // 出力するファイル名
    filename: 'bundle.jsx',
    // 出力先のパス（v2系以降は絶対パスを指定する必要がある）
    path: path.join(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        // 拡張子 .ts の場合
        test: /\.ts$/,
        // TypeScript をコンパイルする
        use: 'ts-loader'
      },
    ]
  },
  // import 文で .ts や .tsx ファイルを解決するため
  resolve: {
    extensions: ['.ts', '.js'],
    mainFiles: ['index']
  },
}
