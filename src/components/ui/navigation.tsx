import { useState, useMemo, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, LayoutDashboard, Package, ChevronDown } from "lucide-react";
import { AuthContext } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { featureFlags } from "@/config/feature-flags";
import logoSinergi from "@/assets/logo-sinergi-gold.png";

interface NavigationProps {
  onDaftarClick?: () => void;
  variant?: "transparent" | "solid";
}

const Navigation = ({ onDaftarClick, variant = "solid" }: NavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const logout = authContext?.logout;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = useMemo(() => [
    { name: "Beranda", href: "/" },
    { name: "Program & Layanan", href: "#", hasDropdown: true },
    { name: "Tentang Kami", href: "/tentang-kami" },
    { name: "Kontak", href: "/contact" }
  ], []);

  const isSolid = true;
  const textColorClass = "text-slate-600 hover:text-primary";
  const mobileMenuButtonClass = "text-slate-600";

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-100 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <img
                src={logoSinergi}
                alt="Sinergi Logo"
                className="h-14 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              item.hasDropdown ? (
                <div key={item.name} className="relative group">
                  <button className={`${textColorClass} flex items-center gap-1 transition-colors duration-200 font-medium text-base py-2`}>
                    {item.name}
                    <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
                  </button>

                  {/* Dropdown Content */}
                  <div className="absolute top-full left-0 mt-2 w-[480px] bg-white rounded-xl shadow-xl border border-slate-100 p-8 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0">
                    <div className="grid grid-cols-2 gap-12">
                      {/* Program Kami */}
                      <div>
                        <h4 className="font-bold text-slate-900 mb-4 text-base">Program kami</h4>
                        <ul className="space-y-3">
                          <li>
                            <Link to="/self-assessment" className="block text-slate-600 hover:text-primary transition-colors text-sm">
                              Self Assessment
                            </Link>
                          </li>
                          <li>
                            <Link to="/learning-hub" className="block text-slate-600 hover:text-primary transition-colors text-sm">
                              Learning Hub
                            </Link>
                          </li>
                        </ul>
                      </div>

                      {/* Layanan Kami */}
                      <div>
                        <h4 className="font-bold text-slate-900 mb-4 text-base">Layanan kami</h4>
                        <ul className="space-y-3">
                          <li>
                            <Link to="/layanan-konsultasi" className="block text-slate-600 hover:text-primary transition-colors text-sm">
                              Konsultasi
                            </Link>
                          </li>
                          <li>
                            <Link to="/programs" className="block text-slate-600 hover:text-primary transition-colors text-sm">
                              Pendampingan
                            </Link>
                          </li>
                          <li>
                            <Link to="/programs" className="block text-slate-600 hover:text-primary transition-colors text-sm">
                              Sertifikasi & Legalitas
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${textColorClass} transition-colors duration-200 font-medium text-base`}
                >
                  {item.name}
                </Link>
              )
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border border-slate-200">
                      <AvatarImage src="" alt={user.fullName} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {user.fullName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.fullName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  {featureFlags.MARKETPLACE_ENABLED && (
                    <DropdownMenuItem asChild>
                      <Link to="/marketplace/my-orders">
                        <Package className="mr-2 h-4 w-4" />
                        <span>Pesanan Saya</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">

                <Button
                  variant="default"
                  onClick={onDaftarClick}
                  className="bg-primary hover:bg-primary/90 text-white font-medium px-6 rounded-lg shadow-sm"
                >
                  Daftar UMKM
                </Button>

                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="text-slate-600 hover:text-primary hover:bg-slate-50 font-medium px-6 transition-colors"
                  >
                    Masuk
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 transition-colors duration-200 ${mobileMenuButtonClass} hover:text-primary`}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="lg:hidden absolute top-20 left-0 right-0 bg-white border-b border-slate-100 shadow-lg animate-in slide-in-from-top-2">
          {/* Mobile menu content behaves like standard white menu */}
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="block px-4 py-3 text-base font-medium text-slate-600 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            <div className="pt-4 mt-4 border-t border-slate-100">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center px-4 py-2">
                    <Avatar className="h-10 w-10 mr-3 border border-slate-200">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.fullName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-900">{user.fullName}</span>
                      <span className="text-xs text-slate-500">{user.email}</span>
                    </div>
                  </div>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-slate-600">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => { logout(); setIsOpen(false); }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 px-4">
                  <Button variant="default" onClick={() => { onDaftarClick?.(); setIsOpen(false); }} className="w-full bg-primary text-white">
                    Daftar UMKM
                  </Button>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="w-full">
                    <Button variant="ghost" className="w-full justify-center text-slate-600 border border-slate-200">
                      Masuk
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;