import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SuperAdminHomePage() {
  return (
    <main className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Console SuperAdmin</h1>
        <p className="text-muted-foreground">
          Accédez aux outils de supervision globale : utilisateurs, propriétés, documents et candidatures.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Propriétés</CardTitle>
            <CardDescription>Gérez toutes les annonces, quels que soient leurs statuts.</CardDescription>
          </CardHeader>
          <CardContent>
            Consultez la page Propriétés pour appliquer des actions en masse, publier ou archiver des annonces.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs</CardTitle>
            <CardDescription>Attribuez des rôles, réinitialisez des accès et modérez les comptes.</CardDescription>
          </CardHeader>
          <CardContent>
            La gestion centralisée des utilisateurs garantit une gouvernance sécurisée.
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
