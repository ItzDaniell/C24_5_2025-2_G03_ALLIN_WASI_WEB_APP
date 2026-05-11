"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";
import { Button } from "@/ui/button";
import { Checkbox } from "@/ui/checkbox";
import { Slider } from "@/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import {
  MapPin, DollarSign, Zap, Wifi, Droplets, Shirt, Utensils, Bath, 
  Armchair, ShieldCheck, Dumbbell, Car, Tv, Dog
} from "lucide-react";

interface FilterModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
  selectedServices: string[];
  setSelectedServices: (services: string[] | ((prev: string[]) => string[])) => void;
}

export const FilterModal = ({
  isOpen,
  onOpenChange,
  searchQuery,
  setSearchQuery,
  priceRange,
  setPriceRange,
  selectedServices,
  setSelectedServices,
}: FilterModalProps) => {
  const allS = [
    'Wifi', 'Luz', 'Agua', 'Lavandería', 'Cocina', 'Baño Privado',
    'Amoblado', 'Seguridad', 'Gimnasio', 'Estacionamiento', 'TV Cable', 'Mascotas'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
        <DialogHeader className="p-8 bg-inkwell text-white">
          <DialogTitle className="text-xl font-bold">Filtros avanzados</DialogTitle>
          <DialogDescription className="text-slate-300">
            Ajusta los detalles para encontrar tu habitación ideal.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
          {/* District Filter */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-inkwell flex items-center gap-2">
              <MapPin className="w-4 h-4 text-creme-brulee" />
              Distrito
            </h4>
            <Select value={searchQuery === "all" ? "all" : searchQuery} onValueChange={setSearchQuery}>
              <SelectTrigger className="w-full h-12 rounded-xl border-slate-200 bg-slate-50/50">
                <SelectValue placeholder="Selecciona un distrito" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200">
                <SelectItem value="all">Todos los distritos</SelectItem>
                {['Ate Vitarte', 'Santa Anita', 'La Molina', 'Surco', 'San Borja', 'San Isidro', 'Miraflores'].map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-inkwell flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-yellow-600" />
              Rango de precio
            </h4>
            <div className="px-2">
              <Slider
                value={priceRange}
                max={2000}
                step={50}
                onValueChange={setPriceRange}
                className="py-4"
              />
              <div className="flex justify-between text-[11px] font-bold text-lunar-eclipse">
                <span>Min: S/ {priceRange[0]}</span>
                <span>Max: S/ {priceRange[1]}</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-inkwell flex items-center gap-2">
                <Zap className="w-4 h-4 text-creme-brulee" />
                Servicios
              </h4>
              <Button
                variant="ghost"
                className="h-7 text-[10px] text-creme-brulee font-bold p-0"
                onClick={() => {
                  if (selectedServices.length === allS.length) {
                    setSelectedServices([]);
                  } else {
                    setSelectedServices(allS);
                  }
                }}
              >
                {selectedServices.length === 12 ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Wifi', icon: Wifi },
                { name: 'Luz', icon: Zap },
                { name: 'Agua', icon: Droplets },
                { name: 'Lavandería', icon: Shirt },
                { name: 'Cocina', icon: Utensils },
                { name: 'Baño Privado', icon: Bath },
                { name: 'Amoblado', icon: Armchair },
                { name: 'Seguridad', icon: ShieldCheck },
                { name: 'Gimnasio', icon: Dumbbell },
                { name: 'Estacionamiento', icon: Car },
                { name: 'TV Cable', icon: Tv },
                { name: 'Mascotas', icon: Dog }
              ].map((s) => (
                <div
                  key={s.name}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedServices.includes(s.name) 
                      ? 'bg-emerald-50 border-emerald-200' 
                      : 'bg-slate-50 border-transparent hover:bg-slate-100'
                  }`}
                  onClick={() => {
                    setSelectedServices(prev =>
                      prev.includes(s.name) ? prev.filter(x => x !== s.name) : [...prev, s.name]
                    );
                  }}
                >
                  <div className="flex items-center gap-2">
                    <s.icon className={`w-3.5 h-3.5 ${selectedServices.includes(s.name) ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="text-[10px] font-bold text-inkwell">{s.name}</span>
                  </div>
                  <Checkbox 
                    checked={selectedServices.includes(s.name)} 
                    className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600" 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t flex gap-3">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button 
            className="flex-1 rounded-xl bg-creme-brulee hover:bg-creme-brulee/90 text-white font-bold" 
            onClick={() => onOpenChange(false)}
          >
            Aplicar filtros
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
