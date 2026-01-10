/* eslint-disable @typescript-eslint/no-unused-vars */
// components/dashboard/user-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "@/lib/db/schema";
import { toast } from "sonner";
import { ArrowLeft, Save, UserPlus, Shield, Mail, Lock, User as UserIcon } from "lucide-react";
import Link from "next/link";

interface UserFormProps {
  user: User;
  userToEdit?: User;
}

export function UserForm({ user, userToEdit }: UserFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: userToEdit?.name || "",
    email: userToEdit?.email || "",
    password: "",
    role: userToEdit?.role || "reader",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (userToEdit) {
        const response = await fetch(`/api/users/${userToEdit.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            role: formData.role,
            ...(formData.password && { password: formData.password }),
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update user");
        }

        toast.success("User updated successfully");
      } else {
        const response = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create user");
        }

        toast.success("User created successfully");
      }
      
      router.push("/dashboard/users");
      router.refresh();
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "admin":
        return "Full system access with user management capabilities";
      case "editor":
        return "Can edit and publish all content";
      case "contributor":
        return "Can create and submit content for review";
      case "reader":
        return "Can only view published content";
      default:
        return "";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/users">
          <Button type="button" variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground">
            {userToEdit ? "Edit User" : "Create New User"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {userToEdit 
              ? "Update user information and permissions" 
              : "Add a new user to the system"}
          </p>
        </div>
      </div>

      {/* User Information Card */}
      <Card className="shadow-sm py-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            User Information
          </CardTitle>
          <CardDescription>
            {userToEdit 
              ? "Update the user's personal information" 
              : "Enter the basic details for the new user"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Full Name
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="John Doe"
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">
              This name will be displayed throughout the system
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="john.doe@example.com"
              required
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">
              Used for login and system notifications
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              {userToEdit ? "New Password" : "Password"}
              {!userToEdit && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder={userToEdit ? "Leave blank to keep current password" : "Enter a secure password"}
              required={!userToEdit}
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">
              {userToEdit 
                ? "Only enter a new password if you want to change it" 
                : "Must be at least 6 characters long"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Role & Permissions Card */}
      <Card className="shadow-sm py-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Role & Permissions
          </CardTitle>
          <CardDescription>
            Set the user&apos;s access level and permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">User Role</Label>
            <Select value={formData.role} onValueChange={handleRoleChange}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reader">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-500" />
                    <span>Reader</span>
                  </div>
                </SelectItem>
                <SelectItem value="contributor">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Contributor</span>
                  </div>
                </SelectItem>
                <SelectItem value="editor">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Editor</span>
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span>Admin</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Role Description */}
          <div className="p-4 bg-muted rounded-lg border border-border">
            <p className="text-sm font-medium text-foreground mb-1 capitalize">
              {formData.role} Role
            </p>
            <p className="text-sm text-muted-foreground">
              {getRoleDescription(formData.role)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Link href="/dashboard/users">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            className="min-w-25"
          >
            Cancel
          </Button>
        </Link>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="min-w-35 flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : userToEdit ? (
            <>
              <Save className="w-4 h-4" />
              Update User
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Create User
            </>
          )}
        </Button>
      </div>
    </form>
  );
}