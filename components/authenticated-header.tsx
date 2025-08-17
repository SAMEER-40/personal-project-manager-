"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, User, LogOut, Cloud, Download } from "lucide-react"
import { signOut } from "@/lib/auth-actions"
import { UserProfileSettings } from "./user-profile-settings"

interface AuthenticatedHeaderProps {
  user: any
  userRole: string
  onRoleChange?: (newRole: string) => void
}

export function AuthenticatedHeader({ user, userRole, onRoleChange }: AuthenticatedHeaderProps) {
  const [showSettings, setShowSettings] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  const getUserInitials = (email: string) => {
    return email.split("@")[0].slice(0, 2).toUpperCase()
  }

  const handleRoleChange = (newRole: string) => {
    if (onRoleChange) {
      onRoleChange(newRole)
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 bg-blue-600 text-white flex-shrink-0">
            <AvatarFallback className="bg-blue-600 text-white font-semibold text-xs sm:text-sm">
              {getUserInitials(user.email)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{user.email}</h2>
            <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
              <Cloud className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{userRole} • Synced to cloud</span>
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-blue-200 hover:bg-blue-50 bg-transparent w-full sm:w-auto"
            >
              <Settings className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">Account</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => setShowSettings(true)}>
              <User className="h-4 w-4 mr-2" />
              Profile & Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {showSettings && (
        <UserProfileSettings
          user={user}
          userRole={userRole}
          onClose={() => setShowSettings(false)}
          onRoleChange={handleRoleChange}
        />
      )}
    </>
  )
}
