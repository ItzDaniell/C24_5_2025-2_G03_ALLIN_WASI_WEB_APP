"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Heart, MessageSquare, History, User, Settings, MapPin, Star, Calendar } from "lucide-react";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Badge } from "@/ui/badge";

export default function StudentDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get('view') || 'dashboard';

  const menuItems = [
    { id: 'dashboard', label: 'Explorar', icon: Search },
    { id: 'favorites', label: 'Favoritos', icon: Heart },
    { id: 'messages', label: 'Mensajes', icon: MessageSquare },
    { id: 'history', label: 'Mis Solicitudes', icon: History },
    { id: 'settings', label: 'Mi Perfil', icon: Settings },
  ];

  const featuredRooms = [
    { id: 1, title: "Habitación Individual cerca a Tecsup", price: 450, rating: 4.8, location: "Santa Anita, Lima" },
    { id: 2, title: "Mini Departamento Estreno", price: 800, rating: 4.9, location: "Huachipa, Lima" },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-au-lait/20 via-white to-au-lait/20 overflow-hidden font-sans">
      {/* Student Sidebar */}
      <aside className="w-64 bg-inkwell text-white flex flex-col shadow-2xl z-10">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-creme-brulee rounded-xl flex items-center justify-center font-black text-inkwell shadow-lg transform -rotate-6">T</div>
            <h1 className="text-xl font-bold tracking-tight">Rooms <span className="text-creme-brulee">Student</span></h1>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(`?view=${item.id}`)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                view === item.id 
                  ? 'bg-creme-brulee text-inkwell font-bold shadow-lg shadow-creme-brulee/20 translate-x-1' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${view === item.id ? 'text-inkwell' : 'text-creme-brulee/60'}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-creme-brulee to-au-lait flex items-center justify-center text-inkwell font-bold shadow-inner">
                E
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold truncate">Estudiante</p>
                <p className="text-[10px] text-gray-500 truncate uppercase tracking-widest font-black">Plan Premium</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full text-gray-400 hover:text-white h-8 text-xs font-bold border border-white/5">
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-12">
          <header className="mb-12 flex justify-between items-end">
            <div>
              <h2 className="text-4xl font-black text-inkwell mb-3 leading-tight tracking-tighter">
                ¡Hola de nuevo,<br />
                <span className="text-creme-brulee">Busca tu hogar ideal!</span>
              </h2>
              <p className="text-lunar-eclipse font-medium">Tenemos 24 nuevas habitaciones cerca de tu campus esta semana.</p>
            </div>
            <div className="flex gap-3">
              <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-au-lait flex items-center gap-2">
                <Calendar className="w-4 h-4 text-creme-brulee" />
                <span className="text-sm font-bold text-inkwell">Semana 12 - Ciclo 2024-I</span>
              </div>
            </div>
          </header>

          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-inkwell flex items-center gap-2">
                <Star className="w-5 h-5 text-creme-brulee fill-creme-brulee" />
                Habitaciones destacadas
              </h3>
              <Button variant="link" className="text-creme-brulee font-bold">Ver todas</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredRooms.map((room) => (
                <Card key={room.id} className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl group">
                  <div className="relative aspect-video bg-gray-200">
                    <div className="absolute top-4 left-4 z-10">
                      <Badge className="bg-white/90 text-inkwell text-[10px] font-black tracking-widest backdrop-blur-md px-3 py-1 border-0">VERIFICADO</Badge>
                    </div>
                    <div className="absolute top-4 right-4 z-10 transition-transform group-hover:scale-110">
                      <button className="bg-white/90 p-2 rounded-full shadow-lg text-red-500 backdrop-blur-md">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="w-full h-full bg-slate-300 animate-pulse bg-[url('https://images.unsplash.com/photo-1522770179533-24471fcdba45')] bg-cover bg-center group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                      <div className="flex items-center gap-1 text-white">
                        <Star className="w-4 h-4 fill-creme-brulee text-creme-brulee" />
                        <span className="font-bold">{room.rating}</span>
                      </div>
                      <div className="text-white text-right">
                        <p className="text-[10px] uppercase font-black tracking-widest text-creme-brulee/80 mb-1">Precio Mensual</p>
                        <p className="text-2xl font-black">S/ {room.price}</p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-8 bg-white">
                    <h4 className="text-xl font-black text-inkwell mb-2 group-hover:text-creme-brulee transition-colors leading-tight">{room.title}</h4>
                    <div className="flex items-center gap-2 text-lunar-eclipse font-medium text-sm">
                      <MapPin className="w-4 h-4 text-creme-brulee" />
                      {room.location}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <footer className="mt-20 pt-10 border-t border-au-lait flex justify-between items-center text-lunar-eclipse">
            <p className="text-sm font-medium">© 2024 Tecsup Rooms. Hecho para estudiantes, por estudiantes.</p>
            <div className="flex gap-6 text-sm font-bold uppercase tracking-widest">
              <a href="#" className="hover:text-creme-brulee transition-colors">Términos</a>
              <a href="#" className="hover:text-creme-brulee transition-colors">Privacidad</a>
              <a href="#" className="hover:text-creme-brulee transition-colors">Ayuda</a>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
