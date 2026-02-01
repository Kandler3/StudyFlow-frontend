import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Calendar, ClipboardList, CreditCard, Settings, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useApp } from '../context/AppContext';

export function Welcome() {
  const navigate = useNavigate();
  const { userRole, setUserRole } = useApp();
  const [selectedRole, setSelectedRole] = useState<'tutor' | 'student'>(userRole === 'parent' ? 'student' : userRole);

  const features = [
    {
      icon: Calendar,
      title: 'Расписание',
      description: 'Управляйте занятиями и временем',
      link: '/schedule',
    },
    {
      icon: ClipboardList,
      title: 'Задания',
      description: 'Создавайте и отслеживайте ДЗ',
      link: '/assignments',
    },
    {
      icon: CreditCard,
      title: 'Оплаты',
      description: 'Контролируйте финансы',
      link: '/payments',
    },
    {
      icon: Settings,
      title: 'Настройки',
      description: 'Персонализируйте приложение',
      link: '/settings',
    },
  ];

  const handleStart = () => {
    setUserRole(selectedRole);
    navigate('/schedule');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3390ec] to-[#5b9bef] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Calendar className="w-10 h-10 text-[#3390ec]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">StudyFlow</h1>
          <p className="text-white/90 text-lg">
            Управление обучением в одном приложении
          </p>
        </div>

        <Card className="mb-6 bg-white">
          <h2 className="text-lg font-semibold mb-4">Выберите роль</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedRole('tutor')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedRole === 'tutor'
                  ? 'border-[#3390ec] bg-[#3390ec]/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold">Репетитор</div>
              <div className="text-sm text-gray-600 mt-1">Управление учениками</div>
            </button>
            <button
              onClick={() => setSelectedRole('student')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedRole === 'student'
                  ? 'border-[#3390ec] bg-[#3390ec]/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold">Ученик</div>
              <div className="text-sm text-gray-600 mt-1">Просмотр занятий</div>
            </button>
          </div>
        </Card>

        <div className="space-y-3 mb-6">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="bg-white/95 backdrop-blur"
              onClick={() => {
                setUserRole(selectedRole);
                navigate(feature.link);
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#3390ec]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-[#3390ec]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
            </Card>
          ))}
        </div>

        <Button fullWidth size="lg" onClick={handleStart}>
          Начать работу
        </Button>

        <p className="text-center text-white/70 text-sm mt-6">
          Все данные синхронизируются в реальном времени
        </p>
      </div>
    </div>
  );
}
