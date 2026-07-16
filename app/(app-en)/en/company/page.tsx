"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { UserAvatar } from "@/components/UserAvatar";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/table";
import { Building2, Landmark, Save, Plus, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import type { UserRole } from "@/lib/types/database";
import { COMPANY_PROFILE, TEAM, ACTIVITY_LOG, BANKS } from "@/lib/mock";

const permissionBadgeVariant = {
  navy: "default",
  green: "success",
  gray: "secondary",
  amber: "warning",
} as const;

const roleLabelsEn: Record<string, string> = {
  "مدير الشركة": "Company Admin",
  "مدير مالي": "Finance Manager",
  "محاسبة": "Accountant",
  "مستثمر / مطّلع": "Investor / Viewer",
};

const permissionLabelsEn: Record<string, string> = {
  "مالك": "Owner",
  "اعتماد القوائم": "Statement approval",
  "إدخال بيانات فقط": "Data entry only",
  "عرض فقط": "View only",
};

export default function CompanyEnPage() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", password: "", role: "accountant" as UserRole,
  });

  function setField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.first_name || !form.email || !form.password) {
      toast.error("Please fill all required fields");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Account created successfully");
        setOpen(false);
        setForm({ first_name: "", last_name: "", email: "", password: "", role: "accountant" });
      } else {
        toast.error(json.error || "Failed to create account");
      }
    } catch {
      toast.error("An error occurred, please try again");
    } finally {
      setIsLoading(false);
    }
  }

  const activityIconMap: Record<string, string> = { check: "✓", link: "🔗", share: "📤" };

  return (
    <div className="space-y-6 page-transition-shell" dir="ltr">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Company & Team</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Company details, bank accounts, and team permissions</p>
        </div>
        <Button size="sm" className="gap-2 w-fit" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Invite member
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--primary)_12%,transparent)]">
                <Building2 className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <h2 className="text-base font-bold text-[var(--foreground)]">Company Details</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Company name</Label>
                <Input defaultValue="Horizon Technology & Consulting Co." />
              </div>
              <div className="space-y-2">
                <Label>Commercial registration</Label>
                <Input defaultValue={COMPANY_PROFILE.commercialRegistration} />
              </div>
              <div className="space-y-2">
                <Label>Tax number</Label>
                <Input defaultValue={COMPANY_PROFILE.taxNumber} />
              </div>
              <div className="space-y-2">
                <Label>Sector</Label>
                <Input defaultValue="Technology & Consulting Services" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Services offered</Label>
                  <Badge variant="default" className="text-[10px]">New</Badge>
                </div>
                <Input defaultValue="Technical consulting, software development, training & workshops" />
              </div>
            </div>
            <Button className="mt-4 w-full gap-2" onClick={() => toast.success("Changes saved")}>
              <Save className="h-4 w-4" />
              Save changes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--success)_12%,transparent)]">
                  <Landmark className="h-5 w-5 text-[var(--success)]" />
                </div>
                <h2 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                  Bank Accounts
                  <Badge variant="default" className="text-[10px]">New</Badge>
                </h2>
              </div>
              <a href="/en/bank" className="text-xs font-bold text-[var(--primary)]">Manage connections</a>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mb-4">{BANKS.length} accounts linked via the Open Banking tab</p>
            <div className="space-y-2">
              {BANKS.map(bank => (
                <div key={bank.id} className="flex items-center justify-between rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-white font-bold text-xs" style={{ background: bank.color }}>
                      {bank.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">{bank.name}</p>
                      {bank.iban && <p className="text-[11px] text-[var(--muted-foreground)]">{bank.iban}</p>}
                    </div>
                  </div>
                  <Badge variant={bank.status === "connected" ? "success" : "secondary"}>
                    {bank.status === "connected" ? "Active" : "Not connected"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-base font-bold text-[var(--foreground)] mb-3 flex items-center gap-2">
          Team
          <Badge variant="default" className="text-[10px]">New</Badge>
        </h2>
        <Card>
          <CardContent className="p-5">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Member</TableHeaderCell>
                  <TableHeaderCell>Role</TableHeaderCell>
                  <TableHeaderCell>Permission</TableHeaderCell>
                  <TableHeaderCell>Last activity</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {TEAM.map(member => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          user={{ id: member.id, first_name: member.name.split(" ")[0], last_name: member.name.split(" ")[1] ?? "" }}
                          className="h-8 w-8"
                          textClassName="text-xs"
                          alt={member.name}
                        />
                        <span>{member.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{roleLabelsEn[member.role] ?? member.role}</TableCell>
                    <TableCell><Badge variant={permissionBadgeVariant[member.permissionVariant]}>{permissionLabelsEn[member.permissionLabel] ?? member.permissionLabel}</Badge></TableCell>
                    <TableCell>{member.lastActivity === "الآن" ? "Now" : member.lastActivity === "—" ? "—" : member.lastActivity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-base font-bold text-[var(--foreground)] mb-3 flex items-center gap-2">
          Activity Log
          <Badge variant="default" className="text-[10px]">New</Badge>
        </h2>
        <Card>
          <CardContent className="p-5 space-y-2">
            {ACTIVITY_LOG.map(entry => (
              <div key={entry.id} className="flex items-center gap-3 rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-sm">
                  {activityIconMap[entry.icon] ?? "•"}
                </div>
                <div>
                  <p className="text-sm text-[var(--foreground)]">{entry.title}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{entry.timestamp}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add new member</DialogTitle>
            <DialogDescription>An account will be created instantly on the platform</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-bold">First name *</Label>
                <Input
                  placeholder="Ahmed"
                  value={form.first_name}
                  onChange={(e) => setField("first_name", e.target.value)}
                  disabled={isLoading}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold">Last name</Label>
                <Input
                  placeholder="Al-Omar"
                  value={form.last_name}
                  onChange={(e) => setField("last_name", e.target.value)}
                  disabled={isLoading}
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold">Email *</Label>
              <Input
                type="email"
                placeholder="ahmed@company.com"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                disabled={isLoading}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold">Role *</Label>
              <select
                value={form.role}
                onChange={(e) => setField("role", e.target.value)}
                disabled={isLoading}
                className="flex h-10 w-full rounded-[10px] border border-[var(--input)] bg-[var(--surface-strong)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-colors hover:border-[var(--primary)]"
              >
                <option value="accountant">Accountant</option>
                <option value="auditor">Auditor</option>
                <option value="company_admin">Company Admin</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold">Password *</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  disabled={isLoading}
                  className="h-10 pe-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Creating...
                  </span>
                ) : "Create account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
