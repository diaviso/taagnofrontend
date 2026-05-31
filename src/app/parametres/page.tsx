"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/providers";
import { usersService } from "@/lib/services";
import { toast } from "sonner";
import {
  Settings,
  User,
  Shield,
  LogOut,
  Mail,
  Car,
  Lock,
  Loader2,
  Pencil,
} from "lucide-react";

export default function ParametresPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, refetch } = useAuth();

  // Profil
  const [editingProfile, setEditingProfile] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Mot de passe
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
    }
  }, [user]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  const getInitials = (firstName?: string, lastName?: string) =>
    `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const hasPassword = user?.hasPassword ?? false;

  const isPasswordStrong = (pwd: string) =>
    pwd.length >= 8 && /[a-z]/.test(pwd) && /[A-Z]/.test(pwd) && /\d/.test(pwd);

  const handleSaveProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Le prénom et le nom sont requis");
      return;
    }
    setSavingProfile(true);
    try {
      await usersService.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      await refetch();
      toast.success("Profil mis à jour");
      setEditingProfile(false);
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Erreur lors de la mise à jour";
      toast.error(message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (hasPassword && !currentPassword) {
      toast.error("Veuillez entrer votre mot de passe actuel");
      return;
    }
    if (!isPasswordStrong(newPassword)) {
      toast.error(
        "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre"
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    setSavingPassword(true);
    try {
      await usersService.changePassword({
        currentPassword: hasPassword ? currentPassword : undefined,
        newPassword,
      });
      await refetch();
      toast.success(
        hasPassword ? "Mot de passe modifié" : "Mot de passe défini ! Vous pouvez maintenant vous connecter par email."
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Erreur lors du changement de mot de passe";
      toast.error(message);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-12 max-w-4xl">
        <div className="text-center mb-12">
          <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20">
            <Settings className="w-4 h-4 mr-2" />
            Compte
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Paramètres</h1>
          <p className="text-muted-foreground text-lg">
            Gérez votre compte et vos préférences
          </p>
        </div>

        <div className="space-y-8">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Profil
                  </CardTitle>
                  <CardDescription className="mt-1.5">
                    Vos informations personnelles
                  </CardDescription>
                </div>
                {!editingProfile && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setEditingProfile(true)}
                  >
                    <Pencil className="h-4 w-4" />
                    Modifier
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.photoUrl} />
                  <AvatarFallback className="bg-primary text-white text-xl">
                    {getInitials(user?.firstName, user?.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <Badge className="mt-2" variant="outline">
                    {user?.userMode === "PROPRIETAIRE" ? "Propriétaire" : "Voyageur"}
                  </Badge>
                </div>
              </div>

              {editingProfile && (
                <>
                  <Separator className="my-6" />
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Button onClick={handleSaveProfile} disabled={savingProfile} className="gap-2">
                      {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
                      Enregistrer
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditingProfile(false);
                        setFirstName(user?.firstName || "");
                        setLastName(user?.lastName || "");
                      }}
                    >
                      Annuler
                    </Button>
                  </div>
                </>
              )}

              {!editingProfile && (
                <>
                  <Separator className="my-6" />
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Car className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Mode</p>
                        <p className="font-medium">
                          {user?.userMode === "PROPRIETAIRE" ? "Propriétaire" : "Voyageur"}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Security / Password Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Sécurité
              </CardTitle>
              <CardDescription>
                {hasPassword
                  ? "Changez votre mot de passe"
                  : "Définissez un mot de passe pour pouvoir vous connecter par email (et sur l'application mobile)"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-md">
                {hasPassword && (
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="currentPassword"
                        type="password"
                        className="pl-10"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="newPassword">
                    {hasPassword ? "Nouveau mot de passe" : "Mot de passe"}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type="password"
                      className="pl-10"
                      placeholder="Min. 8 caractères, 1 maj, 1 min, 1 chiffre"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      className="pl-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={handleChangePassword} disabled={savingPassword} className="gap-2">
                  {savingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
                  {hasPassword ? "Modifier le mot de passe" : "Définir le mot de passe"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <LogOut className="h-5 w-5" />
                Déconnexion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Vous serez déconnecté de votre compte sur cet appareil.
              </p>
              <Button variant="destructive" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Se déconnecter
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
