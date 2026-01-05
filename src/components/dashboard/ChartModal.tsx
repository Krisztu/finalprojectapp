import React, { useState } from 'react';
import { X, BarChart2 } from 'lucide-react';

interface ChartModalProps {
    isOpen: boolean;
    onClose: () => void;
    grades: any[];
}

export function ChartModal({
    isOpen,
    onClose,
    grades
}: ChartModalProps) {
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

    if (!isOpen) return null;

    const subjects = Object.keys(
        grades.reduce((acc, grade) => {
            const subject = grade.subject || 'Egyéb';
            acc[subject] = true;
            return acc;
        }, {} as Record<string, boolean>)
    );

    const chartData = Object.entries(
        grades.reduce((acc, grade) => {
            const subject = grade.subject || 'Egyéb';
            if (!acc[subject]) acc[subject] = [];
            acc[subject].push(grade);
            return acc;
        }, {} as Record<string, any[]>)
    ).filter(([subject]) => selectedSubject === null || subject === selectedSubject);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm">
            <div className="glass-panel border border-white/10 rounded-xl shadow-2xl p-3 sm:p-8 max-w-6xl w-full max-h-[95vh] overflow-auto animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <BarChart2 className="text-blue-600" />
                            Tantárgyak átlagai
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Részletes diagram nézet</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="bg-white/5 p-4 rounded-lg mb-6 border border-white/10">
                    <h5 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Szűrés tantárgy szerint:</h5>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedSubject(null)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedSubject === null
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                                }`}
                        >
                            Összes tantárgy
                        </button>
                        {subjects.map(subject => (
                            <button
                                key={subject}
                                onClick={() => setSelectedSubject(subject)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedSubject === subject
                                    ? 'bg-blue-500 text-white shadow-md'
                                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                                    }`}
                            >
                                {subject}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="glass-panel border border-white/10 rounded-xl p-6 bg-white/5">
                    <div className="w-full overflow-x-auto">
                        <svg viewBox="0 0 700 450" className="w-full h-96 min-w-[600px]">
                            {chartData.map(([subject, subjectGrades]: [string, any], index: number, filteredArray: any[]) => {
                                const average = subjectGrades.reduce((sum: number, grade: any) => sum + (grade.grade || 0), 0) / subjectGrades.length;
                                const barHeight = (average / 5) * 250;
                                const chartWidth = 550;
                                const barWidth = Math.min(70, (chartWidth / filteredArray.length) - 30);
                                const spacing = chartWidth / filteredArray.length;
                                const x = 100 + index * spacing;
                                const color = average >= 4 ? '#10b981' : average >= 3 ? '#f59e0b' : '#ef4444';
                                return (
                                    <g key={subject}>
                                        <rect
                                            x={x - barWidth / 2}
                                            y={320 - barHeight}
                                            width={barWidth}
                                            height={barHeight}
                                            fill={color}
                                            rx="4"
                                            className="hover:opacity-80 cursor-pointer transition-opacity"
                                        />
                                        <text
                                            x={x}
                                            y={340}
                                            textAnchor="middle"
                                            fontSize="12"
                                            fill="currentColor"
                                            className="text-gray-700 dark:text-gray-300 font-medium"
                                        >
                                            {subject.length > 10 ? subject.slice(0, 10) + '...' : subject}
                                        </text>
                                        <title>{subject}: {average.toFixed(2)}</title>
                                        <text
                                            x={x}
                                            y={310 - barHeight}
                                            textAnchor="middle"
                                            fontSize="14"
                                            fill={color}
                                            className="text-gray-900 dark:text-white font-bold"
                                        >
                                            {average.toFixed(2)}
                                        </text>
                                        <text
                                            x={x}
                                            y={355}
                                            textAnchor="middle"
                                            fontSize="10"
                                            fill="currentColor"
                                            className="text-gray-500 dark:text-gray-400"
                                        >
                                            {subjectGrades.length} jegy
                                        </text>
                                    </g>
                                );
                            })}
                            <line x1="80" y1="320" x2="620" y2="320" stroke="currentColor" strokeWidth="2" className="text-gray-300 dark:text-gray-600" />
                            <line x1="80" y1="70" x2="80" y2="320" stroke="currentColor" strokeWidth="2" className="text-gray-300 dark:text-gray-600" />
                            {[1, 2, 3, 4, 5].map(grade => (
                                <g key={grade}>
                                    <line x1="75" y1={320 - (grade / 5) * 250} x2="85" y2={320 - (grade / 5) * 250} stroke="currentColor" strokeWidth="2" className="text-gray-300 dark:text-gray-600" />
                                    <text x="70" y={320 - (grade / 5) * 250 + 5} textAnchor="end" fontSize="12" fill="currentColor" className="text-gray-600 dark:text-gray-400 font-medium">{grade}</text>
                                    <line x1="80" y1={320 - (grade / 5) * 250} x2="620" y2={320 - (grade / 5) * 250} stroke="currentColor" strokeWidth="1" className="text-gray-200 dark:text-gray-700" opacity="0.3" />
                                </g>
                            ))}
                            <text x="35" y="195" textAnchor="middle" fontSize="12" fill="currentColor" className="text-gray-600 dark:text-gray-400 font-medium" transform="rotate(-90 35 195)">Átlag</text>
                            <text x="350" y="385" textAnchor="middle" fontSize="12" fill="currentColor" className="text-gray-600 dark:text-gray-400 font-medium">Tantárgyak</text>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
