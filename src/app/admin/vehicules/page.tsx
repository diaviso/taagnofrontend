"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminService } from "@/lib/services/admin.service";
import { Vehicle, VehicleStatus } from "@/types";
import { toast } from "sonner";
import {
  Car,
  Check,
  X,
  Eye,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Image as ImageIcon,
  MapPin,
  Key,
  AlertTriangle,
  Loader2,
  Filter,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const documentTypeLabels: Record<string, string> = {
  INSURANCE: "Assurance",
  REGISTRATION: "Carte grise",
  TECHNICAL_VISIT: "Visite technique",
};

const getDocStatusBadge = (status: string) => {
  switch (status) {
    case "PENDING":
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">En attente</Badge>;
    case "APPROVED":
      return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Validé</Badge>;
    case "REJECTED":
      return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Refusé</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function AdminVehiclesPage() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const initialStatus = (searchParams.get("status") as VehicleStatus) || VehicleStatus.PENDING;

  const [statusFilter, setStatusFilter] = useState<VehicleStatus>(initialStatus);
  const [searchQuery, setSearchQuery] = useState("");

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [rejectComment, setRejectComment] = useState("");

  const [vehicleDetailOpen, setVehicleDetailOpen] = useState(false);
  const [vehicleDetail, setVehicleDetail] = useState<Vehicle | null>(null);
  const [loadingVehicleDetail, setLoadingVehicleDetail] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ["admin", "vehicles", statusFilter],
    queryFn: () => adminService.getVehicles(statusFilter),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminService.approveVehicle(id),
    onSuccess: () => {
      toast.success("Véhicule approuvé avec succès !");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      setVehicleDetailOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de l'approbation");
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
      toast.error(error.response?.data?.message || "Erreur lors du refus");
    },
  });

  const handleViewVehicle = async (id: string) => {
    setLoadingVehicleDetail(true);
    setSelectedPhotoIndex(0);
    try {
      const data = await adminService.getVehicleById(id);
      setVehicleDetail(data);
      setVehicleDetailOpen(true);
    } catch (error) {
      toast.error("Erreur lors du chargement du véhicule");
    } finally {
      setLoadingVehicleDetail(false);
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

  const getStatusConfig = (status: VehicleStatus) => {
    switch (status) {
      case VehicleStatus.PENDING:
        return {
          label: "En attente",
          icon: Clock,
          color: "text-amber-600",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500",
        };
      case VehicleStatus.APPROVED:
        return {
          label: "Approuvé",
          icon: CheckCircle2,
          color: "text-green-600",
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500",
        };
      case VehicleStatus.REJECTED:
        return {
          label: "Refusé",
          icon: XCircle,
          color: "text-red-600",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500",
        };
    }
  };

  const filteredVehicles = vehicles?.filter((v: Vehicle) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      v.brand.toLowerCase().includes(searchLower) ||
      v.model.toLowerCase().includes(searchLower) ||
      v.licensePlate.toLowerCase().includes(searchLower) ||
      v.owner?.firstName?.toLowerCase().includes(searchLower) ||
      v.owner?.lastName?.toLowerCase().includes(searchLower)
    );
  });

  const pendingCount = vehicles?.filter((v: Vehicle) => v.status === VehicleStatus.PENDING).length || 0;
  const approvedCount = vehicles?.filter((v: Vehicle) => v.status === VehicleStatus.APPROVED).length || 0;
  const rejectedCount = vehicles?.filter((v: Vehicle) => v.status === VehicleStatus.REJECTED).length || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Car className="h-5 w-5 text-blue-500" />
            </div>
            Gestion des véhicules
          </h1>
          <p className="text-muted-foreground mt-1">Validez et gérez les véhicules de la plateforme</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card
          className={`cursor-pointer transition-all duration-200 ${statusFilter === VehicleStatus.PENDING ? 'ring-2 ring-amber-500 shadow-lg' : 'hover:shadow-md'}`}
          onClick={() => setStatusFilter(VehicleStatus.PENDING)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all duration-200 ${statusFilter === VehicleStatus.APPROVED ? 'ring-2 ring-green-500 shadow-lg' : 'hover:shadow-md'}`}
          onClick={() => setStatusFilter(VehicleStatus.APPROVED)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
                <p className="text-sm text-muted-foreground">Approuvés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all duration-200 ${statusFilter === VehicleStatus.REJECTED ? 'ring-2 ring-red-500 shadow-lg' : 'hover:shadow-md'}`}
          onClick={() => setStatusFilter(VehicleStatus.REJECTED)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
                <p className="text-sm text-muted-foreground">Refusés</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-soft">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par marque, modèle, plaque ou propriétaire..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-muted/50 border-0"
              />
            </div>
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as VehicleStatus)} className="w-full md:w-auto">
              <TabsList className="grid grid-cols-3 w-full md:w-auto">
                <TabsTrigger value={VehicleStatus.PENDING} className="gap-1 text-xs md:text-sm">
                  <Clock className="h-3 w-3" />
                  Attente
                </TabsTrigger>
                <TabsTrigger value={VehicleStatus.APPROVED} className="gap-1 text-xs md:text-sm">
                  <CheckCircle2 className="h-3 w-3" />
                  Approuvés
                </TabsTrigger>
                <TabsTrigger value={VehicleStatus.REJECTED} className="gap-1 text-xs md:text-sm">
                  <XCircle className="h-3 w-3" />
                  Refusés
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : filteredVehicles && filteredVehicles.length > 0 ? (
        <div className="space-y-4">
          {filteredVehicles.map((vehicle: Vehicle, index: number) => {
            const statusConfig = getStatusConfig(vehicle.status);
            const StatusIcon = statusConfig.icon;

            return (
              <Card
                key={vehicle.id}
                className={`group overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 ${statusConfig.borderColor}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row">
                    {/* Vehicle Image */}
                    <div className="lg:w-48 h-48 lg:h-auto relative bg-muted flex-shrink-0 overflow-hidden">
                      {vehicle.photos && vehicle.photos.length > 0 ? (
                        <img
                          src={vehicle.photos[0].url}
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-cyan-500/5">
                          <Car className="h-16 w-16 text-blue-500/30" />
                        </div>
                      )}
                      <Badge className={`absolute top-3 left-3 gap-1 ${statusConfig.bgColor} ${statusConfig.color} border-0`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </Badge>
                    </div>

                    {/* Vehicle Info */}
                    <div className="flex-1 p-5">
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-1">
                            {vehicle.brand} {vehicle.model}
                            <span className="text-muted-foreground font-normal ml-2">({vehicle.year})</span>
                          </h3>
                          <p className="text-muted-foreground text-sm mb-3">
                            {vehicle.color} | {vehicle.licensePlate} | {vehicle.numberOfSeats} places
                          </p>

                          {/* Owner */}
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 mb-3">
                            <Avatar className="h-10 w-10 ring-2 ring-blue-500/20">
                              <AvatarImage src={vehicle.owner?.photoUrl || undefined} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-sm">
                                {getInitials(vehicle.owner?.firstName, vehicle.owner?.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{vehicle.owner?.firstName} {vehicle.owner?.lastName}</p>
                              <p className="text-xs text-muted-foreground">{vehicle.owner?.email}</p>
                            </div>
                          </div>

                          {/* Services & Docs */}
                          <div className="flex flex-wrap gap-2">
                            {vehicle.isForCarpooling && (
                              <Badge variant="outline" className="gap-1">
                                <MapPin className="h-3 w-3" />
                                Covoiturage
                              </Badge>
                            )}
                            {vehicle.isForRental && (
                              <Badge variant="outline" className="gap-1">
                                <Key className="h-3 w-3" />
                                Location
                              </Badge>
                            )}
                            <Badge variant="outline" className="gap-1">
                              <ImageIcon className="h-3 w-3" />
                              {vehicle.photos?.length || 0} photos
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                              <FileText className="h-3 w-3" />
                              {vehicle.documents?.length || 0} docs
                            </Badge>
                          </div>

                          {/* Reject Reason */}
                          {vehicle.status === VehicleStatus.REJECTED && vehicle.adminComment && (
                            <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                              <p className="text-sm text-red-600 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                <strong>Motif:</strong> {vehicle.adminComment}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-row lg:flex-col gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            onClick={() => handleViewVehicle(vehicle.id)}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Détails
                          </Button>
                          {vehicle.status === VehicleStatus.PENDING && (
                            <>
                              <Button
                                onClick={() => approveMutation.mutate(vehicle.id)}
                                disabled={approveMutation.isPending}
                                className="gap-2 bg-green-500 hover:bg-green-600"
                              >
                                <Check className="h-4 w-4" />
                                Approuver
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleReject(vehicle)}
                                className="gap-2"
                              >
                                <X className="h-4 w-4" />
                                Refuser
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-0 shadow-soft">
          <CardContent className="p-16 text-center">
            <div className="h-20 w-20 mx-auto rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
              <Car className="h-10 w-10 text-blue-500/50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Aucun véhicule</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {searchQuery
                ? "Aucun véhicule ne correspond à votre recherche."
                : `Aucun véhicule ${statusFilter === VehicleStatus.PENDING ? "en attente" : statusFilter === VehicleStatus.APPROVED ? "approuvé" : "refusé"} pour le moment.`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Vehicle Detail Dialog */}
      <Dialog open={vehicleDetailOpen} onOpenChange={setVehicleDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {loadingVehicleDetail ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : vehicleDetail ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Car className="h-5 w-5 text-blue-500" />
                  </div>
                  {vehicleDetail.brand} {vehicleDetail.model} ({vehicleDetail.year})
                </DialogTitle>
                <DialogDescription>
                  {vehicleDetail.color} | {vehicleDetail.licensePlate} | {vehicleDetail.numberOfSeats} places
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Photo Gallery */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-blue-500" />
                    Photos ({vehicleDetail.photos?.length || 0})
                  </h4>
                  {vehicleDetail.photos && vehicleDetail.photos.length > 0 ? (
                    <div className="space-y-3">
                      {/* Main Photo */}
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                        <img
                          src={vehicleDetail.photos[selectedPhotoIndex].url}
                          alt="Photo véhicule"
                          className="w-full h-full object-cover"
                        />
                        {vehicleDetail.photos[selectedPhotoIndex].isMain && (
                          <Badge className="absolute top-3 left-3 bg-blue-500">Photo principale</Badge>
                        )}
                        {vehicleDetail.photos.length > 1 && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                              onClick={() => setSelectedPhotoIndex(prev => prev > 0 ? prev - 1 : vehicleDetail.photos!.length - 1)}
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                              onClick={() => setSelectedPhotoIndex(prev => prev < vehicleDetail.photos!.length - 1 ? prev + 1 : 0)}
                            >
                              <ChevronRight className="h-5 w-5" />
                            </Button>
                          </>
                        )}
                      </div>
                      {/* Thumbnails */}
                      {vehicleDetail.photos.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {vehicleDetail.photos.map((photo: any, index: number) => (
                            <button
                              key={photo.id}
                              onClick={() => setSelectedPhotoIndex(index)}
                              className={`relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                                selectedPhotoIndex === index ? 'ring-2 ring-blue-500 scale-105' : 'opacity-70 hover:opacity-100'
                              }`}
                            >
                              <img
                                src={photo.url}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-muted/30 rounded-xl">
                      <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">Aucune photo</p>
                    </div>
                  )}
                </div>

                {/* Owner Info */}
                <div>
                  <h4 className="font-semibold mb-3">Propriétaire</h4>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/5 border border-blue-500/10">
                    <Avatar className="h-14 w-14 ring-2 ring-blue-500/30">
                      <AvatarImage src={vehicleDetail.owner?.photoUrl || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                        {getInitials(vehicleDetail.owner?.firstName, vehicleDetail.owner?.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{vehicleDetail.owner?.firstName} {vehicleDetail.owner?.lastName}</p>
                      <p className="text-sm text-muted-foreground">{vehicleDetail.owner?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-500" />
                    Documents ({vehicleDetail.documents?.length || 0})
                  </h4>
                  {vehicleDetail.documents && vehicleDetail.documents.length > 0 ? (
                    <div className="space-y-2">
                      {vehicleDetail.documents.map((doc: any) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-purple-500" />
                            </div>
                            <div>
                              <p className="font-medium">{documentTypeLabels[doc.type] || doc.type}</p>
                              <p className="text-xs text-muted-foreground">
                                Ajouté le {new Date(doc.createdAt).toLocaleDateString("fr-FR")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getDocStatusBadge(doc.status)}
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="outline" size="sm" className="gap-1">
                                <Eye className="h-3 w-3" />
                                Voir
                              </Button>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-muted/30 rounded-xl">
                      <FileText className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">Aucun document</p>
                    </div>
                  )}
                </div>

                {/* Services */}
                <div className="flex gap-3">
                  {vehicleDetail.isForCarpooling && (
                    <Badge variant="outline" className="gap-1 px-3 py-1">
                      <MapPin className="h-3 w-3 text-green-500" />
                      Covoiturage
                    </Badge>
                  )}
                  {vehicleDetail.isForRental && (
                    <Badge variant="outline" className="gap-1 px-3 py-1">
                      <Key className="h-3 w-3 text-purple-500" />
                      Location
                    </Badge>
                  )}
                </div>

                {/* Admin Comment */}
                {vehicleDetail.status === "REJECTED" && vehicleDetail.adminComment && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <p className="font-medium text-red-600 flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4" />
                      Motif du refus
                    </p>
                    <p className="text-sm text-red-600">{vehicleDetail.adminComment}</p>
                  </div>
                )}
              </div>

              {vehicleDetail.status === "PENDING" && (
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setVehicleDetailOpen(false)}>
                    Fermer
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setSelectedVehicle(vehicleDetail);
                      setRejectDialogOpen(true);
                    }}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Refuser
                  </Button>
                  <Button
                    onClick={() => approveMutation.mutate(vehicleDetail.id)}
                    disabled={approveMutation.isPending}
                    className="gap-2 bg-green-500 hover:bg-green-600"
                  >
                    {approveMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Approuver
                  </Button>
                </DialogFooter>
              )}
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Refuser le véhicule
            </DialogTitle>
            <DialogDescription>
              {selectedVehicle?.brand} {selectedVehicle?.model} - {selectedVehicle?.licensePlate}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="comment">Motif du refus *</Label>
              <Textarea
                id="comment"
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="Ex: Documents manquants, photos floues, informations incorrectes..."
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Ce message sera visible par le propriétaire du véhicule.
              </p>
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
              className="gap-2"
            >
              {rejectMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
              Confirmer le refus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
