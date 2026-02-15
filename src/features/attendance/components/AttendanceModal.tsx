import React, { useState, useEffect } from 'react';
import { AttendanceRecord, Lesson, Homework } from '@/shared/types';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Modal } from '@/shared/components/ui/modal';
import { Check, X, Calendar, Clock, BookOpen } from 'lucide-react';

interface AttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    lesson: Lesson | null;
    date: Date;
    initialTopic?: string;
    initialStudents: AttendanceRecord[];
    onSave: (data: { topic: string; students: AttendanceRecord[] }, homework?: Partial<Homework>) => Promise<void>;
    isEdit?: boolean;
    availableDates?: string[];
}

export function AttendanceModal({
    isOpen,
    onClose,
    lesson,
    date,
    initialTopic = '',
    initialStudents,
    onSave,
    isEdit = false,
    availableDates = []
}: AttendanceModalProps) {
    const [topic, setTopic] = useState(initialTopic);
    const [students, setStudents] = useState<AttendanceRecord[]>([]);
    const [showHomeworkForm, setShowHomeworkForm] = useState(false);
    const [homeworkForm, setHomeworkForm] = useState<{ title: string, description: string, dueDate: string }>({
        title: '',
        description: '',
        dueDate: ''
    });

    useEffect(() => {
        if (isOpen) {
            setTopic(initialTopic);
            setStudents(JSON.parse(JSON.stringify(initialStudents)));
            setHomeworkForm({ title: '', description: '', dueDate: '' });
            setShowHomeworkForm(false);
        }
    }, [isOpen, initialTopic, initialStudents]);

    if (!lesson) return null;

    const handleStudentStatusChange = (index: number, present: boolean) => {
        const updatedStudents = [...students];
        updatedStudents[index] = { ...updatedStudents[index], present };
        setStudents(updatedStudents);
    };

    const handleSave = async () => {
        const homeworkData = (showHomeworkForm && homeworkForm.title) ? homeworkForm : undefined;
        await onSave({ topic, students }, homeworkData);
    };

    const presentCount = students.filter(s => s.present).length;
    const absentCount = students.length - presentCount;

    const modalTitle = (
        <div>
            <div className="flex items-center gap-2">
                <span>{isEdit ? 'Mulasztások szerkesztése' : 'Mulasztás rögzítése'}</span>
                <span className="text-gray-400 font-normal">|</span>
                <span className="text-blue-600 dark:text-blue-400">{lesson.Subject}</span>
            </div>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400 font-normal">
                <span className="flex items-center gap-1">
                    <BookOpen size={14} /> {lesson.Class}
                </span>
                <span className="flex items-center gap-1">
                    <Calendar size={14} /> {date.toLocaleDateString('hu-HU')}
                </span>
                <span className="flex items-center gap-1">
                    <Clock size={14} /> {lesson.StartTime}
                </span>
            </div>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} maxWidth="max-w-4xl">
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Óra témája / tananyaga
                    </label>
                    <Input
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="pl. Egyenletek megoldása, Irodalom elemzés..."
                        className="w-full bg-white/5 border-gray-300 dark:border-gray-600"
                    />
                </div>

                <div>
                    <div className="flex justify-between items-end mb-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">Diákok jelenléte</h4>
                        <div className="text-xs space-x-3">
                            <span className="text-green-600 dark:text-green-400 font-medium">{presentCount} Jelen</span>
                            <span className="text-red-600 dark:text-red-400 font-medium">{absentCount} Hiányzik</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {students.map((student, index) => (
                            <div key={student.studentId} className={`flex items-center justify-between p-3 border rounded-lg transition-all ${student.present
                                ? 'bg-white/5 border-white/10'
                                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                }`}>
                                <span className={`font-medium text-sm truncate mr-2 ${!student.present && 'text-red-700 dark:text-red-300'}`}>
                                    {student.studentName}
                                </span>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleStudentStatusChange(index, true)}
                                        className={`p-1.5 rounded transition-colors ${student.present
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                        title="Jelen"
                                    >
                                        <Check size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleStudentStatusChange(index, false)}
                                        className={`p-1.5 rounded transition-colors ${!student.present
                                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                        title="Hiányzik"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-white">Házi feladat (Opcionális)</h4>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowHomeworkForm(!showHomeworkForm)}
                            className="text-xs h-8"
                        >
                            {showHomeworkForm ? '- Mégse' : '+ Hozzáadás'}
                        </Button>
                    </div>

                    {showHomeworkForm && (
                        <div className="space-y-4 bg-gray-50 dark:bg-white/5 p-4 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Cím</label>
                                    <Input
                                        value={homeworkForm.title}
                                        onChange={(e) => setHomeworkForm({ ...homeworkForm, title: e.target.value })}
                                        placeholder="Házi feladat címe"
                                        className="bg-white dark:bg-black/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Határidő</label>
                                    <Input
                                        type="date"
                                        value={homeworkForm.dueDate}
                                        onChange={(e) => setHomeworkForm({ ...homeworkForm, dueDate: e.target.value })}
                                        className="bg-white dark:bg-black/20"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Leírás</label>
                                <Textarea
                                    value={homeworkForm.description}
                                    onChange={(e) => setHomeworkForm({ ...homeworkForm, description: e.target.value })}
                                    placeholder="Részletes leírás..."
                                    rows={3}
                                    className="bg-white dark:bg-black/20 resize-none"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 pt-2">
                    <Button
                        onClick={handleSave}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {isEdit ? 'Módosítások mentése' : 'Rögzítés'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 border-gray-300 dark:border-gray-600"
                    >
                        Mégse
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
