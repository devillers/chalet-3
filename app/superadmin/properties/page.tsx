import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const columns = [
  'Titre',
  'Ville',
  'Capacité',
  'Statut',
  'Propriétaire',
  'Créée le',
  'Publiée le',
  'Images',
  'Slug',
];

export default function SuperAdminPropertiesPage() {
  return (
    <main className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Toutes les propriétés</CardTitle>
          <CardDescription>
            Tableau serveur avec filtres avancés. Connectez l&apos;API `/api/superadmin/properties` pour récupérer les données.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column}>{column}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
                    Données à connecter à l&apos;API.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
