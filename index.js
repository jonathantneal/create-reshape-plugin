#!/usr/bin/env node

// tooling
const args     = require('./lib/args');
const child    = require('./lib/child_process');
const fs       = require('./lib/fs');
const gitinfo  = require('./lib/gitinfo');
const path     = require('path');
const question = require('./lib/question');

// caching
const answers = {};

// capturing
const keys = /\$\{([^\}]+)\}/g;

// directory names
const tpl = 'template';
const ghpages = '.gh-pages';

// directory paths
const __tpl = path.join(__dirname, tpl);
const __tpl_ghpages = path.join(__tpl, ghpages);
const __out = process.cwd();
const __out_ghpages = path.join(__out, ghpages);

const patchPkg = `,
    ".*",
    "*"`;

// capture answers
(questions => Object.keys(questions).reduce(
	(resolver, key) => resolver.then(
		() => questions[key]()
	).then(
		answer => answers[key] = answer
	),
	Promise.resolve()
).then(
	() => answers
))({
	// --date, or formatted date
	date: () => args('date').catch(
		() => new Date(Date.now()).toLocaleDateString('en-US', {
			weekday: 'narrow',
			year:    'numeric',
			month:   'long',
			day:     'numeric'
		}).slice(3)
	),

	// --title, prompt, or Example
	title: () => args('title').catch(
		() => question('Plugin Name')
	).catch(
		() => 'Example'
	).then(
		title => title
		.trim()
		.replace(/^(reshape\s+)?/i, 'Reshape ')
	),

	// --id, or formatted title
	id: () => args('id').catch(
		() => answers.title
	).then(
		answer => answer
		.trim()
		.replace(/[^\w]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.toLowerCase()
	),

	// --id-camel, or formatted title
	idCamelCase: () => args('id-camel').catch(
		() => answers.title
	).then(
		answer => `reshape${
			answer
			.trim()
			.replace(/^reshape\s+/i, '')
			.replace(/[^\w\s]+/g, '-')
			.replace(/(^|\s+)-+/g, '$1')
			.replace(/-+(\s+|$)/g, '$1')
			.replace(/\s+./g, match => match.trim().toUpperCase())
			.replace(/^[A-z]/, match => match.toUpperCase())
		}`
	),

	// --author, gitinfo name, prompt, or Reshape Community
	author: () => args('author').catch(
		() => gitinfo('name')
	).catch(
		() => question('GitHub author')
	).catch(
		() => 'Reshape Community'
	),

	// --email, gitinfo email, prompt, or reshape@reshape.ml
	email: () => args('email').catch(
		() => gitinfo('email')
	).catch(
		() => question('GitHub email')
	).catch(
		() => 'reshape@reshape.ml'
	),

	// --email, gitinfo user, prompt, or reshape
	user: () => args('user').catch(
		() => gitinfo('user')
	).catch(
		() => question('GitHub user')
	).catch(
		() => 'reshape'
	),

	// --keywords, or prompt, and then formatted
	keywords: () => args('keywords').catch(
		() => question('Keywords')
	).catch(
		() => ''
	).then(
		keywords => ['reshape', 'html', 'reshape-plugin'].concat(
			keywords
			.trim()
			.split(/\s*,\s*/)
		).join('",\n    "')
	)
}).then(
	// read template files, update their contents with answers, and write them to the destination
	answers => Promise.all([
		fs.readdir(__tpl).then(
			files => Promise.all(files.filter(
				file => file !== ghpages
			).map(
				file => fs.readFile(path.join(__tpl, file), 'utf8').then(
					content => content.replace(
						keys,
						(match, key) => key in answers ? answers[key] : match
					)
				).then(
					content => fs.writeFile(path.join(__out, file.replace(/-template$/, '').replace(patchPkg, '')), content)
				)
			))
		),
		fs.mkdir(__out_ghpages).then(
			() => fs.readdir(__tpl_ghpages).then(
				files => Promise.all(files.map(
					file => fs.readFile(path.join(__tpl_ghpages, file), 'utf8').then(
						content => content.replace(
							keys,
							(match, key) => key in answers ? answers[key] : match
						)
					).then(
						content => fs.writeFile(path.join(__out, ghpages, file.replace(/-template$/, '')), content)
					)
				))
			)
		)
	]).then(
		() => Promise.all([
			fs.rmdir(path.resolve(__out, '.git')).catch(() => {}).then(
				() => child(
					'git init',
					{
						cwd: __out
					}
				)
			).then(
				() => child(
					`git remote add origin git@github.com:${answers.user}/${answers.id}.git`,
					{
						cwd: __out
					}
				)
			),
			fs.rmdir(path.resolve(__out, 'lib')).catch(() => {}),
			fs.rmdir(path.resolve(__tpl)).catch(() => {}),
			fs.touchFile(path.resolve(__out, 'test/basic.html')),
			fs.touchFile(path.resolve(__out, 'test/basic.expect.html')),
			child(
				'git init',
				{
					cwd: __out_ghpages
				}
			).then(
				() => child(
					`git remote add origin git@github.com:${answers.user}/${answers.id}.git`,
					{
						cwd: __out_ghpages
					}
				)
			).then(
				() => child(
					`git checkout --orphan gh-pages`,
					{
						cwd: __out_ghpages
					}
				)
			)
		])
	)
).then(
	() => process.exit(0),
	error => console.warn(error) && process.exit(1)
);
