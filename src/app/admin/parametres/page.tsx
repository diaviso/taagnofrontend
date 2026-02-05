"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Settings,
  Bell,
  Shield,
  Mail,
  Globe,
  Database,
  Server,
  Clock,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Info,
  Zap,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSave = () => {
    toast.success("Paramètres enregistrés avec succès");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gray-500/10 flex items-center justify-center">
              <Settings className="h-5 w-5 text-gray-500" />
            </div>
            Paramètres
          </h1>
          <p className="text-muted-foreground mt-1">Configuration de la plateforme</p>
        </div>
        <Button onClick={handleSave} className="gap-2 bg-purple-500 hover:bg-purple-600">
          <Save className="h-4 w-4" />
          Enregistrer
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Bell className="h-4 w-4 text-blue-500" />
              </div>
              Notifications
            </CardTitle>
            <CardDescription>Gérez les notifications de la plateforme</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Notifications par email</p>
                  <p className="text-sm text-muted-foreground">Recevoir les alertes par email</p>
                </div>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Notifications push</p>
                  <p className="text-sm text-muted-foreground">Alertes en temps réel</p>
                </div>
              </div>
              <Switch checked={true} />
            </div>
          </CardContent>
        </Card>

        {/* Validation */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
              Validation
            </CardTitle>
            <CardDescription>Paramètres de validation des véhicules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Approbation automatique</p>
                  <p className="text-sm text-muted-foreground">Approuver automatiquement les véhicules</p>
                </div>
              </div>
              <Switch checked={autoApprove} onCheckedChange={setAutoApprove} />
            </div>
            {autoApprove && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                <p className="text-sm text-amber-600">
                  Attention: L'approbation automatique peut présenter des risques de sécurité.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Server className="h-4 w-4 text-purple-500" />
              </div>
              Système
            </CardTitle>
            <CardDescription>État et maintenance du système</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Mode maintenance</p>
                  <p className="text-sm text-muted-foreground">Désactiver l'accès public</p>
                </div>
              </div>
              <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
                <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-1" />
                <p className="text-sm font-medium text-green-600">API Active</p>
              </div>
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
                <Database className="h-6 w-6 text-green-500 mx-auto mb-1" />
                <p className="text-sm font-medium text-green-600">DB Connectée</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Info className="h-4 w-4 text-amber-500" />
              </div>
              Informations
            </CardTitle>
            <CardDescription>Informations sur l'application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <span className="text-sm text-muted-foreground">Version</span>
              <Badge variant="outline">1.0.0</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <span className="text-sm text-muted-foreground">Environnement</span>
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Production</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <span className="text-sm text-muted-foreground">Dernière mise à jour</span>
              <span className="text-sm font-medium">Aujourd'hui</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
