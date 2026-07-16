"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/table";
import { Toggle } from "@/components/ui/toggle";
import { Settings, User, Bell, Shield, Save, CreditCard, Briefcase, Users2, Plus, Globe } from "lucide-react";
import { useUser } from "@/lib/contexts/UserContext";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SUBSCRIPTION, SERVICES, CLIENTS, NOTIFICATIONS } from "@/lib/mock";
import { formatCurrency } from "@/lib/utils/format";

const notificationLabelsEn: Record<string, string> = {
  liquidity_alert: "Liquidity threshold alerts",
  weekly_report: "Weekly email report",
  credit_rating_change: "Credit rating change alerts",
  new_financing_offers: "New matched financing offers",
};

export default function SettingsEnPage() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  function toggleNotification(key: string) {
    setNotifications(prev => prev.map(n => n.key === key ? { ...n, enabled: !n.enabled } : n));
  }

  return (
    <div className="space-y-6 page-transition-shell" dir="ltr">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Settings</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Manage your account and platform preferences</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--primary)_12%,transparent)]">
                <User className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <h2 className="text-base font-bold text-[var(--foreground)]">Profile</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>First name</Label><Input defaultValue={user?.first_name || ""} /></div>
                <div className="space-y-2"><Label>Last name</Label><Input defaultValue={user?.last_name || ""} /></div>
              </div>
              <div className="space-y-2"><Label>Email</Label><Input defaultValue={user?.email || ""} /></div>
            </div>
            <Button className="mt-4 gap-2" onClick={() => toast.success("Profile saved")}>
              <Save className="h-4 w-4" />
              Save
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--warning)_12%,transparent)]">
                <Settings className="h-5 w-5 text-[var(--warning)]" />
              </div>
              <h2 className="text-base font-bold text-[var(--foreground)]">Appearance</h2>
            </div>
            <div className="flex items-center justify-between rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
              <p className="text-sm font-medium text-[var(--foreground)]">Dark / Light mode</p>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--destructive)_10%,transparent)]">
                <Shield className="h-5 w-5 text-[var(--destructive)]" />
              </div>
              <h2 className="text-base font-bold text-[var(--foreground)]">Security</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Current password</Label><Input type="password" placeholder="••••••••" /></div>
              <div className="space-y-2"><Label>New password</Label><Input type="password" placeholder="••••••••" /></div>
              <div className="space-y-2"><Label>Confirm password</Label><Input type="password" placeholder="••••••••" /></div>
            </div>
            <Button variant="outline" className="mt-4 gap-2" onClick={() => toast.success("Password updated")}>
              <Shield className="h-4 w-4" />
              Update password
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--success)_12%,transparent)]">
                <Bell className="h-5 w-5 text-[var(--success)]" />
              </div>
              <h2 className="text-base font-bold text-[var(--foreground)]">Notifications</h2>
            </div>
            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n.key} className="flex items-center justify-between rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                  <p className="text-sm text-[var(--foreground)]">{notificationLabelsEn[n.key] ?? n.label}</p>
                  <Toggle checked={n.enabled} onCheckedChange={() => toggleNotification(n.key)} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--primary)_12%,transparent)]">
                <Globe className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <h2 className="text-base font-bold text-[var(--foreground)]">Language & Currency</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--foreground)]">Interface language</span>
                <span className="text-sm font-bold text-[var(--foreground)]">English</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--foreground)]">Base currency</span>
                <span className="text-sm font-bold text-[var(--foreground)]">Saudi Riyal (SAR)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--primary)_12%,transparent)]">
                <CreditCard className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <h2 className="text-base font-bold text-[var(--foreground)]">Subscription & Billing</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--foreground)]">Current plan</span>
                <span className="text-sm font-bold text-[var(--foreground)]">Business — Monthly</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--foreground)]">Monthly price</span>
                <span className="text-sm font-bold text-[var(--foreground)] tabular-nums">{formatCurrency(SUBSCRIPTION.monthlyPrice)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--foreground)]">Renewal date</span>
                <span className="text-sm font-bold text-[var(--foreground)]">{SUBSCRIPTION.renewalDate}</span>
              </div>
            </div>
            <Button variant="outline" className="mt-4 w-full">Manage subscription & billing</Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-base font-bold text-[var(--foreground)] mb-3 flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-[var(--primary)]" />
          Services & Pricing
        </h2>
        <Card>
          <CardContent className="p-5">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Service</TableHeaderCell>
                  <TableHeaderCell>Price</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {SERVICES.map(s => (
                  <TableRow key={s.id}>
                    <TableCell>
                      {s.id === "s1" ? "Technical consulting (hourly)" : s.id === "s2" ? "Software development (project)" : "Training & workshops (day)"}
                    </TableCell>
                    <TableCell>{s.price === "حسب النطاق" ? "By scope" : s.price}</TableCell>
                    <TableCell><Badge variant={s.active ? "success" : "secondary"}>{s.active ? "Active" : "Paused"}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button variant="outline" size="sm" className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Add service
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-base font-bold text-[var(--foreground)] mb-3 flex items-center gap-2">
          <Users2 className="h-4 w-4 text-[var(--primary)]" />
          Client Management
        </h2>
        <Card>
          <CardContent className="p-5">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Client</TableHeaderCell>
                  <TableHeaderCell>Total transactions</TableHeaderCell>
                  <TableHeaderCell>Last invoice</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {CLIENTS.map(c => (
                  <TableRow key={c.id}>
                    <TableCell>
                      {c.id === "cl1" ? "Namaa Real Estate Development Co." : c.id === "cl2" ? "Darb Consulting Est." : "Alpha Commercial Group"}
                    </TableCell>
                    <TableCell>{formatCurrency(c.totalTransactions)}</TableCell>
                    <TableCell>{c.lastInvoiceDate}</TableCell>
                    <TableCell><Badge variant={c.status === "active" ? "success" : "warning"}>{c.status === "active" ? "Active" : "Overdue"}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button variant="outline" size="sm" className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Add client
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
