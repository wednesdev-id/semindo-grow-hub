import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useSidebar } from '../context/SidebarContext'
import {
  LayoutDashboard,
  Bot,
  ShoppingCart,
  Calendar,
  User,
  ClipboardList,
  FileText,
  Table as TableIcon,
  Files,
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
  Users,
  Plane,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react'

type NavItem = {
  name: string
  icon: React.ReactNode
  path?: string
  permission?: string
  roles?: string[]
  badge?: string
  badgeColor?: string
  subItems?: {
    name: string
    path: string
    permission?: string
    roles?: string[]
    badge?: string
    badgeColor?: string
  }[]
}

// Menu items dengan RBAC
const getMenuItems = (): {
  menuItems: NavItem[]
  supportItems: NavItem[]
  otherItems: NavItem[]
} => {
  const menuItems: NavItem[] = [
    {
      icon: <LayoutDashboard size={20} />,
      name: 'Dashboard',
      path: '/dashboard',
    },
    {
      icon: <MessageSquare size={20} />,
      name: 'Consultation',
      path: '/consultation',
      badge: 'NEW',
      badgeColor: 'bg-[#EFEFEF] text-[#212B36] dark:bg-white/10 dark:text-white',
    },
    {
      icon: <ShoppingCart size={20} />,
      name: 'Marketplace',
      path: '/marketplace',
      badge: 'NEW',
      badgeColor: 'bg-[#EFEFEF] text-[#212B36] dark:bg-white/10 dark:text-white',
      subItems: [
        {
          name: 'Marketplace',
          path: '/marketplace',
        },
        {
          name: 'Export Hub',
          path: '/export-hub',
        }
      ]
    },
    {
      icon: <Calendar size={20} />,
      name: 'Calendar',
      path: '/calendar',
    },
    {
      icon: <User size={20} />,
      name: 'User Profile',
      path: '/profile',
    },
    {
      icon: <ClipboardList size={20} />,
      name: 'Assessment',
      permission: 'take-assessment',
      subItems: [
        {
          name: 'Take Assessment',
          path: '/assessment',
          permission: 'take-assessment',
        },
        {
          name: 'History',
          path: '/assessment/history',
          permission: 'view-own-assessment',
        },
      ],
    },
    {
      icon: <Scale size={20} />, // Legalitas mapped to Forms/Legalitas
      name: 'Legalitas',
      path: '/legality',
    },
    {
      icon: <Wallet size={20} />, // Financing mapped to Tables/Financing
      name: 'Financing',
      path: '/financing',
    },
    {
      icon: <BookOpen size={20} />, // Learning Hub mapped to Pages/Learning
      name: 'Learning Hub',
      path: '/learning-hub',
      permission: 'access-lms',
      subItems: [
        {
          name: 'Courses',
          path: '/learning-hub',
        },
        {
          name: 'Community',
          path: '/community',
        }
      ]
    },
  ]

  const supportItems: NavItem[] = [
    {
      icon: <MessageCircle size={20} />,
      name: 'Chat',
      path: '/chat',
    },
    {
      icon: <Ticket size={20} />,
      name: 'Support Ticket',
      path: '/support',
      badge: 'NEW',
      badgeColor: 'bg-[#EFEFEF] text-[#212B36] dark:bg-white/10 dark:text-white',
    },
    {
      icon: <Mail size={20} />,
      name: 'Email',
      path: '/email',
    },
  ]

  const otherItems: NavItem[] = [
    {
      icon: <PieChart size={20} />,
      name: 'Charts',
      path: '/charts',
    },
    {
      icon: <Box size={20} />,
      name: 'UI Elements',
      path: '/ui-elements',
    },
    {
      icon: <Lock size={20} />,
      name: 'Authentication',
      path: '/auth',
    },
  ]

  return { menuItems, supportItems, otherItems }
}

export default function AppSidebar() {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar()
  const { user, hasPermission, hasRole } = useAuth()
  const location = useLocation()

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: 'menu' | 'support' | 'others'
    index: number
  } | null>(null)
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({})
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const { menuItems, supportItems, otherItems } = getMenuItems()

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  )

  const canViewMenuItem = (item: NavItem) => {
    // If no permission or role specified, show to all
    if (!item.permission && !item.roles) return true

    // Check permission
    if (item.permission && !hasPermission(item.permission)) return false

    // Check roles
    if (item.roles && item.roles.length > 0) {
      const hasRequiredRole = item.roles.some(role => hasRole(role))
      if (!hasRequiredRole) return false
    }

    return true
  }

  const canViewSubItem = (subItem: { permission?: string; roles?: string[] }) => {
    if (!subItem.permission && !subItem.roles) return true

    if (subItem.permission && !hasPermission(subItem.permission)) return false

    if (subItem.roles && subItem.roles.length > 0) {
      const hasRequiredRole = subItem.roles.some(role => hasRole(role))
      if (!hasRequiredRole) return false
    }

    return true
  }

  useEffect(() => {
    let submenuMatched = false
      ;['menu', 'support', 'others'].forEach((menuType) => {
        const items =
          menuType === 'menu' ? menuItems :
            menuType === 'support' ? supportItems :
              otherItems

        items.forEach((nav, index) => {
          if (nav.subItems && canViewMenuItem(nav)) {
            nav.subItems.forEach((subItem) => {
              if (canViewSubItem(subItem) && isActive(subItem.path)) {
                setOpenSubmenu({
                  type: menuType as 'menu' | 'support' | 'others',
                  index,
                })
                submenuMatched = true
              }
            })
          }
        })
      })

    if (!submenuMatched) {
      setOpenSubmenu(null)
    }
  }, [location, isActive])

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }))
      }
    }
  }, [openSubmenu])

  const handleSubmenuToggle = (index: number, menuType: 'menu' | 'support' | 'others') => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null
      }
      return { type: menuType, index }
    })
  }

  const renderMenuItems = (items: NavItem[], menuType: 'menu' | 'support' | 'others') => {
    const filteredItems = items.filter(canViewMenuItem)

    return (
      <ul className="flex flex-col gap-1.5">
        {filteredItems.map((nav, index) => (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`group relative flex w-full items-center gap-2.5 rounded-sm px-4 py-2 font-medium duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? 'bg-graydark dark:bg-meta-4'
                    : ''
                  } ${!isExpanded && !isHovered ? 'lg:justify-center' : 'lg:justify-start'}`}
              >
                <span className="text-white">
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <>
                    <span className="text-bodydark1">{nav.name}</span>
                    {nav.badge && (
                      <span className={`ml-auto rounded px-2 py-0.5 text-xs font-medium ${nav.badgeColor || 'bg-primary text-white'}`}>
                        {nav.badge}
                      </span>
                    )}
                    <ChevronDown
                      className={`ml-auto h-5 w-5 fill-current transition-transform duration-200 ${openSubmenu?.type === menuType && openSubmenu?.index === index
                          ? 'rotate-180'
                          : ''
                        } ${nav.badge ? 'hidden' : ''}`} // Hide chevron if badge is present to avoid crowding? No, keep both if space allows. Actually image shows badge OR chevron usually, but here we have subitems.
                    />
                  </>
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  to={nav.path}
                  className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${isActive(nav.path) ? 'bg-graydark dark:bg-meta-4' : ''
                    } ${!isExpanded && !isHovered ? 'lg:justify-center' : 'lg:justify-start'}`}
                >
                  <span className="text-white">
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <>
                      <span className="text-bodydark1">{nav.name}</span>
                      {nav.badge && (
                        <span className={`ml-auto rounded px-2 py-0.5 text-xs font-medium ${nav.badgeColor || 'bg-primary text-white'}`}>
                          {nav.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              )
            )}
            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`${menuType}-${index}`] = el
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height:
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? `${subMenuHeight[`${menuType}-${index}`]}px`
                      : '0px',
                }}
              >
                <ul className="mt-2 mb-4 flex flex-col gap-2.5 pl-6">
                  {nav.subItems.filter(canViewSubItem).map((subItem) => (
                    <li key={subItem.name}>
                      <Link
                        to={subItem.path}
                        className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium duration-300 ease-in-out hover:text-white ${isActive(subItem.path)
                            ? 'text-white'
                            : 'text-bodydark2'
                          }`}
                      >
                        {subItem.name}
                        {subItem.badge && (
                          <span className={`ml-auto rounded px-2 py-0.5 text-xs font-medium ${subItem.badgeColor || 'bg-primary text-white'}`}>
                            {subItem.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <aside
      className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${isExpanded || isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${!isExpanded && !isHovered && !isMobileOpen ? 'w-20' : 'w-72.5'}`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <Link to="/dashboard" className="flex items-center gap-2">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
                <span className="text-xl font-bold">S</span>
              </div>
              <span className="text-xl font-semibold text-white">Semindo</span>
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
            <h3 className={`mb-4 ml-4 text-sm font-semibold text-bodydark2 ${!isExpanded && !isHovered ? 'lg:hidden' : ''}`}>
              MENU
            </h3>
            {renderMenuItems(menuItems, 'menu')}
          </div>

          {/* SUPPORT */}
          <div className="mt-9">
            <h3 className={`mb-4 ml-4 text-sm font-semibold text-bodydark2 ${!isExpanded && !isHovered ? 'lg:hidden' : ''}`}>
              SUPPORT
            </h3>
            {renderMenuItems(supportItems, 'support')}
          </div>

          {/* OTHERS */}
          <div className="mt-9">
            <h3 className={`mb-4 ml-4 text-sm font-semibold text-bodydark2 ${!isExpanded && !isHovered ? 'lg:hidden' : ''}`}>
              OTHERS
            </h3>
            {renderMenuItems(otherItems, 'others')}
          </div>
        </nav>
      </div>
    </aside>
  )
}
