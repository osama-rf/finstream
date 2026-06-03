"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { UserAvatar } from "@/components/UserAvatar";
import { Plus, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useUser } from "@/lib/contexts/UserContext";
import { toast } from "sonner";
import type { UserRole } from "@/lib/types/database";

const roleLabels: Record<UserRole,string> = { super_admin:"System Admin", company_admin:"Company Admin", accountant:"Accountant", auditor:"Auditor" };
const roleVariants: Record<UserRole,any>  = { super_admin:"destructive",  company_admin:"default",       accountant:"success",    auditor:"warning" };

const initialMembers = [
  { id:"u1", first_name:"Khalid", last_name:"Al-Omar",  email:"admin@horizon.sa",      role:"company_admin" as UserRole, status:"active" },
  { id:"u2", first_name:"Ahmed",  last_name:"Mohammed", email:"accountant@horizon.sa", role:"accountant"    as UserRole, status:"active" },
  { id:"u3", first_name:"Sara",   last_name:"Al-Ahmad", email:"auditor@horizon.sa",    role:"auditor"       as UserRole, status:"active" },
];

export default function UsersEnPage() {
  const { user } = useUser();
  const [members, setMembers] = useState(initialMembers);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ first_name:"", last_name:"", email:"", password:"", role:"accountant" as UserRole });

  function setField(field: string, value: string) { setForm((prev) => ({...prev,[field]:value})); }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.first_name || !form.email || !form.password) { toast.error("Please fill all required fields"); return; }
    if (form.password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setIsLoading(true);
    try {
      const res = await fetch("/api/users/create", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
      const json = await res.json();
      if (json.success) {
        toast.success("Account created successfully");
        setMembers((prev) => [...prev, { id:json.data.id, first_name:form.first_name, last_name:form.last_name, email:form.email, role:form.role, status:"active" }]);
        setOpen(false);
        setForm({ first_name:"", last_name:"", email:"", password:"", role:"accountant" });
      } else { toast.error(json.error || "Failed to create account"); }
    } catch { toast.error("An error occurred"); } finally { setIsLoading(false); }
  }

  const isAdmin = user?.role === "company_admin" || user?.role === "super_admin";

  return (
    <div className="space-y-6 page-transition-shell" dir="ltr">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Team</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Manage team members and permissions</p>
        </div>
        {isAdmin && <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Add Member</Button>}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          {label:"Company Admins", count:members.filter(m=>m.role==="company_admin").length, color:"var(--primary)"},
          {label:"Accountants",    count:members.filter(m=>m.role==="accountant").length,    color:"var(--success)"},
          {label:"Auditors",       count:members.filter(m=>m.role==="auditor").length,       color:"var(--warning)"},
        ].map((s) => (
          <Card key={s.label}><CardContent className="p-5">
            <p className="text-2xl font-bold tabular-nums" style={{color:s.color}}>{s.count}</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">{s.label}</p>
          </CardContent></Card>
        ))}
      </div>

      <Card><CardContent className="p-5">
        <div className="flex items-center gap-2 mb-5">
          <div className="h-5 w-1 rounded-full bg-[var(--primary)]" />
          <h2 className="text-base font-bold text-[var(--foreground)]">Team Members</h2>
        </div>
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
              <div className="flex items-center gap-3">
                <UserAvatar user={{id:member.id,first_name:member.first_name,last_name:member.last_name}} className="h-10 w-10" textClassName="text-sm" alt={`${member.first_name} ${member.last_name}`} />
                <div>
                  <p className="font-medium text-[var(--foreground)] text-sm">
                    {member.first_name} {member.last_name}
                    {member.id === user?.id && <span className="ms-2 text-xs text-[var(--muted-foreground)]">(you)</span>}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={roleVariants[member.role]}>{roleLabels[member.role]}</Badge>
                <Badge variant={member.status==="active"?"success":"secondary"}>{member.status==="active"?"Active":"Inactive"}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent></Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
            <DialogDescription>An account will be created instantly on the platform</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>First Name *</Label><Input placeholder="Ahmed" value={form.first_name} onChange={(e) => setField("first_name",e.target.value)} disabled={isLoading} className="h-10" /></div>
              <div className="space-y-2"><Label>Last Name</Label><Input placeholder="Al-Omar" value={form.last_name} onChange={(e) => setField("last_name",e.target.value)} disabled={isLoading} className="h-10" /></div>
            </div>
            <div className="space-y-2"><Label>Email *</Label><Input type="email" placeholder="ahmed@company.com" value={form.email} onChange={(e) => setField("email",e.target.value)} disabled={isLoading} className="h-10" /></div>
            <div className="space-y-2">
              <Label>Role *</Label>
              <select value={form.role} onChange={(e) => setField("role",e.target.value)} disabled={isLoading}
                className="flex h-10 w-full rounded-[10px] border border-[var(--input)] bg-[var(--surface-strong)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-colors hover:border-[var(--primary)]">
                <option value="accountant">Accountant</option>
                <option value="auditor">Auditor</option>
                <option value="company_admin">Company Admin</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Password *</Label>
              <div className="relative">
                <Input type={showPassword?"text":"password"} placeholder="Min 8 characters" value={form.password} onChange={(e) => setField("password",e.target.value)} disabled={isLoading} className="h-10 pe-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute end-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <span className="flex items-center gap-2"><LoaderCircle className="h-4 w-4 animate-spin" />Creating...</span> : "Create Account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
