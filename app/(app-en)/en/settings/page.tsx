"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, User, Bell, Shield, Save } from "lucide-react";
import { useUser } from "@/lib/contexts/UserContext";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SettingsEnPage() {
  const { user } = useUser();

  return (
    <div className="space-y-6 page-transition-shell" dir="ltr">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Settings</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Manage your account and platform preferences</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card><CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--primary)_12%,transparent)]"><User className="h-5 w-5 text-[var(--primary)]" /></div>
            <h2 className="text-base font-bold text-[var(--foreground)]">Profile</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>First Name</Label><Input defaultValue={user?.first_name||""} /></div>
              <div className="space-y-2"><Label>Last Name</Label><Input defaultValue={user?.last_name||""} /></div>
            </div>
            <div className="space-y-2"><Label>Email</Label><Input defaultValue={user?.email||""} /></div>
          </div>
          <Button className="mt-4 gap-2" onClick={() => toast.success("Profile saved")}><Save className="h-4 w-4" />Save</Button>
        </CardContent></Card>

        <Card><CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--warning)_12%,transparent)]"><Settings className="h-5 w-5 text-[var(--warning)]" /></div>
            <h2 className="text-base font-bold text-[var(--foreground)]">Appearance</h2>
          </div>
          <div className="flex items-center justify-between rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">Dark / Light Mode</p>
              <p className="text-xs text-[var(--muted-foreground)]">Toggle the application theme</p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--destructive)_10%,transparent)]"><Shield className="h-5 w-5 text-[var(--destructive)]" /></div>
            <h2 className="text-base font-bold text-[var(--foreground)]">Security</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Current Password</Label><Input type="password" placeholder="••••••••" /></div>
            <div className="space-y-2"><Label>New Password</Label><Input type="password" placeholder="••••••••" /></div>
            <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" placeholder="••••••••" /></div>
          </div>
          <Button variant="outline" className="mt-4 gap-2" onClick={() => toast.success("Password updated")}><Shield className="h-4 w-4" />Update Password</Button>
        </CardContent></Card>

        <Card><CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--success)_12%,transparent)]"><Bell className="h-5 w-5 text-[var(--success)]" /></div>
            <h2 className="text-base font-bold text-[var(--foreground)]">Notifications</h2>
          </div>
          <div className="space-y-3">
            {["Notify on bank data sync","Notify on AI classification complete","Notify on new approval request","Notify on filing completion"].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                <p className="text-sm text-[var(--foreground)]">{item}</p>
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-[var(--primary)]" />
              </div>
            ))}
          </div>
        </CardContent></Card>
      </div>
    </div>
  );
}
