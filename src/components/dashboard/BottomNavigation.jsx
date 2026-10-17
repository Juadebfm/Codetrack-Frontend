import { LayoutGrid, SquarePen, Target, GraduationCap, BarChart3 } from 'lucide-react';

const BottomNavigation = () => {
  const navItems = [
    { icon: LayoutGrid, label: 'Dashboard', href: '#top', active: true },
    { icon: SquarePen, label: 'Log', href: '#recent-log', active: false },
    { icon: Target, label: 'Goals', href: '#goals', active: false },
    { icon: GraduationCap, label: 'Skills', href: '#heatmap', active: false },
    { icon: BarChart3, label: 'Stats', href: '#activity', active: false },
  ];

  return (
    <nav aria-label="Primary navigation" className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            aria-current={item.active ? 'page' : undefined}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
              item.active
                ? 'text-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <item.icon size={24} />
            <span className="text-xs font-medium">{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
