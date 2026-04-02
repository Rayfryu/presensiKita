import { useEffect, useState } from 'react';
import { supabase, Profile } from '../lib/supabase';
import { Users, UserCheck, GraduationCap, Calendar, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    todayAttendance: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(p);

        // Fetch stats
        const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true });
        const { count: teacherCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        
        const today = format(new Date(), 'yyyy-MM-dd');
        const { count: attendanceCount } = await supabase
          .from('teacher_attendance')
          .select('*', { count: 'exact', head: true })
          .eq('date', today);

        setStats({
          totalStudents: studentCount || 0,
          totalTeachers: teacherCount || 0,
          todayAttendance: attendanceCount || 0,
        });
      }
    };

    fetchData();
  }, []);

  const cards = [
    { 
      label: 'Total Siswa', 
      value: stats.totalStudents, 
      icon: <GraduationCap className="w-6 h-6 text-blue-600" />, 
      color: 'bg-blue-50',
      trend: '+2% dari bulan lalu'
    },
    { 
      label: 'Total Guru/Karyawan', 
      value: stats.totalTeachers, 
      icon: <Users className="w-6 h-6 text-sky-600" />, 
      color: 'bg-sky-50',
      trend: 'Stabil'
    },
    { 
      label: 'Absensi Guru Hari Ini', 
      value: stats.todayAttendance, 
      icon: <UserCheck className="w-6 h-6 text-emerald-600" />, 
      color: 'bg-emerald-50',
      trend: '95% Kehadiran'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Halo, {profile?.full_name || 'User'}! 👋</h1>
          <p className="text-blue-100 max-w-md">
            Selamat datang di dashboard PresensiKita. Hari ini adalah {format(new Date(), 'EEEE, d MMMM yyyy', { locale: id })}.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <TrendingUp className="w-32 h-32" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-2xl", card.color)}>
                {card.icon}
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Statistik</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-slate-500 font-medium">{card.label}</h3>
              <p className="text-3xl font-bold text-slate-900">{card.value}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-xs text-slate-400">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              {card.trend}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Aktivitas Terbaru</h2>
            <button className="text-blue-600 text-sm font-bold hover:underline">Lihat Semua</button>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800">Absensi Guru Berhasil</p>
                  <p className="text-xs text-slate-500">Guru A melakukan absen masuk pada 07:15 WIB</p>
                </div>
                <span className="text-xs text-slate-400">2j yang lalu</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center space-y-4">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
            <Calendar className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Jadwal Hari Ini</h2>
          <p className="text-slate-500 max-w-xs">
            Pastikan semua guru dan siswa melakukan absensi tepat waktu untuk menjaga kedisiplinan sekolah.
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
            Cek Rekapitulasi
          </button>
        </div>
      </div>
    </div>
  );
}

import { cn } from '../lib/utils';
