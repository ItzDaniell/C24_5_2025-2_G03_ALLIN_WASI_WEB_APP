"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { ArrowLeft, Eye, Camera, MessageSquare, FileText, TrendingUp, Users, Calendar, BarChart3} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,} from 'recharts';
import usePropertyStats from "@/modules/dashboard/data/queries/usePropertyStats";

interface PropertyStatisticsProps {
  onViewChange: (view: string) => void;
  propertyId?: number;
}

const visitData = [
  { date: '1 Ene', visits: 12, tours: 3 },
  { date: '2 Ene', visits: 19, tours: 5 },
  { date: '3 Ene', visits: 8, tours: 2 },
  { date: '4 Ene', visits: 25, tours: 8 },
  { date: '5 Ene', visits: 32, tours: 12 },
  { date: '6 Ene', visits: 28, tours: 9 },
  { date: '7 Ene', visits: 35, tours: 14 },
];

const interactionData = [
  { name: 'Mensajes', value: 24, color: '#8884d8' },
  { name: 'Solicitudes', value: 8, color: '#82ca9d' },
  { name: 'Tours 360°', value: 53, color: '#ffc658' },
  { name: 'Solo visitas', value: 145, color: '#ff7c7c' }
];

const monthlyData = [
  { month: 'Dic', visits: 186, interactions: 45 },
  { month: 'Ene', visits: 245, interactions: 62 },
  { month: 'Feb', visits: 298, interactions: 78 },
];

export function PropertyStatistics({ onViewChange, propertyId }: PropertyStatisticsProps) {
  const { views, tours, isLoading } = usePropertyStats(propertyId ? String(propertyId) : undefined, 30);
  const safeViews = isLoading ? undefined : views;
  const safeTours = isLoading ? undefined : tours;
  const baseVisits = typeof safeViews === 'number' ? safeViews : 0;
  const baseInteractions = 62; // placeholder para mantener la UI hasta integrar más métricas
  const conversionRate = baseVisits > 0 ? ((baseInteractions / baseVisits) * 100).toFixed(1) : '—';
  const totalInteractions = interactionData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => onViewChange('properties')} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver a propiedades
        </Button>
        <div>
          <h1>Estadísticas de la Propiedad {propertyId ? `#${propertyId}` : ''}</h1>
          <p className="text-gray-600">Habitación moderna cerca de UNALM</p>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Visitas totales</p>
                <p className="text-3xl font-bold text-blue-900">{typeof safeViews === 'number' ? safeViews : '—'}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +23% esta semana
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Tours 360° vistos</p>
                <p className="text-3xl font-bold text-purple-900">{typeof safeTours === 'number' ? safeTours : '—'}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +31% esta semana
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Interacciones</p>
                <p className="text-3xl font-bold text-green-900">62</p>
                <p className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" />
                  32 mensajes, 8 solicitudes
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">Tasa de conversión</p>
                <p className="text-3xl font-bold text-orange-900">{conversionRate}%</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +5.2% vs mes anterior
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Visitas y Tours 360° (Últimos 7 días)</CardTitle>
            <CardDescription>Seguimiento diario de la actividad</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={visitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="visits" stroke="#667eea" strokeWidth={3} name="Visitas" />
                <Line type="monotone" dataKey="tours" stroke="#9f7aea" strokeWidth={3} name="Tours 360°" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución de Interacciones</CardTitle>
            <CardDescription>Tipos de actividad en tu propiedad</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={interactionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props) => {
                    const { name, value } = props as any;
                    const percent = totalInteractions ? (value / totalInteractions) * 100 : 0;
                    return `${name}: ${percent.toFixed(0)}%`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {interactionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Comparativa mensual */}
      <Card>
        <CardHeader>
          <CardTitle>Comparativa Mensual</CardTitle>
          <CardDescription>Visitas vs Interacciones por mes</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="visits" fill="#667eea" name="Visitas" />
              <Bar dataKey="interactions" fill="#48bb78" name="Interacciones" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <TrendingUp className="w-5 h-5" />
              Insights Positivos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge className="bg-green-100 text-green-700">✓</Badge>
              <p className="text-sm">Tu tour 360° tiene una tasa de visualización del 21.6%</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-green-100 text-green-700">✓</Badge>
              <p className="text-sm">Las visitas han aumentado 23% esta semana</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-green-100 text-green-700">✓</Badge>
              <p className="text-sm">Tasa de conversión superior al promedio (18%)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Eye className="w-5 h-5" />
              Recomendaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge className="bg-blue-100 text-blue-700">💡</Badge>
              <p className="text-sm">Actualiza las fotos para aumentar las visitas</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-blue-100 text-blue-700">💡</Badge>
              <p className="text-sm">Responde más rápido para mejorar la conversión</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-blue-100 text-blue-700">💡</Badge>
              <p className="text-sm">Considera promocionar durante fines de semana</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
