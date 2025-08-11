"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";

// Roles supported
const ROLES = ["admin", "engineer", "contractor", "worker"] as const;

type Role = (typeof ROLES)[number];

export default function CompleteProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [validated, setValidated] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [userType, setUserType] = useState<"individual" | "industry" | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    role: "" as Role | "",
    specialCode: "",
    profilePhotoFile: null as File | null,
    profilePhotoUrl: "",
  });
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Ensure user is authenticated; otherwise redirect to login
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login");
        return;
      }
      // Set userType from auth metadata
      const ut = (data.user.user_metadata?.user_type as "individual" | "industry" | undefined) || null;
      setUserType(ut);
    })();
  }, [router]);

  const setField = (k: keyof typeof form, v: any) => {
    setForm((p) => ({ ...p, [k]: v }));
    setError("");
  };

  const uploadProfilePhoto = async (): Promise<string | ""> => {
    if (!form.profilePhotoFile) return "";
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) return "";

    const file = form.profilePhotoFile;
    const filePath = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadErr } = await supabase.storage
      .from("profile-photos")
      .upload(filePath, file, { upsert: false });
    if (uploadErr) {
      // Provide a clearer message when the storage bucket is missing
      const msg = (uploadErr as any)?.message || String(uploadErr);
      if (msg.toLowerCase().includes("bucket not found")) {
        throw new Error(
          'Supabase Storage bucket "profile-photos" not found. Create it in Supabase Storage (public recommended) or update the bucket name in app/complete-profile/page.tsx.'
        );
      }
      throw uploadErr;
    }

    const { data: publicUrl } = supabase.storage.from("profile-photos").getPublicUrl(filePath);
    return publicUrl.publicUrl || "";
  };

  const handleGenerateCode = async () => {
    setGenerating(true);
    setError("");
    try {
      if (userType !== "industry") {
        throw new Error("Special code is only for industry users");
      }
      const { data: resp, error: fnErr } = await supabase.functions.invoke("generate_special_code", {
        body: {},
      });
      if (fnErr) throw fnErr;
      setGeneratedCode(resp?.code || null);
    } catch (e: any) {
      setError(e.message || "Failed to generate code. Ensure Edge Function 'generate_special_code' is deployed and accessible.");
    } finally {
      setGenerating(false);
    }
  };

  const handleValidateCode = async () => {
    setLoading(true);
    setError("");
    try {
      if (userType !== "industry") {
        setValidated(true);
        return;
      }
      const { data: resp, error: fnErr } = await supabase.functions.invoke("validate_special_code", {
        body: { code: form.specialCode },
      });
      if (fnErr) throw fnErr;
      if (!resp?.valid) throw new Error("Invalid special code");
      setValidated(true);
    } catch (e: any) {
      setError(e.message || "Failed to validate code. Ensure Edge Function 'validate_special_code' is deployed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (!form.name || !form.phone) {
        throw new Error("Name and Phone are required");
      }

      // If industry and role selected (not admin), ensure validated
      if (userType === "industry" && form.role && form.role !== "admin" && !validated) {
        throw new Error("Please validate your special code");
      }

      const profilePhotoUrl = await uploadProfilePhoto();

      const payload = {
        name: form.name,
        phone: form.phone,
        role: userType === "industry" ? (form.role || null) : null,
        profile_photo_url: profilePhotoUrl || undefined,
        special_code: userType === "industry" && form.role && form.role !== "admin" ? form.specialCode : undefined,
      };

      // All profile DB updates via Edge Function (only invoke for both flows; function should handle logic)
      const { data: fnResp, error: fnErr } = await supabase.functions.invoke("update_profile", { body: payload });
      if (fnErr) {
        // Fallback: directly update profiles if Edge Function is not reachable
        console.warn("update_profile function failed, attempting direct profile update:", fnErr);
        const { data: auth } = await supabase.auth.getUser();
        const userId = auth.user?.id;
        if (!userId) throw fnErr;
        const updatePayload: any = {
          name: form.name,
          phone: form.phone,
        };
        if (userType === "industry") {
          updatePayload.role = form.role || null;
        }
        if (payload.profile_photo_url) {
          updatePayload.profile_photo_url = payload.profile_photo_url;
        }
        const { error: directErr } = await supabase.from('profiles').update(updatePayload).eq('id', userId);
        if (directErr) throw directErr;
      }

      // After saving, redirect to the landing page
      router.push("/");
    } catch (e: any) {
      setError(e.message || "Failed to complete profile. Ensure Edge Function 'update_profile' is deployed and RLS policies allow it.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <CardDescription>Provide your details to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Profile Photo (optional)</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setField("profilePhotoFile", e.target.files?.[0] || null)}
                />
              </div>

              {userType === "industry" && (
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select onValueChange={(v) => setField("role", v as Role)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {userType === "industry" && form.role && form.role !== "admin" && (
                <div className="space-y-2">
                  <Label htmlFor="code">Special Code</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Enter special code provided by admin"
                    value={form.specialCode}
                    onChange={(e) => setField("specialCode", e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={handleValidateCode} disabled={loading || !form.specialCode}>
                      {loading ? "Validating..." : "Validate Code"}
                    </Button>
                    {validated && <span className="text-green-600 text-sm self-center">Code validated</span>}
                  </div>
                </div>
              )}

              {userType === "industry" && form.role === "admin" && (
                <div className="space-y-2">
                  <Label>Admin Special Code</Label>
                  <div className="flex gap-2">
                    <Button type="button" onClick={handleGenerateCode} disabled={generating}>
                      {generating ? "Generating..." : "Generate Special Code"}
                    </Button>
                    {generatedCode && (
                      <Input readOnly value={generatedCode} className="font-mono" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Share this code with your team members to let them join.</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving..." : "Save & Continue"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
