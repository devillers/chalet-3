'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LogOut,
  Mail,
  Users,
  Shield,
  Home,
  MessageSquare,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { pacifico } from '@/lib/fonts';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/admin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const stats = [
    {
      title: 'Messages',
      value: '0',
      icon: MessageSquare,
      description: 'Messages de contact',
      href: '/admin/messages',
    },
    {
      title: 'Utilisateurs',
      value: '1',
      icon: Users,
      description: 'Comptes administrateurs',
      href: '/admin/users',
    },
    {
      title: 'Logs Email',
      value: '0',
      icon: Mail,
      description: 'Historique des emails',
      href: '/admin/email-logs',
    },
  ];

  const quickActions = [
    {
      title: 'Voir le site',
      description: 'Accéder au site public',
      icon: Home,
      href: '/',
      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    },
    {
      title: 'Gestion des utilisateurs',
      description: 'Gérer les administrateurs',
      icon: Shield,
      href: '/admin/users',
      color: 'bg-green-50 text-green-700 hover:bg-green-100',
    },
    {
      title: 'Paramètres',
      description: 'Configuration système',
      icon: Settings,
      href: '/admin/settings',
      color: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className={`${pacifico.className} text-2xl text-slate-900`}>Chalet Manager</h1>
                <p className="text-xs text-slate-500">Administration</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{session.user?.name || session.user?.email}</p>
                <p className="text-xs text-slate-500 capitalize">{session.user?.role || 'admin'}</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-slate-300 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Tableau de bord
          </h2>
          <p className="text-slate-600">
            Bienvenue, {session.user?.name || session.user?.email}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                  <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Actions rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <Card className="hover:shadow-lg transition-all cursor-pointer border-slate-200 hover:border-blue-300">
                  <CardHeader>
                    <div className={`inline-flex rounded-lg p-3 ${action.color} transition-colors mb-4 w-fit`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>Dernières actions sur la plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-500">
              <Mail className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p>Aucune activité récente</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
