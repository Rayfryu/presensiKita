import { useEffect, useState } from 'react';
import { supabase, Profile, Student, StudentAttendance } from '../lib/supabase';
import { Search, GraduationCap, CheckCircle2, XCircle, Clock, AlertCircle, Save } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '../lib/utils';

export default function StudentAttendancePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late' | 'sick' | 'permission'>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [classes, setClasses] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(p);

        const { data: s } = await supabase.from('students').select('*').order('name');
        if (s) {
          setStudents(s);
          const uniqueClasses = Array.from(new Set(s.map(student => student.class_name)));
          setClasses(uniqueClasses);
          if (uniqueClasses.length > 0) setSelectedClass(uniqueClasses[0]);
        }
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late' | 'sick' | 'permission') => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const saveAttendance = async () => {
    if (!profile || !selectedClass) return;
    setSubmitting(true);

    const today = format(new Date(), 'yyyy-MM-dd');
    const records = Object.entries(attendance).map(([studentId, status]) => ({
      student_id: studentId,
      teacher_id: profile.id,
      date: today,
      status,
    }));

    try {
      const { error } = await supabase.from('student_attendance').upsert(records);
      if (error) throw error;
      alert('Berhasil menyimpan absensi siswa!');
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan absensi.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.class_name === selectedClass && 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-slate-900">Absensi Siswa</h1>
          <p className="text-slate-500">Pilih kelas dan lakukan absensi untuk hari ini.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-2 text-blue-700 font-bold">
            <Clock className="w-4 h-4" />
            {format(new Date(), 'd MMMM yyyy', { locale: id })}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama siswa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700"
          >
            {classes.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            onClick={saveAttendance}
            disabled={submitting || Object.keys(attendance).length === 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Simpan Absensi
              </>
            )}
          </button>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Siswa</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Hadir</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Izin</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Sakit</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Alpa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{student.name}</p>
                        <p className="text-xs text-slate-500">{student.nism}</p>
                      </div>
                    </div>
                  </td>
                  {['present', 'permission', 'sick', 'absent'].map((status) => (
                    <td key={status} className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleStatusChange(student.id, status as any)}
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all mx-auto",
                          attendance[student.id] === status
                            ? status === 'present' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                            : status === 'permission' ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                            : status === 'sick' ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                            : "bg-red-500 text-white shadow-lg shadow-red-500/20"
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                        )}
                      >
                        {status === 'present' && <CheckCircle2 className="w-5 h-5" />}
                        {status === 'permission' && <AlertCircle className="w-5 h-5" />}
                        {status === 'sick' && <AlertCircle className="w-5 h-5" />}
                        {status === 'absent' && <XCircle className="w-5 h-5" />}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Tidak ada data siswa ditemukan.
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
