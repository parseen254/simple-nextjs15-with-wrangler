'use client'

import Link from "next/link"
import { signOut } from "next-auth/react"
import { User } from "next-auth"
import { Button } from "@/components/ui/button"
import { 
  UserIcon, 
  LogOut, 
  CheckCheck, 
  ListTodo,
  Settings
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type NavbarProps = {
    user: User | undefined
}

export function Navbar({ user }: NavbarProps) {
    return (
        <nav className="w-full border-b py-4">
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center gap-1 font-bold text-xl">
                    <CheckCheck className="h-5 w-5" />
                    <Link href="/">Todo.App</Link>
                </div>
                <div className="flex items-center gap-4">
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  className="relative border h-12 w-12 rounded-full shadow-lg"
                                  aria-label="User menu"
                                >
                                    <UserIcon className="size-5" />
                                  
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>
                                  <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium">{user.name || 'User'}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                  </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                  <Link href="/todos" className="flex items-center gap-2 cursor-pointer w-full">
                                    <ListTodo className="h-4 w-4" />
                                    <span>My Todos</span>
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href="/profile" className="flex items-center gap-2 cursor-pointer w-full">
                                    <UserIcon className="h-4 w-4" />
                                    <span>My Profile</span>
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => signOut({ callbackUrl: '/' })}
                                  className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                                >
                                  <LogOut className="h-4 w-4" />
                                  <span>Sign Out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link href="/signin">
                            <Button variant="default" size="lg">Sign In</Button>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}