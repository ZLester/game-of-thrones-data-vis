const fs = require('fs');

const stopWordList = require('./stop-words.json');

const seasons = [
    require('./season1.json'),
    require('./season2.json'),
    require('./season3.json'),
    require('./season4.json'),
    require('./season5.json'),
    require('./season6.json'),
    require('./season7.json'),
];

const stopWords = new Set(stopWordList);

const getWordFrequencyByLine = (freq, line) => {
    const words = line
        .replace(/[^a-zA-Z0-9 \']/gi, '')
        .split(' ')
        .map(word => word.toLowerCase())
        .filter(word => Boolean(word.length) && !stopWords.has(word));

    words.forEach(word => {
        const wordClean = word.toLowerCase();
        if (!freq[wordClean]) {
            freq[wordClean] = 0;
        }
        freq[wordClean]++;
    });

    return freq;
};

const sortWordTuples = (a, b) => {
    if (a[1] > b[1]) {
        return -1;
    }
    if (a[1] < b[1]) {
        return 1;
    }
    return 0;
};

const getSeasonWordFrequency = (season) => Object.values(season)
        .map(episode => Object.values(episode))
        .reduce((lines, episodeLines) => [...lines, ...episodeLines], [])
        .reduce(getWordFrequencyByLine, {});

const getWordFrequencyTuples = (wordFrequencyMap) => Object.entries(wordFrequencyMap);

const getSortedWordFrequencyTuples = (wordFrequencyTuples) => wordFrequencyTuples.sort(sortWordTuples);

const getWordFrequencyMap = (wordFrequencyTuples) => wordFrequencyTuples
    .reduce((acc, [word, value]) => ({ ...acc, [word]: value }), {});

const writeDataToFile = (data, filename) => fs.writeFileSync(filename, JSON.stringify(data, null, 2));

const allSeasonsWordFrequencies = seasons
    .reduce((freq, season, i) => {
        const seasonWordFrequency = getSeasonWordFrequency(season);

        Object.entries(seasonWordFrequency).forEach(([word, value]) => {
            if (!freq[word]) {
                freq[word] = 0;
            }
            freq[word] += value;
        });

        return freq;
    });

const allSeasonsWordFrequencyTuples = getWordFrequencyTuples(allSeasonsWordFrequencies);
const sortedAllSeasonsWordFrequencyTuples = getSortedWordFrequencyTuples(allSeasonsWordFrequencyTuples);

writeDataToFile(sortedAllSeasonsWordFrequencyTuples, 'allSeasonsWordFrequency.json');
writeDataToFile(sortedAllSeasonsWordFrequencyTuples.slice(0, 100), 'allSeasonsTop100WordFrequency.json');
