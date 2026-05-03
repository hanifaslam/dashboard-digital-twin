"use client";

import { User } from "lucide-react";
import { useLecturerListQuery } from "@/hooks/api/digital-twin/use-lecturer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface LecturerTabProps {
  roomId: string;
}

export function LecturerTab({ roomId }: LecturerTabProps) {
  const { data: lecturers, isLoading } = useLecturerListQuery(roomId);

  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center gap-3 mb-5 flex-none">
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
          Dosen di Ruangan
        </span>
        <div className="h-[1px] flex-1 bg-border/50" />
      </div>

      <ScrollArea className="h-[30vh] w-full pr-4">
        <div className="flex flex-col gap-3.5">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))
          ) : lecturers && lecturers.length > 0 ? (
            lecturers.map((lecturer) => (
              <div
                key={lecturer.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-green-50/50 border border-green-100 dark:bg-green-950/20 dark:border-green-900/30 w-full"
              >
                <Avatar className="h-14 w-14 border-2 border-white dark:border-zinc-800 shadow-md bg-green-100 dark:bg-green-900">
                  <AvatarFallback className="text-green-700 dark:text-green-300 font-bold text-lg">
                    {lecturer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-bold text-foreground truncate">
                    {lecturer.name}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate font-medium">
                    Mata kuliah: {lecturer.course || "-"}
                  </p>
                  <p className="text-xs text-muted-foreground/80">
                    Hadir sejak {lecturer.present_since || "08:00"} WIB
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 dark:bg-green-900/50 dark:text-green-400 dark:border-green-800 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-tight">
                  {lecturer.status}
                </Badge>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="bg-muted/30 p-4 rounded-full mb-4">
                <User className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground font-semibold">
                Tidak ada dosen di ruangan saat ini
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
