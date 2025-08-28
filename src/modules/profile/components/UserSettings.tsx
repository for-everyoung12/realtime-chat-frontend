import { useState } from "react";
import { Camera, Edit, Save, X, Bell, Lock, Users } from "lucide-react";
import { Button } from "@/modules/shared/components/button";
import { Input } from "@/modules/shared/components/input";
import { Label } from "@/modules/shared/components/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/modules/shared/components/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/modules/shared/components/avatar";
import { Switch } from "@/modules/shared/components/switch";
import { Separator } from "@/modules/shared/components/separator";

interface UserSettingsProps {
  onClose: () => void;
}

export function UserSettings({ onClose }: UserSettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    status: "Hey there! I'm using ChatConnect",
    avatar: ""
  });

  const [settings, setSettings] = useState({
    notifications: true,
    soundEnabled: true,
    readReceipts: true,
    onlineStatus: true,
    groupInvites: true
  });

  const handleSaveProfile = () => {
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur border-card-border shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <div>
            <CardTitle className="text-2xl text-foreground">Settings</CardTitle>
            <CardDescription>Manage your account and preferences</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Profile Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Profile
            </h3>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {profile.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="icon" 
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary hover:bg-primary/90"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex-1 space-y-3">
                <div>
                  <Label htmlFor="name" className="text-foreground">Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    disabled={!isEditing}
                    className="bg-chat-input border-0 focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
                
                <div>
                  <Label htmlFor="status" className="text-foreground">Status Message</Label>
                  <Input
                    id="status"
                    value={profile.status}
                    onChange={(e) => setProfile({...profile, status: e.target.value})}
                    disabled={!isEditing}
                    className="bg-chat-input border-0 focus-visible:ring-1 focus-visible:ring-primary"
                    placeholder="What's on your mind?"
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSaveProfile} className="">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Separator className="bg-card-border" />

          {/* Notifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications for new messages</p>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked) => setSettings({...settings, notifications: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Sound Effects</Label>
                  <p className="text-sm text-muted-foreground">Play sound for new messages</p>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => setSettings({...settings, soundEnabled: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Read Receipts</Label>
                  <p className="text-sm text-muted-foreground">Let others know when you've read their messages</p>
                </div>
                <Switch
                  checked={settings.readReceipts}
                  onCheckedChange={(checked) => setSettings({...settings, readReceipts: checked})}
                />
              </div>
            </div>
          </div>

          <Separator className="bg-card-border" />

          {/* Privacy */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Privacy
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Online Status</Label>
                  <p className="text-sm text-muted-foreground">Show when you're online to your friends</p>
                </div>
                <Switch
                  checked={settings.onlineStatus}
                  onCheckedChange={(checked) => setSettings({...settings, onlineStatus: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Group Invites</Label>
                  <p className="text-sm text-muted-foreground">Allow friends to add you to groups</p>
                </div>
                <Switch
                  checked={settings.groupInvites}
                  onCheckedChange={(checked) => setSettings({...settings, groupInvites: checked})}
                />
              </div>
            </div>
          </div>

          <Separator className="bg-card-border" />

          {/* Account Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Account</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start text-warning">
                Export Data
              </Button>
              <Button variant="destructive" className="w-full justify-start">
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}