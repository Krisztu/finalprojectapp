'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { BehaviorType, BehaviorLevel } from '../types';

interface BehaviorFormProps {
  students: Array<{ id: string; fullName: string; name: string; class: string }>;
  userRole: 'teacher' | 'homeroom_teacher' | 'principal';
  onSubmit: (data: any) => Promise<void>;
  onSuccess?: () => void;
}

export function BehaviorForm({ students, userRole, onSubmit, onSuccess }: BehaviorFormProps) {
  const [formData, setFormData] = useState({
    studentId: '',
    type: 'dicséret' as BehaviorType,
    level: 'szaktanári' as BehaviorLevel,
    reason: ''
  });

  const availableLevels: BehaviorLevel[] = 
    userRole === 'principal' ? ['igazgatói'] :
    userRole === 'homeroom_teacher' ? ['szaktanári', 'osztályfőnöki'] :
    ['szaktanári'];

  const handleSubmit = async () => {
    if (!formData.studentId || !formData.reason) {
      alert('Töltsd ki az összes mezőt!');
      return;
    }

    const student = students.find(s => s.id === formData.studentId);
    if (!student) return;

    try {
      await onSubmit({
        studentId: formData.studentId,
        studentName: student.fullName || student.name,
        studentClass: student.class,
        type: formData.type,
        level: formData.level,
        reason: formData.reason
      });

      setFormData({
        studentId: '',
        type: 'dicséret',
        level: availableLevels[0],
        reason: ''
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Hiba:', error);
    }
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Viselkedés értékelés</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Diák</label>
          <select
            value={formData.studentId}
            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
          >
            <option value="">Válassz diákot</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.fullName || student.name} ({student.class})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Típus</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as BehaviorType })}
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
            >
              <option value="dicséret">Dicséret</option>
              <option value="figyelmeztetés">Figyelmeztetés</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Szint</label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value as BehaviorLevel })}
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
            >
              {availableLevels.map(level => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Indoklás</label>
          <textarea
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
            rows={3}
            placeholder="Írd le az indoklást..."
          />
        </div>

        <Button
          onClick={handleSubmit}
          className={`w-full ${formData.type === 'dicséret' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
        >
          {formData.type === 'dicséret' ? '✓' : '⚠'} Rögzítés
        </Button>
      </CardContent>
    </Card>
  );
}
