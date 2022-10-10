import { join } from 'node:path'
import { readFile } from 'node:fs/promises'
import { createRegex, extractRangeFromMatch } from 'verse-reference-regex'

const verseRegex = createRegex({ requireVerse: true })

// The verse range data is formatted like this:
// {
//   book: '1 Samuel',
//   start: { chapter: 13, verse: 1, section: null },
//   end: { chapter: 13, verse: 1, section: null }
// }

// The World-English-Bible data is formatted like this:
// {
// 	"type": "paragraph text",
// 	"chapterNumber": 9,
// 	"verseNumber": 18,
// 	"sectionNumber": 1,
// 	"value": "My God, turn your ear, and hear. Open your eyes, and see our desolations, and the city which is called by your name; for we do not present our petitions before you for our righteousness, but for your great mercies’ sake.  "
// },

export const get_bible_text = async ({ book, start, end }) => {
	const filepath = join('node_modules', 'world-english-bible', 'json', `${book.toLowerCase().replaceAll(' ', '')}.json`)
	const data = JSON.parse(await readFile(filepath, 'utf8'))
	let startIndex
	let endIndex
	let currentIndex = 0
	for (const { chapterNumber, verseNumber } of data) {
		if (startIndex === undefined && chapterNumber === start.chapter && verseNumber === start.verse) {
			startIndex = currentIndex
		}
		if (endIndex === undefined && chapterNumber === end.chapter && verseNumber === end.verse) {
			endIndex = currentIndex
			break
		}
		currentIndex++
	}
	if (startIndex === undefined) throw new Error('Could not find start verse index.')
	if (endIndex === undefined) throw new Error('Could not find end verse index.')
	return data.slice(startIndex, endIndex + 1)
}

export const get_bible_text_from_reference_string = async string => {
	const match = string.match(verseRegex)
	if (!match) throw new Error('Verse did not match regex!')
	const { book, start, end } = extractRangeFromMatch(match)
	if (!start.chapter || !start.verse || !end.chapter || !end.verse) throw new Error('Bad metadata!')
	return {
		book,
		start,
		end,
		parts: await get_bible_text({ book, start, end }),
	}
}
