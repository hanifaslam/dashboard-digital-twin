"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MarkerInfoCardProps {
  title: string;
  description?: string;
  onClose: () => void;
  className?: string;
}

export function MarkerInfoCard({
  title,
  description,
  onClose,
  className
}: MarkerInfoCardProps) {
  return (
    <Card 
      className={cn(
        "w-80 shadow-2xl border-border/50 bg-background/95 backdrop-blur-md animate-in fade-in zoom-in duration-200 flex flex-col",
        className
      )}
    >
      <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-bold tracking-tight text-foreground uppercase italic">
          {title}
        </CardTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 rounded-full hover:bg-muted" 
          onClick={onClose}
        >
          <X className="h-3 w-3" />
        </Button>
      </CardHeader>
      
      <CardContent className="px-4 pb-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {description || "Informasi mendetail untuk sensor digital twin ini belum tersedia."}
        </p>
        
        {/* Digital Twin Metrics */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="p-2 rounded-md bg-muted/30 border border-border/20">
            <span className="block text-[8px] uppercase font-bold text-zinc-500">Temperature</span>
            <span className="text-xs font-mono font-bold text-blue-500">24.5°C</span>
          </div>
          <div className="flex flex-col justify-center pl-1">
            <span className="block text-[8px] uppercase font-bold text-zinc-500">Status</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-green-500">ONLINE</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button size="sm" variant="outline" className="w-full text-[10px] h-7 rounded-full">
          Open Control Panel
        </Button>
      </CardFooter>
    </Card>
  );
}
