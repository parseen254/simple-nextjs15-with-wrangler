'use client'

import Link from "next/link"
import { signOut } from "next-auth/react"
import { User } from "next-auth"
import { Button } from "@/components/ui/button"
import { UserIcon, LogOut, CheckCheck } from "lucide-react"

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
                        <>
                            <Link href="/user" className="flex items-center gap-1">
                                <UserIcon className="h-4 w-4" />
                                <span>My Profile</span>
                            </Link>

                            <Button
                                variant="ghost"
                                size="lg"
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="flex items-center gap-1"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Sign Out</span>
                            </Button>
                        </>
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