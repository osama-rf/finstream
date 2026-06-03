"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Landmark, Save } from "lucide-react";
import { toast } from "sonner";

export default function CompanyEnPage() {
  return (
    <div className="space-y-6 page-transition-shell" dir="ltr">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Company</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Company details, commercial registration, and bank account</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card><CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--primary)_12%,transparent)]">
              <Building2 className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <h2 className="text-base font-bold text-[var(--foreground)]">Company Details</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Company Name (Arabic)</Label><Input defaultValue="شركة الأفق للتقنية والاستشارات" dir="rtl" /></div>
            <div className="space-y-2"><Label>Company Name (English)</Label><Input defaultValue="Horizon Technology & Consulting Co." /></div>
            <div className="space-y-2"><Label>Commercial Registration</Label><Input defaultValue="1010123456" /></div>
            <div className="space-y-2"><Label>Tax Number</Label><Input defaultValue="300012345600003" /></div>
            <div className="space-y-2"><Label>Address</Label><Input defaultValue="Riyadh, Al-Olaya District, King Fahd Road" /></div>
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[color:color-mix(in_srgb,var(--success)_12%,transparent)]">
              <Landmark className="h-5 w-5 text-[var(--success)]" />
            </div>
            <h2 className="text-base font-bold text-[var(--foreground)]">Bank Account</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Bank Name</Label><Input defaultValue="Al Rajhi Bank" /></div>
            <div className="space-y-2"><Label>IBAN</Label><Input defaultValue="SA44 2000 0001 2345 6789 1234" /></div>
            <div className="space-y-2"><Label>Account Number</Label><Input defaultValue="0012345678901" /></div>
            <div className="rounded-[12px] border border-[var(--primary)]/20 bg-[color:color-mix(in_srgb,var(--primary)_6%,transparent)] px-4 py-3">
              <p className="text-xs font-bold text-[var(--primary)] mb-1">Connection Status: Active</p>
              <p className="text-xs text-[var(--muted-foreground)]">Linked via Open Banking API — Last sync: 2 hours ago</p>
            </div>
          </div>
        </CardContent></Card>
      </div>

      <div className="flex justify-end">
        <Button className="gap-2" onClick={() => toast.success("Changes saved")}>
          <Save className="h-4 w-4" />Save Changes
        </Button>
      </div>
    </div>
  );
}
