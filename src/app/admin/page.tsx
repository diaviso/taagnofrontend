"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { adminService, AdminStatistics } from "@/lib/services/admin.service";
import {
  Users,
  Car,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  Key,
  TrendingUp,
  ArrowUpRight,
  Activity,
  Sparkles,
  Calendar,
  Eye,
  Shield,
  BarChart3,
  Zap,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function AdminDashboardPage() {
  const { data: statistics, isLoading } = useQuery({
    queryKey: ["admin", "statistics"],
    queryFn: () => adminService.getStatistics(),
  });

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase() || "?";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">En attente</Badge>;
      case "APPROVED":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Approuvé</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Refusé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!statistics) return null;

  const pendingRate = statistics.vehicles.total > 0
    ? (statistics.vehicles.pending / statistics.vehicles.total) * 100
    : 0;
  const approvalRate = statistics.vehicles.total > 0
    ? (statistics.vehicles.approved / statistics.vehicles.total) * 100
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-purple-500" />
            </div>
            Tableau de bord
          </h1>
          <p className="text-muted-foreground mt-1">Vue d'ensemble de la plateforme</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 px-3 py-1">
            <Activity className="h-3 w-3 text-green-500 animate-pulse" />
            Plateforme active
          </Badge>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="p-5 relative">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Utilisateurs</p>
                <p className="text-3xl font-bold text-blue-600">{statistics.users.total}</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  Actifs sur la plateforme
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Vehicles */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-l-4 border-l-amber-500">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="p-5 relative">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">En attente</p>
                <p className="text-3xl font-bold text-amber-600">{statistics.vehicles.pending}</p>
                <Link href="/admin/vehicules?status=PENDING" className="text-xs text-amber-600 hover:underline mt-1 flex items-center gap-1">
                  Voir les demandes
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-500 animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Approved Vehicles */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="p-5 relative">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Approuvés</p>
                <p className="text-3xl font-bold text-green-600">{statistics.vehicles.approved}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {approvalRate.toFixed(0)}% du total
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rejected Vehicles */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-l-4 border-l-red-500">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="p-5 relative">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Refusés</p>
                <p className="text-3xl font-bold text-red-600">{statistics.vehicles.rejected}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Demandes rejetées
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Statistics */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Carpool Stats */}
        <Card className="border-0 shadow-soft overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-green-500" />
              </div>
              Covoiturage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/10">
                <p className="text-3xl font-bold text-green-600">{statistics.carpool.totalTrips}</p>
                <p className="text-sm text-muted-foreground">Trajets total</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/10">
                <p className="text-3xl font-bold text-blue-600">{statistics.carpool.openTrips}</p>
                <p className="text-sm text-muted-foreground">Trajets ouverts</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-gray-500/10 to-slate-500/5 border border-gray-500/10">
                <p className="text-3xl font-bold">{statistics.carpool.completedTrips}</p>
                <p className="text-sm text-muted-foreground">Terminés</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/5 border border-purple-500/10">
                <p className="text-3xl font-bold text-purple-600">{statistics.carpool.totalReservations}</p>
                <p className="text-sm text-muted-foreground">Réservations</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Taux de remplissage</span>
                <span className="font-medium">{statistics.carpool.openTrips > 0 ? ((statistics.carpool.totalReservations / statistics.carpool.openTrips) * 100).toFixed(0) : 0}%</span>
              </div>
              <Progress value={statistics.carpool.openTrips > 0 ? (statistics.carpool.totalReservations / statistics.carpool.openTrips) * 100 : 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Rental Stats */}
        <Card className="border-0 shadow-soft overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Key className="h-4 w-4 text-purple-500" />
              </div>
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/5 border border-purple-500/10">
                <p className="text-3xl font-bold text-purple-600">{statistics.rental.totalOffers}</p>
                <p className="text-sm text-muted-foreground">Offres total</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/10">
                <p className="text-3xl font-bold text-green-600">{statistics.rental.activeOffers}</p>
                <p className="text-sm text-muted-foreground">Offres actives</p>
              </div>
              <div className="col-span-2 p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-amber-600">{statistics.rental.totalBookings}</p>
                    <p className="text-sm text-muted-foreground">Réservations totales</p>
                  </div>
                  <Calendar className="h-10 w-10 text-amber-500/30" />
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Offres actives</span>
                <span className="font-medium">{statistics.rental.totalOffers > 0 ? ((statistics.rental.activeOffers / statistics.rental.totalOffers) * 100).toFixed(0) : 0}%</span>
              </div>
              <Progress value={statistics.rental.totalOffers > 0 ? (statistics.rental.activeOffers / statistics.rental.totalOffers) * 100 : 0} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Vehicles */}
        <Card className="border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Car className="h-4 w-4 text-blue-500" />
              </div>
              Derniers véhicules
            </CardTitle>
            <Link href="/admin/vehicules">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                Voir tout
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statistics.recentVehicles.length > 0 ? (
                statistics.recentVehicles.map((vehicle: any, index: number) => (
                  <div
                    key={vehicle.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {vehicle.photos && vehicle.photos.length > 0 ? (
                        <img
                          src={vehicle.photos[0].url}
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Car className="h-5 w-5 text-blue-500/50" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{vehicle.brand} {vehicle.model}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {vehicle.owner?.firstName} {vehicle.owner?.lastName}
                      </p>
                    </div>
                    {getStatusBadge(vehicle.status)}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Car className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aucun véhicule récent</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-emerald-500" />
              </div>
              Nouveaux utilisateurs
            </CardTitle>
            <Link href="/admin/utilisateurs">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                Voir tout
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statistics.recentUsers.length > 0 ? (
                statistics.recentUsers.map((user: any, index: number) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Avatar className="h-12 w-12 ring-2 ring-emerald-500/20">
                      <AvatarImage src={user.photoUrl} />
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-green-500 text-white">
                        {getInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    {user.role === "ADMIN" && (
                      <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 gap-1">
                        <Shield className="h-3 w-3" />
                        Admin
                      </Badge>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aucun utilisateur récent</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-soft bg-gradient-to-br from-purple-500/5 to-indigo-500/5">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Actions rapides</h3>
                <p className="text-sm text-muted-foreground">Accédez aux fonctionnalités principales</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/vehicules?status=PENDING">
                <Button className="gap-2 bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/25">
                  <Clock className="h-4 w-4" />
                  Valider véhicules ({statistics.vehicles.pending})
                </Button>
              </Link>
              <Link href="/admin/utilisateurs">
                <Button variant="outline" className="gap-2">
                  <Users className="h-4 w-4" />
                  Gérer utilisateurs
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
