"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminService, AdminUser, UserDependencies } from "@/lib/services/admin.service";
import { toast } from "sonner";
import {
  Users,
  Search,
  Shield,
  Ban,
  Check,
  Eye,
  Loader2,
  Car,
  MapPin,
  Calendar,
  Mail,
  Crown,
  UserX,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Key,
  Ticket,
  Clock,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const [userDetail, setUserDetail] = useState<any>(null);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [dependencies, setDependencies] = useState<UserDependencies | null>(null);
  const [loadingDeps, setLoadingDeps] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin", "users", searchQuery],
    queryFn: () => adminService.getUsers(searchQuery || undefined),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'USER' | 'ADMIN' }) =>
      adminService.updateUserRole(id, role),
    onSuccess: (data) => {
      toast.success(`Rôle mis à jour: ${data.role}`);
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour");
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (id: string) => adminService.toggleUserActive(id),
    onSuccess: (data) => {
      toast.success(data.isActive ? "Utilisateur activé" : "Utilisateur désactivé");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => {
      toast.success("Utilisateur supprimé avec succès");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      setDeleteDialogOpen(false);
      setUserDetailOpen(false);
      setDeleteTarget(null);
      setDependencies(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression");
    },
  });

  const handleViewUser = async (id: string) => {
    setLoadingUserDetail(true);
    try {
      const data = await adminService.getUserById(id);
      setUserDetail(data);
      setUserDetailOpen(true);
    } catch {
      toast.error("Erreur lors du chargement de l'utilisateur");
    } finally {
      setLoadingUserDetail(false);
    }
  };

  const handleDeleteClick = async (user: AdminUser) => {
    setDeleteTarget(user);
    setLoadingDeps(true);
    setDeleteDialogOpen(true);
    try {
      const deps = await adminService.getUserDependencies(user.id);
      setDependencies(deps);
    } catch {
      toast.error("Erreur lors du chargement des dépendances");
      setDeleteDialogOpen(false);
    } finally {
      setLoadingDeps(false);
    }
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase() || "?";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED": return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Approuvé</Badge>;
      case "PENDING": return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">En attente</Badge>;
      case "REJECTED": return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Refusé</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTripStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN": return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Ouvert</Badge>;
      case "FULL": return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Complet</Badge>;
      case "COMPLETED": return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Terminé</Badge>;
      case "CANCELLED": return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Annulé</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getReservationStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING": return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">En attente</Badge>;
      case "CONFIRMED": return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Confirmée</Badge>;
      case "REJECTED": return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Refusée</Badge>;
      case "CANCELLED": return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20">Annulée</Badge>;
      case "COMPLETED": return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Terminée</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredUsers = users?.filter((user: AdminUser) => {
    if (roleFilter === "all") return true;
    if (roleFilter === "admin") return user.role === "ADMIN";
    if (roleFilter === "active") return user.isActive;
    if (roleFilter === "inactive") return !user.isActive;
    return true;
  });

  const totalUsers = users?.length || 0;
  const adminCount = users?.filter((u: AdminUser) => u.role === "ADMIN").length || 0;
  const activeCount = users?.filter((u: AdminUser) => u.isActive).length || 0;
  const inactiveCount = users?.filter((u: AdminUser) => !u.isActive).length || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-emerald-500" />
            </div>
            Gestion des utilisateurs
          </h1>
          <p className="text-muted-foreground mt-1">Gérez les comptes et les rôles des utilisateurs</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className={`cursor-pointer transition-all duration-200 ${roleFilter === 'all' ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'}`}
          onClick={() => setRoleFilter('all')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{totalUsers}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all duration-200 ${roleFilter === 'admin' ? 'ring-2 ring-purple-500 shadow-lg' : 'hover:shadow-md'}`}
          onClick={() => setRoleFilter('admin')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Crown className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{adminCount}</p>
                <p className="text-sm text-muted-foreground">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all duration-200 ${roleFilter === 'active' ? 'ring-2 ring-green-500 shadow-lg' : 'hover:shadow-md'}`}
          onClick={() => setRoleFilter('active')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{activeCount}</p>
                <p className="text-sm text-muted-foreground">Actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all duration-200 ${roleFilter === 'inactive' ? 'ring-2 ring-red-500 shadow-lg' : 'hover:shadow-md'}`}
          onClick={() => setRoleFilter('inactive')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <UserX className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{inactiveCount}</p>
                <p className="text-sm text-muted-foreground">Désactivés</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="border-0 shadow-soft">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-muted/50 border-0"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48 h-11 bg-muted/50 border-0">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les utilisateurs</SelectItem>
                <SelectItem value="admin">Administrateurs</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Désactivés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : filteredUsers && filteredUsers.length > 0 ? (
        <div className="space-y-3">
          {filteredUsers.map((user: AdminUser, index: number) => (
            <Card
              key={user.id}
              className={`group overflow-hidden hover:shadow-lg transition-all duration-300 ${!user.isActive ? 'opacity-60' : ''}`}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative">
                      <Avatar className={`h-14 w-14 ring-2 ${user.role === 'ADMIN' ? 'ring-purple-500/30' : 'ring-emerald-500/30'}`}>
                        <AvatarImage src={user.photoUrl || undefined} />
                        <AvatarFallback className={`text-white font-semibold ${user.role === 'ADMIN' ? 'bg-gradient-to-br from-purple-500 to-indigo-500' : 'bg-gradient-to-br from-emerald-500 to-green-500'}`}>
                          {getInitials(user.firstName, user.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      {user.role === 'ADMIN' && (
                        <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-purple-500 flex items-center justify-center">
                          <Crown className="h-3 w-3 text-white" />
                        </div>
                      )}
                      {!user.isActive && (
                        <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
                          <Ban className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold truncate">{user.firstName} {user.lastName}</p>
                        {user.role === "ADMIN" && (
                          <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 gap-1 text-xs">
                            <Shield className="h-3 w-3" />
                            Admin
                          </Badge>
                        )}
                        {!user.isActive && (
                          <Badge variant="destructive" className="text-xs">Désactivé</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Car className="h-3 w-3" />
                          {user._count?.vehicles || 0} véhicules
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {user._count?.carpoolTripsAsDriver || 0} trajets
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {user._count?.carpoolReservations || 0} réservations
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm" onClick={() => handleViewUser(user.id)} className="gap-1">
                      <Eye className="h-4 w-4" />
                      Détails
                    </Button>
                    <Select
                      value={user.role}
                      onValueChange={(v) => updateRoleMutation.mutate({ id: user.id, role: v as 'USER' | 'ADMIN' })}
                    >
                      <SelectTrigger className="w-28 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">User</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant={user.isActive ? "destructive" : "default"}
                      onClick={() => toggleActiveMutation.mutate(user.id)}
                      disabled={toggleActiveMutation.isPending}
                      className="gap-1"
                    >
                      {toggleActiveMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : user.isActive ? (
                        <><Ban className="h-4 w-4" /> Désactiver</>
                      ) : (
                        <><Check className="h-4 w-4" /> Activer</>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-soft">
          <CardContent className="p-16 text-center">
            <div className="h-20 w-20 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
              <Users className="h-10 w-10 text-emerald-500/50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Aucun utilisateur trouvé</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {searchQuery
                ? "Aucun utilisateur ne correspond à votre recherche."
                : "Aucun utilisateur dans cette catégorie."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* User Detail Dialog */}
      <Dialog open={userDetailOpen} onOpenChange={setUserDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {loadingUserDetail ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          ) : userDetail ? (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <Avatar className={`h-16 w-16 ring-2 ${userDetail.role === 'ADMIN' ? 'ring-purple-500/30' : 'ring-emerald-500/30'}`}>
                    <AvatarImage src={userDetail.photoUrl || undefined} />
                    <AvatarFallback className={`text-white text-xl font-semibold ${userDetail.role === 'ADMIN' ? 'bg-gradient-to-br from-purple-500 to-indigo-500' : 'bg-gradient-to-br from-emerald-500 to-green-500'}`}>
                      {getInitials(userDetail.firstName, userDetail.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-xl flex items-center gap-2">
                      {userDetail.firstName} {userDetail.lastName}
                      {userDetail.role === "ADMIN" && (
                        <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 gap-1">
                          <Shield className="h-3 w-3" /> Admin
                        </Badge>
                      )}
                    </DialogTitle>
                    <DialogDescription className="flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {userDetail.email}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Statut</p>
                    <Badge variant={userDetail.isActive ? "default" : "destructive"} className="text-xs">
                      {userDetail.isActive ? "Actif" : "Désactivé"}
                    </Badge>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Email vérifié</p>
                    <Badge className={userDetail.emailVerified ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}>
                      {userDetail.emailVerified ? "Oui" : "Non"}
                    </Badge>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Mode</p>
                    <p className="font-medium text-sm">{userDetail.userMode || "Non défini"}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Inscrit le</p>
                    <p className="font-medium text-sm">
                      {format(new Date(userDetail.createdAt), "d MMM yyyy", { locale: fr })}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/10 text-center">
                    <Car className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                    <p className="text-xl font-bold text-blue-600">{userDetail._count?.vehicles || 0}</p>
                    <p className="text-xs text-muted-foreground">Véhicules</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/10 text-center">
                    <MapPin className="h-5 w-5 mx-auto text-green-500 mb-1" />
                    <p className="text-xl font-bold text-green-600">{userDetail._count?.carpoolTripsAsDriver || 0}</p>
                    <p className="text-xs text-muted-foreground">Trajets</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/5 border border-purple-500/10 text-center">
                    <Ticket className="h-5 w-5 mx-auto text-purple-500 mb-1" />
                    <p className="text-xl font-bold text-purple-600">{userDetail._count?.carpoolReservations || 0}</p>
                    <p className="text-xs text-muted-foreground">Réservations</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/10 text-center">
                    <Key className="h-5 w-5 mx-auto text-orange-500 mb-1" />
                    <p className="text-xl font-bold text-orange-600">{userDetail._count?.rentalBookings || 0}</p>
                    <p className="text-xs text-muted-foreground">Locations</p>
                  </div>
                </div>

                {/* === PROPRIÉTAIRE SECTION === */}
                {((userDetail.vehicles && userDetail.vehicles.length > 0) || (userDetail.carpoolTripsAsDriver && userDetail.carpoolTripsAsDriver.length > 0)) && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-base flex items-center gap-2 border-b pb-2">
                      <Car className="h-4 w-4 text-blue-500" />
                      Activité Propriétaire
                    </h3>

                    {/* Vehicles */}
                    {userDetail.vehicles && userDetail.vehicles.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <Car className="h-3.5 w-3.5 text-blue-500" />
                          Véhicules ({userDetail.vehicles.length})
                        </h4>
                        <div className="space-y-2">
                          {userDetail.vehicles.map((v: any) => (
                            <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center overflow-hidden">
                                  {v.photos && v.photos.length > 0 ? (
                                    <img src={v.photos[0].url} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <Car className="h-5 w-5 text-blue-500" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{v.brand} {v.model} ({v.year})</p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{v.licensePlate}</span>
                                    {v.isForCarpooling && <Badge variant="outline" className="text-[10px] px-1 py-0"><MapPin className="h-2.5 w-2.5 mr-0.5" />Covoit.</Badge>}
                                    {v.isForRental && <Badge variant="outline" className="text-[10px] px-1 py-0"><Key className="h-2.5 w-2.5 mr-0.5" />Location</Badge>}
                                    {v.rentalOffer && <span className="text-green-600">{v.rentalOffer.pricePerDay} FCFA/j</span>}
                                  </div>
                                </div>
                              </div>
                              {getStatusBadge(v.status)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Carpool Trips as Driver */}
                    {userDetail.carpoolTripsAsDriver && userDetail.carpoolTripsAsDriver.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-green-500" />
                          Trajets proposés ({userDetail.carpoolTripsAsDriver.length})
                        </h4>
                        <div className="space-y-2">
                          {userDetail.carpoolTripsAsDriver.map((trip: any) => (
                            <div key={trip.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                              <div>
                                <p className="font-medium text-sm">{trip.departureCity} → {trip.arrivalCity}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {format(new Date(trip.departureTime), "d MMM yyyy HH:mm", { locale: fr })}
                                  <span>|</span>
                                  <span>{trip.pricePerSeat} FCFA/place</span>
                                  <span>|</span>
                                  <span>{trip._count?.reservations || 0} résa.</span>
                                  {trip.vehicle && <span>| {trip.vehicle.brand} {trip.vehicle.model}</span>}
                                </div>
                              </div>
                              {getTripStatusBadge(trip.status)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* === VOYAGEUR SECTION === */}
                {((userDetail.carpoolReservations && userDetail.carpoolReservations.length > 0) || (userDetail.rentalBookings && userDetail.rentalBookings.length > 0)) && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-base flex items-center gap-2 border-b pb-2">
                      <Ticket className="h-4 w-4 text-purple-500" />
                      Activité Voyageur
                    </h3>

                    {/* Carpool Reservations */}
                    {userDetail.carpoolReservations && userDetail.carpoolReservations.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-purple-500" />
                          Réservations covoiturage ({userDetail.carpoolReservations.length})
                        </h4>
                        <div className="space-y-2">
                          {userDetail.carpoolReservations.map((res: any) => (
                            <div key={res.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                              <div>
                                <p className="font-medium text-sm">
                                  {res.trip?.departureCity || "?"} → {res.trip?.arrivalCity || "?"}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{res.seatsReserved} place(s)</span>
                                  {res.trip?.driver && <span>| Conducteur: {res.trip.driver.firstName} {res.trip.driver.lastName}</span>}
                                  {res.trip?.vehicle && <span>| {res.trip.vehicle.brand} {res.trip.vehicle.model}</span>}
                                </div>
                              </div>
                              {getReservationStatusBadge(res.status)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rental Bookings */}
                    {userDetail.rentalBookings && userDetail.rentalBookings.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <Key className="h-3.5 w-3.5 text-orange-500" />
                          Locations ({userDetail.rentalBookings.length})
                        </h4>
                        <div className="space-y-2">
                          {userDetail.rentalBookings.map((booking: any) => (
                            <div key={booking.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                              <div>
                                <p className="font-medium text-sm">
                                  {booking.rentalOffer?.vehicle?.brand} {booking.rentalOffer?.vehicle?.model}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(booking.startDate), "d MMM", { locale: fr })} - {format(new Date(booking.endDate), "d MMM yyyy", { locale: fr })}
                                  <span>| {booking.totalPrice} FCFA</span>
                                </div>
                              </div>
                              {getReservationStatusBadge(booking.status)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 flex-wrap">
                <Button variant="outline" onClick={() => setUserDetailOpen(false)}>
                  Fermer
                </Button>
                <Button
                  variant={userDetail.isActive ? "destructive" : "default"}
                  onClick={() => {
                    toggleActiveMutation.mutate(userDetail.id);
                    setUserDetailOpen(false);
                  }}
                  className="gap-2"
                >
                  {userDetail.isActive ? <><Ban className="h-4 w-4" /> Désactiver</> : <><Check className="h-4 w-4" /> Activer</>}
                </Button>
                {userDetail.role !== "ADMIN" && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setUserDetailOpen(false);
                      handleDeleteClick(userDetail);
                    }}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </Button>
                )}
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Supprimer l&apos;utilisateur
            </DialogTitle>
            <DialogDescription>
              {deleteTarget?.firstName} {deleteTarget?.lastName} ({deleteTarget?.email})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {loadingDeps ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-red-500" />
              </div>
            ) : dependencies ? (
              <>
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="font-semibold text-red-600 flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4" />
                    Cette action est irréversible !
                  </p>
                  <p className="text-sm text-red-600/80 mb-3">
                    La suppression de cet utilisateur entraînera la perte définitive de toutes les données suivantes :
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {dependencies.vehicles > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Car className="h-4 w-4 text-red-500" />
                        <span><strong>{dependencies.vehicles}</strong> véhicule(s)</span>
                      </div>
                    )}
                    {dependencies.vehiclePhotos > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <ImageIcon className="h-4 w-4 text-red-500" />
                        <span><strong>{dependencies.vehiclePhotos}</strong> photo(s)</span>
                      </div>
                    )}
                    {dependencies.vehicleDocuments > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-red-500" />
                        <span><strong>{dependencies.vehicleDocuments}</strong> document(s)</span>
                      </div>
                    )}
                    {dependencies.rentalOffers > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Key className="h-4 w-4 text-red-500" />
                        <span><strong>{dependencies.rentalOffers}</strong> offre(s) de location</span>
                      </div>
                    )}
                    {dependencies.carpoolTrips > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-red-500" />
                        <span><strong>{dependencies.carpoolTrips}</strong> trajet(s) proposé(s)</span>
                      </div>
                    )}
                    {dependencies.carpoolReservations > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Ticket className="h-4 w-4 text-red-500" />
                        <span><strong>{dependencies.carpoolReservations}</strong> réservation(s)</span>
                      </div>
                    )}
                    {dependencies.rentalBookings > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-red-500" />
                        <span><strong>{dependencies.rentalBookings}</strong> location(s)</span>
                      </div>
                    )}
                  </div>
                </div>

                {dependencies.total === 0 && (
                  <p className="text-sm text-muted-foreground text-center">
                    Cet utilisateur n&apos;a aucune donnée associée.
                  </p>
                )}
              </>
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteDialogOpen(false); setDeleteTarget(null); setDependencies(null); }}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending || loadingDeps}
              className="gap-2"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
