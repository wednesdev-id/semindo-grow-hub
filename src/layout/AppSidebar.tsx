import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import {
  LayoutDashboard,
  Users,
  Database,
  UserCheck,
  Briefcase,
  GraduationCap,
  ShoppingBag,
  Banknote,
  Globe,
  MessageSquare,
  MessagesSquare,
  BarChart2,
  Settings,
  ShieldAlert,
  Wrench,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  permission?: string;
  roles?: string[];
  badge?: string;
  badgeColor?: string;
  subItems?: {
    name: string;
    path: string;
    permission?: string;
    roles?: string[];
    badge?: string;
    badgeColor?: string;
    new?: boolean;
    pro?: boolean;
  }[];
};

// Menu items dengan RBAC
const getMenuItems = (): {
  menuItems: NavItem[];
  supportItems: NavItem[];
  otherItems: NavItem[];
} => {
  const menuItems: NavItem[] = [
    // 1. Dashboard
    {
      icon: <LayoutDashboard size={20} />,
      name: "Dashboard",
      path: "/dashboard",
      subItems: [
        { name: "Overview Sistem", path: "/dashboard/overview" },
        { name: "Aktivitas Terbaru", path: "/dashboard/activity" },
        { name: "Statistik Pengguna", path: "/dashboard/user-stats" },
        { name: "Status Server & API", path: "/dashboard/server-status", roles: ["admin"] },
        { name: "Notifikasi Sistem", path: "/dashboard/notifications" },
      ],
    },
    // 2. User Management
    {
      icon: <Users size={20} />,
      name: "User Management",
      // Main menu visible to all, sub-items controlled by roles
      subItems: [
        { name: "Semua Pengguna", path: "/users/all", roles: ["admin", "management"] },
        { name: "Manajemen Role & Permission", path: "/users/roles", roles: ["admin"] },
        { name: "Kelola UMKM", path: "/users/umkm", roles: ["admin", "management"] },
        { name: "Kelola Mentor", path: "/users/mentors", roles: ["admin", "management"] },
        { name: "Kelola Trainer", path: "/users/trainers", roles: ["admin", "management"] },
        { name: "Kelola Staf Manajemen", path: "/users/staff", roles: ["admin"] },
        { name: "Kelola Admin", path: "/users/admins", roles: ["admin"] },
        { name: "Import / Export Data User", path: "/users/import-export", roles: ["admin"] },
        { name: "Audit User Activity", path: "/users/audit", roles: ["admin", "management"] },
      ],
    },
    // 3. UMKM Database
    {
      icon: <Database size={20} />,
      name: "UMKM Database",
      // Accessible to UMKM for their own data
      subItems: [
        { name: "Daftar UMKM", path: "/umkm/list", roles: ["admin", "management", "mentor"] },
        { name: "Segmentasi (Pemula / Madya / Utama)", path: "/umkm/segmentation", roles: ["admin", "management", "mentor"] },
        { name: "Region Mapping (Provinsi / Kota)", path: "/umkm/region", roles: ["admin", "management"] },
        { name: "Self-Assessment", path: "/assessment" }, // All can view
        { name: "Status Program", path: "/umkm/program-status" }, // All can view
        { name: "Histori Pendampingan UMKM", path: "/umkm/history", roles: ["admin", "management", "mentor", "umkm"] },
        { name: "Dokumen & Verifikasi UMKM", path: "/umkm/documents", roles: ["admin", "management", "umkm"] },
      ],
    },
    // 4. Mentor Management
    {
      icon: <UserCheck size={20} />,
      name: "Mentor Management",
      subItems: [
        { name: "Daftar Mentor", path: "/mentors/list", roles: ["admin", "management"] },
        { name: "Assign UMKM ke Mentor", path: "/mentors/assign", roles: ["admin", "management"] },
        { name: "Status & Aktivitas Mentor", path: "/mentors/activity", roles: ["admin", "management", "mentor"] },
        { name: "Jadwal Pendampingan", path: "/mentors/schedule" }, // All can view schedule
        { name: "Laporan & KPI Mentor", path: "/mentors/reports", roles: ["admin", "management"] },
        { name: "Approval Laporan Pendampingan", path: "/mentors/approval", roles: ["admin", "management"] },
      ],
    },
    // 5. Program Management
    {
      icon: <Briefcase size={20} />,
      name: "Program Management",
      subItems: [
        { name: "Daftar Program", path: "/programs/list" }, // All can view programs
        { name: "Buat Program Baru", path: "/programs/create", roles: ["admin", "management"] },
        { name: "Batch Management", path: "/programs/batches", roles: ["admin", "management"] },
        { name: "Kurikulum Program", path: "/programs/curriculum" }, // All can view
        { name: "Jadwal Training & Event", path: "/programs/schedule" }, // All can view
        { name: "Peserta per Program", path: "/programs/participants", roles: ["admin", "management", "trainer"] },
        { name: "Outcome & Evaluasi", path: "/programs/evaluation", roles: ["admin", "management"] },
        { name: "Import / Export Data Program", path: "/programs/import-export", roles: ["admin"] },
      ],
    },
    // 6. LMS Manager
    {
      icon: <GraduationCap size={20} />,
      name: "LMS Manager",
      subItems: [
        { name: "Katalog Kelas", path: "/lms/catalog" }, // All can view
        { name: "Kelas Saya", path: "/lms/my-courses" }, // All can view
        { name: "Manajemen Kelas", path: "/lms/instructor/courses", roles: ["admin", "trainer", "management"] },
        { name: "Kategori Kelas", path: "/lms/admin/categories", roles: ["admin"] },
        { name: "Buat Kelas Baru", path: "/lms/create", roles: ["admin", "management", "trainer"] },
        { name: "Video Library", path: "/lms/videos" }, // All can view
        { name: "Assignment & Quiz", path: "/lms/assignments" }, // All participants
        { name: "Sertifikasi", path: "/lms/certificates" }, // All can view their certificates
        { name: "Trainer Management", path: "/lms/trainers", roles: ["admin", "management"] },
        { name: "Review & Moderasi Materi", path: "/lms/review", roles: ["admin", "management", "trainer"] },
        { name: "Statistik LMS", path: "/lms/stats", roles: ["admin", "management", "trainer"] },
      ],
    },
    // 7. Marketplace Manager
    {
      icon: <ShoppingBag size={20} />,
      name: "Marketplace Manager",
      subItems: [
        { name: "Produk UMKM", path: "/marketplace/products" }, // All can view
        { name: "Verifikasi Produk", path: "/marketplace/verification", roles: ["admin", "management"] },
        { name: "Toko UMKM", path: "/marketplace/stores" }, // All can view
        { name: "Transaksi & Order", path: "/marketplace/orders" }, // UMKM can view their own
        { name: "Komplain & Resolusi", path: "/marketplace/complaints", roles: ["admin", "management"] },
        { name: "Fee & Komisi Marketplace", path: "/marketplace/fees", roles: ["admin", "management"] },
        { name: "Integrasi Marketplace Eksternal", path: "/marketplace/integration", roles: ["admin"] },
        { name: "Laporan Marketplace", path: "/marketplace/reports", roles: ["admin", "management"] },
      ],
    },
    // 8. Financing Manager
    {
      icon: <Banknote size={20} />,
      name: "Financing Manager",
      subItems: [
        { name: "Produk Pembiayaan", path: "/financing/products" }, // All can view options
        { name: "Pengajuan UMKM", path: "/financing/applications" }, // UMKM can submit
        { name: "Tahapan Verifikasi", path: "/financing/verification", roles: ["admin", "management", "finance_partner"] },
        { name: "Approval Pembiayaan", path: "/financing/approval", roles: ["admin", "finance_partner"] },
        { name: "Dokumen Pembiayaan", path: "/financing/documents", roles: ["admin", "management", "finance_partner", "umkm"] },
        { name: "Kerjasama Bank / Lembaga Keuangan", path: "/financing/partners", roles: ["admin", "management"] },
        { name: "Reporting Pembiayaan", path: "/financing/reports", roles: ["admin", "management", "finance_partner"] },
      ],
    },
    // 9. Export Hub Manager
    {
      icon: <Globe size={20} />,
      name: "Export Hub Manager",
      subItems: [
        { name: "Panduan Ekspor", path: "/export/guide" }, // All can view guide
        { name: "Buyer Directory", path: "/export/buyers" }, // All can view
        { name: "Checklist Ekspor", path: "/export/checklist" }, // All can use
        { name: "Dokumen Ekspor", path: "/export/documents" }, // All participants
        { name: "Fasilitasi Ekspor", path: "/export/facilitation", roles: ["admin", "management", "umkm"] },
        { name: "Approval Permintaan Konsultasi Ekspor", path: "/export/approval", roles: ["admin", "management"] },
        { name: "Laporan Ekspor", path: "/export/reports", roles: ["admin", "management"] },
      ],
    },
    // 10. Consultation Management
    {
      icon: <MessageSquare size={20} />,
      name: "Consultation Management",
      subItems: [
        { name: "Jadwal Konsultasi", path: "/consultation/schedule" }, // All can book
        { name: "Mentor Assignment", path: "/consultation/assignment", roles: ["admin", "management"] },
        { name: "Riwayat Konsultasi", path: "/consultation/history" }, // All can view their own
        { name: "Chat Monitoring", path: "/consultation/chat", roles: ["admin", "management"] },
        { name: "Case Ticketing System", path: "/consultation/tickets" }, // All can create tickets
        { name: "Konsultasi Ekspor / Legal / Digital", path: "/consultation/specialized" }, // All can access
      ],
    },
    // 11. Community Platform Manager
    {
      icon: <MessagesSquare size={20} />,
      name: "Community Platform Manager",
      subItems: [
        { name: "Forum", path: "/community/forum" }, // All can participate
        { name: "Manajemen Topik", path: "/community/topics", roles: ["admin", "management"] },
        { name: "Post & Komentar", path: "/community/posts" }, // All can post
        { name: "Moderasi Konten", path: "/community/moderation", roles: ["admin", "management"] },
        { name: "Event Komunitas", path: "/community/events" }, // All can view/join
        { name: "Report Misconduct", path: "/community/reports" }, // All can report
      ],
    },
  ];

  const supportItems: NavItem[] = [
    // 12. Analytics & Reporting
    {
      icon: <BarChart2 size={20} />,
      name: "Analytics & Reporting",
      subItems: [
        { name: "UMKM Analytics", path: "/analytics/umkm", roles: ["admin", "management"] },
        { name: "Program Analytics", path: "/analytics/programs", roles: ["admin", "management"] },
        { name: "LMS Insights", path: "/analytics/lms", roles: ["admin", "management", "trainer"] },
        { name: "Pendampingan Analytics", path: "/analytics/mentoring", roles: ["admin", "management", "mentor"] },
        { name: "Pembiayaan Analytics", path: "/analytics/financing", roles: ["admin", "management", "finance_partner"] },
        { name: "Marketplace Analytics", path: "/analytics/marketplace", roles: ["admin", "management"] },
        { name: "Export Analytics", path: "/analytics/export", roles: ["admin", "management"] },
        { name: "Performance KPI (UMKM / Mentor / Program)", path: "/analytics/kpi", roles: ["admin", "management"] },
        { name: "Data Visualization & Export", path: "/analytics/visualization", roles: ["admin", "management"] },
      ],
    },
    // 13. System Settings
    {
      icon: <Settings size={20} />,
      name: "System Settings",
      subItems: [
        { name: "General Settings", path: "/settings/general", roles: ["admin"] },
        { name: "Branding & Identitas Visual", path: "/settings/branding", roles: ["admin"] },
        { name: "Email & Notification Settings", path: "/settings/notifications", roles: ["admin"] },
        { name: "API Key Manager", path: "/settings/api-keys", roles: ["admin"] },
        { name: "Integrasi Pihak Ketiga", path: "/settings/integrations", roles: ["admin"] },
        { name: "Backup & Restore", path: "/settings/backup", roles: ["admin"] },
        { name: "Environment Configuration", path: "/settings/environment", roles: ["admin"] },
      ],
    },
  ];

  const otherItems: NavItem[] = [
    // 14. Logs & Security
    {
      icon: <ShieldAlert size={20} />,
      name: "Logs & Security",
      subItems: [
        { name: "Login Log", path: "/logs/login", roles: ["admin"] },
        { name: "Activity Log", path: "/logs/activity", roles: ["admin"] },
        { name: "Error Log", path: "/logs/error", roles: ["admin"] },
        { name: "Security & Permission Audit", path: "/logs/security", roles: ["admin"] },
        { name: "Firewall Rules", path: "/logs/firewall", roles: ["admin"] },
        { name: "API Access Logs", path: "/logs/api", roles: ["admin"] },
        { name: "Backup Logs", path: "/logs/backups", roles: ["admin"] },
      ],
    },
    // 15. Tools
    {
      icon: <Wrench size={20} />,
      name: "Tools",
      subItems: [
        { name: "Import / Export", path: "/tools/import-export", roles: ["admin"] },
        { name: "Data Cleaner", path: "/tools/cleaner", roles: ["admin"] },
        { name: "Bulk Editor", path: "/tools/bulk-editor", roles: ["admin"] },
        { name: "Sandbox Mode", path: "/tools/sandbox", roles: ["admin"] },
        { name: "Cache Manager", path: "/tools/cache", roles: ["admin"] },
      ],
    },
  ];

  return { menuItems, supportItems, otherItems };
};

export default function AppSidebar() {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleSidebar } = useSidebar();
  const { hasPermission, hasRole } = useAuth();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "menu" | "support" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { menuItems, supportItems, otherItems } = getMenuItems();

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  const canViewMenuItem = (item: NavItem) => {
    if (!item.permission && !item.roles) return true;
    if (item.permission && !hasPermission(item.permission)) return false;
    if (item.roles && item.roles.length > 0) {
      const hasRequiredRole = item.roles.some((role) => hasRole(role));
      if (!hasRequiredRole) return false;
    }
    return true;
  };

  const canViewSubItem = (subItem: {
    permission?: string;
    roles?: string[];
  }) => {
    if (!subItem.permission && !subItem.roles) return true;
    if (subItem.permission && !hasPermission(subItem.permission)) return false;
    if (subItem.roles && subItem.roles.length > 0) {
      const hasRequiredRole = subItem.roles.some((role) => hasRole(role));
      if (!hasRequiredRole) return false;
    }
    return true;
  };

  useEffect(() => {
    let submenuMatched = false;
    ["menu", "support", "others"].forEach((menuType) => {
      const items =
        menuType === "menu"
          ? menuItems
          : menuType === "support"
            ? supportItems
            : otherItems;

      items.forEach((nav, index) => {
        if (nav.subItems && canViewMenuItem(nav)) {
          nav.subItems.forEach((subItem) => {
            if (canViewSubItem(subItem) && isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "menu" | "support" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (
    index: number,
    menuType: "menu" | "support" | "others"
  ) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (
    items: NavItem[],
    menuType: "menu" | "support" | "others"
  ) => {
    const filteredItems = items.filter(canViewMenuItem);

    return (
      <ul className="flex flex-col gap-2">
        {filteredItems.map((nav, index) => {
          const isSubmenuOpen = openSubmenu?.type === menuType && openSubmenu?.index === index;
          const isItemActive = nav.path ? isActive(nav.path) : false;

          return (
            <li key={nav.name}>
              {nav.subItems ? (
                <button
                  onClick={() => handleSubmenuToggle(index, menuType)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                    ${isSubmenuOpen
                      ? "bg-primary/10 text-primary"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    }
                    ${!isExpanded && !isHovered ? "justify-center" : ""}
                  `}
                >
                  <span className={`${isSubmenuOpen ? "text-primary" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"}`}>
                    {nav.icon}
                  </span>

                  {(isExpanded || isHovered || isMobileOpen) && (
                    <>
                      <span className="font-medium text-sm flex-1 text-left whitespace-nowrap animate-in fade-in duration-300">{nav.name}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${isSubmenuOpen ? "rotate-180" : ""
                          }`}
                      />
                    </>
                  )}
                </button>
              ) : (
                nav.path && (
                  <Link
                    to={nav.path}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                      ${isItemActive
                        ? "bg-primary text-white shadow-lg shadow-primary/25"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                      }
                      ${!isExpanded && !isHovered ? "justify-center" : ""}
                    `}
                  >
                    <span className={`${isItemActive ? "text-white" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"}`}>
                      {nav.icon}
                    </span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span className="font-medium text-sm whitespace-nowrap animate-in fade-in duration-300">{nav.name}</span>
                    )}
                  </Link>
                )
              )}

              {/* Submenu */}
              {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                <div
                  ref={(el) => {
                    subMenuRefs.current[`${menuType}-${index}`] = el;
                  }}
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{
                    height: isSubmenuOpen
                      ? `${subMenuHeight[`${menuType}-${index}`]}px`
                      : "0px",
                  }}
                >
                  <ul className="mt-1 ml-4 pl-4 border-l border-slate-200 dark:border-slate-800 space-y-1">
                    {nav.subItems.filter(canViewSubItem).map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          to={subItem.path}
                          className={`block px-4 py-2 rounded-lg text-sm transition-colors duration-200 whitespace-nowrap
                            ${isActive(subItem.path)
                              ? "text-primary bg-primary/5 font-medium"
                              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                            }
                          `}
                        >
                          {subItem.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-all duration-300 ease-in-out border-r border-slate-200 dark:border-slate-800 flex flex-col z-50
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      onMouseEnter={() => !isExpanded && !isMobileOpen && window.innerWidth >= 768 && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header / Logo */}
      <div className={`h-20 flex items-center ${!isExpanded && !isHovered ? "justify-center" : "px-6"}`}>
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 shrink-0">
            <span className="text-xl font-bold">S</span>
          </div>
          {(isExpanded || isHovered || isMobileOpen) && (
            <div className="flex flex-col animate-in fade-in duration-300 whitespace-nowrap overflow-hidden">
              <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Semindo</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">Dashboard</span>
            </div>
          )}
        </Link>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-6 px-4 space-y-8">
        {/* MENU */}
        <div>
          {(isExpanded || isHovered || isMobileOpen) && (
            <h3 className="mb-4 px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap animate-in fade-in duration-300">
              Main Menu
            </h3>
          )}
          {renderMenuItems(menuItems, "menu")}
        </div>

        {/* SUPPORT */}
        <div>
          {(isExpanded || isHovered || isMobileOpen) && (
            <h3 className="mb-4 px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap animate-in fade-in duration-300">
              Support
            </h3>
          )}
          {renderMenuItems(supportItems, "support")}
        </div>

        {/* OTHERS */}
        <div>
          {(isExpanded || isHovered || isMobileOpen) && (
            <h3 className="mb-4 px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap animate-in fade-in duration-300">
              Others
            </h3>
          )}
          {renderMenuItems(otherItems, "others")}
        </div>
      </div>

      {/* Footer / Toggle */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <button
          onClick={toggleSidebar}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all duration-200
            ${!isExpanded && !isHovered ? "justify-center" : ""}
          `}
        >
          {isExpanded ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          {(isExpanded || isHovered || isMobileOpen) && (
            <span className="font-medium text-sm whitespace-nowrap animate-in fade-in duration-300">Collapse Sidebar</span>
          )}
        </button>
      </div>
    </aside>
  );
}
