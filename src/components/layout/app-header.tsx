// src/components/layout/app-header.tsx
"use client";

import type { FC } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, UserCircle, Settings, LifeBuoy } from 'lucide-react';
import FigmaticLogo from '@/components/logo'; // Import the new logo

interface AppHeaderProps {
  // Props kept for potential future use, though not directly used by the header for these actions now
  onExportSVG?: () => void;
  onExportPNG?: () => void;
  onExportJSON?: () => void;
  onToggleFullScreen?: () => void;
  isFullScreen?: boolean;
}

const AppHeader: FC<AppHeaderProps> = () => {
  const { currentUser, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        <Link href="/diagram" className="flex items-center space-x-3 group">
          <FigmaticLogo />
          <span className="text-2xl font-bold text-primary tracking-tight group-hover:text-accent transition-colors duration-200">Figmatic</span>
        </Link>
        
        <div className="flex items-center space-x-3 md:space-x-4">
          {currentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-primary hover:border-accent transition-colors">
                    <AvatarImage src={`https://placehold.co/100x100.png?text=${currentUser.id.substring(0,1).toUpperCase()}`} alt={currentUser.id} data-ai-hint="abstract geometric" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {currentUser.id.substring(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-foreground">{currentUser.id}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      Welcome to Figmatic
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LifeBuoy className="mr-2 h-4 w-4" />
                  <span>Support</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
