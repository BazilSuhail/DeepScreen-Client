export const DIFFICULTY_COLORS = {
    easy:   'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    hard:   'bg-red-500/10 text-red-400 border-red-500/20',
};

export const EMPTY_PROBLEM = {
    title: '',
    description: '',
    type: 'coding',
    difficulty: 'medium',
    marks: 10,
    order_number: 0,
    coding_details: {
        languages: [
            { languageId: 71, languageName: 'Python' },
            { languageId: 63, languageName: 'JavaScript' },
            { languageId: 54, languageName: 'C++' },
            { languageId: 50, languageName: 'C' },
        ],
        testCases: [{ input: '', expectedOutput: '', isHidden: false }],
    },
    mcq_details: {
        options: [{ text: '', isCorrect: false }],
        multipleCorrect: false,
        explanation: '',
    },
    subjective_details: {
        guideLines: '',
        modelAnswer: '',
    },
};
