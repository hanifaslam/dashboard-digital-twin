"use client";

import { Calendar } from "lucide-react";
import { useScheduleListQuery } from "@/hooks/api/digital-twin/use-schedule";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface ScheduleTabProps {
  roomId: string;
}

export function ScheduleTab({ roomId }: ScheduleTabProps) {
  const { data: schedules, isLoading } = useScheduleListQuery(roomId);

  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center gap-3 mb-5 flex-none">
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
          Jadwal Hari Ini
        </span>
        <div className="h-[1px] flex-1 bg-border/50" />
      </div>

      <ScrollArea className="h-[30vh] w-full pr-4">
        <div className="flex flex-col gap-3.5">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))
          ) : schedules && schedules.length > 0 ? (
            schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 border border-border/50 w-full hover:bg-muted/60 transition-colors"
              >
                <div className="flex flex-col items-center justify-center min-w-[70px] border-r border-border/50 pr-5">
                  <span className="text-xs font-bold text-foreground">
                    {schedule.start_time}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase">
                    {schedule.end_time}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-foreground truncate">
                    {schedule.course_name}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate font-medium">
                    {schedule.lecturer_name}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase font-bold text-blue-600 border-blue-200 bg-blue-50/50 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
                >
                  {schedule.course_code}
                </Badge>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="bg-muted/30 p-4 rounded-full mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground font-semibold">
                Tidak ada jadwal kuliah hari ini
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
