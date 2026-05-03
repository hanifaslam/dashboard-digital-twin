"use client";

import { User } from "lucide-react";
import { useLecturerListQuery } from "@/hooks/api/digital-twin/use-lecturer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "./status-badge";

interface LecturerTabProps {
  roomId: string;
}

export function LecturerTab({ roomId }: LecturerTabProps) {
  const { data: lecturers, isLoading } = useLecturerListQuery(roomId);

  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center mb-3 flex-none">
        <span className="text-sm font-semibold text-foreground">
          Lecturer in Room
        </span>
      </div>

      <ScrollArea className="h-[30vh] w-full">
        <div className="flex flex-col gap-2">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))
          ) : lecturers && lecturers.length > 0 ? (
            lecturers.map((lecturer) => (
              <div
                key={lecturer.id}
                className="flex items-center gap-2 p-2 rounded-md border w-full bg-background"
              >
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="font-semibold text-sm">
                    {lecturer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-foreground">
                    {lecturer.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Course: {lecturer.course || "-"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Presence: {lecturer.present_since || "-"}
                  </span>
                </div>
                <StatusBadge status={lecturer.status} />
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <User className="h-10 w-10 text-muted-foreground/40 mb-4" />
              <p className="text-xs text-muted-foreground">
                No lecturer in this room
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
