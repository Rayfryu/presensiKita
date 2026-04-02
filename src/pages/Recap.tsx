import { useEffect, useState } from 'react';
import { supabase, Profile, Student, TeacherAttendance, StudentAttendance } from '../lib/supabase';
import { Calendar, Users, GraduationCap, Download, Search, Filter } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '../lib/utils';

export default function RecapPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<'teacher' | 'student'>('teacher');
  const [teacherAttendance, setTeacherAttendance] = useState<any[]>([]);
  const [studentAttendance, setStudentAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(p);
        if (p?.role !== 'admin') setActiveTab('student');

        // Fetch teacher attendance (Admin only or self)
        const { data: tAtt } = await supabase
          .from('teacher_attendance')
          .select('*, profiles(full_name)')
          .gte('date', dateRange.start)
          .lte('date', dateRange.end)
          .order('date', { ascending: false });
        
        if (tAtt) setTeacherAttendance(tAtt);

        // Fetch student attendance
        const { data: sAtt } = await supabase
          .from('student_attendance')
          .select('*, students(name, nism, class_name), profiles(full_name)')
          .gte('date', dateRange.start)
          .lte('date', dateRange.end)
          .order('date', { ascending: false });
        
        if (sAtt) setStudentAttendance(sAtt);
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900">Rekapitulasi Absensi</h1>
          <p className="text-slate-500">Laporan kehadiran guru dan siswa secara berkala.</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20">
          <Download className="w-5 h-5" />
          Export Excel
        </button>
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
            {profile?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('teacher')}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                  activeTab === 'teacher' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <Users className="w-4 h-4" />
                Absensi Guru
              </button>
            )}
            <button
              onClick={() => setActiveTab('student')}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                activeTab === 'student' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <GraduationCap className="w-4 h-4" />
              Absensi Siswa
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="bg-transparent text-sm font-bold text-slate-700 outline-none"
              />
              <span className="text-slate-400">-</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="bg-transparent text-sm font-bold text-slate-700 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Nama</th>
                {activeTab === 'student' && <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Kelas</th>}
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activeTab === 'teacher' ? (
                teacherAttendance.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {format(new Date(att.date), 'd MMM yyyy', { locale: id })}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{att.profiles?.full_name}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        att.status === 'present' ? "bg-emerald-100 text-emerald-600" :
                        att.status === 'late' ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"
                      )}>
                        {att.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {att.check_in_time ? format(new Date(att.check_in_time), 'HH:mm') : '-'} WIB
                    </td>
                  </tr>
                ))
              ) : (
                studentAttendance.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {format(new Date(att.date), 'd MMM yyyy', { locale: id })}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">{att.students?.name}</p>
                      <p className="text-[10px] text-slate-400">{att.students?.nism}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{att.students?.class_name}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        att.status === 'present' ? "bg-emerald-100 text-emerald-600" :
                        att.status === 'absent' ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                      )}>
                        {att.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">Oleh: {att.profiles?.full_name}</td>
                  </tr>
                ))
              )}
              {((activeTab === 'teacher' && teacherAttendance.length === 0) || (activeTab === 'student' && studentAttendance.length === 0)) && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Tidak ada data absensi ditemukan untuk periode ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
