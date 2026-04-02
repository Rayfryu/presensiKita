import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { CheckCircle, Users, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">P</div>
          <span className="text-2xl font-bold tracking-tight text-blue-900">PresensiKita</span>
        </div>
        <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-all">
          Login
        </Link>
      </nav>

      {/* Hero Section */}
      <header className="px-6 pt-16 pb-24 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-blue-950 leading-tight mb-6">
            Revolusi Absensi Digital <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-sky-400">
              Cepat, Akurat, Terpercaya.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            PresensiKita adalah platform manajemen kehadiran modern yang dirancang khusus untuk institusi pendidikan. 
            Tinggalkan cara lama, beralih ke efisiensi digital.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="w-full sm:w-auto bg-blue-900 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20">
              Mulai Sekarang <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#features" className="w-full sm:w-auto bg-white border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all">
              Pelajari Fitur
            </a>
          </div>
        </motion.div>
      </header>

      {/* Explanation Section */}
      <section id="features" className="bg-slate-50 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-950 mb-4">Apa itu Absensi Digital?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Absensi digital adalah sistem pencatatan kehadiran yang menggunakan teknologi berbasis cloud untuk menggantikan buku absen manual. 
              Data tersimpan secara real-time, aman, dan mudah diakses kapan saja.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Clock className="w-8 h-8 text-blue-600" />,
                title: "Real-time Tracking",
                desc: "Data kehadiran langsung tercatat di server saat itu juga, meminimalisir kecurangan."
              },
              {
                icon: <ShieldCheck className="w-8 h-8 text-blue-600" />,
                title: "Keamanan Data",
                desc: "Tersimpan aman di cloud dengan enkripsi tingkat tinggi, tidak perlu takut data hilang."
              },
              {
                icon: <Users className="w-8 h-8 text-blue-600" />,
                title: "Manajemen Terpusat",
                desc: "Admin dapat memantau kehadiran seluruh guru dan siswa dari satu dashboard tunggal."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100"
              >
                <div className="bg-blue-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-blue-950 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-900 rounded flex items-center justify-center text-white font-bold">P</div>
            <span className="font-bold text-blue-900">PresensiKita</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 PresensiKita. All rights reserved.</p>
          <div className="flex gap-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-blue-600">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
