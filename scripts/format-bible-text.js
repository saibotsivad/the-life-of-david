export const format_bible_text = ({ book, start, end, parts }) => {
	let formatted_string = `<!-- JSON ${JSON.stringify({ book, start, end })} -->\n\n`
	for (const { type, value, chapterNumber, verseNumber, sectionNumber } of parts) {
		if (type === 'paragraph start') {
			formatted_string += '\n'
		} else if (type === 'paragraph end') {
			formatted_string += '\n'
		} else if (type === 'paragraph text') {
			formatted_string += value
		} else if (type === 'stanza start') {
			formatted_string += '\n'
		} else if (type === 'line text') {
			formatted_string += `> ${value}`
		} else if (type === 'line break') {
			formatted_string += `>`
		} else if (type === 'stanza end') {
			formatted_string += '\n'
		} else {
			console.log('unexpected text part type', { type, value, chapterNumber, verseNumber, sectionNumber })
		}
	}
	return formatted_string + '\n'
}
