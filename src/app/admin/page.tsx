"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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
import { adminService, AdminUser, AdminStatistics } from "@/lib/services/admin.service";
import { useAuth } from "@/providers";
import { Vehicle, VehicleStatus, DocumentType, DocumentStatus } from "@/types";
import { toast } from "sonner";
import {
  Car,
  Check,
  X,
  Shield,
  Users,
  TrendingUp,
  Calendar,
  FileText,
  Eye,
  UserCog,
  BarChart3,
  Clock,
  MapPin,
  Image as ImageIcon,
  Loader2,
  Search,
  Ban,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

const documentTypeLabels: Record<string, string> = {
  INSURANCE: "Assurance",
  REGISTRATION: "Carte grise",
  TECHNICAL_VISIT: "Visite technique",
};

const getDocStatusBadge = (status: string) => {
  switch (status) {
    case "PENDING":
      return <Badge variant="outline" className="text-amber-600 border-amber-300">En attente</Badge>;
    case "APPROVED":
      return <Badge variant="outline" className="text-green-600 border-green-300">Validé</Badge>;
    case "REJECTED":
      return <Badge variant="destructive">Refusé</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function AdminPage() {
  const { isAdmin, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [vehicleStatus, setVehicleStatus] = useState<VehicleStatus>(VehicleStatus.PENDING);
  const [userSearch, setUserSearch] = useState("");
  
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [rejectComment, setRejectComment] = useState("");
  
  const [vehicleDetailOpen, setVehicleDetailOpen] = useState(false);
  const [vehicleDetail, setVehicleDetail] = useState<Vehicle | null>(null);
  const [loadingVehicleDetail, setLoadingVehicleDetail] = useState(false);

  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const [userDetail, setUserDetail] = useState<any>(null);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);

  // Queries
  const { data: statistics, isLoading: statsLoading } = useQuery({
    queryKey: ["admin", "statistics"],
    queryFn: () => adminService.getStatistics(),
    enabled: isAdmin,
  });

  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ["admin", "vehicles", vehicleStatus],
    queryFn: () => adminService.getVehicles(vehicleStatus),
    enabled: isAdmin && activeTab === "vehicles",
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["admin", "users", userSearch],
    queryFn: () => adminService.getUsers(userSearch || undefined),
    enabled: isAdmin && activeTab === "users",
  });

  // Mutations
  const approveMutation = useMutation({
    mutationFn: (id: string) => adminService.approveVehicle(id),
    onSuccess: () => {
      toast.success("Véhicule approuvé !");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      setVehicleDetailOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) =>
      adminService.rejectVehicle(id, comment),
    onSuccess: () => {
      toast.success("Véhicule refusé");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      setRejectDialogOpen(false);
      setVehicleDetailOpen(false);
      setRejectComment("");
      setSelectedVehicle(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur");
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'USER' | 'ADMIN' }) =>
      adminService.updateUserRole(id, role),
    onSuccess: () => {
      toast.success("Rôle mis à jour");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur");
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

  const handleViewVehicle = async (id: string) => {
    setLoadingVehicleDetail(true);
    try {
      const data = await adminService.getVehicleById(id);
      setVehicleDetail(data);
      setVehicleDetailOpen(true);
    } catch (error) {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoadingVehicleDetail(false);
    }
  };

  const handleViewUser = async (id: string) => {
    setLoadingUserDetail(true);
    try {
      const data = await adminService.getUserById(id);
      setUserDetail(data);
      setUserDetailOpen(true);
    } catch (error) {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoadingUserDetail(false);
    }
  };

  const handleReject = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setRejectDialogOpen(true);
  };

  const confirmReject = () => {
    if (selectedVehicle && rejectComment.trim()) {
      rejectMutation.mutate({ id: selectedVehicle.id, comment: rejectComment });
    }
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase() || "?";
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Connexion requise</h1>
        <Link href="/login"><Button>Se connecter</Button></Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container py-8 text-center">
        <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-4">Accès refusé</h1>
        <p className="text-muted-foreground">Cette page est réservée aux administrateurs.</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          Administration
        </h1>
        <p className="text-muted-foreground">Tableau de bord et gestion de la plateforme</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Tableau de bord
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="gap-2">
            <Car className="h-4 w-4" />
            Véhicules
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Utilisateurs
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          {statsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : statistics ? (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Utilisateurs</p>
                        <p className="text-3xl font-bold">{statistics.users.total}</p>
                      </div>
                      <Users className="h-10 w-10 text-blue-500 opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Véhicules en attente</p>
                        <p className="text-3xl font-bold">{statistics.vehicles.pending}</p>
                      </div>
                      <Clock className="h-10 w-10 text-amber-500 opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Véhicules approuvés</p>
                        <p className="text-3xl font-bold">{statistics.vehicles.approved}</p>
                      </div>
                      <CheckCircle className="h-10 w-10 text-green-500 opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Véhicules refusés</p>
                        <p className="text-3xl font-bold">{statistics.vehicles.rejected}</p>
                      </div>
                      <Ban className="h-10 w-10 text-red-500 opacity-50" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Carpool & Rental Stats */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Covoiturage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg text-center">
                        <p className="text-2xl font-bold">{statistics.carpool.totalTrips}</p>
                        <p className="text-sm text-muted-foreground">Trajets total</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg text-center">
                        <p className="text-2xl font-bold">{statistics.carpool.openTrips}</p>
                        <p className="text-sm text-muted-foreground">Trajets ouverts</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg text-center">
                        <p className="text-2xl font-bold">{statistics.carpool.completedTrips}</p>
                        <p className="text-sm text-muted-foreground">Trajets terminés</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg text-center">
                        <p className="text-2xl font-bold">{statistics.carpool.totalReservations}</p>
                        <p className="text-sm text-muted-foreground">Réservations</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Car className="h-5 w-5 text-primary" />
                      Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg text-center">
                        <p className="text-2xl font-bold">{statistics.rental.totalOffers}</p>
                        <p className="text-sm text-muted-foreground">Offres total</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg text-center">
                        <p className="text-2xl font-bold">{statistics.rental.activeOffers}</p>
                        <p className="text-sm text-muted-foreground">Offres actives</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg text-center col-span-2">
                        <p className="text-2xl font-bold">{statistics.rental.totalBookings}</p>
                        <p className="text-sm text-muted-foreground">Réservations</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Derniers véhicules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {statistics.recentVehicles.map((v: any) => (
                        <div key={v.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <p className="font-medium">{v.brand} {v.model}</p>
                            <p className="text-sm text-muted-foreground">
                              {v.owner?.firstName} {v.owner?.lastName}
                            </p>
                          </div>
                          <Badge variant={v.status === "PENDING" ? "outline" : v.status === "APPROVED" ? "default" : "destructive"}>
                            {v.status === "PENDING" ? "En attente" : v.status === "APPROVED" ? "Approuvé" : "Refusé"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Derniers utilisateurs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {statistics.recentUsers.map((u: any) => (
                        <div key={u.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{getInitials(u.firstName, u.lastName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{u.firstName} {u.lastName}</p>
                            <p className="text-sm text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : null}
        </TabsContent>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Select value={vehicleStatus} onValueChange={(v) => setVehicleStatus(v as VehicleStatus)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">En attente</SelectItem>
                  <SelectItem value="APPROVED">Approuvés</SelectItem>
                  <SelectItem value="REJECTED">Refusés</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4">
              {vehiclesLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-20 w-20 rounded" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-1/3" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : vehicles && vehicles.length > 0 ? (
                vehicles.map((vehicle: Vehicle) => (
                  <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Vehicle Image */}
                        <div className="h-24 w-24 bg-muted rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                          {vehicle.photos && vehicle.photos.length > 0 ? (
                            <img
                              src={vehicle.photos[0].url}
                              alt={`${vehicle.brand} ${vehicle.model}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Car className="h-10 w-10 text-muted-foreground" />
                          )}
                        </div>

                        {/* Vehicle Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {vehicle.brand} {vehicle.model} ({vehicle.year})
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {vehicle.color} • {vehicle.licensePlate} • {vehicle.numberOfSeats} places
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={vehicle.owner?.photoUrl || undefined} />
                                  <AvatarFallback className="text-xs">
                                    {getInitials(vehicle.owner?.firstName, vehicle.owner?.lastName)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-muted-foreground">
                                  {vehicle.owner?.firstName} {vehicle.owner?.lastName}
                                </span>
                              </div>
                              <div className="flex gap-2 mt-2">
                                {vehicle.isForCarpooling && <Badge variant="outline">Covoiturage</Badge>}
                                {vehicle.isForRental && <Badge variant="outline">Location</Badge>}
                                <Badge variant="outline" className="gap-1">
                                  <ImageIcon className="h-3 w-3" />
                                  {vehicle.photos?.length || 0} photos
                                </Badge>
                                <Badge variant="outline" className="gap-1">
                                  <FileText className="h-3 w-3" />
                                  {vehicle.documents?.length || 0} docs
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {vehicle.status === VehicleStatus.REJECTED && vehicle.adminComment && (
                            <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
                              <strong>Motif:</strong> {vehicle.adminComment}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewVehicle(vehicle.id)}
                            className="gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            Voir détails
                          </Button>
                          {vehicle.status === VehicleStatus.PENDING && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => approveMutation.mutate(vehicle.id)}
                                disabled={approveMutation.isPending}
                                className="gap-1"
                              >
                                <Check className="h-4 w-4" />
                                Approuver
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(vehicle)}
                                className="gap-1"
                              >
                                <X className="h-4 w-4" />
                                Refuser
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun véhicule</h3>
                    <p className="text-muted-foreground">
                      Aucun véhicule dans cette catégorie
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un utilisateur..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid gap-4">
              {usersLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-1/4" />
                          <Skeleton className="h-3 w-1/3" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : users && users.length > 0 ? (
                users.map((user: AdminUser) => (
                  <Card key={user.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.photoUrl || undefined} />
                          <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{user.firstName} {user.lastName}</p>
                            {user.role === "ADMIN" && (
                              <Badge className="bg-purple-500">Admin</Badge>
                            )}
                            {!user.isActive && (
                              <Badge variant="destructive">Désactivé</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                            <span>{user._count?.vehicles || 0} véhicules</span>
                            <span>{user._count?.carpoolTripsAsDriver || 0} trajets</span>
                            <span>{user._count?.carpoolReservations || 0} réservations</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewUser(user.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Select
                            value={user.role}
                            onValueChange={(v) => updateRoleMutation.mutate({ id: user.id, role: v as 'USER' | 'ADMIN' })}
                          >
                            <SelectTrigger className="w-28">
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
                          >
                            {user.isActive ? <Ban className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun utilisateur</h3>
                    <p className="text-muted-foreground">
                      Aucun utilisateur trouvé
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Vehicle Detail Dialog */}
      <Dialog open={vehicleDetailOpen} onOpenChange={setVehicleDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {loadingVehicleDetail ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : vehicleDetail ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {vehicleDetail.brand} {vehicleDetail.model} ({vehicleDetail.year})
                </DialogTitle>
                <DialogDescription>
                  {vehicleDetail.color} • {vehicleDetail.licensePlate} • {vehicleDetail.numberOfSeats} places
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Owner Info */}
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={vehicleDetail.owner?.photoUrl || undefined} />
                    <AvatarFallback>
                      {getInitials(vehicleDetail.owner?.firstName, vehicleDetail.owner?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {vehicleDetail.owner?.firstName} {vehicleDetail.owner?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{vehicleDetail.owner?.email}</p>
                  </div>
                </div>

                {/* Photos */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Photos ({vehicleDetail.photos?.length || 0})
                  </h4>
                  {vehicleDetail.photos && vehicleDetail.photos.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {vehicleDetail.photos.map((photo: any) => (
                        <div key={photo.id} className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                          <img
                            src={photo.url}
                            alt="Photo véhicule"
                            className="w-full h-full object-cover"
                          />
                          {photo.isMain && (
                            <Badge className="absolute top-2 left-2 text-xs">Principale</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg text-center">
                      Aucune photo
                    </p>
                  )}
                </div>

                {/* Documents */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Documents ({vehicleDetail.documents?.length || 0})
                  </h4>
                  {vehicleDetail.documents && vehicleDetail.documents.length > 0 ? (
                    <div className="space-y-2">
                      {vehicleDetail.documents.map((doc: any) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{documentTypeLabels[doc.type] || doc.type}</p>
                              <p className="text-xs text-muted-foreground">
                                Ajouté le {new Date(doc.createdAt).toLocaleDateString("fr-FR")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getDocStatusBadge(doc.status)}
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm"
                            >
                              Voir
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg text-center">
                      Aucun document
                    </p>
                  )}
                </div>

                {/* Services */}
                <div className="flex gap-4">
                  {vehicleDetail.isForCarpooling && (
                    <Badge variant="outline" className="gap-1">
                      <MapPin className="h-3 w-3" />
                      Covoiturage
                    </Badge>
                  )}
                  {vehicleDetail.isForRental && (
                    <Badge variant="outline" className="gap-1">
                      <Car className="h-3 w-3" />
                      Location
                    </Badge>
                  )}
                </div>

                {/* Admin Comment */}
                {vehicleDetail.status === "REJECTED" && vehicleDetail.adminComment && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Motif du refus
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">{vehicleDetail.adminComment}</p>
                  </div>
                )}
              </div>

              {vehicleDetail.status === "PENDING" && (
                <DialogFooter className="mt-6">
                  <Button variant="outline" onClick={() => setVehicleDetailOpen(false)}>
                    Fermer
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setSelectedVehicle(vehicleDetail);
                      setRejectDialogOpen(true);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Refuser
                  </Button>
                  <Button
                    onClick={() => approveMutation.mutate(vehicleDetail.id)}
                    disabled={approveMutation.isPending}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approuver
                  </Button>
                </DialogFooter>
              )}
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* User Detail Dialog */}
      <Dialog open={userDetailOpen} onOpenChange={setUserDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {loadingUserDetail ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : userDetail ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={userDetail.photoUrl || undefined} />
                    <AvatarFallback>
                      {getInitials(userDetail.firstName, userDetail.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p>{userDetail.firstName} {userDetail.lastName}</p>
                    <p className="text-sm font-normal text-muted-foreground">{userDetail.email}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Badge variant={userDetail.role === "ADMIN" ? "default" : "outline"}>
                    {userDetail.role}
                  </Badge>
                  <Badge variant={userDetail.isActive ? "outline" : "destructive"}>
                    {userDetail.isActive ? "Actif" : "Désactivé"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground">Inscrit le</p>
                    <p className="font-medium">{new Date(userDetail.createdAt).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground">Véhicules</p>
                    <p className="font-medium">{userDetail.vehicles?.length || 0}</p>
                  </div>
                </div>

                {userDetail.vehicles && userDetail.vehicles.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Véhicules</h4>
                    <div className="space-y-2">
                      {userDetail.vehicles.map((v: any) => (
                        <div key={v.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <span>{v.brand} {v.model} - {v.licensePlate}</span>
                          <Badge variant={v.status === "APPROVED" ? "default" : v.status === "PENDING" ? "outline" : "destructive"}>
                            {v.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setUserDetailOpen(false)}>
                  Fermer
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser le véhicule</DialogTitle>
            <DialogDescription>
              {selectedVehicle?.brand} {selectedVehicle?.model} - {selectedVehicle?.licensePlate}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="comment">Motif du refus</Label>
              <Textarea
                id="comment"
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="Ex: Documents manquants, photos floues, informations incorrectes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={!rejectComment.trim() || rejectMutation.isPending}
            >
              {rejectMutation.isPending ? "Refus..." : "Confirmer le refus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
