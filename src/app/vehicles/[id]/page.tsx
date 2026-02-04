"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useAuth } from "@/providers";
import { Vehicle, VehicleStatus, VehiclePhoto, VehicleDocument, DocumentType, DocumentStatus } from "@/types";
import { toast } from "sonner";
import {
  ArrowLeft,
  Car,
  Calendar,
  Users,
  Upload,
  Image as ImageIcon,
  FileText,
  Trash2,
  Star,
  Check,
  X,
  Loader2,
  Plus,
  Shield,
  AlertTriangle,
} from "lucide-react";

const MAX_PHOTOS = 6;

const documentTypeLabels: Record<DocumentType, string> = {
  [DocumentType.INSURANCE]: "Assurance",
  [DocumentType.REGISTRATION]: "Carte grise",
  [DocumentType.TECHNICAL_VISIT]: "Visite technique",
};

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const vehicleId = params.id as string;

  const photoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>(DocumentType.INSURANCE);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);

  const { data: vehicle, isLoading, error } = useQuery({
    queryKey: ["vehicle", vehicleId],
    queryFn: () => vehiclesService.getVehicleById(vehicleId),
    enabled: !!vehicleId,
  });

  const isOwner = user?.id === vehicle?.ownerId;

  const deleteMutation = useMutation({
    mutationFn: () => vehiclesService.deleteVehicle(vehicleId),
    onSuccess: () => {
      toast.success("Véhicule supprimé");
      router.push("/vehicles");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression");
    },
  });

  const addPhotoMutation = useMutation({
    mutationFn: (data: { url: string; isMain: boolean }) => 
      vehiclesService.addPhoto(vehicleId, data),
    onSuccess: () => {
      toast.success("Photo ajoutée");
      queryClient.invalidateQueries({ queryKey: ["vehicle", vehicleId] });
      setPhotoDialogOpen(false);
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
      toast.error(error.response?.data?.message || "Erreur");
    },
  });

  const setMainPhotoMutation = useMutation({
    mutationFn: (photoId: string) => vehiclesService.setMainPhoto(vehicleId, photoId),
    onSuccess: () => {
      toast.success("Photo principale définie");
      queryClient.invalidateQueries({ queryKey: ["vehicle", vehicleId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur");
    },
  });

  const addDocumentMutation = useMutation({
    mutationFn: (data: { type: DocumentType; fileUrl: string }) =>
      vehiclesService.addDocument(vehicleId, data),
    onSuccess: () => {
      toast.success("Document ajouté");
      queryClient.invalidateQueries({ queryKey: ["vehicle", vehicleId] });
      setDocumentDialogOpen(false);
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
      toast.error(error.response?.data?.message || "Erreur");
    },
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5 Mo");
      return;
    }

    setUploadingPhoto(true);
    try {
      const { url } = await vehiclesService.uploadFile(file);
      const isMain = !vehicle?.photos || vehicle.photos.length === 0;
      await addPhotoMutation.mutateAsync({ url, isMain });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'upload");
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) {
        photoInputRef.current.value = "";
      }
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Format accepté : PDF, JPEG, PNG");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Le fichier ne doit pas dépasser 10 Mo");
      return;
    }

    setUploadingDocument(true);
    try {
      const { url } = await vehiclesService.uploadFile(file);
      await addDocumentMutation.mutateAsync({ type: selectedDocType, fileUrl: url });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'upload");
    } finally {
      setUploadingDocument(false);
      if (documentInputRef.current) {
        documentInputRef.current.value = "";
      }
    }
  };

  const getStatusBadge = (status: VehicleStatus) => {
    switch (status) {
      case VehicleStatus.PENDING:
        return <Badge variant="warning" className="gap-1"><AlertTriangle className="h-3 w-3" /> En attente de validation</Badge>;
      case VehicleStatus.APPROVED:
        return <Badge variant="success" className="gap-1"><Check className="h-3 w-3" /> Approuvé</Badge>;
      case VehicleStatus.REJECTED:
        return <Badge variant="destructive" className="gap-1"><X className="h-3 w-3" /> Refusé</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getDocStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.PENDING:
        return <Badge variant="warning" className="text-xs">En attente</Badge>;
      case DocumentStatus.APPROVED:
        return <Badge variant="success" className="text-xs">Validé</Badge>;
      case DocumentStatus.REJECTED:
        return <Badge variant="destructive" className="text-xs">Refusé</Badge>;
      default:
        return <Badge className="text-xs">{status}</Badge>;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Connexion requise</h1>
        <Link href="/login"><Button>Se connecter</Button></Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="container py-8 text-center">
        <Car className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-4">Véhicule non trouvé</h1>
        <p className="text-muted-foreground mb-6">Ce véhicule n&apos;existe pas ou vous n&apos;y avez pas accès.</p>
        <Link href="/vehicles">
          <Button>Retour à mes véhicules</Button>
        </Link>
      </div>
    );
  }

  const photosCount = vehicle.photos?.length || 0;
  const canAddPhotos = photosCount < MAX_PHOTOS;
  const mainPhoto = vehicle.photos?.find((p) => p.isMain) || vehicle.photos?.[0];

  return (
    <div className="container py-8 page-transition">
      <Link href="/vehicles" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Retour à mes véhicules
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle Header */}
          <Card className="overflow-hidden animate-fade-in">
            <div className="relative h-64 bg-gradient-to-br from-primary/10 to-primary/5">
              {mainPhoto ? (
                <img
                  src={mainPhoto.url}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Car className="h-24 w-24 text-primary/30" />
                </div>
              )}
              <div className="absolute top-4 right-4">
                {getStatusBadge(vehicle.status)}
              </div>
            </div>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">
                    {vehicle.brand} {vehicle.model}
                  </h1>
                  <p className="text-muted-foreground">
                    {vehicle.color} • {vehicle.licensePlate}
                  </p>
                </div>
                <div className="flex gap-2">
                  {vehicle.isForCarpooling && (
                    <Badge variant="outline" className="gap-1">
                      <Users className="h-3 w-3" /> Covoiturage
                    </Badge>
                  )}
                  {vehicle.isForRental && (
                    <Badge variant="outline" className="gap-1">
                      <Car className="h-3 w-3" /> Location
                    </Badge>
                  )}
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <Calendar className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                  <p className="text-2xl font-bold">{vehicle.year}</p>
                  <p className="text-xs text-muted-foreground">Année</p>
                </div>
                <div>
                  <Users className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                  <p className="text-2xl font-bold">{vehicle.numberOfSeats}</p>
                  <p className="text-xs text-muted-foreground">Places</p>
                </div>
                <div>
                  <ImageIcon className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                  <p className="text-2xl font-bold">{photosCount}/{MAX_PHOTOS}</p>
                  <p className="text-xs text-muted-foreground">Photos</p>
                </div>
              </div>

              {vehicle.status === VehicleStatus.REJECTED && vehicle.adminComment && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Motif du refus
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{vehicle.adminComment}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Photos & Documents Tabs */}
          <Tabs defaultValue="photos" className="animate-fade-in">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="photos" className="gap-2">
                <ImageIcon className="h-4 w-4" />
                Photos ({photosCount})
              </TabsTrigger>
              <TabsTrigger value="documents" className="gap-2">
                <FileText className="h-4 w-4" />
                Documents ({vehicle.documents?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="photos" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Photos du véhicule</CardTitle>
                      <CardDescription>
                        Ajoutez jusqu&apos;à {MAX_PHOTOS} photos. Cliquez sur l&apos;étoile pour définir l&apos;image principale.
                      </CardDescription>
                    </div>
                    {isOwner && canAddPhotos && (
                      <div>
                        <input
                          ref={photoInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoUpload}
                        />
                        <Button
                          onClick={() => photoInputRef.current?.click()}
                          disabled={uploadingPhoto}
                          className="gap-2"
                        >
                          {uploadingPhoto ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                          Ajouter une photo
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {vehicle.photos && vehicle.photos.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {vehicle.photos.map((photo) => (
                        <div
                          key={photo.id}
                          className="relative group rounded-lg overflow-hidden aspect-video bg-muted"
                        >
                          <img
                            src={photo.url}
                            alt="Photo du véhicule"
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                          {photo.isMain && (
                            <div className="absolute top-2 left-2">
                              <Badge className="gap-1 bg-amber-500">
                                <Star className="h-3 w-3 fill-current" /> Principale
                              </Badge>
                            </div>
                          )}
                          {isOwner && (
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              {!photo.isMain && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => setMainPhotoMutation.mutate(photo.id)}
                                  disabled={setMainPhotoMutation.isPending}
                                  className="gap-1"
                                >
                                  <Star className="h-3 w-3" />
                                  Principale
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deletePhotoMutation.mutate(photo.id)}
                                disabled={deletePhotoMutation.isPending}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                      <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">Aucune photo ajoutée</p>
                      {isOwner && (
                        <Button
                          variant="outline"
                          onClick={() => photoInputRef.current?.click()}
                          disabled={uploadingPhoto}
                        >
                          {uploadingPhoto ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          Ajouter votre première photo
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Documents du véhicule</CardTitle>
                      <CardDescription>
                        Ajoutez les documents requis pour la validation de votre véhicule.
                      </CardDescription>
                    </div>
                    {isOwner && (
                      <Dialog open={documentDialogOpen} onOpenChange={setDocumentDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Ajouter un document
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Ajouter un document</DialogTitle>
                            <DialogDescription>
                              Sélectionnez le type de document et téléchargez le fichier.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Type de document</Label>
                              <Select
                                value={selectedDocType}
                                onValueChange={(v) => setSelectedDocType(v as DocumentType)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(documentTypeLabels).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>
                                      {label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Fichier (PDF, JPEG, PNG - max 10 Mo)</Label>
                              <input
                                ref={documentInputRef}
                                type="file"
                                className="hidden"
                                onChange={handleDocumentUpload}
                              />
                              <Button
                                variant="outline"
                                className="w-full gap-2"
                                onClick={() => documentInputRef.current?.click()}
                                disabled={uploadingDocument}
                              >
                                {uploadingDocument ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Upload className="h-4 w-4" />
                                )}
                                Sélectionner un fichier
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {vehicle.documents && vehicle.documents.length > 0 ? (
                    <div className="space-y-3">
                      {vehicle.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{documentTypeLabels[doc.type]}</p>
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
                            {isOwner && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteDocumentMutation.mutate(doc.id)}
                                disabled={deleteDocumentMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-2">Aucun document ajouté</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Ajoutez vos documents pour accélérer la validation
                      </p>
                      {isOwner && (
                        <Button
                          variant="outline"
                          onClick={() => setDocumentDialogOpen(true)}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Ajouter un document
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Required documents hint */}
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-primary" />
                      Documents requis pour la validation
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-500" /> Carte grise du véhicule
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-500" /> Attestation d&apos;assurance valide
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-500" /> Certificat de visite technique
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions Card */}
          {isOwner && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/vehicles/${vehicleId}/edit`} className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Car className="h-4 w-4" />
                    Modifier les informations
                  </Button>
                </Link>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full justify-start gap-2">
                      <Trash2 className="h-4 w-4" />
                      Supprimer le véhicule
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer ce véhicule ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible. Toutes les données associées à ce véhicule seront supprimées.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteMutation.mutate()}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          )}

          {/* Status Info Card */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Statut de validation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getStatusBadge(vehicle.status)}
                
                {vehicle.status === VehicleStatus.PENDING && (
                  <p className="text-sm text-muted-foreground">
                    Votre véhicule est en cours de vérification par notre équipe. 
                    Assurez-vous d&apos;avoir ajouté tous les documents requis.
                  </p>
                )}

                {vehicle.status === VehicleStatus.APPROVED && (
                  <p className="text-sm text-muted-foreground">
                    Votre véhicule est approuvé ! Vous pouvez maintenant l&apos;utiliser 
                    pour le covoiturage ou la location.
                  </p>
                )}

                {vehicle.status === VehicleStatus.REJECTED && (
                  <p className="text-sm text-muted-foreground">
                    Votre véhicule a été refusé. Veuillez corriger les problèmes 
                    mentionnés et soumettre à nouveau.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
