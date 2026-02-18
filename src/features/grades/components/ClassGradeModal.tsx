import React, { useState, useEffect } from 'react';
import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { BookOpen, Calendar } from 'lucide-react';

interface Student {
    id: string;
    name: string;
    grade: string;
}

interface ClassGradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    className: string;
    students: { id: string; fullName: string; name: string }[];
    subject: string;
    teacherName: string;
    onSave: (grades: { studentName: string; grade: string }[], title: string, description: string) => Promise<void>;
}

export function ClassGradeModal({ isOpen, onClose, className, students, subject, teacherName, onSave }: ClassGradeModalProps) {
    const [studentGrades, setStudentGrades] = useState<Student[]>([]);
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            setStudentGrades(students.map(s => ({
                id: s.id,
                name: s.fullName || s.name,
                grade: ''
            })));
            setTitle('');
            setDescription('');
        }
    }, [isOpen, students]);

    const handleGradeChange = (index: number, grade: string) => {
        const updated = [...studentGrades];
        updated[index].grade = grade;
        setStudentGrades(updated);
    };

    const handleSave = async () => {
        const validGrades = studentGrades.filter(s => s.grade && s.grade !== '');
        if (validGrades.length === 0) {
            alert('Legalább egy diáknak adj jegyet!');
            return;
        }
        if (!title) {
            alert('Add meg a jegy típusát!');
            return;
        }

        await onSave(
            validGrades.map(s => ({ studentName: s.name, grade: s.grade })),
            title,
            description
        );
        onClose();
    };

    const modalTitle = (
        <div>
            <div className="flex items-center gap-2">
                <span>Osztály jegybeírás</span>
                <span className="text-gray-400 font-normal">|</span>
                <span className="text-blue-600 dark:text-blue-400">{className}</span>
            </div>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400 font-normal">
                <span className="flex items-center gap-1">
                    <BookOpen size={14} /> {subject}
                </span>
                <span className="flex items-center gap-1">
                    <Calendar size={14} /> {new Date().toLocaleDateString('hu-HU')}
                </span>
            </div>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} maxWidth="max-w-4xl">
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Jegy típusa *
                        </label>
                        <select
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                        >
                            <option value="">Válassz típust</option>
                            <option value="Dolgozat">Dolgozat</option>
                            <option value="Felelet">Felelés</option>
                            <option value="Házi dolgozat">Házi dolgozat</option>
                            <option value="Beadandó">Beadandó</option>
                            <option value="Témazáró">Témazáró</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Megjegyzés (opcionális)
                        </label>
                        <Input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="pl. 1-5. fejezet"
                            className="bg-white/5 border-gray-300 dark:border-gray-600"
                        />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-end mb-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">Diákok jegyei</h4>
                        <div className="text-xs text-gray-500">
                            {studentGrades.filter(s => s.grade).length} / {studentGrades.length} jegy megadva
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
                        {studentGrades.map((student, index) => (
                            <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg bg-white/5 border-white/10">
                                <span className="font-medium text-sm truncate mr-2">
                                    {student.name}
                                </span>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(grade => (
                                        <button
                                            key={grade}
                                            onClick={() => handleGradeChange(index, grade.toString())}
                                            className={`w-8 h-8 rounded transition-all ${
                                                student.grade === grade.toString()
                                                    ? grade >= 4 ? 'bg-green-500 text-white scale-110' :
                                                      grade >= 3 ? 'bg-yellow-500 text-white scale-110' :
                                                      'bg-red-500 text-white scale-110'
                                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            {grade}
                                        </button>
                                    ))}
                                    {student.grade && (
                                        <button
                                            onClick={() => handleGradeChange(index, '')}
                                            className="w-8 h-8 rounded bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-red-400 hover:text-white transition-all"
                                            title="Törlés"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <Button
                        onClick={handleSave}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Jegyek rögzítése
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
