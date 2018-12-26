// For documentation on these options, see the README at https://github.com/shadowfacts/uebersicht-github-activity/
const options = {
	user: "serkakres",
	size: 26,
	incrAmount: 4,
	margin: 2,
	vary: ["size", "color"],
	shape: "circle",
	theme: "blue",
	colors: {
		overrides: {
			none: [null, null],
			one: [null, null],
			two: [null, null],
			three: [null, null],
			max: [null]
		},
		red: {
			none: ["#111", "#111"],
			one: ["#640C0B", "#560a09"],
			two: ["#840f03", "#640c0b"],
			three: ["#cc1210", "#840f03"],
			max: ["#e81412", "#cc1210"]
		},
		green: {
			none: ["#eee", "#eee"],
			one: ["#d6e685", "#c2d179"],
			two: ["#8cc665", "#d6e685"],
			three: ["#44a340", "#8cc665"],
			max: ["#1e6823", "#44a340"]
		},
		white: {
			none: ["#000", "#000"],
			one: ["#444", "#222"],
			two: ["#777", "#444"],
			three: ["#aaa", "#777"],
			max: ["#eee", "#aaa"]
		},
		blue: {
			none: ["#111", "#111"],
			one: ["#0723b2", "#041469"],
			two: ["#0244b2", "#0723b2"],
			three: ["#006ec9", "#0244b2"],
			max: ["#4baffc", "#006ec9"]
		}
	}
};

const axios = require("axios");
const cheerio = require("cheerio");
const fs = require('fs');

axios.get(`https://github.com/${options.user}`)
	.then(generate)
	.catch(() => {
		generate(null)
	});

function generate(res) {
	if(res !== null){
		let data = JSON.stringify(res.data);
		fs.writeFileSync('github-activity.json', data);
	}
	else {
		let rawdata = fs.readFileSync('github-activity.json');
		res = {'data': JSON.parse(rawdata)};
	}

	console.log(`<svg id="github-activity" width="${53 * options.size}" height="${7 * (options.size)}">`);

	const $ = cheerio.load(res.data);

	const columns = $(".js-calendar-graph-svg g > g");
	let x = 0;
	columns.toArray().forEach((col) => {
		let y = 0;

		$(col).find("rect.day").toArray().forEach((it) => {
			const count = parseInt($(it).data("count"));

			let fill, stroke;
			if (options.vary.includes("color")) {
				[fill, stroke] = getColors(count);
			} else {
				[fill, stroke] = getColors(Number.MAX_VALUE);
			}

			if (options.shape == "square") {
				let xPos = x * options.size;
				let yPos = y * options.size;

				let size;
				if (options.vary.includes("size")) {
					size = Math.min(count + options.incrAmount, (options.size - options.margin) / 2);
					xPos += (-size + options.size) / 2;
					yPos += (-size + options.size) / 2;
				} else {
					size = options.size - options.margin;
				}

				console.log(`\t<rect x="${xPos}" y="${yPos}" width="${size}" height="${size}" fill="${fill}" stroke="${stroke}"></rect>`);
			} else {
				const xPos = x * options.size + (options.size / 2);
				const yPos = y * options.size + (options.size / 2);

				let size;
				if (options.vary.includes("size")) {
					size = Math.min(count + options.incrAmount, (options.size - options.margin) / 2);
				} else {
					size = (options.size - options.margin) / 2;
				}

				console.log(`\t<circle cx="${xPos}" cy="${yPos}" r="${size}" fill="${fill}" stroke="${stroke}"></circle>`);
			}

			y++;
		});

		x++;
	});

	console.log("</svg>");
}

function getColorsForPalette(count, palette) {
	if (count == 0) return palette.none;
	else if (count <= 5) return palette.one;
	else if (count <= 10) return palette.two;
	else if (count <= 15) return palette.three;
	else return palette.max;
}

function getColors(count) {
	const defaults = getColorsForPalette(count, options.colors[options.theme]);
	const overrides = getColorsForPalette(count, options.colors.overrides);
	return [overrides[0] || defaults[0], overrides[1] || defaults[1]];
}