import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import {
  LayoutDashboard,
  ShoppingCart,
  Calendar,
  User,
  ClipboardList,
  MessageCircle,
  Ticket,
  Mail,
  PieChart,
  Box,
  Lock,
  MessageSquare,
  Wallet,
  BookOpen,
  Scale,
  ChevronDown,
  MoreHorizontal,
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
    {
      icon: <LayoutDashboard size={24} />,
      name: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: <MessageSquare size={24} />,
      name: "Consultation",
      path: "/consultation",
      badge: "NEW",
      badgeColor: "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-white",
    },
    {
      icon: <ShoppingCart size={24} />,
      name: "Marketplace",
      path: "/marketplace",
      badge: "NEW",
      badgeColor: "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-white",
      subItems: [
        {
          name: "Marketplace",
          path: "/marketplace",
        },
        {
          name: "Export Hub",
          path: "/export-hub",
        },
      ],
    },
    {
      icon: <Calendar size={24} />,
      name: "Calendar",
      path: "/calendar",
    },
    {
      icon: <User size={24} />,
      name: "User Profile",
      path: "/profile",
    },
    {
      icon: <ClipboardList size={24} />,
      name: "Assessment",
      permission: "take-assessment",
      subItems: [
        {
          name: "Take Assessment",
          path: "/assessment",
          permission: "take-assessment",
        },
        {
          name: "History",
          path: "/assessment/history",
          permission: "view-own-assessment",
        },
      ],
    },
    {
      icon: <Scale size={24} />,
      name: "Legalitas",
      path: "/legality",
    },
    {
      icon: <Wallet size={24} />,
      name: "Financing",
      path: "/financing",
    },
    {
      icon: <BookOpen size={24} />,
      name: "Learning Hub",
      path: "/learning-hub",
      permission: "access-lms",
      subItems: [
        {
          name: "Courses",
          path: "/learning-hub",
        },
        {
          name: "Community",
          path: "/community",
        },
      ],
    },
  ];

  const supportItems: NavItem[] = [
    {
      icon: <MessageCircle size={24} />,
      name: "Chat",
      path: "/chat",
    },
    {
      icon: <Ticket size={24} />,
      name: "Support Ticket",
      path: "/support",
      badge: "NEW",
      badgeColor: "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-white",
    },
    {
      icon: <Mail size={24} />,
      name: "Email",
      path: "/email",
    },
  ];

  const otherItems: NavItem[] = [
    {
      icon: <PieChart size={24} />,
      name: "Charts",
      path: "/charts",
    },
    {
      icon: <Box size={24} />,
      name: "UI Elements",
      path: "/ui-elements",
    },
    {
      icon: <Lock size={24} />,
      name: "Authentication",
      path: "/auth",
    },
  ];

  return { menuItems, supportItems, otherItems };
};

export default function AppSidebar() {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
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
      <ul className="flex flex-col gap-4">
        {filteredItems.map((nav, index) => (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-active"
                    : "menu-item-inactive"
                  } cursor-pointer ${!isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                  }`}
              >
                <span
                  className={`menu-item-icon-size ${openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDown
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType &&
                        openSubmenu?.index === index
                        ? "rotate-180 text-brand-500"
                        : ""
                      }`}
                  />
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  to={nav.path}
                  className={`menu-item group ${isActive(nav.path)
                      ? "menu-item-active"
                      : "menu-item-inactive"
                    }`}
                >
                  <span
                    className={`menu-item-icon-size ${isActive(nav.path)
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                      }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </Link>
              )
            )}
            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`${menuType}-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height:
                    openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                      ? `${subMenuHeight[`${menuType}-${index}`]}px`
                      : "0px",
                }}
              >
                <ul className="mt-2 space-y-1 ml-9">
                  {nav.subItems.filter(canViewSubItem).map((subItem) => (
                    <li key={subItem.name}>
                      <Link
                        to={subItem.path}
                        className={`menu-dropdown-item ${isActive(subItem.path)
                            ? "menu-dropdown-item-active"
                            : "menu-dropdown-item-inactive"
                          }`}
                      >
                        {subItem.name}
                        <span className="flex items-center gap-1 ml-auto">
                          {subItem.badge && (
                            <span
                              className={`ml-auto ${isActive(subItem.path)
                                  ? "menu-dropdown-badge-active"
                                  : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge`}
                            >
                              {subItem.badge}
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
                  <span className="text-xl font-bold">S</span>
                </div>
                <span className="text-xl font-semibold text-gray-900 dark:text-white">
                  Semindo
                </span>
              </div>
            </>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
              <span className="text-xl font-bold">S</span>
            </div>
          )}
        </Link>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-5 px-4 py-4 lg:mt-9 lg:px-6">
          {/* MENU */}
          <div>
            <h3
              className={`mb-4 ml-4 text-sm font-semibold text-bodydark2 ${!isExpanded && !isHovered ? "lg:hidden" : ""
                }`}
            >
              MENU
            </h3>
            {renderMenuItems(menuItems, "menu")}
          </div>

          {/* SUPPORT */}
          <div className="mt-9">
            <h3
              className={`mb-4 ml-4 text-sm font-semibold text-bodydark2 ${!isExpanded && !isHovered ? "lg:hidden" : ""
                }`}
            >
              SUPPORT
            </h3>
            {renderMenuItems(supportItems, "support")}
          </div>

          {/* OTHERS */}
          <div className="mt-9">
            <h3
              className={`mb-4 ml-4 text-sm font-semibold text-bodydark2 ${!isExpanded && !isHovered ? "lg:hidden" : ""
                }`}
            >
              OTHERS
            </h3>
            {renderMenuItems(otherItems, "others")}
          </div>
        </nav>
      </div>
    </aside>
  );
}
