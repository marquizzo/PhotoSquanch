const webpack = require("webpack");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const miniCSS = new MiniCssExtractPlugin({
	// Options similar to the same options in webpackOptions.output
	// both options are optional
	filename: "css/[name].css",
	chunkFilename: "[id].css"
})


// http://webpack.github.io/docs/configuration.html
module.exports = {
	entry:{
		photoSquanch: "./src/App.ts",
	},

	output:{
		path: __dirname + "/web/",
		filename: "js/[name].js"
	},

	resolve: {
	   extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
	},

	externals:{
		Hammer: "hammerjs",
		dat: "dat",
		Stats: "stats",
		TweenMax: "TweenMax"
	},

	module:{
		rules: [
			// Test file extension to run loader
			{
				test: /\.(glsl|vs|fs)$/, 
				loader: "ts-shader-loader"
			},
			{
				test: /\.tsx?$/, 
				exclude: [/node_modules/, /tsOld/],
				loader: "ts-loader"
			},
			{
	            test: /\.less$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					'less-loader'
				]
	        }
		]
	},

	plugins:[
		miniCSS
	],

	// Enables dev server to be accessed by computers in local network
	devServer: {
		host: "0.0.0.0",
		port: 8000,
		publicPath: "/web/",
		disableHostCheck: true
	}
}