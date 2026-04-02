import { useEffect, useState } from 'react';
import { supabase, Profile, TeacherAttendance } from '../lib/supabase';
import { CheckCircle2, Clock, MapPin, AlertCircle, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { motion } from 'motion/react';

export default function TeacherAttendancePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<TeacherAttendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(p);

        const today = format(new Date(), 'yyyy-MM-dd');
        const { data: att } = await supabase
          .from('teacher_attendance')
          .select('*')
          .eq('teacher_id', user.id)
          .eq('date', today)
          .single();
        
        setTodayAttendance(att);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAttendance = async () => {
    if (!profile) return;
    setSubmitting(true);

    const today = format(new Date(), 'yyyy-MM-dd');
    const now = new Date();
    const checkInTime = format(now, 'HH:mm:ss');
    
    // Simple logic: late if after 07:30
    const status = now.getHours() > 7 || (now.getHours() === 7 && now.getMinutes() > 30) ? 'late' : 'present';

    try {
      const { data, error } = await supabase
        .from('teacher_attendance')
        .insert({
          teacher_id: profile.id,
          date: today,
          status,
          check_in_time: format(now, 'yyyy-MM-dd HH:mm:ss'),
        })
        .select()
        .single();

      if (error) throw error;
      setTodayAttendance(data);
    } catch (err: any) {
      alert(err.message || 'Gagal melakukan absensi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Absensi Guru & Karyawan</h1>
        <p className="text-slate-500">Silakan lakukan absensi kehadiran harian Anda di sini.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Clock & Info Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-6">
          <div className="space-y-1">
            <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">Waktu Sekarang</p>
            <h2 className="text-5xl font-black text-slate-900 font-mono tracking-tighter">
              {format(currentTime, 'HH:mm:ss')}
            </h2>
            <p className="text-slate-500 font-medium">
              {format(currentTime, 'EEEE, d MMMM yyyy', { locale: id })}
            </p>
          </div>

          <div className="w-full p-4 bg-blue-50 rounded-2xl flex items-center gap-4 text-left">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase">Lokasi Sekolah</p>
              <p className="text-sm font-bold text-slate-800">SMK Negeri 1 Jakarta (Pusat)</p>
            </div>
          </div>

          {!todayAttendance ? (
            <button
              onClick={handleAttendance}
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 text-lg"
            >
              {submitting ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-6 h-6" />
                  Absen Sekarang
                </>
              )}
            </button>
          ) : (
            <div className="w-full bg-emerald-50 border border-emerald-100 p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-center gap-3 text-emerald-600">
                <CheckCircle2 className="w-8 h-8" />
                <span className="text-xl font-bold">Absensi Berhasil!</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-3 rounded-xl border border-emerald-50">
                  <p className="text-slate-400 text-xs mb-1">Status</p>
                  <p className="font-bold text-emerald-600 capitalize">{todayAttendance.status}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-50">
                  <p className="text-slate-400 text-xs mb-1">Waktu</p>
                  <p className="font-bold text-slate-800">{format(new Date(todayAttendance.check_in_time), 'HH:mm')} WIB</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Guidelines & History */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Panduan Absensi
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">1</div>
                <span>Absensi masuk dimulai pukul 06:30 WIB.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">2</div>
                <span>Batas waktu tidak terlambat adalah pukul 07:30 WIB.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">3</div>
                <span>Pastikan GPS aktif dan berada di area sekolah.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Riwayat Minggu Ini</h3>
              <Calendar className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Senin, 30 Mar</p>
                      <p className="text-[10px] text-slate-500">07:12 WIB</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-600 uppercase">Hadir</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
