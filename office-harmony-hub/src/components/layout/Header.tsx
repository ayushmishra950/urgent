
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Search, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from "@/contexts/NotificationContext";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();



  return (
    <header className="sticky top-0 z-20 bg-card border-b border-border px-4 lg:px-6 py-4">
      <div className="flex items-center justify-end gap-4">
        {/* Search */}
        {/* <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>
        </div> */}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button onClick={() => { navigate("/notifications") }} variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px]
                      rounded-full bg-destructive text-destructive-foreground
                      text-xs flex items-center justify-center px-1"
                  >
                    {unreadCount}
                  </span>
                )}

              </Button>
            </DropdownMenuTrigger>
            {/* <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <span className="font-medium">New task assigned</span>
                <span className="text-xs text-muted-foreground">
                  You have been assigned a new high priority task
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <span className="font-medium">Leave approved</span>
                <span className="text-xs text-muted-foreground">
                  Your leave request has been approved
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent> */}
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary-foreground">
                    {user?.username?.charAt(0)}
                  </span>
                </div>
                <span className="hidden md:block font-medium">{user?.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className='cursor-pointer' onClick={() => { navigate("/settings") }}>Profile</DropdownMenuItem>
              <DropdownMenuItem className='cursor-pointer' onClick={() => { navigate("/settings") }}>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive cursor-pointer" onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;

