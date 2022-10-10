import { join } from 'node:path'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { parse } from '@saibotsivad/blockdown'
import { load as loadYaml } from 'js-yaml'

import { get_bible_text_from_reference_string } from './get-bible-text.js'
import { format_bible_text } from './format-bible-text.js'

await mkdir('build', { recursive: true })

const blockToParser = {
	aside: async ({ content }) => '\n' + content + '\n\n',
	bible: async ({ metadata }) => format_bible_text(await get_bible_text_from_reference_string(metadata)),
	frontmatter: async ({ content }) => loadYaml(content),
}

const book_content_files = await readdir('book')
	.then(files => files.filter(f => f.endsWith('.md')).sort())

for (const file of book_content_files) {
	const filepath = join('book', file)
	const { blocks, warnings } = parse(await readFile(filepath, 'utf8'))
	if (warnings?.length) {
		console.error('Problem with file: ' + filepath, warnings)
		process.exit(1)
	}
	if (blocks[0].name !== 'frontmatter') {
		console.error(`Frontmatter not found when parsing file "${filepath}"`)
		process.exit(1)
	}
	const file_metadata = loadYaml(blocks[0].content)

	let formatted_string = ''
	for (const { name, id, metadata, content } of blocks.slice(1)) {
		if (!blockToParser[name]) {
			console.log(`Could not locate parser for "${name}" block: ` + filepath)
			process.exit(1)
		}
		try {
			formatted_string += await blockToParser[name]({ id, metadata, content })
		} catch (error) {
			console.error(`Failure when parsing file "${filepath}":`, error)
			process.exit(1)
		}
	}
	await writeFile(join('build', file), formatted_string, 'utf8')
}
