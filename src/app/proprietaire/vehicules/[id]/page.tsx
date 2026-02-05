"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { vehiclesService } from "@/lib/services";
import { Vehicle, VehicleStatus, DocumentType, DocumentStatus } from "@/types";
import { toast } from "sonner";
import {
  Car,
  ArrowLeft,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Camera,
  FileText,
  Trash2,
  Plus,
  Star,
  Edit,
  Upload,
  Image,
  File,
  Shield,
  Navigation,
  Key,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Download,
  Eye,
  Power,
  PowerOff,
} from "lucide-react";

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const vehicleId = params.id as string;

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isMainPhoto, setIsMainPhoto] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>(DocumentType.INSURANCE);
  const [isUploading, setIsUploading] = useState(false);

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ["vehicle", vehicleId],
    queryFn: () => vehiclesService.getVehicleById(vehicleId),
    enabled: !!vehicleId,
  });

  const handlePhotoUpload = async () => {
    if (!photoFile) return;
    setIsUploading(true);
    try {
      const { url } = await vehiclesService.uploadFile(photoFile);
      await vehiclesService.addPhoto(vehicleId, { url, isMain: isMainPhoto });
      toast.success("Photo ajoutée avec succès");
      queryClient.invalidateQueries({ queryKey: ["vehicle", vehicleId] });
      setPhotoDialogOpen(false);
      setPhotoFile(null);
      setIsMainPhoto(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'ajout de la photo");
    } finally {
      setIsUploading(false);
    }
  };

  const addPhotoMutation = useMutation({
    mutationFn: (data: { url: string; isMain: boolean }) =>
      vehiclesService.addPhoto(vehicleId, data),
    onSuccess: () => {
      toast.success("Photo ajoutée avec succès");
      queryClient.invalidateQueries({ queryKey: ["vehicle", vehicleId] });
      setPhotoDialogOpen(false);
      setPhotoFile(null);
      setIsMainPhoto(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de l'ajout de la photo");
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: (photoId: string) => vehiclesService.deletePhoto(vehicleId, photoId),
    onSuccess: () => {
      toast.success("Photo supprimée");
      queryClient.invalidateQueries({ queryKey: ["vehicle", vehicleId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression");
    },
  });

  const setMainPhotoMutation = useMutation({
    mutationFn: (photoId: string) => vehiclesService.setMainPhoto(vehicleId, photoId),
    onSuccess: () => {
      toast.success("Photo principale mise à jour");
      queryClient.invalidateQueries({ queryKey: ["vehicle", vehicleId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la modification");
    },
  });

  const handleDocumentUpload = async () => {
    if (!documentFile) return;
    setIsUploading(true);
    try {
      const { url } = await vehiclesService.uploadFile(documentFile);
      await vehiclesService.addDocument(vehicleId, { type: documentType, fileUrl: url });
      toast.success("Document ajouté avec succès");
      queryClient.invalidateQueries({ queryKey: ["vehicle", vehicleId] });
      setDocumentDialogOpen(false);
      setDocumentFile(null);
      setDocumentType(DocumentType.INSURANCE);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'ajout du document");
    } finally {
      setIsUploading(false);
    }
  };

  const addDocumentMutation = useMutation({
    mutationFn: (data: { type: DocumentType; fileUrl: string }) =>
      vehiclesService.addDocument(vehicleId, data),
    onSuccess: () => {
      toast.success("Document ajouté avec succès");
      queryClient.invalidateQueries({ queryKey: ["vehicle", vehicleId] });
      setDocumentDialogOpen(false);
      setDocumentFile(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de l'ajout du document");
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: (documentId: string) => vehiclesService.deleteDocument(vehicleId, documentId),
    onSuccess: () => {
      toast.success("Document supprimé");
      queryClient.invalidateQueries({ queryKey: ["vehicle", vehicleId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression");
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: () => vehiclesService.toggleActive(vehicleId),
    onSuccess: (data) => {
      toast.success(data.isActive ? "Véhicule activé" : "Véhicule désactivé");
      queryClient.invalidateQueries({ queryKey: ["vehicle", vehicleId] });
      queryClient.invalidateQueries({ queryKey: ["vehicles", "mine"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la modification");
    },
  });

  const getStatusConfig = (status: VehicleStatus) => {
    switch (status) {
      case VehicleStatus.APPROVED:
        return {
          label: "Approuvé",
          icon: CheckCircle2,
          color: "text-green-600",
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500",
        };
      case VehicleStatus.PENDING:
        return {
          label: "En attente de validation",
          icon: Clock,
          color: "text-amber-600",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500",
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

  const getDocumentTypeLabel = (type: DocumentType) => {
    switch (type) {
      case DocumentType.INSURANCE:
        return "Assurance";
      case DocumentType.REGISTRATION:
        return "Carte grise";
      case DocumentType.TECHNICAL_VISIT:
        return "Visite technique";
      default:
        return type;
    }
  };

  const handleNextPhoto = () => {
    if (vehicle?.photos && vehicle.photos.length > 0) {
      const length = vehicle.photos.length;
      setSelectedPhotoIndex((prev) => (prev + 1) % length);
    }
  };

  const handlePrevPhoto = () => {
    if (vehicle?.photos && vehicle.photos.length > 0) {
      const length = vehicle.photos.length;
      setSelectedPhotoIndex((prev) => (prev - 1 + length) % length);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-10 w-48" />
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-16">
        <div className="h-20 w-20 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
          <Car className="h-10 w-10 text-amber-500/50" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Véhicule non trouvé</h1>
        <p className="text-muted-foreground mb-6">Ce véhicule n&apos;existe pas ou a été supprimé.</p>
        <Link href="/proprietaire/vehicules">
          <Button>Retour à mes véhicules</Button>
        </Link>
      </div>
    );
  }

  const statusConfig = getStatusConfig(vehicle.status);
  const StatusIcon = statusConfig.icon;
  const mainPhoto = vehicle.photos?.find((p) => p.isMain) || vehicle.photos?.[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/proprietaire/vehicules">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {vehicle.brand} {vehicle.model}
            </h1>
            <p className="text-muted-foreground">
              {vehicle.color} • {vehicle.licensePlate} • {vehicle.year}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {vehicle.status === VehicleStatus.APPROVED && (
            <Button
              variant={vehicle.isActive ? "default" : "outline"}
              size="sm"
              className={`gap-2 ${vehicle.isActive ? "bg-green-500 hover:bg-green-600" : "text-red-500 border-red-500 hover:bg-red-50"}`}
              onClick={() => toggleActiveMutation.mutate()}
              disabled={toggleActiveMutation.isPending}
            >
              {vehicle.isActive ? (
                <>
                  <Power className="h-4 w-4" />
                  Actif
                </>
              ) : (
                <>
                  <PowerOff className="h-4 w-4" />
                  Inactif
                </>
              )}
            </Button>
          )}
          <Badge className={`gap-2 px-4 py-2 ${statusConfig.bgColor} ${statusConfig.color} border-0`}>
            <StatusIcon className="h-4 w-4" />
            {statusConfig.label}
          </Badge>
        </div>
      </div>

      {/* Rejected warning */}
      {vehicle.status === VehicleStatus.REJECTED && vehicle.adminComment && (
        <Card className="border-red-500/50 bg-red-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-700">Motif du refus</p>
                <p className="text-sm text-red-600">{vehicle.adminComment}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Photo Gallery - 3 columns */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="overflow-hidden border-0 shadow-soft">
            <div className="relative aspect-[4/3] bg-gradient-to-br from-amber-100 to-orange-100">
              {vehicle.photos && vehicle.photos.length > 0 ? (
                <>
                  <img
                    src={vehicle.photos[selectedPhotoIndex]?.url || mainPhoto?.url}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setLightboxOpen(true)}
                  />
                  {/* Navigation arrows */}
                  {vehicle.photos.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white shadow-lg"
                        onClick={handlePrevPhoto}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white shadow-lg"
                        onClick={handleNextPhoto}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </>
                  )}
                  {/* Fullscreen button */}
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-4 right-4 rounded-full bg-white/90 hover:bg-white shadow-lg"
                    onClick={() => setLightboxOpen(true)}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                  {/* Photo counter */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-sm backdrop-blur">
                    {selectedPhotoIndex + 1} / {vehicle.photos.length}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <Car className="h-24 w-24 text-amber-300 mb-4" />
                  <p className="text-muted-foreground">Aucune photo</p>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {vehicle.photos && vehicle.photos.length > 1 && (
              <div className="p-4 bg-muted/30">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {vehicle.photos.map((photo, index) => (
                    <button
                      key={photo.id}
                      onClick={() => setSelectedPhotoIndex(index)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all ${
                        selectedPhotoIndex === index
                          ? "ring-2 ring-amber-500 ring-offset-2"
                          : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={photo.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {photo.isMain && (
                        <div className="absolute top-1 right-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Photo Management */}
          <Card className="border-0 shadow-soft">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Camera className="h-5 w-5 text-amber-500" />
                  Galerie photos ({vehicle.photos?.length || 0})
                </CardTitle>
                <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2 bg-amber-500 hover:bg-amber-600">
                      <Plus className="h-4 w-4" />
                      Ajouter
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter une photo</DialogTitle>
                      <DialogDescription>
                        Ajoutez une photo de votre véhicule
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Sélectionner une photo</Label>
                        <div className="flex items-center gap-3">
                          <Input
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                            className="flex-1"
                          />
                        </div>
                        {photoFile && (
                          <p className="text-sm text-muted-foreground">
                            Fichier sélectionné : {photoFile.name}
                          </p>
                        )}
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isMainPhoto}
                          onChange={(e) => setIsMainPhoto(e.target.checked)}
                          className="rounded"
                        />
                        <span>Définir comme photo principale</span>
                      </label>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setPhotoDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button
                        onClick={handlePhotoUpload}
                        disabled={!photoFile || isUploading}
                        className="bg-amber-500 hover:bg-amber-600"
                      >
                        {isUploading ? "Envoi..." : "Ajouter"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {vehicle.photos && vehicle.photos.length > 0 ? (
                <div className="grid grid-cols-4 gap-3">
                  {vehicle.photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img
                          src={photo.url}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      {photo.isMain && (
                        <Badge className="absolute top-2 left-2 bg-amber-500 text-white text-xs">
                          Principal
                        </Badge>
                      )}
                      {/* Action buttons */}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Set as main button */}
                        {!photo.isMain && (
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-7 w-7 bg-amber-500 hover:bg-amber-600 text-white"
                            onClick={() => setMainPhotoMutation.mutate(photo.id)}
                            disabled={setMainPhotoMutation.isPending}
                            title="Définir comme principale"
                          >
                            <Star className="h-3 w-3" />
                          </Button>
                        )}
                        {/* Delete button */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-7 w-7"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer cette photo ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deletePhotoMutation.mutate(photo.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Image className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>Aucune photo ajoutée</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Panel - 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          {/* Vehicle Info */}
          <Card className="border-0 shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Car className="h-5 w-5 text-amber-500" />
                Informations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Marque</p>
                  <p className="font-semibold">{vehicle.brand}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Modèle</p>
                  <p className="font-semibold">{vehicle.model}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Année</p>
                  <p className="font-semibold">{vehicle.year}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Couleur</p>
                  <p className="font-semibold">{vehicle.color}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Immatriculation</p>
                  <p className="font-semibold">{vehicle.licensePlate}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Places</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {vehicle.numberOfSeats}
                  </p>
                </div>
              </div>

              {/* Usage badges */}
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-3">Utilisation</p>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={vehicle.isForCarpooling ? "default" : "outline"}
                    className={`gap-2 ${vehicle.isForCarpooling ? "bg-green-500" : ""}`}
                  >
                    <Navigation className="h-3 w-3" />
                    Covoiturage
                  </Badge>
                  <Badge
                    variant={vehicle.isForRental ? "default" : "outline"}
                    className={`gap-2 ${vehicle.isForRental ? "bg-purple-500" : ""}`}
                  >
                    <Key className="h-3 w-3" />
                    Location
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="border-0 shadow-soft">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-amber-500" />
                  Documents ({vehicle.documents?.length || 0})
                </CardTitle>
                <Dialog open={documentDialogOpen} onOpenChange={setDocumentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Ajouter
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter un document</DialogTitle>
                      <DialogDescription>
                        Ajoutez un document officiel
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Type de document</Label>
                        <select
                          value={documentType}
                          onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                          className="w-full h-10 px-3 rounded-md border bg-background"
                        >
                          <option value={DocumentType.INSURANCE}>Assurance</option>
                          <option value={DocumentType.REGISTRATION}>Carte grise</option>
                          <option value={DocumentType.TECHNICAL_VISIT}>Visite technique</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Sélectionner un document</Label>
                        <Input
                          type="file"
                          accept="application/pdf,image/jpeg,image/png"
                          onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                        />
                        {documentFile && (
                          <p className="text-sm text-muted-foreground">
                            Fichier sélectionné : {documentFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDocumentDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button
                        onClick={handleDocumentUpload}
                        disabled={!documentFile || isUploading}
                      >
                        {isUploading ? "Envoi..." : "Ajouter"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {vehicle.documents && vehicle.documents.length > 0 ? (
                <div className="space-y-3">
                  {vehicle.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <File className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="font-medium">{getDocumentTypeLabel(doc.type)}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.status === DocumentStatus.APPROVED ? (
                              <span className="text-green-600 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Vérifié
                              </span>
                            ) : doc.status === DocumentStatus.REJECTED ? (
                              <span className="text-red-600 flex items-center gap-1">
                                <XCircle className="h-3 w-3" /> Refusé
                              </span>
                            ) : (
                              <span className="text-amber-600 flex items-center gap-1">
                                <Clock className="h-3 w-3" /> En attente
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => window.open(doc.fileUrl, "_blank")}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer ce document ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteDocumentMutation.mutate(doc.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>Aucun document ajouté</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {vehicle.status === VehicleStatus.APPROVED && (
            <Card className="border-0 shadow-soft overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-amber-500" />
                  Actions rapides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {vehicle.isForCarpooling && (
                  <Link href="/proprietaire/trajets/nouveau" className="block">
                    <Button variant="outline" className="w-full justify-start gap-3 h-12">
                      <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <Navigation className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Proposer un trajet</p>
                        <p className="text-xs text-muted-foreground">Avec ce véhicule</p>
                      </div>
                    </Button>
                  </Link>
                )}
                {vehicle.isForRental && (
                  <Link href="/proprietaire/locations/nouvelle" className="block">
                    <Button variant="outline" className="w-full justify-start gap-3 h-12">
                      <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <Key className="h-4 w-4 text-purple-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Mettre en location</p>
                        <p className="text-xs text-muted-foreground">Avec ce véhicule</p>
                      </div>
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && vehicle.photos && vehicle.photos.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/10 z-10"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevPhoto();
            }}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
            onClick={(e) => {
              e.stopPropagation();
              handleNextPhoto();
            }}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
          <img
            src={vehicle.photos[selectedPhotoIndex].url}
            alt=""
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 text-white backdrop-blur">
            {selectedPhotoIndex + 1} / {vehicle.photos.length}
          </div>
        </div>
      )}
    </div>
  );
}
