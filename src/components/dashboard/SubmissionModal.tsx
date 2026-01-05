import React, { useState } from 'react';
import { Homework } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadToCloudinary } from '@/lib/cloudinary';

interface SubmissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    homework: Homework | null;
    onSubmit: (content: string, attachments?: string[]) => Promise<void>;
}

export function SubmissionModal({
    isOpen,
    onClose,
    homework,
    onSubmit
}: SubmissionModalProps) {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    if (!isOpen || !homework) return null;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const url = await uploadToCloudinary(file);
            setImageUrl(url);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Hiba a kép feltöltése során');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!content.trim() && !imageUrl) {
            alert('Írj leírást vagy csatolj képet!');
            return;
        }

        try {
            setIsSubmitting(true);
            await onSubmit(content, imageUrl ? [imageUrl] : []);
            setContent('');
            setImageUrl(null);
            onClose();
        } catch (error) {
            console.error(error);

        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm">
            <div className="glass-panel border border-white/10 rounded-xl shadow-2xl p-3 sm:p-6 max-w-2xl w-full animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Házi feladat beadása</h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">{homework.title}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Megoldás / Válasz:</label>
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full bg-white dark:bg-black/20"
                            rows={6}
                            placeholder="Írd le a megoldásodat, válaszodat..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Kép csatolása (opcionális):</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                id="homework-file-upload"
                            />
                            <label
                                htmlFor="homework-file-upload"
                                className={`flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {uploading ? (
                                    <Loader2 className="animate-spin mr-2" size={16} />
                                ) : (
                                    <Upload size={16} className="mr-2" />
                                )}
                                <span className="text-sm">Kép feltöltése</span>
                            </label>
                            {imageUrl && (
                                <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
                                    <ImageIcon size={16} className="mr-1" />
                                    Kép feltöltve
                                </div>
                            )}
                        </div>
                        {imageUrl && (
                            <div className="mt-2 relative inline-block">
                                <img src={imageUrl} alt="Uploaded" className="h-20 w-auto rounded border" />
                                <button
                                    onClick={() => setImageUrl(null)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || uploading}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={16} />
                                    Küldés...
                                </>
                            ) : (
                                '📤 Beküldés'
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            Mégse
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
