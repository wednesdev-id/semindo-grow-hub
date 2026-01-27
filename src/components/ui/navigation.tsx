import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, LayoutDashboard, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, AuthContext } from "@/contexts/AuthContext";
import { useContext } from "react";
import logoSinergiGold from "@/assets/LOGO SINERGI GOLD 1.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const logout = authContext?.logout;

  const navItems = [
    { name: "Beranda", href: "/" },
    { name: "Program & Layanan", href: "/layanan-konsultasi" },
    { name: "Tentang Kami", href: "/tentang-kami" },
    { name: "Kontak", href: "/contact" }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 items-center h-16 gap-8">
          {/* Column 1: Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img
                src={logoSinergiGold}
                alt="Sinergi Gold Logo"
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Column 2: Navigation Menu + CTA Buttons */}
          <div className="hidden lg:flex items-center justify-end gap-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="transition-colors duration-200 font-medium text-sm whitespace-nowrap"
                style={{ color: "#FFFFFF" }}
              >
                {item.name}
              </Link>
            ))}
            
            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Button 
                className="text-white font-medium text-sm" 
                style={{ backgroundColor: "#212A65", width: "180px", height: "50px" }}
              >
                Daftar UMKM
              </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={user.fullName} />
                      <AvatarFallback>{user.fullName?.charAt(0) || "U"}</AvatarFallback>
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
                    <Link to="/marketplace/seller">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Seller Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Unified Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/marketplace/my-orders">
                      <Package className="mr-2 h-4 w-4" />
                      <span>Pesanan Saya</span>
                    </Link>
                  </DropdownMenuItem>
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
              <Button 
                variant="outline" 
                className="font-medium"
                style={{ 
                  backgroundColor: "transparent",
                  color: "#FFFFFF",
                  borderColor: "#FFFFFF",
                  width: "202px",
                  height: "50px"
                }}
                asChild
              >
                <Link to="/login">Masuk</Link>
              </Button>
            )}}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden justify-self-end">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-white hover:text-white/80 transition-colors duration-200"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-black/30 border-t border-white/20">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-3 py-2 text-base font-medium text-white hover:bg-white/10 rounded-md transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 space-y-2">
                <Button 
                  className="w-full text-white font-medium"
                  style={{ backgroundColor: "#212A65" }}
                >
                  Daftar UMKM
                </Button>
                {user ? (
                  <>
                    <div className="flex items-center px-3 py-2">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src="" alt={user.fullName} />
                        <AvatarFallback>{user.fullName?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">{user.fullName}</span>
                        <span className="text-xs text-white/70">{user.email}</span>
                      </div>
                    </div>
                    <Link to="/marketplace/seller" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10 font-medium">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Seller Dashboard
                      </Button>
                    </Link>
                    <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10 font-medium">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Unified Dashboard
                      </Button>
                    </Link>
                    <Link to="/marketplace/my-orders" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10 font-medium">
                        <Package className="mr-2 h-4 w-4" />
                        Pesanan Saya
                      </Button>
                    </Link>
                    <Link to="/profile" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10 font-medium">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Button>
                    </Link>
                    <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10 font-medium" onClick={() => { logout(); setIsOpen(false); }}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full font-medium"
                    style={{ 
                      backgroundColor: "transparent",
                      color: "#FFFFFF",
                      borderColor: "#FFFFFF"
                    }}
                    asChild
                  >
                    <Link to="/login" onClick={() => setIsOpen(false)}>Masuk</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;