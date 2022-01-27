const table = {
  А: 'A',
  а: 'a',
  Б: 'B',
  б: 'b',
  В: 'V',
  в: 'v',
  Г: 'G',
  г: 'g',
  Д: 'D',
  д: 'd',
  Е: 'Ye',
  е: 'ye',
  Ё: 'Yo',
  ё: 'yo',
  Ж: 'J',
  ж: 'j',
  З: 'Z',
  з: 'z',
  И: 'I',
  и: 'i',
  Й: 'I',
  й: 'i',
  К: 'K',
  к: 'k',
  Л: 'L',
  л: 'l',
  М: 'M',
  м: 'm',
  Н: 'N',
  н: 'n',
  О: 'O',
  о: 'o',
  П: 'P',
  п: 'p',
  Р: 'R',
  р: 'r',
  С: 'S',
  с: 's',
  Т: 'T',
  т: 't',
  У: 'U',
  у: 'u',
  Ф: 'F',
  ф: 'f',
  Х: 'Kh',
  х: 'kh',
  Ц: 'Ts',
  ц: 'ts',
  Ч: 'Ch',
  ч: 'ch',
  Ш: 'Sh',
  ш: 'sh',
  Щ: 'Shch',
  щ: 'shch',
  Ы: 'II',
  ы: 'ii',
  Э: 'E',
  э: 'e',
  Ю: 'Yu',
  ю: 'yu',
  Я: 'Ya',
  я: 'ya',
  Ь: 'I',
  ь: 'i',
  Ъ: 'I',
  ъ: 'i',
  ө: 'u',
  Ө: 'U',
  ү: 'u',
  Ү: 'U',
};

let keys,
  specialCases,
  singleLetter,
  searchPattern,
  lookupTable,
  i = 0;

// Function used by the resulting replace function
lookupTable = function(input) {
  return input in table ? table[input] : input;
};

// Fetch and sort the keys in the translitteration table object, to
// ensure the longest keys in the table is first in the array. Then
// it will find the position of the first one-letter index and split
// the keys into single letter indexes and longer 'specialCases.'
keys = Object.keys(table).sort(function(a, b) {
  return b.length - a.length;
});

for (; keys[i]; i += 1) {
  if (keys[i].length === 1) {
    break; // first one-letter index has been found, break out
  }
}

specialCases = keys.slice(0, i).join('|');
singleLetter = keys.slice(i).join('');
keys = undefined; // reset keys

// Compile a regular expression using the keys found in the given
// translitteration object.
//
// specialCases are joined together with a pipe; `|`
// singleLetters joined together and wrapped in square brackets so
// that the resulting regular expressing have the following format:
//
//     /aa|bb|cc|[abc]/g
//
// This should create a working regular expression that will look
// for every key in the transliteration table.
searchPattern = new RegExp(
  [specialCases, singleLetter ? '[' + singleLetter + ']' : ''].join(
    singleLetter && specialCases ? '|' : '',
  ),
  'g',
);

/**
 * Search for occurrences of entries in the translitteration table
 * and replace these with their corresponding values.
 *
 * @param [String] subject to transliterate.
 * @return [String] transliterated string
 */
export const converter = function(subject: any) {
  // input sanity check, we expect a string
  if (typeof subject !== 'string') {
    // Try to run toString, if it exist
    if (subject && typeof subject.toString === 'function') {
      subject = subject.toString();
    }
    // Return an empty string on empty and falsy input values
    else {
      return '';
    }
  }

  // Replace letters in the input using the lookup table and the
  // compiled search pattern.
  return subject.replace(searchPattern, lookupTable);
};
