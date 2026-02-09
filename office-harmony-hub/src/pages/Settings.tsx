
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Lock,
  Palette,
  Globe,
  Mail,
  Phone,
  Building2,
  Calendar,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { getSingleUser, updateUser, updatePassword } from "@/services/Service";
import { useToast } from '@/hooks/use-toast';

export function formatDate(isoDate: string | null | undefined): string {
  if (!isoDate) return "-";

  const dateObj: Date = new Date(isoDate);
  if (isNaN(dateObj.getTime())) return "-"; // handle invalid dates

  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  return dateObj.toLocaleString("en-US", options);
}

const Settings: React.FC = () => {
  const { user } = useAuth();
    const { toast } = useToast();
  
  const [userData, setUserData] = useState<any>(null);
  const [newPassword, setNewPassword] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState(null);

  const [formData, setFormData] = useState({
    username: "", // Admin
    mobile: "",   // Admin
    fullName: "", // Employee
    contact: "",  // Employee
    profileImage: "",
  });

  // Fetch user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getSingleUser(user?._id, user?.role === "employee"? user?.createdBy?._id : user?.companyId?._id);
        console.log(res)
        if (res.status === 200) {
          setUserData(res.data.user);
          if (user?.role === "admin" || user?.role === "super_admin") {
            setFormData({
              username: res.data.user.username || "",
              mobile: res.data.user.mobile || "",
              fullName: "",
              contact: "",
              profileImage: res.data.user.profileImage || "",
            });
          } else {
            setFormData({
              username: "",
              mobile: "",
              fullName: res.data.user.fullName || "",
              contact: res.data.user.contact || "",
              profileImage: res.data.user.profileImage || "",
            });
          }
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchUser();
  }, [user]);

  // Generic input change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Save user data
  const handleSave = async () => {
    try {
      let dataToSend: any = {};
      if (user?.role === "admin") {
        dataToSend = {
          username: formData.username,
          mobile: formData.mobile,
          profileImage: formData.profileImage,
        };
      } else {
        dataToSend = {
          fullName: formData.fullName,
          contact: formData.contact,
          profileImage: formData.profileImage,
        };
      }

      const res = await updateUser( user?._id, user?.role === "employee" ? user?.createdBy?._id : user?.companyId?._id, dataToSend );

      if (res.status === 200) {
        toast({ title: `Profile Update Successfully.`, description: res?.data?.message });
        setUserData(res.data.user);
      }
    } catch (err) {
      console.log(err);
    toast({ title: "Error", description: err?.response?.data?.message || "Something went wrong" });

    }
  };

  const handleUpdatePassword = async() => {
      if(!newPassword || !confirmPassword){
        toast({ title: "Error", description: "Password Or Confirm Password Is Required." });return;
      }
      if(newPassword !== confirmPassword){
        toast({ title: "Error", description: "Your Password Did Not Match." });return;
      }
    try{
        const res = await updatePassword(user?._id,userData?.email, newPassword, user?.role === "employee" ? user?.createdBy?._id : user?.companyId?._id);
        if(res.status===200){
       toast({ title: `Password Changed.`, description: res?.data?.message });
        }
    }
    catch(err){
      console.log(err);
     toast({ title: "Error", description: err?.response?.data?.message || "Something went wrong" });
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="page-header flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Profile Information
          </CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            {/* Avatar Preview */}
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {formData.profileImage ? (
                <img
                  src={formData.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-primary">
                  {(userData?.username || userData?.fullName || "U").charAt(0)}
                </span>
              )}
            </div>

            {/* Change Avatar */}
            <div className="flex flex-col gap-2">
              <label htmlFor="profileImageInput">
                <Button variant="outline" size="sm">Change Avatar</Button>
              </label>
              <input
                type="file"
                id="profileImageInput"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setFormData((prev) => ({ ...prev, profileImage: reader.result as string }));
                    };
                    reader.readAsDataURL(file); // convert image to base64
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                JPG, PNG or GIF. Max size 2MB
              </p>
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user?.role === "admin" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">Full Name</Label>
                  <Input id="username" value={formData.username} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Phone</Label>
                  <Input id="mobile" value={formData.mobile} onChange={handleChange} />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={formData.fullName} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Phone</Label>
                  <Input id="contact" value={formData.contact} onChange={handleChange} />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" defaultValue={userData?.email} className="pl-10" disabled />
              </div>
            </div>

            {user?.role === "employee" && (
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" value={userData?.department || ""} disabled />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Joined: {formatDate(userData?.createdAt)}</span>
          </div>

          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifications
          </CardTitle>
          <CardDescription>Configure how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive email for important updates</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Task Reminders</p>
              <p className="text-sm text-muted-foreground">Get notified about task deadlines</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Leave Updates</p>
              <p className="text-sm text-muted-foreground">Notifications for leave request status</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Expense Updates</p>
              <p className="text-sm text-muted-foreground">Get notified when expenses are processed</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Security
          </CardTitle>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" onChange={(e)=>{setNewPassword(e.target.value)}} type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password"onChange={(e)=>{setConfirmPassword(e.target.value)}} type="password" placeholder="••••••••" />
            </div>
          </div>
          <Button variant="outline" disabled={!newPassword || !confirmPassword} onClick={handleUpdatePassword}>Update Password</Button>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Preferences
          </CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Language</p>
                <p className="text-sm text-muted-foreground">Select your preferred language</p>
              </div>
            </div>
            <select className="px-3 py-2 rounded-md border bg-background">
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
            </select>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Compact View</p>
              <p className="text-sm text-muted-foreground">Show more content with less spacing</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;

