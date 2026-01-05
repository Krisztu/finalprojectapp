import React from 'react';
import { Homework, HomeworkSubmission } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Check, XCircle, FileText } from 'lucide-react';

interface HomeworkModalProps {
    isOpen: boolean;
    onClose: () => void;
    homework: Homework | null;
    userRole: string;
    onUpdateSubmissionStatus?: (submissionId: string, status: 'completed' | 'incomplete') => Promise<void>;
}

export function HomeworkModal({
    isOpen,
    onClose,
    homework,
    userRole,
    onUpdateSubmissionStatus
}: HomeworkModalProps) {
    if (!isOpen || !homework) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm">
            <div className="glass-panel border border-white/10 rounded-xl shadow-2xl p-3 sm:p-6 max-w-4xl w-full max-h-[90vh] overflow-auto animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{homework.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                            <span className="font-medium">{homework.subject}</span>
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            <span>{homework.teacherName}</span>
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            <span>Határidő: {new Date(homework.dueDate).toLocaleDateString('hu-HU')}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="mb-6">
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white flex items-center gap-2">
                        <FileText size={18} />
                        Feladat leírása
                    </h4>
                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-white/5 p-4 rounded-lg border border-white/10 shadow-inner">
                        {homework.description}
                    </div>
                </div>

                {userRole === 'teacher' && homework.submissions && (
                    <div className="border-t border-white/10 pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                Beadások ({homework.submissions.length})
                            </h4>
                            <Badge variant="outline">
                                {homework.submissions.filter(s => s.grade || s.status === 'completed').length} értékelve
                            </Badge>
                        </div>

                        <div className="space-y-3">
                            {homework.submissions.length === 0 ? (
                                <p className="text-gray-500 italic text-center py-4">Még nincsenek beadások.</p>
                            ) : (
                                homework.submissions.map((submission: HomeworkSubmission) => (
                                    <div key={submission.id} className="border border-white/10 rounded-lg p-4 bg-white/5 hover:bg-white/10 transition-colors">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h5 className="font-medium text-gray-900 dark:text-white text-lg">{submission.studentName}</h5>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Beküldve: {new Date(submission.submittedAt).toLocaleString('hu-HU')}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                {(submission.grade || submission.status === 'completed') ? (
                                                    <Badge className="bg-green-500 hover:bg-green-600">
                                                        <Check size={12} className="mr-1" />
                                                        {submission.grade || 'Elfogadva'}
                                                    </Badge>
                                                ) : submission.status === 'incomplete' ? (
                                                    <Badge className="bg-red-500 hover:bg-red-600">
                                                        <XCircle size={12} className="mr-1" />
                                                        Hiányos
                                                    </Badge>
                                                ) : (
                                                    <div className="flex gap-1">
                                                        {onUpdateSubmissionStatus && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 border-green-200 dark:border-green-800"
                                                                    onClick={() => onUpdateSubmissionStatus(submission.id, 'completed')}
                                                                >
                                                                    <Check size={14} className="mr-1" />
                                                                    Elfogad
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                                                                    onClick={() => onUpdateSubmissionStatus(submission.id, 'incomplete')}
                                                                >
                                                                    <XCircle size={14} className="mr-1" />
                                                                    Hiányos
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-black/5 dark:bg-black/20 p-3 rounded-md text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                            {submission.content}
                                        </div>

                                        {submission.image && (
                                            <div className="mt-3">
                                                <img src={submission.image} alt="Csatolmány" className="max-h-48 rounded-md border border-white/10" />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
