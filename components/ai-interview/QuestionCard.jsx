'use client';

import { HiOutlineVolumeUp } from 'react-icons/hi';

export default function QuestionCard({ question, index, totalQuestions, onSpeak }) {
    return (
        <div className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border-2 border-indigo-200 shadow-md">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <span className="inline-block px-3 py-1 bg-indigo-600 text-white text-sm font-bold rounded-full mb-2">
                        Question {index + 1} of {totalQuestions}
                    </span>
                </div>
                <button
                    onClick={() => onSpeak(question)}
                    className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                    title="Read question aloud"
                >
                    <HiOutlineVolumeUp className="w-5 h-5" />
                </button>
            </div>

            <div className="text-xl font-semibold text-gray-800 mb-4 leading-relaxed">
                {question}
            </div>

            <div className="text-sm text-gray-500 italic">
                Take your time to answer thoroughly. Speak clearly and naturally.
            </div>
        </div>
    );
}
