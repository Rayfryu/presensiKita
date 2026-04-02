import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { supabase, Profile } from '../lib/supabase';
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  ClipboardList, 
  UserCog, 
  LogOut, 
  ChevronRight,
  Menu,
  X,
  GraduationCap
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Layout() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setProfile(data);
        } else {
          // If no profile exists, maybe it's the first user?
          // In a real app, we'd handle this with a trigger.
          // For this demo, let's assume profiles are managed.
        }
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const menuItems = [
    { icon: <LayoutDashboard />, label: 'Dashboard', path: '/app' },
    { icon: <UserCheck />, label: 'Absensi Guru', path: '/app/absensi-guru' },
    { icon: <GraduationCap />, label: 'Absensi Siswa', path: '/app/absensi-siswa' },
    { 
      icon: <ClipboardList />, 
      label: 'Rekap Absensi', 
      path: '/app/rekap',
    },
  ];

  if (profile?.role === 'admin') {
    menuItems.push(
      { icon: <Users />, label: 'Data Siswa', path: '/app/data-siswa' },
      { icon: <UserCog />, label: 'Kelola User', path: '/app/users' }
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-blue-950 to-blue-900 text-white transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          !sidebarOpen && "-translate-x-full lg:hidden"
        )}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-400 rounded-xl flex items-center justify-center text-blue-950 font-bold text-xl shadow-lg shadow-sky-400/20">P</div>
              <span className="text-xl font-bold tracking-tight">PresensiKita</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <div className="text-xs font-semibold text-sky-400/60 uppercase tracking-wider px-4 mb-4">Main Menu</div>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                  location.pathname === item.path 
                    ? "bg-sky-400 text-blue-950 font-bold shadow-lg shadow-sky-400/20" 
                    : "hover:bg-white/10 text-sky-100/70 hover:text-white"
                )}
              >
                <span className={cn("shrink-0", location.pathname === item.path ? "text-blue-950" : "text-sky-400/60 group-hover:text-sky-300")}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {location.pathname === item.path && <ChevronRight className="w-4 h-4" />}
              </Link>
            ))}
          </div>

          <div className="p-6 border-t border-white/10">
            <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-400/20 flex items-center justify-center text-sky-400 font-bold">
                {profile?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{profile?.full_name || 'User'}</p>
                <p className="text-xs text-sky-400/60 capitalize">{profile?.role || 'Teacher'}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-6 h-6 text-slate-600" />
          </button>
          
          <div className="flex-1 px-4 hidden md:block">
            <h2 className="text-lg font-bold text-slate-800">
              {menuItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-sm font-bold text-slate-900">{profile?.full_name}</span>
              <span className="text-xs text-slate-500 capitalize">{profile?.role}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl font-bold transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
